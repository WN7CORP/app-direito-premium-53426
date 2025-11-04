import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, X, Plus, Minus, ArrowUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows, fetchInitialRows } from "@/lib/fetchAllRows";
import { Skeleton } from "@/components/ui/skeleton";
import { sortArticles } from "@/lib/articleSorter";
import { Button } from "@/components/ui/button";
import InlineAudioButton from "@/components/InlineAudioButton";
import AudioCommentButton from "@/components/AudioCommentButton";
import StickyAudioPlayer from "@/components/StickyAudioPlayer";
import ExplicacaoModal from "@/components/ExplicacaoModal";
import VideoAulaModal from "@/components/VideoAulaModal";
import TermosModal from "@/components/TermosModal";
import QuestoesModal from "@/components/QuestoesModal";
import PerguntaModal from "@/components/PerguntaModal";
import { FlashcardViewer } from "@/components/FlashcardViewer";
import { formatTextWithUppercase } from "@/lib/textFormatter";
import { CopyButton } from "@/components/CopyButton";
import { VadeMecumTabs } from "@/components/VadeMecumTabs";
import { VadeMecumPlaylist } from "@/components/VadeMecumPlaylist";
import { VadeMecumRanking } from "@/components/VadeMecumRanking";
import { ArtigoActionsMenu } from "@/components/ArtigoActionsMenu";
import { useArticleTracking } from "@/hooks/useArticleTracking";
import { formatForWhatsApp } from "@/lib/formatWhatsApp";
import { useIndexedDBCache } from "@/hooks/useIndexedDBCache";

interface Article {
  id: number;
  "Número do Artigo": string | null;
  "Artigo": string | null;
  "Narração": string | null;
  "Comentario": string | null;
  "Aula": string | null;
}

const LeiDrogasView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const firstResultRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(15);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(500);
  const [stickyPlayerOpen, setStickyPlayerOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState({ url: "", title: "", isComment: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ artigo: "", numeroArtigo: "", tipo: "explicacao" as "explicacao" | "exemplo", nivel: "tecnico" as "tecnico" | "simples" });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoModalData, setVideoModalData] = useState({ videoUrl: "", artigo: "", numeroArtigo: "" });
  const [flashcardsModalOpen, setFlashcardsModalOpen] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [termosModalOpen, setTermosModalOpen] = useState(false);
  const [termosData, setTermosData] = useState({ artigo: "", numeroArtigo: "" });
  const [questoesModalOpen, setQuestoesModalOpen] = useState(false);
  const [questoesData, setQuestoesData] = useState({ artigo: "", numeroArtigo: "" });
  const [perguntaModalOpen, setPerguntaModalOpen] = useState(false);
  const [perguntaData, setPerguntaData] = useState({ artigo: "", numeroArtigo: "" });
  const [activeTab, setActiveTab] = useState<'artigos' | 'playlist' | 'ranking'>('artigos');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const tableName = "Lei 11.343 de 2006 - Lei de Drogas";
  const codeName = "Lei de Drogas";
  const abbreviation = "LD";

  useEffect(() => {
    const artigoParam = searchParams.get('artigo');
    if (artigoParam) {
      setSearchQuery(artigoParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize(fontSize - 2);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { cachedData, isLoadingCache, saveToCache } = useIndexedDBCache<Article>(tableName);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['lei-drogas-articles-v3'],
    queryFn: async () => {
      if (cachedData?.length) return cachedData;
      const initialData = await fetchInitialRows<Article>(tableName, 100, "id");
      setTimeout(async () => {
        const fullData = await fetchAllRows<Article>(tableName, "id");
        await saveToCache(fullData);
      }, 100);
      return initialData as any as Article[];
    },
    enabled: !isLoadingCache,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24
  });

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const searchLower = searchQuery.toLowerCase().trim();
    return articles.filter(article => {
      const numeroArtigo = (article["Número do Artigo"] || "").toLowerCase().trim();
      const conteudoArtigo = (article["Artigo"] || "").toLowerCase();
      return numeroArtigo.includes(searchLower) || conteudoArtigo.includes(searchLower);
    });
  }, [articles, searchQuery]);

  const displayedArticles = useMemo(() => {
    return searchQuery ? filteredArticles : filteredArticles.slice(0, displayLimit);
  }, [filteredArticles, displayLimit, searchQuery]);

  const articlesWithAudio = useMemo(() => {
    return articles.filter(article => 
      article["Narração"] && article["Narração"].trim() !== "" &&
      article["Número do Artigo"] && article["Número do Artigo"].trim() !== ""
    ) as any[];
  }, [articles]);

  useEffect(() => {
    if (searchQuery && filteredArticles.length > 0 && firstResultRef.current) {
      setTimeout(() => {
        firstResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [searchQuery, filteredArticles]);

  const handleGenerateFlashcards = async (artigo: string, numeroArtigo: string) => {
    setLoadingFlashcards(true);
    try {
      const response = await supabase.functions.invoke('gerar-flashcards', {
        body: { content: `Art. ${numeroArtigo}\n${artigo}` }
      });
      if (response.error) throw response.error;
      setFlashcardsData(response.data.flashcards || []);
      setFlashcardsModalOpen(true);
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <VadeMecumTabs 
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
      />

      {activeTab === 'artigos' && (
        <div className="sticky top-[60px] bg-background border-b border-border z-20">
          <div className="px-4 pt-4 pb-2 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="relative animate-fade-in flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Buscar por artigo ou conteúdo..." 
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearchQuery(searchInput);
                      }
                    }}
                    className="w-full bg-input text-foreground pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all" 
                  />
                </div>
                <Button onClick={() => setSearchQuery(searchInput)} disabled={!searchInput.trim()} size="lg" className="px-6 shrink-0">
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
                {searchQuery && (
                  <Button onClick={() => { setSearchInput(""); setSearchQuery(""); }} variant="outline" size="lg" className="px-4 shrink-0">
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-muted-foreground text-center">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <StickyAudioPlayer 
        isOpen={stickyPlayerOpen} 
        onClose={() => setStickyPlayerOpen(false)} 
        audioUrl={currentAudio.url} 
        title={currentAudio.title}
      />

      <ExplicacaoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} artigo={modalData.artigo} numeroArtigo={modalData.numeroArtigo} tipo={modalData.tipo} nivel={modalData.nivel} codigo="ld" codigoTabela={tableName} />
      <VideoAulaModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} videoUrl={videoModalData.videoUrl} artigo={videoModalData.artigo} numeroArtigo={videoModalData.numeroArtigo} />
      <TermosModal isOpen={termosModalOpen} onClose={() => setTermosModalOpen(false)} artigo={termosData.artigo} numeroArtigo={termosData.numeroArtigo} codigoTabela={tableName} />
      <QuestoesModal isOpen={questoesModalOpen} onClose={() => setQuestoesModalOpen(false)} artigo={questoesData.artigo} numeroArtigo={questoesData.numeroArtigo} />
      <PerguntaModal isOpen={perguntaModalOpen} onClose={() => setPerguntaModalOpen(false)} artigo={perguntaData.artigo} numeroArtigo={perguntaData.numeroArtigo} />
      
      {flashcardsModalOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-accent">Flashcards</h2>
              <button onClick={() => setFlashcardsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingFlashcards ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Gerando flashcards...</p>
                  </div>
                </div>
              ) : (
                <FlashcardViewer flashcards={flashcardsData} />
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={contentRef} className="max-w-4xl mx-auto">
        {activeTab === 'artigos' && (
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
            ) : displayedArticles.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhum artigo encontrado</p></div>
            ) : (
              displayedArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  abbreviation={abbreviation}
                  isFirstResult={index === 0}
                  fontSize={fontSize}
                  onOpenExplicacao={(tipo, nivel) => {
                    setModalData({
                      artigo: article["Artigo"] || "",
                      numeroArtigo: article["Número do Artigo"] || "",
                      tipo,
                      nivel
                    });
                    setModalOpen(true);
                  }}
                  onOpenVideoAula={(videoUrl) => {
                    setVideoModalData({
                      videoUrl,
                      artigo: article["Artigo"] || "",
                      numeroArtigo: article["Número do Artigo"] || ""
                    });
                    setVideoModalOpen(true);
                  }}
                  onGenerateFlashcards={() => handleGenerateFlashcards(article["Artigo"] || "", article["Número do Artigo"] || "")}
                  onOpenTermos={() => {
                    setTermosData({
                      artigo: article["Artigo"] || "",
                      numeroArtigo: article["Número do Artigo"] || ""
                    });
                    setTermosModalOpen(true);
                  }}
                  onOpenQuestoes={() => {
                    setQuestoesData({
                      artigo: article["Artigo"] || "",
                      numeroArtigo: article["Número do Artigo"] || ""
                    });
                    setQuestoesModalOpen(true);
                  }}
                  onPerguntar={() => {
                    setPerguntaData({
                      artigo: article["Artigo"] || "",
                      numeroArtigo: article["Número do Artigo"] || ""
                    });
                    setPerguntaModalOpen(true);
                  }}
                  onPlayNarration={(url, title) => {
                    setCurrentAudio({ url, title, isComment: false });
                    setStickyPlayerOpen(true);
                  }}
                  onPlayComment={(url, title) => {
                    setCurrentAudio({ url, title, isComment: true });
                    setStickyPlayerOpen(true);
                  }}
                  loadingFlashcards={loadingFlashcards}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'playlist' && (
          <div className="p-4">
          <VadeMecumPlaylist 
            articles={articlesWithAudio} 
            codigoNome={codeName}
          />
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="p-4">
          <VadeMecumRanking 
            tableName={tableName}
            codigoNome={codeName}
            onArticleClick={(numeroArtigo) => {
              const element = document.getElementById(`article-${numeroArtigo}`);
              if (element) {
                setActiveTab('artigos');
                setTimeout(() => {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            }}
          />
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="fixed bottom-28 left-4 flex flex-col gap-2 z-30 animate-fade-in">
        <button onClick={increaseFontSize} className="bg-accent hover:bg-accent/90 text-accent-foreground w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={decreaseFontSize} className="bg-accent hover:bg-accent/90 text-accent-foreground w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
          <Minus className="w-4 h-4" />
        </button>
        <div className="bg-card border border-border text-foreground text-xs font-medium px-2 py-1.5 rounded-full text-center shadow-lg">
          {fontSize}px
        </div>
      </div>

      {showScrollTop && (
        <div className="fixed bottom-[8.5rem] right-4 z-30 animate-fade-in">
          <button onClick={scrollToTop} className="bg-accent hover:bg-accent/90 text-accent-foreground w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

interface ArticleCardProps {
  article: Article;
  abbreviation: string;
  isFirstResult: boolean;
  fontSize: number;
  onOpenExplicacao: (tipo: "explicacao" | "exemplo", nivel: "tecnico" | "simples") => void;
  onOpenVideoAula: (videoUrl: string) => void;
  onGenerateFlashcards: () => void;
  onOpenTermos: () => void;
  onOpenQuestoes: () => void;
  onPerguntar: () => void;
  onPlayNarration: (url: string, title: string) => void;
  onPlayComment: (url: string, title: string) => void;
  loadingFlashcards: boolean;
}

const ArticleCard = ({
  article,
  abbreviation,
  isFirstResult,
  fontSize,
  onOpenExplicacao,
  onOpenVideoAula,
  onGenerateFlashcards,
  onOpenTermos,
  onOpenQuestoes,
  onPerguntar,
  onPlayNarration,
  onPlayComment,
  loadingFlashcards
}: ArticleCardProps) => {
  const elementRef = useArticleTracking({
    tableName: "Lei 11.343 de 2006 - Lei de Drogas",
    articleId: article.id,
    numeroArtigo: article["Número do Artigo"] || "",
    enabled: !!article["Número do Artigo"]
  });

  const hasNumber = article["Número do Artigo"] && article["Número do Artigo"].trim() !== "";

  // Se não tem número, renderiza como cabeçalho de seção (igual ao Código Penal)
  if (!hasNumber) {
    return (
      <div key={article.id} className="text-center mb-4 mt-6 font-serif-content">
        <div 
          className="text-sm leading-tight text-muted-foreground/80 whitespace-pre-line" 
          dangerouslySetInnerHTML={{ __html: formatTextWithUppercase(article["Artigo"] || "") }} 
        />
      </div>
    );
  }

  const shareOnWhatsApp = () => {
    const numeroArtigo = article["Número do Artigo"];
    const conteudo = article["Artigo"];
    const fullText = `*Art. ${numeroArtigo}*\n\n${conteudo}`;
    const formattedText = formatForWhatsApp(fullText);
    const encodedText = encodeURIComponent(formattedText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Se tem número, renderiza como card normal (igual ao Código Penal)
  return (
    <div 
      ref={isFirstResult ? elementRef as any : elementRef} 
      id={`article-${article["Número do Artigo"]}`}
      className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-border/50 hover:border-accent/30 transition-all duration-300 animate-fade-in hover:shadow-lg scroll-mt-4"
    >
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-accent font-bold text-xl md:text-2xl animate-scale-in">
          Art. {article["Número do Artigo"]}
        </h2>
        <div className="flex gap-2">
          <CopyButton 
            text={article["Artigo"] || ""}
            articleNumber={article["Número do Artigo"] || ""}
            narrationUrl={article["Narração"] || undefined}
          />
        </div>
      </div>
      
      {/* Article Header */}
      <div
        className="article-content text-foreground/90 mb-6 whitespace-pre-line leading-relaxed font-serif-content"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.7"
        }}
        dangerouslySetInnerHTML={{
          __html: formatTextWithUppercase(article["Artigo"] || "Conteúdo não disponível")
        }}
      />

      {/* Action Menu */}
      <div className="mb-4 animate-fade-in">
        <ArtigoActionsMenu
          article={article}
          codigoNome="Lei de Drogas"
          onPlayComment={(audioUrl, title) => onPlayComment(audioUrl, title)}
          onOpenAula={article["Aula"] ? () => onOpenVideoAula(article["Aula"]!) : undefined}
          onOpenExplicacao={(tipo) => onOpenExplicacao(tipo, "tecnico")}
          onGenerateFlashcards={onGenerateFlashcards}
          onOpenTermos={onOpenTermos}
          onOpenQuestoes={onOpenQuestoes}
          onPerguntar={onPerguntar}
          loadingFlashcards={loadingFlashcards}
        />
      </div>
    </div>
  );
};

export default LeiDrogasView;

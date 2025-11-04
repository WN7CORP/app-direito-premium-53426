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

const LeiPenalLavagemDinheiro = () => {
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

  const tableName = "LLD - Lei de Lavagem de Dinheiro";
  const codeName = "Lei de Lavagem de Dinheiro";
  const abbreviation = "LLD";

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
    queryKey: ['lld-articles-v1'],
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

      <ExplicacaoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} artigo={modalData.artigo} numeroArtigo={modalData.numeroArtigo} tipo={modalData.tipo} nivel={modalData.nivel} codigo="lld" codigoTabela={tableName} />
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
                  tableName={tableName}
                  codeName={codeName}
                  isFirstResult={index === 0}
                  fontSize={fontSize}
                  onOpenExplicacao={(tipo, nivel) => {
                    setModalData({ artigo: article["Artigo"] || "", numeroArtigo: article["Número do Artigo"] || "", tipo, nivel });
                    setModalOpen(true);
                  }}
                  onOpenVideoAula={(videoUrl) => {
                    setVideoModalData({ videoUrl, artigo: article["Artigo"] || "", numeroArtigo: article["Número do Artigo"] || "" });
                    setVideoModalOpen(true);
                  }}
                  onGenerateFlashcards={() => handleGenerateFlashcards(article["Artigo"] || "", article["Número do Artigo"] || "")}
                  onOpenTermos={() => {
                    setTermosData({ artigo: article["Artigo"] || "", numeroArtigo: article["Número do Artigo"] || "" });
                    setTermosModalOpen(true);
                  }}
                  onOpenQuestoes={() => {
                    setQuestoesData({ artigo: article["Artigo"] || "", numeroArtigo: article["Número do Artigo"] || "" });
                    setQuestoesModalOpen(true);
                  }}
                  onPerguntar={() => {
                    setPerguntaData({ artigo: article["Artigo"] || "", numeroArtigo: article["Número do Artigo"] || "" });
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
  tableName: string;
  codeName: string;
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
  tableName,
  codeName,
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
  loadingFlashcards,
}: ArticleCardProps) => {
  const numeroArtigo = article["Número do Artigo"];
  const hasNumber = numeroArtigo && numeroArtigo.trim() !== "";

  const elementRef = useArticleTracking({
    tableName,
    articleId: article.id,
    numeroArtigo: numeroArtigo || "",
    enabled: hasNumber,
  });

  const shareOnWhatsApp = () => {
    const conteudo = article["Artigo"];
    const fullText = `*${abbreviation} - Art. ${numeroArtigo}*\n\n${conteudo}`;
    const formattedText = formatForWhatsApp(fullText);
    const encodedText = encodeURIComponent(formattedText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleOpenExplicacao = (tipo: "explicacao" | "exemplo") => {
    onOpenExplicacao(tipo, "tecnico");
  };

  const handlePlayNarration = (audioUrl: string) => {
    onPlayNarration(audioUrl, `Art. ${numeroArtigo}`);
  };

  if (!hasNumber) {
    return (
      <div className="text-center mb-4 mt-6 font-serif-content">
        <h3 className="text-xl font-bold text-accent uppercase tracking-wide">
          {formatTextWithUppercase(article["Artigo"] || "")}
        </h3>
      </div>
    );
  }

  return (
    <div 
      id={`article-${numeroArtigo}`}
      ref={isFirstResult ? elementRef as any : elementRef}
      className="group relative bg-card border border-border rounded-2xl p-4 hover:shadow-xl transition-all duration-300 animate-fade-in"
      style={{
        boxShadow: '0 0 20px hsla(142,76%,36%,0.1)',
        borderColor: 'hsla(142,76%,36%,0.2)'
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, hsl(142,76%,36%) 0%, hsl(142,76%,46%) 100%)',
              color: 'white',
              boxShadow: '0 4px 12px hsla(142,76%,36%,0.3)'
            }}
          >
            Art. {numeroArtigo}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton 
            text={`*${abbreviation} - Art. ${numeroArtigo}*\n\n${article["Artigo"]}`}
            articleNumber={numeroArtigo}
          />
        </div>
      </div>

      {article["Narração"] && (
        <div className="mb-3">
          <InlineAudioButton 
            audioUrl={article["Narração"]}
          />
        </div>
      )}

      <div className="space-y-3">
        <p 
          className="text-foreground leading-relaxed font-serif-content"
          style={{ fontSize: `${fontSize}px` }}
        >
          {formatTextWithUppercase(article["Artigo"] || "")}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <ArtigoActionsMenu
            article={article}
            codigoNome={codeName}
            onOpenExplicacao={handleOpenExplicacao}
            onOpenTermos={onOpenTermos}
            onOpenQuestoes={onOpenQuestoes}
            onGenerateFlashcards={onGenerateFlashcards}
            onPerguntar={onPerguntar}
            onPlayNarration={handlePlayNarration}
            onPlayComment={onPlayComment}
            loadingFlashcards={loadingFlashcards}
          />
        </div>

        {article["Comentario"] && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <AudioCommentButton 
              commentUrl={article["Comentario"]}
            />
          </div>
        )}

        {article["Aula"] && (
          <div className="mt-3">
            <Button
              onClick={() => onOpenVideoAula(article["Aula"] || "")}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Assistir Videoaula
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeiPenalLavagemDinheiro;

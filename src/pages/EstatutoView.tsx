import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, MessageSquare, GraduationCap, Lightbulb, BookOpen, Bookmark, Plus, Minus, ArrowUp, BookMarked, FileQuestion, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAllRows";
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
import { formatForWhatsApp } from "@/lib/formatWhatsApp";
import { useArticleTracking } from "@/hooks/useArticleTracking";

interface Article {
  id: number;
  "Número do Artigo": string | null;
  "Artigo": string | null;
  "Narração": string | null;
  "Comentario": string | null;
  "Aula": string | null;
}

const EstatutoView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const firstResultRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(15);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const artigoParam = searchParams.get('artigo');
    if (artigoParam) {
      setSearchQuery(artigoParam);
    }
  }, [searchParams]);

  const [displayLimit, setDisplayLimit] = useState(500);
  const [stickyPlayerOpen, setStickyPlayerOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState({
    url: "",
    title: "",
    isComment: false
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    artigo: "",
    numeroArtigo: "",
    tipo: "explicacao" as "explicacao" | "exemplo",
    nivel: "tecnico" as "tecnico" | "simples"
  });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoModalData, setVideoModalData] = useState({
    videoUrl: "",
    artigo: "",
    numeroArtigo: ""
  });
  const [flashcardsModalOpen, setFlashcardsModalOpen] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [termosModalOpen, setTermosModalOpen] = useState(false);
  const [termosData, setTermosData] = useState({ artigo: "", numeroArtigo: "" });
  const [questoesModalOpen, setQuestoesModalOpen] = useState(false);
  const [questoesData, setQuestoesData] = useState({ artigo: "", numeroArtigo: "" });
  const [perguntaModalOpen, setPerguntaModalOpen] = useState(false);
  const [perguntaData, setPerguntaData] = useState({ artigo: "", numeroArtigo: "" });
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'artigos' | 'playlist' | 'ranking'>('artigos');

  const estatutoNames: { [key: string]: string } = {
    cidade: "Estatuto da Cidade",
    desarmamento: "Estatuto do Desarmamento",
    eca: "Estatuto da Criança e do Adolescente",
    idoso: "Estatuto do Idoso",
    "igualdade-racial": "Estatuto da Igualdade Racial",
    oab: "Estatuto da OAB",
    "pessoa-deficiencia": "Estatuto da Pessoa com Deficiência",
    torcedor: "Estatuto do Torcedor"
  };

  const estatutoName = estatutoNames[id as string] || "Estatuto";
  const abbreviation = id?.toUpperCase() || "";
  
  const tableMap: { [key: string]: string } = {
    'cidade': 'ESTATUTO - CIDADE',
    'desarmamento': 'ESTATUTO - DESARMAMENTO',
    'eca': 'ESTATUTO - ECA',
    'idoso': 'ESTATUTO - IDOSO',
    'igualdade-racial': 'ESTATUTO - IGUALDADE RACIAL',
    'oab': 'ESTATUTO - OAB',
    'pessoa-deficiencia': 'ESTATUTO - PESSOA COM DEFICIÊNCIA',
    'torcedor': 'ESTATUTO - TORCEDOR'
  };
  
  const tableName = tableMap[id as string] || "";

  // Fetch articles with React Query
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['estatuto-articles-v2', id],
    queryFn: async () => {
      const tableMap: { [key: string]: string } = {
        'cidade': 'ESTATUTO - CIDADE',
        'desarmamento': 'ESTATUTO - DESARMAMENTO',
        'eca': 'ESTATUTO - ECA',
        'idoso': 'ESTATUTO - IDOSO',
        'igualdade-racial': 'ESTATUTO - IGUALDADE RACIAL',
        'oab': 'ESTATUTO - OAB',
        'pessoa-deficiencia': 'ESTATUTO - PESSOA COM DEFICIÊNCIA',
        'torcedor': 'ESTATUTO - TORCEDOR'
      };

      const tableName = tableMap[id as string];
      
      if (!tableName) {
        console.error("Tabela não encontrada para estatuto:", id);
        return [];
      }

      const data = await fetchAllRows<Article>(tableName, "id");
      return data as any as Article[];
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60
  });

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    
    const searchLower = searchQuery.toLowerCase().trim();
    const isNumericSearch = /^\d+$/.test(searchLower);
    const normalizeDigits = (s: string) => s.replace(/\D/g, "");
    
    const filtered = articles.filter(article => {
      const numeroArtigoRaw = article["Número do Artigo"] || "";
      const numeroArtigo = numeroArtigoRaw.toLowerCase().trim();
      const conteudoArtigo = article["Artigo"]?.toLowerCase() || "";
      
      // Busca por número - encontra artigos que começam com o número buscado
      if (isNumericSearch) {
        const numeroDigits = normalizeDigits(numeroArtigo);
        // Busca exata ou números que começam com o termo buscado
        // Ex: buscar "1020" encontra "1020", "10200", "1020-A", etc.
        if (numeroDigits.startsWith(searchLower)) return true;
      } else {
        // Busca textual no número do artigo
        if (numeroArtigo.includes(searchLower)) return true;
      }
      
      return conteudoArtigo.includes(searchLower);
    });
    
    return filtered.sort((a, b) => {
      const aNum = (a["Número do Artigo"] || "").toLowerCase().trim();
      const bNum = (b["Número do Artigo"] || "").toLowerCase().trim();
      const normalizeA = normalizeDigits(aNum);
      const normalizeB = normalizeDigits(bNum);
      
      // Priorizar matches exatos
      const aExato = isNumericSearch ? normalizeA === searchLower : aNum === searchLower;
      const bExato = isNumericSearch ? normalizeB === searchLower : bNum === searchLower;
      
      if (aExato && !bExato) return -1;
      if (!aExato && bExato) return 1;
      
      // Se ambos começam com o termo, ordenar numericamente
      if (isNumericSearch) {
        const aNumInt = parseInt(normalizeA) || 0;
        const bNumInt = parseInt(normalizeB) || 0;
        return aNumInt - bNumInt;
      }
      
      return 0;
    });
  }, [articles, searchQuery]);

  const displayedArticles = useMemo(() => {
    return searchQuery ? filteredArticles : filteredArticles.slice(0, displayLimit);
  }, [filteredArticles, displayLimit, searchQuery]);

  // Filter articles with audio for playlist
  const articlesWithAudio = useMemo(() => {
    return articles.filter(article => 
      article["Narração"] && 
      article["Narração"].trim() !== "" &&
      article["Número do Artigo"] &&
      article["Número do Artigo"].trim() !== ""
    ) as any[];
  }, [articles]);

  useEffect(() => {
    if (searchQuery && filteredArticles.length > 0 && firstResultRef.current) {
      setTimeout(() => {
        firstResultRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [searchQuery, filteredArticles]);

  useEffect(() => {
    const element = contentRef.current;
    if (!searchQuery && element) {
      const handleScroll = () => {
        if (!element) return;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        if (scrollTop + clientHeight >= scrollHeight - 800 && displayLimit < filteredArticles.length) {
          setDisplayLimit(prev => Math.min(prev + 200, filteredArticles.length));
        }
      };
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [displayLimit, filteredArticles.length, searchQuery]);

  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize(fontSize - 2);
  };

  const formatArticleContent = (content: string) => {
    return formatTextWithUppercase(content || "Conteúdo não disponível");
  };

  const handlePlayComment = (audioUrl: string, title: string) => {
    setCurrentAudio({
      url: audioUrl,
      title,
      isComment: true
    });
    setStickyPlayerOpen(true);
  };

  const handleOpenAula = (article: Article) => {
    if (article.Aula && article["Artigo"] && article["Número do Artigo"]) {
      setVideoModalData({
        videoUrl: article.Aula,
        artigo: article["Artigo"],
        numeroArtigo: article["Número do Artigo"]
      });
      setVideoModalOpen(true);
    }
  };

  const handleOpenExplicacao = (artigo: string, numeroArtigo: string, tipo: "explicacao" | "exemplo", nivel?: "tecnico" | "simples") => {
    setModalData({
      artigo,
      numeroArtigo,
      tipo,
      nivel: nivel || "tecnico"
    });
    setModalOpen(true);
  };
  
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

  const scrollToTop = () => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleArticleClick = (numeroArtigo: string) => {
    setActiveTab('artigos');
    setSearchQuery(numeroArtigo);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Tabs */}
      <VadeMecumTabs 
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
      />

      {/* Search Bar - only show on artigos tab */}
      {activeTab === 'artigos' && (
        <div className="sticky top-[60px] z-20 bg-background border-b border-border">
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
                
                <Button
                  onClick={() => setSearchQuery(searchInput)}
                  disabled={!searchInput.trim()}
                  size="lg"
                  className="px-6 shrink-0"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
                
                {searchQuery && (
                  <Button
                    onClick={() => {
                      setSearchInput("");
                      setSearchQuery("");
                    }}
                    variant="outline"
                    size="lg"
                    className="px-4 shrink-0"
                  >
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

      <ExplicacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        artigo={modalData.artigo}
        numeroArtigo={modalData.numeroArtigo}
        tipo={modalData.tipo}
        nivel={modalData.nivel}
      />

      <VideoAulaModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={videoModalData.videoUrl}
        artigo={videoModalData.artigo}
        numeroArtigo={videoModalData.numeroArtigo}
      />

      <TermosModal
        isOpen={termosModalOpen}
        onClose={() => setTermosModalOpen(false)}
        artigo={termosData.artigo}
        numeroArtigo={termosData.numeroArtigo}
        codigoTabela={tableName}
      />

      <QuestoesModal
        isOpen={questoesModalOpen}
        onClose={() => setQuestoesModalOpen(false)}
        artigo={questoesData.artigo}
        numeroArtigo={questoesData.numeroArtigo}
      />

      {/* Pergunta Modal */}
      <PerguntaModal isOpen={perguntaModalOpen} onClose={() => setPerguntaModalOpen(false)} artigo={perguntaData.artigo} numeroArtigo={perguntaData.numeroArtigo} />

      {flashcardsModalOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-accent">Flashcards</h2>
              <button
                onClick={() => setFlashcardsModalOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FlashcardViewer flashcards={flashcardsData} />
            </div>
          </div>
        </div>
      )}

      <div ref={contentRef} className="px-4 max-w-4xl mx-auto pb-0 overflow-y-auto" style={{ 
        height: activeTab === 'artigos' ? 'calc(100vh - 126px)' : 'calc(100vh - 60px)' 
      }}>
        
        {/* Playlist Tab */}
        {activeTab === 'playlist' && (
          <VadeMecumPlaylist 
            articles={articlesWithAudio}
            codigoNome={estatutoName}
          />
        )}

        {/* Ranking Tab */}
        {activeTab === 'ranking' && (
          <VadeMecumRanking 
            tableName={tableName}
            codigoNome={estatutoName}
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
        )}

        {/* Articles Tab */}
        {activeTab === 'artigos' && (
          <>
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border">
                <Skeleton className="h-8 w-32 mb-3" />
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-24 w-full mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(j => <Skeleton key={j} className="h-10 w-full" />)}
                </div>
              </div>
            ))}
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {searchQuery ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo disponível."}
          </div>
        ) : (
          displayedArticles.map((article, index) => {
            const hasNumber = article["Número do Artigo"] && article["Número do Artigo"].trim() !== "";

            if (!hasNumber) {
              return (
                <div
                  key={article.id}
                  className="text-center mb-4 mt-6 font-serif-content"
                >
                  <div
                    className="text-sm leading-tight text-muted-foreground/80 whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: formatTextWithUppercase(article["Artigo"] || "")
                    }}
                  />
                </div>
              );
            }

            return (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
                searchQuery={searchQuery}
                fontSize={fontSize}
                firstResultRef={index === 0 && searchQuery ? firstResultRef : null}
                tableName={tableName}
                onPlayComment={handlePlayComment}
                onOpenAula={handleOpenAula}
                onOpenExplicacao={handleOpenExplicacao}
                onGenerateFlashcards={handleGenerateFlashcards}
                onOpenTermos={(artigo, numeroArtigo) => {
                  setTermosData({ artigo, numeroArtigo });
                  setTermosModalOpen(true);
                }}
                onOpenQuestoes={(artigo, numeroArtigo) => {
                  setQuestoesData({ artigo, numeroArtigo });
                  setQuestoesModalOpen(true);
                }}
                onPerguntar={(artigo, numeroArtigo) => {
                  setPerguntaData({ artigo, numeroArtigo });
                  setPerguntaModalOpen(true);
                }}
                loadingFlashcards={loadingFlashcards}
                isCommentPlaying={currentAudio.url === article["Comentario"] && stickyPlayerOpen}
              />
            );
          })
        )}
          </>
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

      <div className="fixed bottom-[8.5rem] right-4 z-30 animate-fade-in">
        <button onClick={scrollToTop} className="bg-accent hover:bg-accent/90 text-accent-foreground w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ArticleCard Component
interface ArticleCardProps {
  article: Article;
  index: number;
  searchQuery: string;
  fontSize: number;
  firstResultRef: React.RefObject<HTMLDivElement> | null;
  tableName: string;
  onPlayComment: (audioUrl: string, title: string) => void;
  onOpenAula: (article: Article) => void;
  onOpenExplicacao: (artigo: string, numeroArtigo: string, tipo: "explicacao" | "exemplo", nivel?: "tecnico" | "simples") => void;
  onGenerateFlashcards: (artigo: string, numeroArtigo: string) => void;
  onOpenTermos: (artigo: string, numeroArtigo: string) => void;
  onOpenQuestoes: (artigo: string, numeroArtigo: string) => void;
  onPerguntar: (artigo: string, numeroArtigo: string) => void;
  loadingFlashcards: boolean;
  isCommentPlaying: boolean;
}

const ArticleCard = ({
  article,
  index,
  searchQuery,
  fontSize,
  firstResultRef,
  tableName,
  onPlayComment,
  onOpenAula,
  onOpenExplicacao,
  onGenerateFlashcards,
  onOpenTermos,
  onOpenQuestoes,
  onPerguntar,
  loadingFlashcards,
  isCommentPlaying
}: ArticleCardProps) => {
  const { elementRef } = useArticleTracking({
    tableName,
    articleId: article.id,
    numeroArtigo: article["Número do Artigo"] || "",
    enabled: true
  });

  const isHighlighted = searchQuery && article["Número do Artigo"]?.toLowerCase().trim() === searchQuery.toLowerCase().trim();

  const formatArticleContent = (content: string) => {
    return formatTextWithUppercase(content || "Conteúdo não disponível");
  };

  const shareOnWhatsApp = () => {
    const fullText = `*Art. ${article["Número do Artigo"]}*\n\n${article["Artigo"]}`;
    const formattedText = formatForWhatsApp(fullText);
    const encodedText = encodeURIComponent(formattedText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div
      ref={(el) => {
        if (elementRef) {
          (elementRef as any).current = el;
        }
        if (firstResultRef) {
          (firstResultRef as any).current = el;
        }
      }}
      id={`article-${article["Número do Artigo"]}`}
      className={`relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border transition-all duration-300 animate-fade-in hover:shadow-lg scroll-mt-4 ${
        isHighlighted 
          ? 'border-accent shadow-lg shadow-accent/20 ring-2 ring-accent/20' 
          : 'border-border/50 hover:border-accent/30 hover:shadow-accent/5'
      }`}
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: 'backwards'
      }}
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

      <div 
        className="article-content text-foreground/90 mb-6 whitespace-pre-line leading-relaxed font-serif-content" 
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.7"
        }}
        dangerouslySetInnerHTML={{
          __html: formatArticleContent(article["Artigo"] || "Conteúdo não disponível")
        }}
      />

      <div className="animate-fade-in">
        <ArtigoActionsMenu
          article={article}
          codigoNome="Estatuto do Idoso"
          onPlayComment={onPlayComment}
          onOpenAula={() => onOpenAula(article)}
          onOpenExplicacao={(tipo) => onOpenExplicacao(article["Artigo"] || "", article["Número do Artigo"] || "", tipo)}
          onGenerateFlashcards={() => onGenerateFlashcards(article["Artigo"] || "", article["Número do Artigo"] || "")}
          onOpenTermos={() => onOpenTermos(article["Artigo"] || "", article["Número do Artigo"] || "")}
          onOpenQuestoes={() => onOpenQuestoes(article["Artigo"] || "", article["Número do Artigo"] || "")}
          onPerguntar={() => onPerguntar(article["Artigo"] || "", article["Número do Artigo"] || "")}
          loadingFlashcards={loadingFlashcards}
          isCommentPlaying={isCommentPlaying}
        />
      </div>
    </div>
  );
};

export default EstatutoView;

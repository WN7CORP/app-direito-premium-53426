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

const PacoteAnticrimeView = () => {
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

  const tableName = "Lei 13.964 de 2019 - Pacote Anticrime";
  const codeName = "Pacote Anticrime";
  const abbreviation = "PAC";

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
    queryKey: ['pacote-anticrime-articles-v3'],
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
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchInput("");
                    }}
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {searchQuery && (
                <p className="text-xs text-muted-foreground text-center">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'artigos' && (
        <>
          {/* Floating Font Controls - Mobile */}
          <div className="fixed left-4 bottom-24 z-30 flex md:hidden flex-col gap-2 bg-card border border-border rounded-xl shadow-lg p-2">
            <button 
              onClick={decreaseFontSize} 
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Diminuir fonte"
            >
              <Minus className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs font-medium text-muted-foreground text-center">
              {fontSize}px
            </span>
            <button 
              onClick={increaseFontSize} 
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Aumentar fonte"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button 
              onClick={scrollToTop}
              className="fixed right-4 bottom-24 z-30 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all"
              title="Voltar ao topo"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}

          {/* Content */}
          <div ref={contentRef} className="max-w-4xl mx-auto px-4 py-6 space-y-4 font-serif-content">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))}
              </>
            ) : displayedArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `Nenhum artigo encontrado para "${searchQuery}"`
                    : "Nenhum artigo disponível"}
                </p>
              </div>
            ) : (
              displayedArticles.map((article, index) => {
                const isFirstResult = index === 0 && searchQuery;
                const ArticleTracker = () => {
                  const { elementRef } = useArticleTracking({
                    tableName,
                    articleId: article.id,
                    numeroArtigo: article["Número do Artigo"] || "",
                    enabled: !!article["Número do Artigo"]
                  });
                  return null;
                };

                const hasNumber = article["Número do Artigo"];

                if (!hasNumber) {
                  return (
                    <div key={article.id} className="mb-6 mt-6 font-serif-content">
                      <div 
                        className="text-sm leading-relaxed font-semibold text-foreground/90 whitespace-pre-line text-center" 
                        dangerouslySetInnerHTML={{ __html: formatTextWithUppercase(article["Artigo"] || "") }} 
                      />
                    </div>
                  );
                }

                return (
                  <div 
                    key={article.id}
                    ref={isFirstResult ? firstResultRef as any : undefined}
                    id={`article-${article["Número do Artigo"]}`}
                    className="relative bg-card rounded-2xl p-6 mb-6 border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in hover:shadow-lg scroll-mt-4"
                  >
                    <ArticleTracker />
                    
                    <div className="mb-4">
                      <h3 
                        className="text-lg font-bold text-primary tracking-wide"
                        style={{ fontSize: `${Math.min(fontSize + 3, 24)}px` }}
                      >
                        Art. {article["Número do Artigo"]}
                      </h3>
                    </div>

                    <div 
                      className="text-base leading-relaxed whitespace-pre-line text-foreground"
                      style={{ fontSize: `${fontSize}px` }}
                      dangerouslySetInnerHTML={{ __html: formatTextWithUppercase(article["Artigo"] || "") }}
                    />

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <CopyButton 
                        text={article["Artigo"] || ""} 
                        articleNumber={article["Número do Artigo"] || ""}
                      />
                      <ArtigoActionsMenu 
                        article={article}
                        codigoNome={codeName}
                        onPlayNarration={(audioUrl) => {
                          setCurrentAudio({ 
                            url: audioUrl, 
                            title: `Art. ${article["Número do Artigo"]} - ${codeName}`,
                            isComment: false 
                          });
                          setStickyPlayerOpen(true);
                        }}
                        onPlayComment={(audioUrl, title) => {
                          setCurrentAudio({ url: audioUrl, title, isComment: true });
                          setStickyPlayerOpen(true);
                        }}
                        onOpenAula={() => {
                          if (article["Aula"]) {
                            setVideoModalData({
                              videoUrl: article["Aula"],
                              artigo: article["Artigo"] || "",
                              numeroArtigo: article["Número do Artigo"] || ""
                            });
                            setVideoModalOpen(true);
                          }
                        }}
                        onOpenExplicacao={(tipo) => {
                          setModalData({
                            artigo: article["Artigo"] || "",
                            numeroArtigo: article["Número do Artigo"] || "",
                            tipo,
                            nivel: "tecnico"
                          });
                          setModalOpen(true);
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
                      />
                    </div>
                  </div>
                );
              })
            )}

            {!searchQuery && displayedArticles.length < filteredArticles.length && (
              <div className="flex justify-center py-8">
                <Button 
                  onClick={() => setDisplayLimit(prev => prev + 200)}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Carregar mais artigos
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'playlist' && (
        <VadeMecumPlaylist 
          articles={articlesWithAudio}
          codigoNome={codeName}
        />
      )}

      {activeTab === 'ranking' && (
        <VadeMecumRanking 
          tableName={tableName}
          codigoNome={codeName}
          onArticleClick={(numeroArtigo) => {
            setSearchQuery(numeroArtigo);
            setSearchInput(numeroArtigo);
            setActiveTab('artigos');
          }}
        />
      )}

      {/* Sticky Audio Player */}
      <StickyAudioPlayer 
        isOpen={stickyPlayerOpen}
        onClose={() => setStickyPlayerOpen(false)}
        audioUrl={currentAudio.url}
        title={currentAudio.title}
      />

      {/* Modals */}
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

      {flashcardsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Flashcards</h2>
              <Button variant="ghost" size="icon" onClick={() => setFlashcardsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <FlashcardViewer flashcards={flashcardsData} />
            </div>
          </div>
        </div>
      )}

      <TermosModal 
        isOpen={termosModalOpen}
        onClose={() => setTermosModalOpen(false)}
        artigo={termosData.artigo}
        numeroArtigo={termosData.numeroArtigo}
      />

      <QuestoesModal 
        isOpen={questoesModalOpen}
        onClose={() => setQuestoesModalOpen(false)}
        artigo={questoesData.artigo}
        numeroArtigo={questoesData.numeroArtigo}
      />

      <PerguntaModal 
        isOpen={perguntaModalOpen}
        onClose={() => setPerguntaModalOpen(false)}
        artigo={perguntaData.artigo}
        numeroArtigo={perguntaData.numeroArtigo}
      />
    </div>
  );
};

export default PacoteAnticrimeView;

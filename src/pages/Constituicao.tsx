import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, MessageSquare, GraduationCap, Lightbulb, BookOpen, Bookmark, Plus, Minus, ArrowUp, BookMarked, FileQuestion, ChevronDown, X, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows, fetchInitialRows } from "@/lib/fetchAllRows";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { sortArticles } from "@/lib/articleSorter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AudioCommentButton from "@/components/AudioCommentButton";
import StickyAudioPlayer from "@/components/StickyAudioPlayer";
import ExplicacaoModal from "@/components/ExplicacaoModal";
import VideoAulaModal from "@/components/VideoAulaModal";
import QuestoesModal from "@/components/QuestoesModal";
import TermosModal from "@/components/TermosModal";
import PerguntaModal from "@/components/PerguntaModal";
import FlashcardsArtigoModal from "@/components/FlashcardsArtigoModal";
import { formatTextWithUppercase } from "@/lib/textFormatter";
import { CopyButton } from "@/components/CopyButton";
import { ArtigoActionsMenu } from "@/components/ArtigoActionsMenu";
import { formatForWhatsApp } from "@/lib/formatWhatsApp";
import { VadeMecumTabs } from "@/components/VadeMecumTabs";
import { VadeMecumPlaylist } from "@/components/VadeMecumPlaylist";
import { VadeMecumRanking } from "@/components/VadeMecumRanking";
import { BuscaCompacta } from "@/components/BuscaCompacta";
import { ArtigoListaCompacta } from "@/components/ArtigoListaCompacta";
import { useIndexedDBCache } from "@/hooks/useIndexedDBCache";
import { usePaginatedArticles } from "@/hooks/usePaginatedArticles";

interface Article {
  id: number;
  "Número do Artigo": string | null;
  "Artigo": string | null;
  "Narração": string | null;
  "Comentario": string | null;
  "Aula": string | null;
}

interface Article {
  id: number;
  "Número do Artigo": string;
  Artigo: string;
  Narração: string;
  Comentario: string;
  Aula: string;
}

const Constituicao = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const firstResultRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(15);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(500);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'lista' | 'expandido'>('expandido');
  const [artigoExpandido, setArtigoExpandido] = useState<number | null>(null);

  // Auto-search based on URL parameter
  useEffect(() => {
    const artigoParam = searchParams.get('artigo');
    if (artigoParam) {
      setSearchQuery(artigoParam);
    }
  }, [searchParams]);

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

  const [questoesModalOpen, setQuestoesModalOpen] = useState(false);
  const [questoesModalData, setQuestoesModalData] = useState({
    artigo: "",
    numeroArtigo: ""
  });

  const [termosModalOpen, setTermosModalOpen] = useState(false);
  const [termosModalData, setTermosModalData] = useState({
    artigo: "",
    numeroArtigo: ""
  });

  const [flashcardsModalOpen, setFlashcardsModalOpen] = useState(false);
  const [flashcardsModalData, setFlashcardsModalData] = useState({
    artigo: "",
    numeroArtigo: ""
  });

  const [perguntaModalOpen, setPerguntaModalOpen] = useState(false);
  const [perguntaData, setPerguntaData] = useState({ artigo: "", numeroArtigo: "" });
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'artigos' | 'playlist' | 'ranking'>('artigos');
  
  const tableName = "CF - Constituição Federal";
  const codeName = "Constituição Federal";

  // Use IndexedDB cache for instant loading
  const { cachedData, isLoadingCache, saveToCache } = useIndexedDBCache<Article>(tableName);

  // Fetch articles with optimized strategy: cache first, then load all
  const {
    data: articles = [],
    isLoading
  } = useQuery({
    queryKey: ['constituicao-articles-v4', tableName],
    queryFn: async () => {
      // Se tem cache, retorna imediatamente
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }

      // Carregar todos os artigos de uma vez (167 artigos)
      const fullData = await fetchAllRows<Article>("CF - Constituição Federal", "id");
      await saveToCache(fullData);

      return fullData as any as Article[];
    },
    enabled: !isLoadingCache, // Só busca depois de verificar cache
    staleTime: Infinity, // Cache permanente
    gcTime: 1000 * 60 * 60 * 24 // 24h
  });

  // Filter and limit articles with useMemo
  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const searchLower = searchQuery.toLowerCase().trim();
    const isNumericSearch = /^\d+$/.test(searchLower);
    const normalizeDigits = (s: string) => s.replace(/\D/g, "");

    const filtered = articles.filter(article => {
      const numeroArtigoRaw = article["Número do Artigo"] || "";
      const numeroArtigo = numeroArtigoRaw.toLowerCase().trim();
      const conteudoArtigo = article["Artigo"]?.toLowerCase() || "";

      if (isNumericSearch) {
        const numeroDigits = normalizeDigits(numeroArtigo);
        if (numeroDigits.startsWith(searchLower)) return true;
      } else {
        if (numeroArtigo === searchLower || numeroArtigo.includes(searchLower)) return true;
      }

      return conteudoArtigo.includes(searchLower);
    });

    return filtered.sort((a, b) => {
      const aNum = (a["Número do Artigo"] || "").toLowerCase().trim();
      const bNum = (b["Número do Artigo"] || "").toLowerCase().trim();
      const normalizeA = normalizeDigits(aNum);
      const normalizeB = normalizeDigits(bNum);
      
      const aExato = isNumericSearch ? normalizeA === searchLower : aNum === searchLower;
      const bExato = isNumericSearch ? normalizeB === searchLower : bNum === searchLower;
      
      if (aExato && !bExato) return -1;
      if (!aExato && bExato) return 1;
      
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
  

  // Auto-scroll to first result when searching
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

  // Infinite scroll handler
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
      setFlashcardsModalData({ artigo, numeroArtigo });
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
      <VadeMecumTabs 
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
      />

      {activeTab === 'artigos' && (
        <BuscaCompacta
          value={searchInput}
          onChange={setSearchInput}
          onSearch={() => setSearchQuery(searchInput)}
          onClear={() => {
            setSearchInput("");
            setSearchQuery("");
            setArtigoExpandido(null);
          }}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode);
            if (mode === 'lista') setArtigoExpandido(null);
          }}
          resultCount={filteredArticles.length}
        />
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

      <QuestoesModal 
        isOpen={questoesModalOpen} 
        onClose={() => setQuestoesModalOpen(false)} 
        artigo={questoesModalData.artigo} 
        numeroArtigo={questoesModalData.numeroArtigo} 
      />

      <TermosModal 
        isOpen={termosModalOpen} 
        onClose={() => setTermosModalOpen(false)} 
        artigo={termosModalData.artigo} 
        numeroArtigo={termosModalData.numeroArtigo} 
      />

      <FlashcardsArtigoModal 
        isOpen={flashcardsModalOpen} 
        onClose={() => setFlashcardsModalOpen(false)} 
        artigo={flashcardsModalData.artigo} 
        numeroArtigo={flashcardsModalData.numeroArtigo} 
      />

      <PerguntaModal 
        isOpen={perguntaModalOpen} 
        onClose={() => setPerguntaModalOpen(false)} 
        artigo={perguntaData.artigo} 
        numeroArtigo={perguntaData.numeroArtigo} 
      />

      <div ref={contentRef} className="max-w-4xl mx-auto">
        {activeTab === 'artigos' && (
          viewMode === 'lista' ? (
            <div className="p-4">
              {isLoading && (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              )}

              {!isLoading && displayedArticles.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    {searchQuery ? "Nenhum artigo encontrado." : "Nenhum artigo disponível."}
                  </p>
                </div>
              )}

              {!isLoading && displayedArticles.length > 0 && (
                <ArtigoListaCompacta
                  articles={displayedArticles}
                  onArtigoClick={(article) => setArtigoExpandido(article.id)}
                  searchQuery={searchQuery}
                  onPlayComment={handlePlayComment}
                  onOpenAula={handleOpenAula}
                  onOpenExplicacao={handleOpenExplicacao}
                  onGenerateFlashcards={handleGenerateFlashcards}
                  onOpenTermos={(artigo, numeroArtigo) => {
                    setTermosModalData({ artigo, numeroArtigo });
                    setTermosModalOpen(true);
                  }}
                  onOpenQuestoes={(artigo, numeroArtigo) => {
                    setQuestoesModalData({ artigo, numeroArtigo });
                    setQuestoesModalOpen(true);
                  }}
                  onPerguntar={(artigo, numeroArtigo) => {
                    setPerguntaData({ artigo, numeroArtigo });
                    setPerguntaModalOpen(true);
                  }}
                  loadingFlashcards={loadingFlashcards}
                  currentAudio={currentAudio}
                  stickyPlayerOpen={stickyPlayerOpen}
                  codeName="CF/88"
                />
              )}
            </div>
          ) : (
            <div className="px-4 pb-6 space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 border border-border">
                      <Skeleton className="h-8 w-32 mb-4" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))}
                </div>
              ) : displayedArticles.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  {searchQuery ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo disponível."}
                </div>
              ) : (
                displayedArticles.map((article, index) => {
                  const numeroArtigo = article["Número do Artigo"];
                  const isHeader = !numeroArtigo || numeroArtigo.trim() === "";
                  
                  if (isHeader) {
                    return (
                      <div key={article.id} className="text-center mb-4 mt-6 font-serif-content">
                        <div 
                          className="text-sm leading-tight text-muted-foreground/80 whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: formatTextWithUppercase(article["Artigo"] || "") }}
                        />
                      </div>
                    );
                  }

                  const isHighlighted = searchQuery && numeroArtigo?.toLowerCase().trim() === searchQuery.toLowerCase().trim();

                  return (
                    <div
                      key={article.id}
                      ref={index === 0 && searchQuery ? firstResultRef : null}
                      className={`bg-card rounded-2xl p-6 border transition-all ${
                        isHighlighted 
                          ? 'border-[hsl(45,93%,58%)] shadow-lg shadow-[hsl(45,93%,58%)]/20 ring-2 ring-[hsl(45,93%,58%)]/20' 
                          : 'border-border/50 hover:border-[hsl(45,93%,58%)]/30 hover:shadow-[hsl(45,93%,58%)]/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-[hsl(45,93%,58%)] font-bold text-xl md:text-2xl">
                          Art. {numeroArtigo}
                        </h2>
                        <div className="flex gap-2">
                          <CopyButton 
                            text={`Art. ${numeroArtigo}\n${article["Artigo"]}`}
                            articleNumber={numeroArtigo || ""}
                            narrationUrl={article["Narração"] || undefined}
                          />
                          <Button
                            onClick={() => {
                              const whatsappText = formatForWhatsApp(`# Artigo ${numeroArtigo} - CF/88\n\n${article["Artigo"]}`);
                              window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div 
                        className="article-content text-foreground/90 mb-6 whitespace-pre-line leading-relaxed font-serif-content"
                        style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
                        dangerouslySetInnerHTML={{ __html: formatTextWithUppercase(article["Artigo"] || "") }}
                      />

                      <ArtigoActionsMenu
                        article={article}
                        codigoNome="CF/88"
                        onPlayComment={(audioUrl: string, title: string) => handlePlayComment(audioUrl, title)}
                        onOpenAula={() => handleOpenAula(article)}
                        onOpenExplicacao={(tipo) => handleOpenExplicacao(article["Artigo"] || "", numeroArtigo || "", tipo)}
                        onGenerateFlashcards={() => handleGenerateFlashcards(article["Artigo"] || "", numeroArtigo || "")}
                        onOpenTermos={() => {
                          setTermosModalData({ artigo: article["Artigo"] || "", numeroArtigo: numeroArtigo || "" });
                          setTermosModalOpen(true);
                        }}
                        onOpenQuestoes={() => {
                          setQuestoesModalData({ artigo: article["Artigo"] || "", numeroArtigo: numeroArtigo || "" });
                          setQuestoesModalOpen(true);
                        }}
                        onPerguntar={() => {
                          setPerguntaData({ artigo: article["Artigo"] || "", numeroArtigo: numeroArtigo || "" });
                          setPerguntaModalOpen(true);
                        }}
                        loadingFlashcards={loadingFlashcards}
                        isCommentPlaying={stickyPlayerOpen && currentAudio.url === article["Comentario"]}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )
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
              onArticleClick={handleArticleClick}
            />
          </div>
        )}
      </div>

      <div className="fixed bottom-28 left-4 flex flex-col gap-2 z-30">
        <Button 
          onClick={increaseFontSize} 
          size="icon" 
          className="rounded-full bg-[hsl(45,93%,58%)] hover:bg-[hsl(45,93%,58%)]/90 text-black"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button 
          onClick={decreaseFontSize} 
          size="icon" 
          className="rounded-full bg-[hsl(45,93%,58%)] hover:bg-[hsl(45,93%,58%)]/90 text-black"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="bg-card border px-2 py-1 rounded-full text-xs text-center">
          {fontSize}px
        </div>
      </div>

      <Button
        onClick={scrollToTop}
        size="icon"
        className="fixed bottom-28 right-4 rounded-full bg-[hsl(45,93%,58%)] hover:bg-[hsl(45,93%,58%)]/90 text-black z-30"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Constituicao;

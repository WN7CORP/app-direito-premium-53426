import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, MessageSquare, GraduationCap, Lightbulb, BookOpen, Bookmark, Plus, Minus, ArrowUp, BookMarked, FileQuestion, X, Share2 } from "lucide-react";
import { BuscaCompacta } from "@/components/BuscaCompacta";
import { ArtigoListaCompacta } from "@/components/ArtigoListaCompacta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows, fetchInitialRows } from "@/lib/fetchAllRows";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { sortArticles } from "@/lib/articleSorter";
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
import { useArticleTracking } from "@/hooks/useArticleTracking";
import { ArtigoActionsMenu } from "@/components/ArtigoActionsMenu";
import { formatForWhatsApp } from "@/lib/formatWhatsApp";
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
const CodigoView = () => {
  const navigate = useNavigate();
  const {
    id
  } = useParams();
  const [searchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const firstResultRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(15);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-search based on URL parameter
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
  
  // View mode state
  const [viewMode, setViewMode] = useState<'lista' | 'expandido'>('expandido');
  const [artigoExpandido, setArtigoExpandido] = useState<number | null>(null);
  const codeNames: {
    [key: string]: string;
  } = {
    cc: "Código Civil",
    cp: "Código Penal",
    cpc: "Código de Processo Civil",
    cpp: "Código de Processo Penal",
    cf: "Constituição Federal",
    clt: "Consolidação das Leis do Trabalho",
    cdc: "Código de Defesa do Consumidor",
    ctn: "Código Tributário Nacional",
    ctb: "Código de Trânsito Brasileiro",
    ce: "Código Eleitoral",
    ca: "Código de Águas",
    cba: "Código Brasileiro de Aeronáutica",
    cbt: "Código Brasileiro de Telecomunicações",
    ccom: "Código Comercial",
    cdm: "Código de Minas",
    cpm: "Código Penal Militar",
    cppm: "Código de Processo Penal Militar",
    "lei-beneficios": "Lei de Benefícios da Previdência Social",
    "lei-custeio": "Lei de Custeio da Previdência Social",
    "lei-improbidade": "Lei de Improbidade Administrativa",
    "lei-acesso-informacao": "Lei de Acesso à Informação",
    "lei-anticorrupcao": "Lei Anticorrupção",
    "lei-mediacao": "Lei de Mediação",
    "lei-lgpd": "Lei Geral de Proteção de Dados",
    "lei-lrf": "Lei de Responsabilidade Fiscal",
    "lei-licitacoes": "Lei de Licitações e Contratos",
    "lei-acao-popular": "Lei da Ação Popular",
    "lei-registros-publicos": "Lei de Registros Públicos",
    "lei-acao-civil-publica": "Lei da Ação Civil Pública",
    "lei-juizados-civeis": "Lei dos Juizados Especiais",
    "lei-legislacao-tributaria": "Lei da Legislação Tributária",
    "lei-processo-administrativo": "Lei do Processo Administrativo",
    "lei-adi-adc": "Lei da ADI e ADC"
  };
  
  const tableNames: {
    [key: string]: string;
  } = {
    cc: "CC - Código Civil",
    cp: "CP - Código Penal",
    cpc: "CPC – Código de Processo Civil",
    cpp: "CPP – Código de Processo Penal",
    cf: "CF - Constituição Federal",
    clt: "CLT - Consolidação das Leis do Trabalho",
    cdc: "CDC – Código de Defesa do Consumidor",
    ctn: "CTN – Código Tributário Nacional",
    ctb: "CTB Código de Trânsito Brasileiro",
    ce: "CE – Código Eleitoral",
    ca: "CA - Código de Águas",
    cba: "CBA Código Brasileiro de Aeronáutica",
    cbt: "CBT Código Brasileiro de Telecomunicações",
    ccom: "CCOM – Código Comercial",
    cdm: "CDM – Código de Minas",
    cpm: "CPM – Código Penal Militar",
    cppm: "CPPM – Código de Processo Penal Militar",
    "lei-beneficios": "LEI 8213 - Benefícios",
    "lei-custeio": "LEI 8212 - Custeio",
    "lei-improbidade": "LEI 8429 - IMPROBIDADE",
    "lei-acesso-informacao": "LEI 12527 - ACESSO INFORMACAO",
    "lei-anticorrupcao": "LEI 12846 - ANTICORRUPCAO",
    "lei-mediacao": "LEI 13140 - MEDIACAO",
    "lei-lgpd": "LEI 13709 - LGPD",
    "lei-lrf": "LC 101 - LRF",
    "lei-licitacoes": "LEI 14133 - LICITACOES",
    "lei-acao-popular": "LEI 4717 - ACAO POPULAR",
    "lei-registros-publicos": "LEI 6015 - REGISTROS PUBLICOS",
    "lei-acao-civil-publica": "LEI 7347 - ACAO CIVIL PUBLICA",
    "lei-juizados-civeis": "LEI 9099 - JUIZADOS CIVEIS",
    "lei-legislacao-tributaria": "LEI 9430 - LEGISLACAO TRIBUTARIA",
    "lei-processo-administrativo": "LEI 9784 - PROCESSO ADMINISTRATIVO",
    "lei-adi-adc": "LEI 9868 - ADI E ADC"
  };
  
  // Verificar se o ID é um nome de tabela direto ou um slug
  const decodedId = decodeURIComponent(id || '');
  const allTableValues = Object.values(tableNames);
  const isDirectTableName = allTableValues.includes(decodedId);
  
  const finalTableName = isDirectTableName ? decodedId : (tableNames[id as string] || "CP - Código Penal");
  const codeName = isDirectTableName 
    ? (Object.entries(codeNames).find(([key]) => tableNames[key] === decodedId)?.[1] || "Código")
    : (codeNames[id as string] || "Código");
  const tableName = finalTableName;
  const abbreviation = id?.toUpperCase() || "";

  // Use IndexedDB cache for instant loading
  const { cachedData, isLoadingCache, saveToCache } = useIndexedDBCache<Article>(tableName);

  // Fetch articles with optimized strategy: cache first, then load all
  const {
    data: articles = [],
    isLoading
  } = useQuery({
    queryKey: ['codigo-articles-v9', id, decodedId, tableName],
    queryFn: async () => {
      // Se tem cache, retorna imediatamente
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }

      const tableMap: { [key: string]: string } = {
        'cc': 'CC - Código Civil',
        'cp': 'CP - Código Penal',
        'cpc': 'CPC – Código de Processo Civil',
        'cpp': 'CPP – Código de Processo Penal',
        'clt': 'CLT - Consolidação das Leis do Trabalho',
        'cdc': 'CDC – Código de Defesa do Consumidor',
        'ctn': 'CTN – Código Tributário Nacional',
        'ce': 'CE – Código Eleitoral',
        'cf': 'CF - Constituição Federal',
        'ca': 'CA - Código de Águas',
        'cba': 'CBA Código Brasileiro de Aeronáutica',
        'cbt': 'CBT Código Brasileiro de Telecomunicações',
        'ccom': 'CCOM – Código Comercial',
        'cdm': 'CDM – Código de Minas',
        'ctb': 'CTB Código de Trânsito Brasileiro',
        'cpm': 'CPM – Código Penal Militar',
        'cppm': 'CPPM – Código de Processo Penal Militar',
        'lei-beneficios': 'LEI 8213 - Benefícios',
        'lei-custeio': 'LEI 8212 - Custeio',
        'lei-improbidade': 'LEI 8429 - IMPROBIDADE',
        'lei-acesso-informacao': 'LEI 12527 - ACESSO INFORMACAO',
        'lei-anticorrupcao': 'LEI 12846 - ANTICORRUPCAO',
        'lei-mediacao': 'LEI 13140 - MEDIACAO',
        'lei-lgpd': 'LEI 13709 - LGPD',
        'lei-lrf': 'LC 101 - LRF',
        'lei-licitacoes': 'LEI 14133 - LICITACOES',
        'lei-acao-popular': 'LEI 4717 - ACAO POPULAR',
        'lei-registros-publicos': 'LEI 6015 - REGISTROS PUBLICOS',
        'lei-acao-civil-publica': 'LEI 7347 - ACAO CIVIL PUBLICA',
        'lei-juizados-civeis': 'LEI 9099 - JUIZADOS CIVEIS',
        'lei-legislacao-tributaria': 'LEI 9430 - LEGISLACAO TRIBUTARIA',
        'lei-processo-administrativo': 'LEI 9784 - PROCESSO ADMINISTRATIVO',
        'lei-adi-adc': 'LEI 9868 - ADI E ADC'
      };

      const decodedId = decodeURIComponent(id || '');
      const allTableValues = Object.values(tableMap);
      const finalTableName = allTableValues.includes(decodedId) ? decodedId : tableMap[id as string];
      
      if (!finalTableName) {
        console.error("Tabela não encontrada para código:", id, "decodedId:", decodedId);
        return [];
      }

      // Carregar todos os artigos de uma vez
      const fullData = await fetchAllRows<Article>(finalTableName, "id");
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
      
      // Busca pelo conteúdo do artigo
      return conteudoArtigo.includes(searchLower);
    });
    
    // Ordenar para que artigos com número exato apareçam primeiro
    return filtered.sort((a, b) => {
      const aNum = (a["Número do Artigo"] || "").toLowerCase().trim();
      const bNum = (b["Número do Artigo"] || "").toLowerCase().trim();
      const normalizeA = normalizeDigits(aNum);
      const normalizeB = normalizeDigits(bNum);
      
      // Priorizar matches exatos
      const aExato = isNumericSearch
        ? normalizeA === searchLower
        : aNum === searchLower;
      const bExato = isNumericSearch
        ? normalizeB === searchLower
        : bNum === searchLower;
      
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
  // Formata conteúdo do artigo usando formatador da Constituição
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
      
      // Salvar flashcards na tabela
      if (response.data.flashcards && Array.isArray(response.data.flashcards)) {
        try {
          const { error: updateError } = await supabase
            .from(tableName as any)
            .update({ 
              flashcards: response.data.flashcards,
              ultima_atualizacao: new Date().toISOString()
            })
            .eq('Número do Artigo', numeroArtigo);
          
          if (updateError) {
            console.error('Erro ao salvar flashcards:', updateError);
          }
        } catch (saveError) {
          console.error('Erro ao salvar flashcards:', saveError);
        }
      }
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

  // Registrar visualização quando buscar um artigo
  const registrarVisualizacao = async (numeroArtigo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('artigos_visualizacoes')
        .insert({
          tabela_codigo: tableName,
          numero_artigo: numeroArtigo,
          user_id: user?.id || null,
          origem: 'busca'
        });
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  // Registrar visualização quando buscar um artigo específico
  useEffect(() => {
    if (searchQuery && filteredArticles.length > 0) {
      const primeiroArtigo = filteredArticles[0];
      if (primeiroArtigo["Número do Artigo"]) {
        registrarVisualizacao(primeiroArtigo["Número do Artigo"]);
      }
    }
  }, [searchQuery]);

  return <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Tabs */}
      <VadeMecumTabs 
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
      />

      {/* Search Bar - only show on artigos tab */}
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

      {/* Sticky Audio Player for Comments */}
      <StickyAudioPlayer 
        isOpen={stickyPlayerOpen} 
        onClose={() => setStickyPlayerOpen(false)} 
        audioUrl={currentAudio.url} 
        title={currentAudio.title}
      />

      {/* Explicacao Modal */}
      <ExplicacaoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} artigo={modalData.artigo} numeroArtigo={modalData.numeroArtigo} tipo={modalData.tipo} nivel={modalData.nivel} />

      {/* Video Aula Modal */}
      <VideoAulaModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} videoUrl={videoModalData.videoUrl} artigo={videoModalData.artigo} numeroArtigo={videoModalData.numeroArtigo} />

      {/* Termos Modal */}
      <TermosModal 
        isOpen={termosModalOpen} 
        onClose={() => setTermosModalOpen(false)} 
        artigo={termosData.artigo} 
        numeroArtigo={termosData.numeroArtigo}
        codigoTabela={tableName}
      />

      {/* Questoes Modal */}
      <QuestoesModal 
        isOpen={questoesModalOpen} 
        onClose={() => setQuestoesModalOpen(false)} 
        artigo={questoesData.artigo} 
        numeroArtigo={questoesData.numeroArtigo}
        codigoTabela={tableName}
      />

      {/* Pergunta Modal */}
      <PerguntaModal isOpen={perguntaModalOpen} onClose={() => setPerguntaModalOpen(false)} artigo={perguntaData.artigo} numeroArtigo={perguntaData.numeroArtigo} />

      {/* Flashcards Modal */}
      {flashcardsModalOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-[hsl(45,93%,58%)]">Flashcards</h2>
              <button onClick={() => setFlashcardsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FlashcardViewer flashcards={flashcardsData} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="overflow-y-auto" style={{ 
        height: activeTab === 'artigos' ? 'calc(100vh - 126px)' : 'calc(100vh - 60px)' 
      }}>
        
        {/* Playlist Tab */}
        {activeTab === 'playlist' && (
          <div className="px-4 max-w-4xl mx-auto pb-20">
            <VadeMecumPlaylist 
              articles={articlesWithAudio}
              codigoNome={codeName}
            />
          </div>
        )}

        {/* Ranking Tab */}
        {activeTab === 'ranking' && (
          <div className="px-4 max-w-4xl mx-auto pb-20">
            <VadeMecumRanking 
              tableName={tableName}
              codigoNome={codeName}
              onArticleClick={handleArticleClick}
            />
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'artigos' && (
          <>
            {isLoading ? (
              <div className="space-y-6 px-4 max-w-4xl mx-auto pb-20">
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
            ) : viewMode === 'lista' ? (
              <ArtigoListaCompacta
                articles={displayedArticles}
                onArtigoClick={(article) => {
                  setArtigoExpandido(article.id);
                }}
                searchQuery={searchQuery}
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
                currentAudio={currentAudio}
                stickyPlayerOpen={stickyPlayerOpen}
                codeName={codeName}
              />
            ) : displayedArticles.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {searchQuery ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo disponível."}
              </div>
            ) : (
              <div className="px-4 max-w-4xl mx-auto pb-20">
                {displayedArticles.map((article, index) => {
        const hasNumber = article["Número do Artigo"] && article["Número do Artigo"].trim() !== "";

        // Se não tem número, renderiza como cabeçalho de seção
        if (!hasNumber) {
          return <div key={article.id} className="text-center mb-4 mt-6 font-serif-content">
                  <div className="text-sm leading-tight text-muted-foreground/80 whitespace-pre-line" dangerouslySetInnerHTML={{
              __html: formatTextWithUppercase(article["Artigo"] || "")
            }} />
                </div>;
        }

        // Destacar artigo se for resultado de busca
        const isHighlighted = searchQuery && article["Número do Artigo"]?.toLowerCase().trim() === searchQuery.toLowerCase().trim();

        // Se tem número, renderiza como card normal
        return <div key={article.id} ref={index === 0 && searchQuery ? firstResultRef : null} className={`relative overflow-hidden bg-card/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border transition-all duration-300 hover:shadow-lg scroll-mt-4 ${
            isHighlighted
              ? 'border-[hsl(45,93%,58%)] shadow-lg shadow-[hsl(45,93%,58%)]/20 ring-2 ring-[hsl(45,93%,58%)]/20' 
              : 'border-border/50 hover:border-[hsl(45,93%,58%)]/30 hover:shadow-[hsl(45,93%,58%)]/5'
          }`}>
                {/* Header with narration and share buttons */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-[hsl(45,93%,58%)] font-bold text-xl md:text-2xl">
                    Art. {article["Número do Artigo"]}
                  </h2>
                  <div className="flex gap-2">
                    <CopyButton 
                      text={`Art. ${article["Número do Artigo"]}\n${article["Artigo"]}`}
                      articleNumber={article["Número do Artigo"] || ""}
                      narrationUrl={article["Narração"] || undefined}
                    />
                    <Button
                      onClick={() => {
                        const whatsappText = formatForWhatsApp(`# Artigo ${article["Número do Artigo"]} - ${codeName}\n\n${article["Artigo"]}`);
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

                {/* Article Content */}
                <div
                  className="article-content text-foreground/90 mb-6 whitespace-pre-line leading-relaxed font-serif-content break-words overflow-hidden"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: "1.7",
                    overflowWrap: "break-word",
                    wordBreak: "break-word"
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatArticleContent(article["Artigo"] || "Conteúdo não disponível")
                  }}
                />

                {/* Action Menu */}
                <div className="mb-4 animate-fade-in">
                <ArtigoActionsMenu
                  article={article}
                  codigoNome={codeName}
                  onPlayComment={handlePlayComment}
                    onOpenAula={() => handleOpenAula(article)}
                    onOpenExplicacao={(tipo) => handleOpenExplicacao(article["Artigo"]!, article["Número do Artigo"]!, tipo)}
                    onGenerateFlashcards={() => handleGenerateFlashcards(article["Artigo"]!, article["Número do Artigo"]!)}
                    onOpenTermos={() => {
                      setTermosData({ artigo: article["Artigo"]!, numeroArtigo: article["Número do Artigo"]! });
                      setTermosModalOpen(true);
                    }}
                    onOpenQuestoes={() => {
                      setQuestoesData({ artigo: article["Artigo"]!, numeroArtigo: article["Número do Artigo"]! });
                      setQuestoesModalOpen(true);
                    }}
                    onPerguntar={() => {
                      setPerguntaData({ artigo: article["Artigo"]!, numeroArtigo: article["Número do Artigo"]! });
                      setPerguntaModalOpen(true);
                    }}
                    loadingFlashcards={loadingFlashcards}
                    isCommentPlaying={stickyPlayerOpen && currentAudio.isComment && currentAudio.title.includes(article["Número do Artigo"]!)}
                  />
                </div>
                  </div>;
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Controls - Only visible when content is showing on artigos tab in expanded mode */}
      {activeTab === 'artigos' && viewMode === 'expandido' && displayedArticles.length > 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[60rem] px-4 flex justify-between z-30 pointer-events-none">
          {/* Font size controls on the left */}
          <div className="flex flex-col gap-2 animate-fade-in pointer-events-auto">
            <button onClick={increaseFontSize} className="bg-[hsl(45,93%,58%)] hover:bg-[hsl(45,88%,52%)] text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={decreaseFontSize} className="bg-[hsl(45,93%,58%)] hover:bg-[hsl(45,88%,52%)] text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
              <Minus className="w-4 h-4" />
            </button>
            <div className="bg-card border border-border text-foreground text-xs font-medium px-2 py-1.5 rounded-full text-center shadow-lg">
              {fontSize}px
            </div>
          </div>

          {/* Scroll to top button on the right */}
          <div className="animate-fade-in pointer-events-auto mt-20">
            <button onClick={scrollToTop} className="bg-[hsl(45,93%,58%)] hover:bg-[hsl(45,88%,52%)] text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>;
};

export default CodigoView;
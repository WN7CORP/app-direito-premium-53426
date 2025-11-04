import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Sparkles, FileText, Calendar, Headphones, Gavel, Gamepad2, ScrollText, BookOpen, Monitor, Video, Home, Search as SearchIcon, Loader2, Newspaper, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlaylistCarousel } from "@/components/VideoPlaylistCarousel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SmartLoadingIndicator } from "@/components/chat/SmartLoadingIndicator";
import { CursosCarousel } from "@/components/CursosCarousel";

const Aprender = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Estados para videoaulas - carrossel de áreas
  const [areasPreview, setAreasPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreasPreview();
  }, []);

  const fetchAreasPreview = async () => {
    try {
      const { data, error } = await supabase
        .from('VIDEO AULAS-NOVO' as any)
        .select('area, thumb, categoria')
        .eq('categoria', 'Áreas');

      if (error) throw error;

      // Agrupar por área, pegar a primeira thumb e contar vídeos
      const areaMap = new Map<string, { thumb: string, count: number }>();
      
      data?.forEach((video: any) => {
        if (!areaMap.has(video.area)) {
          areaMap.set(video.area, { thumb: video.thumb, count: 1 });
        } else {
          const current = areaMap.get(video.area)!;
          areaMap.set(video.area, { ...current, count: current.count + 1 });
        }
      });

      // Criar array de áreas únicas com suas capas e contagem, embaralhado aleatoriamente
      const areasUnicas = Array.from(areaMap.entries())
        .map(([area, data]) => ({ area, thumb: data.thumb, count: data.count }))
        .sort(() => Math.random() - 0.5);

      setAreasPreview(areasUnicas);
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
    } finally {
      setLoading(false);
    }
  };

  const opcoesComplementares = [
    {
      id: "resumos",
      titulo: "Resumos Jurídicos",
      descricao: "Crie resumos estruturados de textos e documentos",
      icon: ScrollText,
      path: "/resumos-juridicos",
      iconBg: "bg-orange-600 shadow-lg shadow-orange-500/50",
      glowColor: "rgb(234, 88, 12)",
    },
    {
      id: "flashcards",
      titulo: "Flashcards",
      descricao: "Estude com flashcards interativos por área e tema",
      icon: Sparkles,
      path: "/flashcards",
      iconBg: "bg-blue-600 shadow-lg shadow-blue-500/50",
      glowColor: "rgb(37, 99, 235)",
    },
    {
      id: "mapa-mental",
      titulo: "Mapa Mental",
      descricao: "Mapas mentais visuais organizados por área do direito",
      icon: Brain,
      path: "/mapa-mental",
      iconBg: "bg-violet-600 shadow-lg shadow-violet-500/50",
      glowColor: "rgb(124, 58, 237)",
    },
    {
      id: "plano",
      titulo: "Plano de Estudos",
      descricao: "Organize seu cronograma de estudos personalizado",
      icon: Calendar,
      path: "/plano-estudos",
      iconBg: "bg-indigo-600 shadow-lg shadow-indigo-500/50",
      glowColor: "rgb(79, 70, 229)",
    },
    {
      id: "audioaulas",
      titulo: "Audioaulas",
      descricao: "Aprenda ouvindo em qualquer lugar",
      icon: Headphones,
      path: "/audioaulas",
      iconBg: "bg-purple-600 shadow-lg shadow-purple-500/50",
      glowColor: "rgb(147, 51, 234)",
    },
    {
      id: "desktop",
      titulo: "Acesso Desktop",
      descricao: "Acesse a plataforma completa no computador",
      icon: Monitor,
      path: "/acesso-desktop",
      iconBg: "bg-green-600 shadow-lg shadow-green-500/50",
      glowColor: "rgb(22, 163, 74)",
    },
  ];


  const estagiosDireito = [
    {
      id: "buscar-vagas",
      titulo: "Buscar Vagas",
      descricao: "Encontre oportunidades de estágio em todo o Brasil",
      icon: SearchIcon,
      path: "/aprender/estagios/buscar",
      iconBg: "bg-emerald-600 shadow-lg shadow-emerald-500/50",
      glowColor: "rgb(5, 150, 105)",
    },
    {
      id: "blog-estagios",
      titulo: "Blog",
      descricao: "Dicas e orientações para conseguir seu estágio",
      icon: Newspaper,
      path: "/aprender/estagios/blog",
      iconBg: "bg-blue-600 shadow-lg shadow-blue-500/50",
      glowColor: "rgb(37, 99, 235)",
    },
  ];

  const jogosEducativos = [
    {
      id: "jogos-juridicos",
      titulo: "Jogos Jurídicos",
      descricao: "Aprenda brincando: forca, cruzadas, caça-palavras e stop",
      icon: Gamepad2,
      path: "/jogos-juridicos",
      iconBg: "bg-pink-600 shadow-lg shadow-pink-500/50",
      glowColor: "rgb(219, 39, 119)",
      disponivel: true
    },
    {
      id: "simulacao-juridica",
      titulo: "Jogo de Simulação",
      descricao: "Pratique argumentação em audiências virtuais interativas",
      icon: Gavel,
      path: "/simulacao-juridica",
      iconBg: "bg-amber-600 shadow-lg shadow-amber-500/50",
      glowColor: "rgb(217, 119, 6)",
      disponivel: false
    },
  ];

  return (
    <div className="px-3 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Faculdade</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Conteúdo completo para aprender sobre Direito
        </p>
      </div>

      {/* Seção de Videoaulas Preview */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 shadow-lg shadow-red-500/50">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Videoaulas</h2>
              <p className="text-sm text-muted-foreground">
                Áreas do direito e conteúdos complementares
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/videoaulas")}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
          >
            Acessar
          </button>
        </div>

        {loading ? (
          <SmartLoadingIndicator nome="Videoaulas" />
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {areasPreview.map((area, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-72"
                >
                  <div className="bg-secondary/30 rounded-xl p-3 transition-all hover:bg-secondary/50">
                    <div
                      onClick={() => navigate(`/videoaulas/area/${encodeURIComponent(area.area)}`)}
                      className="cursor-pointer group"
                    >
                      <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden mb-3 shadow-lg">
                        {area.thumb && (
                          <img
                            src={area.thumb}
                            alt={area.area}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="bg-red-600 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-1">
                        <h3 className="font-bold text-foreground text-base mb-1 line-clamp-2">
                          {area.area}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {area.count} {area.count === 1 ? 'vídeo' : 'vídeos'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      {/* Seção Complementos em Alta */}
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Complementos em Alta</h2>
          <p className="text-sm text-muted-foreground">
            Ferramentas e recursos para aprimorar seus estudos
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {opcoesComplementares.map((opcao) => {
              const Icon = opcao.icon;
              return (
                <button
                  key={opcao.id}
                  onClick={() => navigate(opcao.path)}
                  className="bg-card rounded-2xl md:rounded-xl p-5 md:p-4 text-left transition-all hover:scale-105 hover:shadow-xl min-h-[180px] md:min-h-[160px] flex flex-col border border-border shadow-lg"
                >
                  <div className={`${opcao.iconBg} rounded-full p-3 md:p-2.5 w-fit mb-4 md:mb-3`}>
                    <Icon className="w-6 h-6 md:w-5 md:h-5 text-white" />
                  </div>
                  <h3 className="text-sm md:text-sm font-bold text-foreground mb-2 md:mb-1.5">
                    {opcao.titulo}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-[11px] line-clamp-3">
                    {opcao.descricao}
                  </p>
                </button>
              );
            })}
        </div>
      </div>

      {/* Seção Cursos em Destaque */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Cursos em Destaque</h2>
            <p className="text-sm text-muted-foreground">
              Descomplicando o Direito
            </p>
          </div>
          <button
            onClick={() => navigate("/iniciando-direito")}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
          >
            Acessar
          </button>
        </div>
        
        <CursosCarousel />
      </div>

      {/* Seção Estágios em Direito */}
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Estágios em Direito</h2>
          <p className="text-sm text-muted-foreground">
            Encontre oportunidades e dicas para sua carreira
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {estagiosDireito.map((opcao) => {
            const Icon = opcao.icon;
            return (
              <button
                key={opcao.id}
                onClick={() => navigate(opcao.path)}
                className="bg-card rounded-2xl md:rounded-xl p-5 md:p-4 text-left transition-all hover:scale-105 hover:shadow-xl min-h-[180px] md:min-h-[160px] flex flex-col border border-border shadow-lg"
              >
                <div className={`${opcao.iconBg} rounded-full p-3 md:p-2.5 w-fit mb-4 md:mb-3`}>
                  <Icon className="w-6 h-6 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-sm md:text-sm font-bold text-foreground mb-2 md:mb-1.5">
                  {opcao.titulo}
                </h3>
                <p className="text-muted-foreground text-xs md:text-[11px] line-clamp-3">
                  {opcao.descricao}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seção Jogos Educativos */}
      <div className="mt-12 pb-20">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Jogos Educativos</h2>
          <p className="text-sm text-muted-foreground">
            Aprenda sobre direito jogando
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {jogosEducativos.map((jogo) => {
            const Icon = jogo.icon;
            return (
              <Card
                key={jogo.id}
                onClick={() => jogo.disponivel && navigate(jogo.path)}
                className={`transition-all border-2 border-transparent bg-gradient-to-br from-card to-card/80 group shadow-xl overflow-hidden relative animate-fade-in ${
                  jogo.disponivel
                    ? 'cursor-pointer hover:scale-105 hover:shadow-2xl hover:-translate-y-1 hover:border-accent/50'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {!jogo.disponivel && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 z-10">
                    Em Breve
                  </Badge>
                )}
                
                {/* Brilho colorido no topo */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 opacity-80"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${jogo.glowColor}, transparent)`,
                    boxShadow: `0 0 20px ${jogo.glowColor}`
                  }}
                />
                
                <CardContent className="p-5 flex flex-col items-center text-center min-h-[180px] justify-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${jogo.iconBg} transition-transform group-hover:scale-110 mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-2 text-foreground">{jogo.titulo}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{jogo.descricao}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Aprender;

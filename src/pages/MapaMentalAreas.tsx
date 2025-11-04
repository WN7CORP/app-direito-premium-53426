import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { SmartLoadingIndicator } from "@/components/chat/SmartLoadingIndicator";
interface AreaData {
  area: string;
  count: number;
}

// Mapeamento de cores por área (deve ser consistente com MapaMentalTemas)
const CORES_POR_AREA: Record<string, {
  cor: string;
  bordaCor: string;
  glowColor: string;
}> = {
  "DIREITO CIVIL": {
    cor: "from-red-500 to-red-700",
    bordaCor: "border-red-500/30",
    glowColor: "rgb(239, 68, 68)"
  },
  "DIREITO CONSTITUCIONAL": {
    cor: "from-blue-500 to-blue-700",
    bordaCor: "border-blue-500/30",
    glowColor: "rgb(59, 130, 246)"
  },
  "DIREITO EMPRESARIAL": {
    cor: "from-green-500 to-green-700",
    bordaCor: "border-green-500/30",
    glowColor: "rgb(34, 197, 94)"
  },
  "DIREITO PENAL": {
    cor: "from-purple-500 to-purple-700",
    bordaCor: "border-purple-500/30",
    glowColor: "rgb(168, 85, 247)"
  },
  "DIREITO TRIBUTÁRIO": {
    cor: "from-yellow-500 to-yellow-700",
    bordaCor: "border-yellow-500/30",
    glowColor: "rgb(234, 179, 8)"
  },
  "DIREITO ADMINISTRATIVO": {
    cor: "from-indigo-500 to-indigo-700",
    bordaCor: "border-indigo-500/30",
    glowColor: "rgb(99, 102, 241)"
  },
  "DIREITO TRABALHISTA": {
    cor: "from-orange-500 to-orange-700",
    bordaCor: "border-orange-500/30",
    glowColor: "rgb(249, 115, 22)"
  },
  "DIREITO PROCESSUAL CIVIL": {
    cor: "from-cyan-500 to-cyan-700",
    bordaCor: "border-cyan-500/30",
    glowColor: "rgb(6, 182, 212)"
  },
  "DIREITO PROCESSUAL PENAL": {
    cor: "from-pink-500 to-pink-700",
    bordaCor: "border-pink-500/30",
    glowColor: "rgb(236, 72, 153)"
  }
};
const CORES_DEFAULT = {
  cor: "from-violet-500 to-violet-700",
  bordaCor: "border-violet-500/30",
  glowColor: "rgb(124, 58, 237)"
};
export default function MapaMentalAreas() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchAreas();
  }, []);
  const fetchAreas = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('MAPA MENTAL' as any).select('area');
      if (error) throw error;

      // Agrupar por área e contar temas
      const areaMap = new Map<string, number>();
      data?.forEach((item: any) => {
        const area = item.area;
        if (area) {
          areaMap.set(area, (areaMap.get(area) || 0) + 1);
        }
      });

      // Criar array de áreas únicas com contagem, ordenado alfabeticamente
      const areasUnicas = Array.from(areaMap.entries()).map(([area, count]) => ({
        area,
        count
      })).sort((a, b) => a.area.localeCompare(b.area, 'pt-BR'));
      setAreas(areasUnicas);
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-card to-background pb-20">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <SmartLoadingIndicator nome="Áreas do Mapa Mental" />
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-card to-background pb-20">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          

          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-600 shadow-lg shadow-violet-500/50">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Mapa Mental</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Escolha a área do direito
              </p>
            </div>
          </div>
        </div>

        {/* Grid de áreas */}
        {areas.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {areas.map(areaData => {
          const cores = CORES_POR_AREA[areaData.area.toUpperCase()] || CORES_DEFAULT;
          return <Card key={areaData.area} className={`cursor-pointer hover:scale-105 transition-all bg-card ${cores.bordaCor} border-2 group relative overflow-hidden`} onClick={() => navigate(`/mapa-mental/area/${encodeURIComponent(areaData.area)}`)}>
                  {/* Brilho no topo */}
                  <div className="absolute top-0 left-0 right-0 h-1 opacity-80" style={{
              background: `linear-gradient(90deg, transparent, ${cores.glowColor}, transparent)`,
              boxShadow: `0 0 20px ${cores.glowColor}`
            }} />

                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${cores.cor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Brain className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xs font-bold text-foreground mb-2 leading-tight line-clamp-2 min-h-[2.5rem]">
                      {areaData.area}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm">
                      {areaData.count} {areaData.count === 1 ? 'mapa' : 'mapas'}
                    </p>
                  </CardContent>
                </Card>;
        })}
          </div> : <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma área encontrada.</p>
          </div>}
      </div>
    </div>;
}
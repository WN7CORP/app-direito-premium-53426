import { useNavigate } from "react-router-dom";
import { HandCoins, Calculator, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

const Previdenciario = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const leis = [
    {
      id: "beneficios",
      sigla: "LB",
      titulo: "Lei de Benefícios da Previdência Social",
      numero: "Lei 8.213/1991",
      descricao: "Dispõe sobre os Planos de Benefícios da Previdência Social",
      icon: HandCoins,
      borderColor: "border-l-[hsl(142,76%,36%)]",
      iconBg: "bg-[hsl(142,76%,36%)]/10",
      iconColor: "text-[hsl(142,76%,36%)]",
      route: "/lei-previdenciaria/beneficios"
    },
    {
      id: "custeio",
      sigla: "LC",
      titulo: "Lei de Custeio da Previdência Social",
      numero: "Lei 8.212/1991",
      descricao: "Dispõe sobre a organização da Seguridade Social e Plano de Custeio",
      icon: Calculator,
      borderColor: "border-l-[hsl(217,91%,60%)]",
      iconBg: "bg-[hsl(217,91%,60%)]/10",
      iconColor: "text-[hsl(217,91%,60%)]",
      route: "/lei-previdenciaria/custeio"
    }
  ];

  const filteredLeis = useMemo(() => {
    if (!searchQuery.trim()) return leis;
    
    const query = searchQuery.toLowerCase();
    return leis.filter(lei => 
      lei.sigla.toLowerCase().includes(query) || 
      lei.titulo.toLowerCase().includes(query) ||
      lei.numero.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const getGlowColor = (id: string) => {
    const colorMap: Record<string, string> = {
      "beneficios": "hsl(142,76%,36%)",
      "custeio": "hsl(217,91%,60%)"
    };
    return colorMap[id] || "hsl(142,76%,36%)";
  };

  return (
    <div className="px-3 py-4 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 shadow-lg shadow-emerald-500/50">
            <HandCoins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Previdenciário</h1>
            <p className="text-sm text-muted-foreground">
              Leis de Benefícios e Custeio da Previdência Social
            </p>
          </div>
        </div>
      </div>

      {/* Campo de Busca */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por sigla, nome ou número da lei..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-base"
            />
            <Button variant="outline" size="icon" className="shrink-0">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leis Grid */}
      {filteredLeis.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-3">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhuma lei encontrada
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredLeis.map((lei) => {
            const Icon = lei.icon;
            return (
              <Card
                key={lei.id}
                className="cursor-pointer hover:scale-105 hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-transparent hover:border-primary/50 bg-gradient-to-br from-card to-card/80 group overflow-hidden relative"
                onClick={() => navigate(lei.route)}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1 opacity-80"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${getGlowColor(lei.id)}, transparent)`,
                    boxShadow: `0 0 20px ${getGlowColor(lei.id)}`
                  }}
                />
                
                <CardContent className="p-4 flex flex-col items-center text-center min-h-[160px] justify-center">
                  <div className={`${lei.iconBg} rounded-full p-3 mb-2`}>
                    <Icon className={`w-6 h-6 ${lei.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{lei.sigla}</h3>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    {lei.titulo}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: getGlowColor(lei.id) }}>
                    {lei.numero}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Previdenciario;

import { useNavigate } from "react-router-dom";
import { Scale, Gavel, Briefcase, Vote, Shield, FileCheck, FileText, Building2 } from "lucide-react";

const Sumulas = () => {
  const navigate = useNavigate();

  const sumulas = [
    {
      id: "vinculantes",
      title: "Súmulas Vinculantes STF",
      description: "Efeito vinculante obrigatório para todos os tribunais",
      icon: Scale,
      available: true
    },
    {
      id: "stf",
      title: "STF",
      description: "Súmulas do Supremo Tribunal Federal",
      icon: Gavel,
      available: true
    },
    {
      id: "stj",
      title: "STJ",
      description: "Súmulas do Superior Tribunal de Justiça",
      icon: Gavel,
      available: true
    },
    {
      id: "tst",
      title: "TST",
      description: "Súmulas trabalhistas e relações de trabalho",
      icon: Briefcase,
      available: false
    },
    {
      id: "tse",
      title: "TSE",
      description: "Súmulas eleitorais e direito eleitoral",
      icon: Vote,
      available: false
    },
    {
      id: "tcu",
      title: "TCU",
      description: "Súmulas de controle e fiscalização de contas públicas",
      icon: FileCheck,
      available: false
    },
    {
      id: "stm",
      title: "STM",
      description: "Súmulas de justiça militar",
      icon: Shield,
      available: false
    },
    {
      id: "cnmp",
      title: "CNMP",
      description: "Enunciados sobre atuação do Ministério Público",
      icon: FileText,
      available: false
    },
    {
      id: "cnj",
      title: "CNJ",
      description: "Enunciados sobre organização judiciária",
      icon: Building2,
      available: false
    }
  ];

  return (
    <div className="px-3 py-4 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-600 shadow-lg shadow-cyan-500/50">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Súmulas</h1>
            <p className="text-sm text-muted-foreground">
              Acesse súmulas de tribunais superiores e enunciados
            </p>
          </div>
        </div>
      </div>

      {/* Súmulas Grid */}
      <div className="grid grid-cols-2 gap-3">
        {sumulas.map((sumula) => {
          const Icon = sumula.icon;
          
          if (!sumula.available) {
            return (
              <div
                key={sumula.id}
                className="bg-card/50 border-2 border-dashed border-border/50 rounded-xl overflow-hidden relative opacity-60 cursor-not-allowed"
              >
                <div className="p-4 flex flex-col items-center text-center min-h-[140px] justify-center">
                  <div className="bg-muted/50 rounded-full p-3 mb-2">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-base mb-1 text-muted-foreground">{sumula.title}</h3>
                  <div className="mt-2 px-3 py-1 bg-primary/20 rounded-full">
                    <p className="text-xs font-semibold text-primary">Em Breve</p>
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <button
              key={sumula.id}
              onClick={() => navigate(`/sumula/${sumula.id}`)}
              className="bg-card hover:scale-105 hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-transparent hover:border-primary/50 bg-gradient-to-br from-card to-card/80 group overflow-hidden relative rounded-xl"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1 opacity-80"
                style={{
                  background: `linear-gradient(90deg, transparent, hsl(174,72%,56%), transparent)`,
                  boxShadow: `0 0 20px hsl(174,72%,56%)`
                }}
              />
              
              <div className="p-4 flex flex-col items-center text-center min-h-[140px] justify-center">
                <div className="bg-[hsl(174,72%,56%)]/10 rounded-full p-3 mb-2">
                  <Icon className="w-6 h-6 text-[hsl(174,72%,56%)]" />
                </div>
                <h3 className="font-bold text-base mb-1">{sumula.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {sumula.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sumulas;

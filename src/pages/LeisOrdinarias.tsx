import { useNavigate } from "react-router-dom";
import { FileText, Scale, Shield, Database, Key, ClipboardCheck, Eye, DollarSign, FileCheck, BookMarked, Users, AlertTriangle, Handshake, Gavel } from "lucide-react";

const LeisOrdinarias = () => {
  const navigate = useNavigate();

  const leis = [
    {
      id: "improbidade",
      title: "Lei 8.429/1992",
      subtitle: "Improbidade Administrativa",
      icon: Shield,
      iconBg: "bg-red-600",
      route: "/leis-ordinarias/improbidade"
    },
    {
      id: "licitacoes-nova",
      title: "Lei 14.133/2021",
      subtitle: "Nova Lei de Licitações",
      icon: FileCheck,
      iconBg: "bg-blue-600",
      route: "/leis-ordinarias/licitacoes"
    },
    {
      id: "acao-civil-publica",
      title: "Lei 7.347/1985",
      subtitle: "Ação Civil Pública",
      icon: Users,
      iconBg: "bg-green-600",
      route: "/leis-ordinarias/acao-civil-publica"
    },
    {
      id: "lgpd",
      title: "Lei 13.709/2018",
      subtitle: "LGPD",
      icon: Database,
      iconBg: "bg-purple-600",
      route: "/leis-ordinarias/lgpd"
    },
    {
      id: "lrf",
      title: "LC 101/2000",
      subtitle: "Lei de Responsabilidade Fiscal",
      icon: DollarSign,
      iconBg: "bg-emerald-600",
      route: "/leis-ordinarias/lrf"
    },
    {
      id: "processo-administrativo",
      title: "Lei 9.784/1999",
      subtitle: "Processo Administrativo",
      icon: ClipboardCheck,
      iconBg: "bg-orange-600",
      route: "/leis-ordinarias/processo-administrativo"
    },
    {
      id: "acesso-informacao",
      title: "Lei 12.527/2011",
      subtitle: "Acesso à Informação",
      icon: Eye,
      iconBg: "bg-cyan-600",
      route: "/leis-ordinarias/acesso-informacao"
    },
    {
      id: "legislacao-tributaria",
      title: "Lei 9.430/1996",
      subtitle: "Legislação Tributária",
      icon: Scale,
      iconBg: "bg-yellow-600",
      route: "/leis-ordinarias/legislacao-tributaria"
    },
    {
      id: "registros-publicos",
      title: "Lei 6.015/1973",
      subtitle: "Registros Públicos",
      icon: BookMarked,
      iconBg: "bg-indigo-600",
      route: "/leis-ordinarias/registros-publicos"
    },
    {
      id: "juizados-civeis",
      title: "Lei 9.099/1995",
      subtitle: "Juizados Especiais Cíveis",
      icon: Gavel,
      iconBg: "bg-teal-600",
      route: "/leis-ordinarias/juizados-civeis"
    },
    {
      id: "acao-popular",
      title: "Lei 4.717/1965",
      subtitle: "Ação Popular",
      icon: Users,
      iconBg: "bg-pink-600",
      route: "/leis-ordinarias/acao-popular"
    },
    {
      id: "anticorrupcao",
      title: "Lei 12.846/2013",
      subtitle: "Lei Anticorrupção",
      icon: AlertTriangle,
      iconBg: "bg-rose-600",
      route: "/leis-ordinarias/anticorrupcao"
    },
    {
      id: "mediacao",
      title: "Lei 13.140/2015",
      subtitle: "Lei de Mediação",
      icon: Handshake,
      iconBg: "bg-amber-600",
      route: "/leis-ordinarias/mediacao"
    },
    {
      id: "adi-adc",
      title: "Lei 9.868/1999",
      subtitle: "ADI e ADC",
      icon: Key,
      iconBg: "bg-violet-600",
      route: "/leis-ordinarias/adi-adc"
    }
  ];

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground animate-fade-in">Leis Ordinárias</h1>
        <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Principais leis ordinárias e complementares do ordenamento jurídico brasileiro
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {leis.map((lei, index) => {
          const Icon = lei.icon;
          return (
            <button
              key={lei.id}
              onClick={() => navigate(lei.route)}
              className="bg-card rounded-xl p-4 text-left transition-all hover:scale-105 hover:shadow-xl animate-fade-in h-40 flex flex-col"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'backwards'
              }}
            >
              <div className={`${lei.iconBg} rounded-full p-3 w-fit mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xs font-semibold text-primary mb-1">
                {lei.title}
              </h3>
              <h4 className="text-sm font-bold text-foreground leading-tight">
                {lei.subtitle}
              </h4>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeisOrdinarias;

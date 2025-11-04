import { useNavigate } from "react-router-dom";
import { Gavel, Film, Scale, ScanText, Newspaper, GraduationCap, MessageCircle, MapPin, FileText } from "lucide-react";

const Ferramentas = () => {
  const navigate = useNavigate();

  const ferramentas = [
    {
      id: "assistente-pessoal",
      titulo: "Assistente Pessoal",
      descricao: "Assistente jurídica no WhatsApp para te ajudar no dia a dia",
      icon: MessageCircle,
      path: "/assistente-pessoal",
      iconColor: "bg-green-500",
      emBreve: false,
    },
    {
      id: "simulado-tjsp",
      titulo: "Simulado TJSP",
      descricao: "Pratique com questões reais do concurso TJSP",
      icon: FileText,
      path: "/simulados/tjsp",
      iconColor: "bg-blue-600",
      emBreve: false,
    },
    {
      id: "noticias-juridicas",
      titulo: "Notícias Jurídicas",
      descricao: "Fique por dentro das últimas notícias",
      icon: Newspaper,
      path: "/noticias-juridicas",
      iconColor: "bg-red-500",
      emBreve: false,
    },
    {
      id: "dicionario",
      titulo: "Dicionário Jurídico",
      descricao: "Consulte termos e definições do direito",
      icon: Gavel,
      path: "/dicionario",
      iconColor: "bg-gray-500",
      emBreve: false,
    },
    {
      id: "juriflix",
      titulo: "JuriFlix",
      descricao: "Filmes e séries jurídicas",
      icon: Film,
      path: "/juriflix",
      iconColor: "bg-red-500",
      emBreve: false,
    },
    {
      id: "ranking-faculdades",
      titulo: "Ranking Faculdades",
      descricao: "Melhores faculdades de Direito do Brasil",
      icon: GraduationCap,
      path: "/ranking-faculdades",
      iconColor: "bg-gray-600",
      emBreve: false,
    },
    {
      id: "peticoes",
      titulo: "Petições",
      descricao: "Modelos e criação de petições com IA",
      icon: Scale,
      path: "/advogado",
      iconColor: "bg-blue-500",
      emBreve: false,
    },
    {
      id: "analisar",
      titulo: "Analisar",
      descricao: "Analise documentos com IA",
      icon: ScanText,
      path: "/analisar",
      iconColor: "bg-amber-500",
      emBreve: true,
    },
    {
      id: "meu-brasil",
      titulo: "Meu Brasil",
      descricao: "História, juristas, casos famosos e instituições brasileiras",
      icon: MapPin,
      path: "/meu-brasil",
      iconColor: "bg-green-500",
      emBreve: true,
    },
  ];

  return (
    <div className="px-3 py-4 max-w-6xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-1">Ferramentas</h1>
        <p className="text-sm text-muted-foreground">
          Recursos úteis para seus estudos
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {ferramentas.map((ferramenta) => {
          const Icon = ferramenta.icon;
          return (
            <button
              key={ferramenta.id}
              onClick={() => !ferramenta.emBreve && navigate(ferramenta.path)}
              className={`bg-card rounded-2xl md:rounded-xl p-5 md:p-4 text-left transition-all min-h-[180px] md:min-h-[160px] flex flex-col border border-border shadow-lg relative ${
                ferramenta.emBreve 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:scale-105 hover:shadow-xl'
              }`}
              disabled={ferramenta.emBreve}
            >
              {ferramenta.emBreve && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  Em Breve
                </div>
              )}
              <div className={`${ferramenta.iconColor} rounded-full p-3 md:p-2.5 w-fit mb-4 md:mb-3`}>
                <Icon className="w-6 h-6 md:w-5 md:h-5 text-white" />
              </div>
              <h3 className="text-sm md:text-sm font-bold text-foreground mb-2 md:mb-1.5">
                {ferramenta.titulo}
              </h3>
              <p className="text-muted-foreground text-xs md:text-[11px] line-clamp-3">
                {ferramenta.descricao}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Ferramentas;

import { 
  MessageSquare, 
  GraduationCap, 
  Lightbulb, 
  BookOpen, 
  Bookmark, 
  BookMarked, 
  FileQuestion, 
  Sparkles,
  Share2,
  X
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Article {
  "Número do Artigo": string | null;
  "Artigo": string | null;
  "Narração": string | null;
  "Comentario": string | null;
  "Aula": string | null;
}

interface ArtigoActionsMenuProps {
  article: Article;
  codigoNome: string;
  onPlayNarration?: (audioUrl: string) => void;
  onPlayComment?: (audioUrl: string, title: string) => void;
  onOpenAula?: () => void;
  onOpenExplicacao?: (tipo: "explicacao" | "exemplo") => void;
  onGenerateFlashcards?: () => void;
  onOpenTermos?: () => void;
  onOpenQuestoes?: () => void;
  onPerguntar?: () => void;
  loadingFlashcards?: boolean;
  isCommentPlaying?: boolean;
}

export const ArtigoActionsMenu = ({
  article,
  codigoNome,
  onPlayNarration,
  onPlayComment,
  onOpenAula,
  onOpenExplicacao,
  onGenerateFlashcards,
  onOpenTermos,
  onOpenQuestoes,
  onPerguntar,
  loadingFlashcards = false,
  isCommentPlaying = false,
}: ArtigoActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasAula = article["Aula"];
  const hasComentario = article["Comentario"];

  const handleShareWhatsApp = () => {
    const numeroArtigo = article["Número do Artigo"];
    const conteudo = article["Artigo"];
    
    if (!numeroArtigo || !conteudo) return;
    
    // Remover emojis do texto principal
    const textoLimpo = conteudo.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    
    // Apenas emoji no topo indicando o artigo
    const fullText = `📜 ${codigoNome} - Art. ${numeroArtigo}\n\n${textoLimpo}`;
    const encodedText = encodeURIComponent(fullText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const recursos = [
    {
      icon: Lightbulb,
      label: "Explicar",
      description: "Explicação detalhada do artigo",
      action: () => onOpenExplicacao?.("explicacao"),
      show: !!onOpenExplicacao
    },
    {
      icon: BookOpen,
      label: "Exemplo",
      description: "Veja exemplos práticos de aplicação",
      action: () => onOpenExplicacao?.("exemplo"),
      show: !!onOpenExplicacao
    },
    {
      icon: BookMarked,
      label: "Termos",
      description: "Glossário com termos técnicos",
      action: onOpenTermos,
      show: !!onOpenTermos
    },
    {
      icon: FileQuestion,
      label: "Questões",
      description: "Pratique com questões sobre o artigo",
      action: onOpenQuestoes,
      show: !!onOpenQuestoes
    },
    {
      icon: Bookmark,
      label: "Flashcards",
      description: loadingFlashcards ? "Gerando flashcards..." : "Crie flashcards para memorização",
      action: onGenerateFlashcards,
      show: !!onGenerateFlashcards,
      disabled: loadingFlashcards
    },
    {
      icon: MessageSquare,
      label: "Perguntar",
      description: "Tire suas dúvidas com a IA",
      action: onPerguntar,
      show: !!onPerguntar
    }
  ].filter(item => item.show);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-[hsl(45,93%,58%)]/10 to-[hsl(45,93%,58%)]/20 hover:from-[hsl(45,93%,58%)]/20 hover:to-[hsl(45,93%,58%)]/30 text-foreground border-[hsl(45,93%,58%)]/40 font-semibold transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
          variant="outline"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          <span className="text-sm">Recursos do Artigo</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] animate-scale-in max-h-[80vh] overflow-y-auto">
        <DialogHeader className="relative pr-8">
          <DialogTitle className="flex items-start gap-2 text-lg leading-tight">
            <Sparkles className="w-5 h-5 text-[hsl(45,93%,58%)] mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Recursos do Art. {article["Número do Artigo"]}</div>
              <div className="text-sm font-normal text-muted-foreground mt-0.5">{codigoNome}</div>
            </div>
          </DialogTitle>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-0 top-0 rounded-full p-1.5 hover:bg-accent/20 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogHeader>
        
        {/* Lista vertical de recursos */}
        <div className="space-y-2 py-4">
          {recursos.map((recurso, index) => {
            const Icon = recurso.icon;
            return (
              <button
                key={index}
                onClick={() => recurso.action && handleAction(recurso.action)}
                disabled={recurso.disabled}
                className="action-button w-full flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-[hsl(45,93%,58%)]/10 to-[hsl(45,93%,58%)]/20 hover:from-[hsl(45,93%,58%)]/20 hover:to-[hsl(45,93%,58%)]/30 text-foreground rounded-xl transition-all duration-200 hover:scale-[1.02] border border-[hsl(45,93%,58%)]/40 shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:scale-100 text-left"
              >
                <Icon className="w-5 h-5 text-[hsl(45,93%,58%)] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{recurso.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{recurso.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

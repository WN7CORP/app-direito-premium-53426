import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown } from "lucide-react";
import { formatTextWithUppercase } from "@/lib/textFormatter";
import { ArtigoActionsMenu } from "@/components/ArtigoActionsMenu";
import { CopyButton } from "@/components/CopyButton";

interface Article {
  id: number;
  "Número do Artigo": string | null;
  "Artigo": string | null;
  "Narração": string | null;
  "Comentario": string | null;
  "Aula": string | null;
}

interface ArtigoListaCompactaProps {
  articles: Article[];
  onArtigoClick?: (article: Article) => void;
  searchQuery?: string;
  onPlayComment?: (audioUrl: string, title: string) => void;
  onOpenAula?: (article: Article) => void;
  onOpenExplicacao?: (artigo: string, numeroArtigo: string, tipo: "explicacao" | "exemplo", nivel?: "tecnico" | "simples") => void;
  onGenerateFlashcards?: (artigo: string, numeroArtigo: string) => void;
  onOpenTermos?: (artigo: string, numeroArtigo: string) => void;
  onOpenQuestoes?: (artigo: string, numeroArtigo: string) => void;
  onPerguntar?: (artigo: string, numeroArtigo: string) => void;
  loadingFlashcards?: boolean;
  currentAudio?: { url: string; title: string; isComment: boolean };
  stickyPlayerOpen?: boolean;
  codeName?: string;
}

export const ArtigoListaCompacta = ({ 
  articles, 
  onArtigoClick,
  searchQuery,
  onPlayComment,
  onOpenAula,
  onOpenExplicacao,
  onGenerateFlashcards,
  onOpenTermos,
  onOpenQuestoes,
  onPerguntar,
  loadingFlashcards,
  currentAudio,
  stickyPlayerOpen,
  codeName
}: ArtigoListaCompactaProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const getPreviewText = (content: string) => {
    const cleanText = content.replace(/\n/g, ' ').trim();
    return cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
  };

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-[hsl(45,93%,58%)]/20 text-[hsl(45,93%,58%)] font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatArticleContent = (content: string) => {
    return formatTextWithUppercase(content || "Conteúdo não disponível");
  };

  // Filtrar artigos sem número
  const articlesWithNumber = articles.filter(article => 
    article["Número do Artigo"] && article["Número do Artigo"].trim() !== ""
  );

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="px-4 py-2 pb-32 max-w-4xl mx-auto space-y-2">
        {articlesWithNumber.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum artigo encontrado</p>
          </div>
        ) : (
          articlesWithNumber.map((article, index) => {
            const numeroArtigo = article["Número do Artigo"] || "S/N";
            const conteudo = article["Artigo"] || "Conteúdo não disponível";
            const preview = getPreviewText(conteudo);
            const isExpanded = expandedId === article.id;
            
            return (
              <Card
                key={article.id}
                className={`overflow-hidden transition-all duration-300 bg-[hsl(45,93%,58%)]/5 ${
                  isExpanded 
                    ? 'border-[hsl(45,93%,58%)] shadow-lg' 
                    : 'hover:border-[hsl(45,93%,58%)]/50 hover:shadow-sm'
                }`}
              >
                {/* Header compacto - sempre visível */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    if (isExpanded) {
                      setExpandedId(null);
                    } else {
                      setExpandedId(article.id);
                      if (onArtigoClick) onArtigoClick(article);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Badge 
                      variant="secondary" 
                      className="shrink-0 h-12 w-12 flex items-center justify-center text-xs font-bold rounded-lg"
                    >
                      {numeroArtigo}
                    </Badge>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground">
                          {highlightText(`Art. ${numeroArtigo}`, searchQuery)}
                        </h3>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[hsl(45,93%,58%)] transition-colors shrink-0 mt-0.5" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(45,93%,58%)] transition-colors shrink-0 mt-0.5" />
                        )}
                      </div>
                      
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {highlightText(preview, searchQuery)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo expandido - com animação */}
                {isExpanded && (
                  <div className="px-4 pb-4 animate-accordion-down animate-scale-in">
                    {/* Botão de copiar */}
                    <div className="mb-4">
                      <CopyButton 
                        text={article["Artigo"] || ""}
                        articleNumber={article["Número do Artigo"] || ""}
                        narrationUrl={article["Narração"] || undefined}
                      />
                    </div>

                    {/* Conteúdo do artigo */}
                    <div
                      className="article-content text-foreground/90 mb-6 whitespace-pre-line leading-relaxed text-sm break-words overflow-hidden"
                      style={{
                        overflowWrap: "break-word",
                        wordBreak: "break-word"
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formatArticleContent(article["Artigo"] || "Conteúdo não disponível")
                      }}
                    />

                    {/* Menu de ações */}
                    <ArtigoActionsMenu
                      article={article}
                      codigoNome={codeName || ""}
                      onPlayComment={(audioUrl, title) => onPlayComment?.(audioUrl, title)}
                      onOpenAula={() => onOpenAula?.(article)}
                      onOpenExplicacao={(tipo) => onOpenExplicacao?.(article["Artigo"]!, article["Número do Artigo"]!, tipo)}
                      onGenerateFlashcards={() => onGenerateFlashcards?.(article["Artigo"]!, article["Número do Artigo"]!)}
                      onOpenTermos={() => onOpenTermos?.(article["Artigo"]!, article["Número do Artigo"]!)}
                      onOpenQuestoes={() => onOpenQuestoes?.(article["Artigo"]!, article["Número do Artigo"]!)}
                      onPerguntar={() => onPerguntar?.(article["Artigo"]!, article["Número do Artigo"]!)}
                      loadingFlashcards={loadingFlashcards || false}
                      isCommentPlaying={
                        stickyPlayerOpen && 
                        currentAudio?.isComment && 
                        currentAudio.title.includes(article["Número do Artigo"]!)
                      }
                    />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
};

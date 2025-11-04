import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, List, LayoutGrid } from "lucide-react";

interface BuscaCompactaProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  viewMode: 'lista' | 'expandido';
  onViewModeChange: (mode: 'lista' | 'expandido') => void;
  resultCount: number;
}

export const BuscaCompacta = ({
  value,
  onChange,
  onSearch,
  onClear,
  viewMode,
  onViewModeChange,
  resultCount
}: BuscaCompactaProps) => {
  return (
    <div className="bg-background border-b border-border sticky top-0 z-10">
      <div className="px-4 py-3 max-w-4xl mx-auto">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar artigo..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch();
                }
              }}
              className="pl-9 pr-20 h-11"
            />
            <Button
              onClick={onSearch}
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 bg-[hsl(45,93%,58%)]/70 hover:bg-[hsl(45,93%,58%)]/90 border border-[hsl(45,93%,58%)]/30 text-black"
            >
              Buscar
            </Button>
          </div>
          
          <Button
            onClick={() => onViewModeChange(viewMode === 'lista' ? 'expandido' : 'lista')}
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 bg-[hsl(45,93%,58%)]/70 hover:bg-[hsl(45,93%,58%)]/90 border border-[hsl(45,93%,58%)]/30 text-black transition-colors"
            title={viewMode === 'lista' ? 'Visualização expandida' : 'Visualização em lista'}
          >
            {viewMode === 'lista' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </Button>

          {value && (
            <Button
              onClick={onClear}
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {value && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {resultCount} {resultCount === 1 ? 'artigo encontrado' : 'artigos encontrados'}
          </p>
        )}
      </div>
    </div>
  );
};

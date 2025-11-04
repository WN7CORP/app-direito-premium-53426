import { supabase } from "@/integrations/supabase/client";

interface FetchOptions {
  limit?: number;
  offset?: number;
}

// Fetch rows with optional pagination for better performance
export async function fetchAllRows<T>(
  tableName: string, 
  orderBy: string = "id",
  options?: FetchOptions
): Promise<T[]> {
  // Se tem limite específico, busca apenas o necessário
  if (options?.limit) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;

    const { data, error } = await supabase
      .from(tableName as any)
      .select("*")
      .order(orderBy as any, { ascending: true })
      .range(from, to);

    if (error) {
      console.error(`Erro ao buscar tabela ${tableName}:`, error);
      throw error;
    }

    return (data || []) as T[];
  }

  // Modo legado: busca tudo (mantido para compatibilidade)
  const pageSize = 1000;
  let from = 0;
  let all: T[] = [];

  for (let i = 0; i < 50; i++) {
    const { data, error } = await supabase
      .from(tableName as any)
      .select("*")
      .order(orderBy as any, { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error(`Erro ao paginar tabela ${tableName}:`, error);
      throw error;
    }

    const batch = (data || []) as T[];
    all = all.concat(batch);

    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

// Nova função otimizada para carregamento inicial rápido
export async function fetchInitialRows<T>(
  tableName: string,
  limit: number = 50,
  orderBy: string = "id"
): Promise<T[]> {
  return fetchAllRows<T>(tableName, orderBy, { limit, offset: 0 });
}

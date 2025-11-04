import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🔍 Iniciando extração de títulos do CPPM do Planalto...");

    // Buscar página do Planalto com headers de navegador
    const url = "https://www.planalto.gov.br/ccivil_03/decreto-lei/del1002.htm";
    console.log(`📡 Buscando: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    console.log(`✅ Página carregada (${html.length} caracteres)`);

    // Extrair títulos em negrito seguidos de artigos
    // Padrão: <p>...<b>Título em negrito</b>...</p> seguido eventualmente por <p>...Art. X
    const titulosMap: Record<string, string> = {};
    let totalTitulos = 0;

    // Split HTML em linhas para análise contextual
    const lines = html.split('\n');
    let tituloAtual: string | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Buscar título em negrito
      const tituloMatch = line.match(/<b>([^<]+?)<\/b>/);
      if (tituloMatch) {
        const titulo = tituloMatch[1].trim()
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ');
        
        // Ignorar títulos de estrutura (muito longos ou com palavras estruturais)
        if (titulo.length > 5 && titulo.length < 150 && 
            !titulo.match(/LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|PARTE/i) &&
            !titulo.match(/Art\.|§|Parágrafo/)) {
          tituloAtual = titulo;
        }
      }
      
      // Buscar artigo nas próximas 20 linhas após encontrar um título
      if (tituloAtual) {
        const artigoMatch = line.match(/<a name="art(\d+[ºª]?)(?:-[A-Z])?"><\/a>Art\.\s*(\d+[ºª]?(?:-[A-Z])?)/);
        if (artigoMatch) {
          const numeroArtigo = artigoMatch[2]
            .replace('º', '')
            .replace('ª', '')
            .trim();
          
          titulosMap[numeroArtigo] = tituloAtual;
          totalTitulos++;
          console.log(`📌 Art. ${numeroArtigo}: "${tituloAtual}"`);
          
          tituloAtual = null;
        }
      }
    }

    console.log(`\n✅ Extração concluída: ${totalTitulos} títulos encontrados`);

    // Salvar no cache do Supabase para uso posterior
    const { error: cacheError } = await supabase
      .from("cache_pesquisas")
      .upsert({
        chave: "cppm_titulos_planalto",
        valor: titulosMap,
        tipo: "json"
      }, {
        onConflict: "chave"
      });

    if (cacheError) {
      console.error("❌ Erro ao salvar cache:", cacheError);
    } else {
      console.log("💾 Títulos salvos no cache");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        total: totalTitulos,
        titulos: titulosMap,
        message: `${totalTitulos} títulos extraídos com sucesso`
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("❌ Erro na extração:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});

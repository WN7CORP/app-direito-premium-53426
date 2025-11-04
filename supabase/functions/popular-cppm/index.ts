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

    console.log("Iniciando população do CPPM - Código de Processo Penal Militar");

    // URL oficial do CPPM
    const cppmUrl = "https://www.planalto.gov.br/ccivil_03/decreto-lei/del1002.htm";
    
    console.log("Extraindo artigos do CPPM da fonte oficial:", cppmUrl);

    // Fazer request para obter o HTML
    const response = await fetch(cppmUrl);
    const html = await response.text();

    // Extração aprimorada de artigos do CPPM
    const artigos: Array<{ "Número do Artigo": string; "Artigo": string }> = [];
    
    // Remove scripts e estilos
    let cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Regex aprimorado para capturar artigos completos
    const artigoRegex = /Art\.\s*(\d+[ºª]?(?:-[A-Z])?)\s*\.?\s*(.*?)(?=(?:Art\.\s*\d+)|(?:<\/body>)|$)/gis;
    const matches = [...cleanHtml.matchAll(artigoRegex)];

    for (const match of matches) {
      const numeroArtigo = match[1].replace(/[ºª]/g, '').trim();
      let conteudo = match[2]
        .replace(/<[^>]+>/g, ' ')          // Remove tags HTML
        .replace(/&nbsp;/g, ' ')           // Remove &nbsp;
        .replace(/&[a-z]+;/gi, ' ')        // Remove entities HTML
        .replace(/\s+/g, ' ')              // Remove espaços múltiplos
        .trim();

      // Pula artigos vazios ou muito curtos
      if (conteudo.length < 10) continue;
      
      // Limita tamanho mas preserva integridade
      if (conteudo.length > 8000) {
        conteudo = conteudo.substring(0, 8000) + '... (continua)';
      }

      artigos.push({
        "Número do Artigo": numeroArtigo,
        "Artigo": `Art. ${numeroArtigo}. ${conteudo}`,
      });
    }

    console.log(`${artigos.length} artigos extraídos do CPPM`);

    // Inserir artigos no banco
    if (artigos.length > 0) {
      const { data, error } = await supabase
        .from("CPPM – Código de Processo Penal Militar")
        .insert(artigos);

      if (error) {
        console.error("Erro ao inserir artigos:", error);
        throw error;
      }

      console.log("Artigos do CPPM inseridos com sucesso!");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: artigos.length,
        message: `CPPM populado com ${artigos.length} artigos`,
        fonte: cppmUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("Erro ao popular CPPM:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
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

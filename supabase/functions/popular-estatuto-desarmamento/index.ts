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

    console.log("Iniciando população do Estatuto do Desarmamento (Lei 10.826/2003)");

    const estatutoUrl = "https://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm";
    
    console.log("Extraindo artigos da fonte oficial:", estatutoUrl);

    const response = await fetch(estatutoUrl);
    const html = await response.text();

    // Extração de artigos
    const artigos: Array<{ "Número do Artigo": string; "Artigo": string }> = [];
    
    let cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    const artigoRegex = /Art\.\s*(\d+[ºª]?(?:-[A-Z])?)\s*\.?\s*(.*?)(?=(?:Art\.\s*\d+)|(?:<\/body>)|$)/gis;
    const matches = [...cleanHtml.matchAll(artigoRegex)];

    for (const match of matches) {
      const numeroArtigo = match[1].replace(/[ºª]/g, '').trim();
      let conteudo = match[2]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (conteudo.length < 10) continue;
      
      if (conteudo.length > 8000) {
        conteudo = conteudo.substring(0, 8000) + '... (continua)';
      }

      artigos.push({
        "Número do Artigo": numeroArtigo,
        "Artigo": `Art. ${numeroArtigo}. ${conteudo}`,
      });
    }

    console.log(`${artigos.length} artigos extraídos do Estatuto do Desarmamento`);

    // Inserir artigos no banco
    if (artigos.length > 0) {
      const { data, error } = await supabase
        .from("ESTATUTO - DESARMAMENTO")
        .insert(artigos);

      if (error) {
        console.error("Erro ao inserir artigos:", error);
        throw error;
      }

      console.log("Artigos do Estatuto do Desarmamento inseridos com sucesso!");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: artigos.length,
        message: `Estatuto do Desarmamento populado com ${artigos.length} artigos`,
        fonte: estatutoUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("Erro ao popular Estatuto do Desarmamento:", error);
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

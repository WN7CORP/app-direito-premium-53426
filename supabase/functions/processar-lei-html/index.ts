import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processando HTML da Lei 14.133/2021');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { html } = await req.json();
    
    if (!html) {
      throw new Error('HTML não fornecido');
    }

    console.log(`HTML recebido com ${html.length} caracteres`);

    // Pattern para extrair artigos
    const artigoPattern = /Art\.\s*(\d+[ºª]?(?:-[A-Z])?)\s*\.?\s*(.*?)(?=(?:Art\.\s*\d+)|(?:<\/body>)|$)/gis;
    
    const artigos: Array<{ numero: string; texto: string }> = [];
    let match;

    while ((match = artigoPattern.exec(html)) !== null) {
      const numeroArtigo = match[1].trim();
      let textoArtigo = match[2].trim();

      // Limpar HTML tags
      textoArtigo = textoArtigo
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();

      // Limitar tamanho
      if (textoArtigo.length > 8000) {
        textoArtigo = textoArtigo.substring(0, 8000) + '...';
      }

      if (textoArtigo && textoArtigo.length > 10) {
        const artigoCompleto = `Art. ${numeroArtigo}. ${textoArtigo}`;
        
        artigos.push({
          numero: numeroArtigo,
          texto: artigoCompleto
        });

        console.log(`Artigo extraído: ${numeroArtigo} (${textoArtigo.length} chars)`);
      }
    }

    console.log(`Total de artigos extraídos: ${artigos.length}`);

    if (artigos.length === 0) {
      throw new Error('Nenhum artigo foi extraído da lei');
    }

    // Inserir artigos no banco
    let sucessos = 0;
    let erros = 0;

    for (const artigo of artigos) {
      const { error } = await supabase
        .from('LEI 14133 - LICITACOES')
        .insert({
          'Número do Artigo': artigo.numero,
          'Artigo': artigo.texto
        });

      if (error) {
        console.error(`Erro ao inserir artigo ${artigo.numero}:`, error);
        erros++;
      } else {
        console.log(`✓ Artigo ${artigo.numero} inserido com sucesso`);
        sucessos++;
      }
    }

    console.log(`População concluída: ${sucessos} sucessos, ${erros} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        total: sucessos,
        erros: erros,
        message: `Lei 14.133/2021 populada com ${sucessos} artigos`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro no processamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

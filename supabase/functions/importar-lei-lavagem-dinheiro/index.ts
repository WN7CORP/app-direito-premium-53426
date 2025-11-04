import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Iniciando importação da Lei 9.613/1998 (Lei de Lavagem de Dinheiro)');

    // Fetch do Planalto (encoding ISO-8859-1)
    const url = 'https://www.planalto.gov.br/ccivil_03/leis/l9613.htm';
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const html = decoder.decode(arrayBuffer);

    console.log(`✅ HTML baixado com sucesso (${html.length} caracteres)`);

    // Limpeza do HTML
    let cleanedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\/?font[^>]*>/gi, '')
      .replace(/<\/?span[^>]*>/gi, '')
      .replace(/<\/?div[^>]*>/gi, '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n');

    const artigos: Array<{
      Artigo: string;
      'Número do Artigo': string | null;
    }> = [];

    // Extrair estruturas (CAPÍTULO, SEÇÃO, etc)
    const estruturaRegex = /(CAPÍTULO\s+[IVX]+[^<\n]*|SEÇÃO\s+[IVX]+[^<\n]*|DA\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+)/gi;
    let estruturaMatch;
    const estruturas: Array<{ posicao: number; texto: string }> = [];

    while ((estruturaMatch = estruturaRegex.exec(cleanedHtml)) !== null) {
      const texto = estruturaMatch[0].trim();
      if (texto.length > 5 && texto.length < 200) {
        estruturas.push({
          posicao: estruturaMatch.index,
          texto: texto
        });
      }
    }

    console.log(`📚 ${estruturas.length} estruturas encontradas`);

    // Extrair artigos
    const artigoRegex = /Art\.?\s*(\d+[ºª°]?(?:-[A-Z])?)[\.:\s]+((?:(?!Art\.?\s*\d)[^]){1,8000}?)(?=Art\.?\s*\d|\n\n\n|$)/gi;
    let match;
    let artigoCount = 0;

    while ((match = artigoRegex.exec(cleanedHtml)) !== null) {
      const numeroArtigo = match[1].trim();
      let conteudo = match[2].trim();

      conteudo = conteudo
        .replace(/<[^>]+>/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (conteudo.length > 20) {
        artigos.push({
          Artigo: conteudo,
          'Número do Artigo': numeroArtigo
        });
        artigoCount++;
      }
    }

    console.log(`📝 ${artigoCount} artigos extraídos`);

    // Adicionar estruturas como registros separados
    for (const estrutura of estruturas) {
      artigos.push({
        Artigo: estrutura.texto,
        'Número do Artigo': null
      });
    }

    console.log(`✅ Total de ${artigos.length} registros (artigos + estruturas)`);

    // Inserir no banco em batches
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < artigos.length; i += batchSize) {
      const batch = artigos.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('LLD - Lei de Lavagem de Dinheiro')
        .insert(batch);

      if (error) {
        console.error(`❌ Erro no batch ${Math.floor(i/batchSize) + 1}:`, error);
        throw error;
      }

      insertedCount += batch.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} registros inseridos`);
    }

    console.log(`🎉 Importação concluída! Total: ${insertedCount} registros`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Lei de Lavagem de Dinheiro importada com sucesso`,
        total: insertedCount,
        artigos: artigoCount,
        estruturas: estruturas.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

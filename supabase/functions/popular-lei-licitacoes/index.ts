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
    console.log('Iniciando população da Lei 14.133/2021 (Nova Lei de Licitações)');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Limpar tabela antes de popular
    console.log('Limpando tabela existente...');
    const { error: deleteError } = await supabase
      .from('LEI 14133 - LICITACOES')
      .delete()
      .neq('id', 0); // deleta todos (neq 0 = diferente de 0, ou seja, todos)
    
    if (deleteError) {
      console.error('Erro ao limpar tabela:', deleteError);
    } else {
      console.log('Tabela limpa com sucesso');
    }

    // URL oficial da Lei 14.133/2021 no Planalto
    const url = 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm';
    console.log(`Buscando lei de: ${url}`);

    // Headers para simular um navegador real
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar lei: ${response.status}`);
    }

    // Ler como arrayBuffer para tratar encoding corretamente
    const arrayBuffer = await response.arrayBuffer();
    
    // Tentar UTF-8 primeiro (padrão moderno)
    const decoder = new TextDecoder('utf-8');
    let html = decoder.decode(arrayBuffer);
    
    console.log(`HTML baixado e decodificado: ${html.length} caracteres`);

    // EXTRAIR APENAS O CORPO PRINCIPAL DA LEI 14.133
    // A página contém a lei principal + alterações de outras leis
    // Vamos extrair apenas até o fim do corpo principal
    
    // Encontrar o início do texto principal (após "CAPÍTULO I" ou primeiro artigo)
    const inicioMatch = html.match(/CAPÍTULO I[\s\S]*?(?=Art\.\s*1º)/i) || html.match(/Art\.\s*1º/i);
    let inicioIndex = inicioMatch ? html.indexOf(inicioMatch[0]) : 0;
    
    // Encontrar o fim (antes das alterações de outras leis)
    // Geralmente marcado por "Art. 193" ou "DISPOSIÇÕES FINAIS" seguido de alterações
    const fimMatch = html.match(/Art\.\s*194[\s\S]{0,3000}?(?=Art\.\s*\d+\s*\.\s*(?:da Lei|O art|Os arts))/i);
    let fimIndex = fimMatch ? html.indexOf(fimMatch[0]) + fimMatch[0].length : html.length;
    
    // Se não encontrar o padrão acima, tentar outro marcador
    if (!fimMatch) {
      const fimAlt = html.match(/Art\.\s*194[^A]*$/i);
      if (fimAlt) {
        fimIndex = html.indexOf(fimAlt[0]) + fimAlt[0].length;
      }
    }
    
    const corpoLei = html.substring(inicioIndex, fimIndex);
    console.log(`Corpo da lei extraído: ${corpoLei.length} caracteres (de ${inicioIndex} até ${fimIndex})`);

    // Pattern mais robusta: aceita várias formas de ordinais (º, ª, °, ᵒ, ᵃ) ou sem ordinal
    // Também aceita espaços entre Art. e número
    const artigoPattern = /Art\.\s*(\d+(?:[ºª°ᵒᵃ]|&ordm;|&ordf;)?(?:-[A-Z])?)\s*\.\s+([\s\S]*?)(?=\s*(?:Art\.\s*\d+|CAPÍTULO|SEÇÃO|TÍTULO|Brasília,|$))/gi;
    
    const artigos: Array<{ numero: string; texto: string }> = [];
    const numerosVistos = new Set<string>();
    let match;

    while ((match = artigoPattern.exec(corpoLei)) !== null) {
      let numeroArtigo = match[1].trim();
      let textoArtigo = match[2].trim();
      
      // Normalizar o número do artigo (remover HTML entities e normalizar ordinais)
      numeroArtigo = numeroArtigo
        .replace(/&ordm;/g, 'º')
        .replace(/&ordf;/g, 'ª')
        .replace(/[°ᵒ]/g, 'º')
        .replace(/[ᵃ]/g, 'ª');
      
      // Evitar duplicatas
      if (numerosVistos.has(numeroArtigo)) {
        console.log(`Artigo ${numeroArtigo} duplicado, ignorando`);
        continue;
      }
      numerosVistos.add(numeroArtigo);

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
        message: `Lei 14.133/2021 populada com ${sucessos} artigos`,
        fonte: url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na população da Lei de Licitações:', error);
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

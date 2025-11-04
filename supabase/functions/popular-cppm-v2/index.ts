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

    console.log("🚀 Iniciando população do CPPM - Versão 2 (Melhorada)");

    const cppmUrl = "https://www.planalto.gov.br/ccivil_03/decreto-lei/del1002.htm";
    console.log("📥 Extraindo artigos do CPPM:", cppmUrl);

    // Fazer request para obter o HTML
    const response = await fetch(cppmUrl);
    const html = await response.text();

    // Limpar scripts e estilos
    let cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    console.log("🔍 Fase 1: Identificando estruturas hierárquicas...");
    
    // FASE 1: Identificar onde aparecem estruturas hierárquicas
    const estruturaRegex = /(LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|PARTE)\s+([IVX]+|[A-Z]+|GERAL|ESPECIAL|ÚNICO)/gi;
    const estruturas: Array<{posicao: number, texto: string}> = [];
    let match;
    
    while ((match = estruturaRegex.exec(cleanHtml)) !== null) {
      estruturas.push({
        posicao: match.index,
        texto: match[0]
      });
    }
    
    console.log(`   Encontradas ${estruturas.length} estruturas hierárquicas`);

    console.log("📋 Fase 2: Extraindo artigos...");

    // FASE 2: Extrair artigos com regex melhorado
    // Para ANTES de encontrar: próximo artigo OU estrutura hierárquica OU fim
    const artigoRegex = /Art\.\s*(\d+[ºª]?(?:-[A-Z])?)\s*\.?\s*(.*?)(?=(?:\s*Art\.\s*\d+)|(?:\s*(?:LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|PARTE)\s+)|(?:<\/body>)|$)/gis;
    
    const artigos: Array<{ "Número do Artigo": string; "Artigo": string }> = [];
    const matches = [...cleanHtml.matchAll(artigoRegex)];

    console.log(`   ${matches.length} matches encontrados, processando...`);

    for (const match of matches) {
      const numeroArtigo = match[1].replace(/[ºª]/g, '').trim();
      
      // Limpeza inteligente preservando estrutura
      let conteudo = match[2]
        .replace(/<br\s*\/?>/gi, '\n')           // <br> vira quebra de linha
        .replace(/<\/p>/gi, '\n\n')              // </p> vira quebra dupla
        .replace(/<p[^>]*>/gi, '')               // Remove tag <p> de abertura
        .replace(/<[^>]+>/g, ' ')                // Remove outras tags HTML
        .replace(/&nbsp;/g, ' ')                 // Remove &nbsp;
        .replace(/&[a-z]+;/gi, ' ')              // Remove entities HTML
        .replace(/\s+/g, ' ')                    // Normaliza espaços horizontais
        .replace(/\n\s+/g, '\n')                 // Remove espaços após quebras
        .trim();

      // Remove títulos hierárquicos que foram capturados incorretamente
      conteudo = conteudo
        .replace(/^(LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|PARTE)\s+[IVX]+[^\n]*$/gim, '')
        .replace(/^(LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|PARTE)\s+(GERAL|ESPECIAL|ÚNICO)[^\n]*$/gim, '')
        .replace(/\n{3,}/g, '\n\n')              // Normaliza quebras múltiplas
        .trim();

      // Validações rigorosas
      if (conteudo.length < 15) {
        console.log(`   ⚠️  Art. ${numeroArtigo}: muito curto (${conteudo.length} chars) - pulando`);
        continue;
      }
      
      if (/^(LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|PARTE)/i.test(conteudo)) {
        console.log(`   ⚠️  Art. ${numeroArtigo}: começa com estrutura hierárquica - pulando`);
        continue;
      }
      
      const palavras = conteudo.split(/\s+/).length;
      if (palavras < 5) {
        console.log(`   ⚠️  Art. ${numeroArtigo}: muito poucas palavras (${palavras}) - pulando`);
        continue;
      }

      // Limita tamanho mas preserva integridade
      if (conteudo.length > 8000) {
        conteudo = conteudo.substring(0, 8000) + '...';
        console.log(`   ✂️  Art. ${numeroArtigo}: truncado para 8000 chars`);
      }

      artigos.push({
        "Número do Artigo": numeroArtigo,
        "Artigo": `Art. ${numeroArtigo}. ${conteudo}`,
      });
    }

    console.log(`✅ ${artigos.length} artigos extraídos com sucesso`);

    // Estatísticas
    if (artigos.length > 0) {
      const avgLength = artigos.reduce((sum, art) => sum + art.Artigo.length, 0) / artigos.length;
      console.log("\n📊 Estatísticas:");
      console.log(`   - Total: ${artigos.length} artigos`);
      console.log(`   - Primeiro: Art. ${artigos[0]["Número do Artigo"]}`);
      console.log(`   - Último: Art. ${artigos[artigos.length-1]["Número do Artigo"]}`);
      console.log(`   - Média de caracteres: ${Math.round(avgLength)}`);
    }

    // Limpar tabela antes de inserir
    console.log("\n🗑️  Limpando registros antigos...");
    const { error: deleteError } = await supabase
      .from("CPPM – Código de Processo Penal Militar")
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.warn("⚠️  Aviso ao limpar:", deleteError.message);
    } else {
      console.log("✅ Tabela limpa");
    }

    // Inserir artigos em lotes de 50
    console.log("\n💾 Inserindo artigos em lotes...");
    let totalInserido = 0;
    
    for (let i = 0; i < artigos.length; i += 50) {
      const batch = artigos.slice(i, i + 50);
      const loteNum = Math.floor(i/50) + 1;
      
      console.log(`   Lote ${loteNum}: inserindo ${batch.length} artigos (${i + 1}-${i + batch.length})...`);
      
      const { data, error } = await supabase
        .from("CPPM – Código de Processo Penal Militar")
        .insert(batch);

      if (error) {
        console.error(`❌ Erro no lote ${loteNum}:`, error);
        throw error;
      }

      totalInserido += batch.length;
      console.log(`   ✅ Lote ${loteNum}: ${batch.length} artigos inseridos`);
    }

    console.log(`\n🎉 Concluído! ${totalInserido} artigos inseridos no banco de dados`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: totalInserido,
        estruturasEncontradas: estruturas.length,
        message: `CPPM populado com ${totalInserido} artigos`,
        fonte: cppmUrl,
        estatisticas: {
          primeiro: artigos[0]?.["Número do Artigo"],
          ultimo: artigos[artigos.length-1]?.["Número do Artigo"],
          mediaCaracteres: Math.round(artigos.reduce((s, a) => s + a.Artigo.length, 0) / artigos.length)
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("❌ Erro ao popular CPPM:", error);
    
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

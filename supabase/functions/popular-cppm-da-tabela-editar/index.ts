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

    console.log("🚀 Iniciando transferência de artigos da TABELA PARA EDITAR");

    // 1. Buscar artigos válidos da tabela origem
    console.log("📥 Buscando artigos da TABELA PARA EDITAR...");
    const { data: artigosOrigem, error: fetchError } = await supabase
      .from("TABELA PARA EDITAR")
      .select('"Número do Artigo", "Artigo"')
      .not("Número do Artigo", "is", null)
      .order("id");

    if (fetchError) {
      console.error("❌ Erro ao buscar artigos:", fetchError);
      throw fetchError;
    }

    console.log(`✅ ${artigosOrigem?.length || 0} artigos encontrados`);

    // 2. Processar e limpar artigos
    console.log("🧹 Processando e limpando artigos...");
    const artigosProcessados: Array<{ "Número do Artigo": string; "Artigo": string }> = [];

    for (const registro of artigosOrigem || []) {
      const numeroArtigo = registro["Número do Artigo"]?.trim();
      let conteudoArtigo = registro["Artigo"] || "";

      // Validações básicas
      if (!numeroArtigo || conteudoArtigo.length < 20) {
        console.log(`   ⚠️  Pulando Art. ${numeroArtigo}: conteúdo muito curto`);
        continue;
      }

      // Limpeza e normalização do conteúdo
      conteudoArtigo = conteudoArtigo
        .replace(/\n{3,}/g, '\n\n')           // Normaliza quebras múltiplas para duplas
        .replace(/[ \t]+/g, ' ')              // Normaliza espaços horizontais
        .replace(/\n /g, '\n')                // Remove espaços após quebras de linha
        .replace(/ \n/g, '\n')                // Remove espaços antes de quebras de linha
        .trim();

      // Validar se começa com "Art."
      if (!conteudoArtigo.match(/^Art\.\s*\d+[ºª]?(-[A-Z])?/i)) {
        console.log(`   ⚠️  Art. ${numeroArtigo}: não começa com formato correto`);
      }

      artigosProcessados.push({
        "Número do Artigo": numeroArtigo,
        "Artigo": conteudoArtigo,
      });
    }

    console.log(`✅ ${artigosProcessados.length} artigos processados e validados`);

    // Estatísticas
    if (artigosProcessados.length > 0) {
      const avgLength = artigosProcessados.reduce((sum, art) => sum + art.Artigo.length, 0) / artigosProcessados.length;
      const minLength = Math.min(...artigosProcessados.map(art => art.Artigo.length));
      const maxLength = Math.max(...artigosProcessados.map(art => art.Artigo.length));
      
      console.log("\n📊 Estatísticas dos artigos:");
      console.log(`   - Total: ${artigosProcessados.length} artigos`);
      console.log(`   - Primeiro: Art. ${artigosProcessados[0]["Número do Artigo"]}`);
      console.log(`   - Último: Art. ${artigosProcessados[artigosProcessados.length-1]["Número do Artigo"]}`);
      console.log(`   - Média de caracteres: ${Math.round(avgLength)}`);
      console.log(`   - Menor artigo: ${minLength} chars`);
      console.log(`   - Maior artigo: ${maxLength} chars`);
    }

    // 3. Limpar tabela CPPM antes de inserir
    console.log("\n🗑️  Limpando tabela CPPM...");
    const { error: deleteError } = await supabase
      .from("CPPM – Código de Processo Penal Militar")
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.warn("⚠️  Aviso ao limpar:", deleteError.message);
    } else {
      console.log("✅ Tabela CPPM limpa");
    }

    // 4. Inserir artigos em lotes de 50
    console.log("\n💾 Inserindo artigos na tabela CPPM...");
    let totalInserido = 0;
    
    for (let i = 0; i < artigosProcessados.length; i += 50) {
      const batch = artigosProcessados.slice(i, i + 50);
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

    console.log(`\n🎉 Transferência concluída! ${totalInserido} artigos inseridos no CPPM`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: totalInserido,
        fonte: "TABELA PARA EDITAR",
        message: `${totalInserido} artigos transferidos e ajustados com sucesso`,
        estatisticas: {
          primeiro: artigosProcessados[0]?.["Número do Artigo"],
          ultimo: artigosProcessados[artigosProcessados.length-1]?.["Número do Artigo"],
          mediaCaracteres: Math.round(
            artigosProcessados.reduce((s, a) => s + a.Artigo.length, 0) / artigosProcessados.length
          )
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
    console.error("❌ Erro na transferência:", error);
    
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

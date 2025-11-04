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

    console.log("🔧 Iniciando correção: mover títulos para dentro dos artigos");

    // 1. Buscar registros SEM número de artigo que são títulos
    const { data: titulos, error: titulosError } = await supabase
      .from("CPPM – Código de Processo Penal Militar")
      .select("id, \"Artigo\"")
      .is("Número do Artigo", null)
      .order("id");

    if (titulosError) throw titulosError;

    console.log(`📋 ${titulos?.length} registros sem número de artigo encontrados`);

    let movidos = 0;
    let deletados = 0;

    // 2. Processar cada título
    for (const titulo of titulos || []) {
      const conteudo = (titulo.Artigo || "").trim();
      
      // Verificar se é um título curto (não estrutural)
      const palavrasEstruturais = ["LIVRO", "TÍTULO", "CAPÍTULO", "SEÇÃO", "DECRETO", "LEI", "PARTE"];
      const temPalavraEstrutural = palavrasEstruturais.some(p => conteudo.toUpperCase().includes(p));
      
      if (conteudo.length >= 10 && conteudo.length <= 80 && !temPalavraEstrutural) {
        console.log(`\n📌 Título detectado (ID ${titulo.id}): "${conteudo}"`);
        
        // 3. Buscar próximo artigo COM número
        const { data: proximosArtigos, error: proximoError } = await supabase
          .from("CPPM – Código de Processo Penal Militar")
          .select("id, \"Número do Artigo\", \"Artigo\"")
          .not("Número do Artigo", "is", null)
          .gt("id", titulo.id)
          .order("id")
          .limit(1);

        if (proximoError || !proximosArtigos || proximosArtigos.length === 0) {
          console.log(`⚠️ Nenhum artigo seguinte encontrado para título ID ${titulo.id}`);
          continue;
        }

        const proximoArtigo = proximosArtigos[0];
        const conteudoArtigo = proximoArtigo.Artigo || "";

        // 4. Adicionar título no INÍCIO do artigo seguinte
        const novoConteudo = `${conteudo}\n\n${conteudoArtigo}`;

        // 5. Atualizar artigo
        const { error: updateError } = await supabase
          .from("CPPM – Código de Processo Penal Militar")
          .update({ "Artigo": novoConteudo })
          .eq("id", proximoArtigo.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar Art. ${proximoArtigo["Número do Artigo"]}:`, updateError);
          continue;
        }

        console.log(`✅ Título movido para Art. ${proximoArtigo["Número do Artigo"]}`);
        movidos++;

        // 6. Deletar registro do título
        const { error: deleteError } = await supabase
          .from("CPPM – Código de Processo Penal Militar")
          .delete()
          .eq("id", titulo.id);

        if (deleteError) {
          console.error(`❌ Erro ao deletar título ID ${titulo.id}:`, deleteError);
        } else {
          console.log(`🗑️ Registro do título ID ${titulo.id} deletado`);
          deletados++;
        }
      }
    }

    console.log(`\n🎉 Correção concluída!`);
    console.log(`✅ ${movidos} títulos movidos para artigos`);
    console.log(`🗑️ ${deletados} registros de títulos deletados`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: titulos?.length,
        movidos,
        deletados,
        message: `${movidos} títulos integrados aos artigos e ${deletados} registros limpos`
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("❌ Erro na correção:", error);
    
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

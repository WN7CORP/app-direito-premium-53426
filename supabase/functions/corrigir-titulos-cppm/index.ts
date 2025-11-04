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

    console.log("🔧 Iniciando correção de títulos no CPPM");

    // Buscar todos os artigos com número, ordenados
    const { data: artigos, error: fetchError } = await supabase
      .from("CPPM – Código de Processo Penal Militar")
      .select("id, \"Número do Artigo\", \"Artigo\"")
      .not("Número do Artigo", "is", null)
      .order("id");

    if (fetchError) throw fetchError;

    console.log(`📄 ${artigos?.length} artigos encontrados`);

    let corrigidos = 0;

    // Processar artigos em pares (atual e próximo)
    for (let i = 0; i < (artigos?.length || 0) - 1; i++) {
      const artigoAtual = artigos![i];
      const proximoArtigo = artigos![i + 1];

      const conteudoAtual = artigoAtual.Artigo || "";
      const conteudoProximo = proximoArtigo.Artigo || "";

      // Dividir em linhas
      const linhasAtual = conteudoAtual.split('\n');
      
      // Verificar se última linha não vazia é um título (curta, sem "Art.", sem "§")
      let ultimaLinhaIndex = linhasAtual.length - 1;
      while (ultimaLinhaIndex >= 0 && linhasAtual[ultimaLinhaIndex].trim() === '') {
        ultimaLinhaIndex--;
      }

      if (ultimaLinhaIndex < 0) continue;

      const ultimaLinha = linhasAtual[ultimaLinhaIndex].trim();
      
      // Critérios para identificar título:
      // - Não começa com "Art.", "§", "a)", "b)", números romanos seguidos de "-"
      // - Tem menos de 100 caracteres
      // - Não termina com ponto (títulos geralmente não têm pontuação final)
      // - Primeira letra maiúscula
      const pareceSubtitulo = 
        ultimaLinha.length > 5 &&
        ultimaLinha.length < 100 &&
        !/^(Art\.|§|\d+º|[a-z]\)|[IVXLCDM]+\s*[-–—])/.test(ultimaLinha) &&
        /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/.test(ultimaLinha);

      if (pareceSubtitulo) {
        console.log(`\n🔍 Art. ${artigoAtual["Número do Artigo"]}: Título detectado: "${ultimaLinha}"`);

        // Remover título do artigo atual
        const novasLinhasAtual = linhasAtual.slice(0, ultimaLinhaIndex);
        // Remover linhas vazias do final
        while (novasLinhasAtual.length > 0 && novasLinhasAtual[novasLinhasAtual.length - 1].trim() === '') {
          novasLinhasAtual.pop();
        }
        const novoConteudoAtual = novasLinhasAtual.join('\n');

        // Adicionar título no início do próximo artigo
        const novoConteudoProximo = `${conteudoProximo}\n\n${ultimaLinha}`;

        // Atualizar artigo atual (remover título do final)
        const { error: updateError1 } = await supabase
          .from("CPPM – Código de Processo Penal Militar")
          .update({ "Artigo": novoConteudoAtual })
          .eq("id", artigoAtual.id);

        if (updateError1) {
          console.error(`❌ Erro ao atualizar Art. ${artigoAtual["Número do Artigo"]}:`, updateError1);
          continue;
        }

        // Atualizar próximo artigo (adicionar título no início)
        const { error: updateError2 } = await supabase
          .from("CPPM – Código de Processo Penal Militar")
          .update({ "Artigo": novoConteudoProximo })
          .eq("id", proximoArtigo.id);

        if (updateError2) {
          console.error(`❌ Erro ao atualizar Art. ${proximoArtigo["Número do Artigo"]}:`, updateError2);
          continue;
        }

        console.log(`✅ Título movido do Art. ${artigoAtual["Número do Artigo"]} para Art. ${proximoArtigo["Número do Artigo"]}`);
        corrigidos++;
      }
    }

    console.log(`\n🎉 Correção concluída! ${corrigidos} artigos corrigidos`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: artigos?.length,
        corrigidos,
        message: `${corrigidos} títulos movidos para seus artigos corretos`
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

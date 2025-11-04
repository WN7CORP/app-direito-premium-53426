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

    console.log("🔧 Iniciando adição de títulos aos artigos do CPPM");

    // 1. Primeiro extrair títulos do Planalto diretamente
    const planaltoUrl = "https://www.planalto.gov.br/ccivil_03/decreto-lei/del1002.htm";
    console.log(`📡 Buscando títulos do Planalto...`);
    
    const response = await fetch(planaltoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    // Ler como ArrayBuffer e decodificar como ISO-8859-1 (Latin-1)
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const html = decoder.decode(buffer);
    const lines = html.split('\n');
    const titulosMap: Record<string, string> = {};
    let tituloAtual: string | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const tituloMatch = line.match(/<b>([^<]+?)<\/b>/);
      if (tituloMatch) {
        const titulo = tituloMatch[1].trim().replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
        if (titulo.length > 5 && titulo.length < 150 && !titulo.match(/LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|PARTE|Art\.|§|Parágrafo/i)) {
          tituloAtual = titulo;
        }
      }
      if (tituloAtual) {
        const artigoMatch = line.match(/<a name="art(\d+[ºª]?)(?:-[A-Z])?"><\/a>Art\.\s*(\d+[ºª]?(?:-[A-Z])?)/);
        if (artigoMatch) {
          const numeroArtigo = artigoMatch[2].replace('º', '').replace('ª', '').trim();
          titulosMap[numeroArtigo] = tituloAtual;
          tituloAtual = null;
        }
      }
    }
    
    console.log(`📋 ${Object.keys(titulosMap).length} títulos extraídos`);

    // 2. Buscar todos os artigos do CPPM
    const { data: artigos, error: artigosError } = await supabase
      .from("CPPM – Código de Processo Penal Militar")
      .select("id, \"Número do Artigo\", \"Artigo\"")
      .not("Número do Artigo", "is", null)
      .order("id");

    if (artigosError) throw artigosError;

    console.log(`📚 ${artigos?.length} artigos encontrados no banco`);

    let atualizados = 0;
    let semTitulo = 0;
    let erros = 0;
    const batchSize = 50;

    // 3. Processar em lotes
    for (let i = 0; i < (artigos?.length || 0); i += batchSize) {
      const batch = artigos?.slice(i, i + batchSize) || [];
      console.log(`\n🔄 Processando lote ${Math.floor(i / batchSize) + 1} (${batch.length} artigos)`);

      for (const artigo of batch) {
        const numeroArtigo = artigo["Número do Artigo"];
        const conteudoAtual = artigo.Artigo || "";

        // Normalizar número do artigo para busca
        const numeroNormalizado = numeroArtigo?.toString()
          .replace(/^Art\.\s*/i, '')
          .replace('º', '')
          .replace('ª', '')
          .trim();

        // Buscar título
        const titulo = titulosMap[numeroNormalizado];

        if (!titulo) {
          console.log(`⚠️ Art. ${numeroArtigo}: sem título no mapeamento`);
          semTitulo++;
          continue;
        }

        // Remover título antigo corrompido se existir (forçar atualização)
        const linhas = conteudoAtual.split('\n');
        let conteudoLimpo = conteudoAtual;
        
        // Se primeira linha não começa com "Art.", é provável que seja título corrompido
        if (linhas.length > 0 && !linhas[0].trim().startsWith('Art.')) {
          conteudoLimpo = linhas.slice(1).join('\n').trim();
        }

        // Adicionar título correto no início
        const novoConteudo = `${titulo}\n\n${conteudoLimpo}`;

        // Atualizar artigo
        const { error: updateError } = await supabase
          .from("CPPM – Código de Processo Penal Militar")
          .update({ "Artigo": novoConteudo })
          .eq("id", artigo.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar Art. ${numeroArtigo}:`, updateError);
          erros++;
          continue;
        }

        console.log(`✅ Art. ${numeroArtigo}: "${titulo}" adicionado`);
        atualizados++;
      }

      // Pequeno delay entre lotes para evitar sobrecarga
      if (i + batchSize < (artigos?.length || 0)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n🎉 Processamento concluído!`);
    console.log(`✅ ${atualizados} artigos atualizados`);
    console.log(`⚠️ ${semTitulo} artigos sem título no mapeamento`);
    console.log(`❌ ${erros} erros`);

    return new Response(
      JSON.stringify({ 
        success: true,
        total: artigos?.length || 0,
        atualizados,
        semTitulo,
        erros,
        message: `${atualizados} artigos atualizados com títulos`
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("❌ Erro ao adicionar títulos:", error);
    
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

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

    console.log("🔧 Iniciando correção de espaçamento nos títulos estruturais do CPPM");

    // Função para corrigir espaçamento
    function corrigirEspacamento(texto: string): string {
      if (!texto || texto.trim().length === 0) return texto;

      let corrigido = texto;
      const original = texto;

      // 1. Corrigir números romanos (LIVRO, TÍTULO, CAPÍTULO)
      corrigido = corrigido.replace(/\b(LIVRO)([IVXLCDM]+)\b/gi, '$1 $2');
      corrigido = corrigido.replace(/\b(TÍTULO)([IVXLCDM]+)\b/gi, '$1 $2');
      corrigido = corrigido.replace(/\b(CAPÍTULO)([IVXLCDM]+)\b/gi, '$1 $2');
      corrigido = corrigido.replace(/\b(CAPÍTULO)(ÚNICO)\b/gi, '$1 $2');
      corrigido = corrigido.replace(/\b(Seção)([IVXLCDM]+)\b/g, '$1 $2');

      // 2. Adicionar espaços em textos colados (detectar padrão MAIÚSCULAS sem espaços)
      if (corrigido.length > 10 && corrigido === corrigido.toUpperCase()) {
        // Primeiro, adicionar espaços antes de preposições DA, DO, DOS, DAS
        corrigido = corrigido.replace(/([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])(DA|DO|DOS|DAS)\b/g, '$1 $2');
        
        // Adicionar espaço antes de outras preposições
        corrigido = corrigido.replace(/([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])(DE|E|EM|NO|NA|NOS|NAS|AO|AOS|POR|PELA|PELO)\b/g, '$1 $2');
        
        // Adicionar espaço antes de palavras-chave (substantivos comuns)
        const palavrasChave = [
          'PARTES', 'DENÚNCIA', 'COMPETÊNCIA', 'LUGAR', 'INFRAÇÃO', 'RESIDÊNCIA', 'PREVENÇÃO',
          'CONEXÃO', 'CONTINÊNCIA', 'FORO', 'PRIVILÉGIO', 'FUNÇÃO', 'CONFLITO', 'JURISDIÇÃO',
          'PROCESSO', 'AUDIÊNCIA', 'INSTRUÇÃO', 'JULGAMENTO', 'SENTENÇA', 'RECURSOS',
          'COISA', 'JULGADA', 'AÇÃO', 'REVISÃO', 'HABEAS', 'CORPUS', 'PROCEDIMENTO',
          'CRIMES', 'DESERÇÃO', 'INSUBMISSÃO', 'OFICIAL', 'PRAÇA', 'CONSELHO',
          'JUIZ', 'AUXILIARES', 'PERITOS', 'ESCRIVÃO', 'CITAÇÕES', 'NOTIFICAÇÕES', 'INTIMAÇÕES'
        ];
        
        for (const palavra of palavrasChave) {
          const regex = new RegExp(`([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])(${palavra})\\b`, 'g');
          corrigido = corrigido.replace(regex, '$1 $2');
        }
      }

      // 3. Mapeamento de casos específicos conhecidos (fallback para casos mais complexos)
      const mapeamento: Record<string, string> = {
        'CÓDIGODEPROCESSOPENALMILITAR': 'CÓDIGO DE PROCESSO PENAL MILITAR',
        'DALEIDEPROCESSOPENALMILITAREDASUAAPLICAÇÃO': 'DA LEI DE PROCESSO PENAL MILITAR E DA SUA APLICAÇÃO',
        'DAPOLÍCIAJUDICIÁRIAMILITAR': 'DA POLÍCIA JUDICIÁRIA MILITAR',
        'DOINQUÉRITOPOLICIALMILITAR': 'DO INQUÉRITO POLICIAL MILITAR',
        'DAAÇÃOPENALMILITAREDOSEUEXERCÍCIO': 'DA AÇÃO PENAL MILITAR E DO SEU EXERCÍCIO',
        'DOPROCESSOPENALMILITAREMGERAL': 'DO PROCESSO PENAL MILITAR EM GERAL',
        'DOJUIZ,AUXILIARESEPARTESDOPROCESSO': 'DO JUIZ, AUXILIARES E PARTES DO PROCESSO',
        'DOJUIZESEUSAUXILIARES': 'DO JUIZ E SEUS AUXILIARES',
        'Dosauxiliaresdojuiz': 'Dos auxiliares do juiz',
        'Dosperitoseintérpretes': 'Dos peritos e intérpretes',
        'DoEscrivãodoprocesso': 'Do Escrivão do processo',
        'Dooficialdejustiça': 'Do oficial de justiça',
        'Daspartesdoprocesso': 'Das partes do processo',
        'Doacusadoreseudefensor': 'Do acusado e seu defensor',
        'Doassistente': 'Do assistente',
        'DATOSATENTADAAOCUDÁDIAPESSOADOJUIZ': 'DOS ATENTADOS À CUSTÓDIA DA PESSOA DO JUIZ',
        'DASCITAÇÕES,NOTIFICAÇÕESEINTIMAÇÕES': 'DAS CITAÇÕES, NOTIFICAÇÕES E INTIMAÇÕES',
        'DASPARTES': 'DAS PARTES',
        'DADENÚNCIA': 'DA DENÚNCIA',
        'DACOMPETÊNCIAEMGERAL': 'DA COMPETÊNCIA EM GERAL',
        'DACOMPETÊNCIAPELOLUGARDAINFRAÇÃO': 'DA COMPETÊNCIA PELO LUGAR DA INFRAÇÃO',
        'DACOMPETÊNCIAPELOLUGARDAINFR AÇÃO': 'DA COMPETÊNCIA PELO LUGAR DA INFRAÇÃO',
        'DACOMPETÊNCIAPELOLUGARDARESIDÊNCIA': 'DA COMPETÊNCIA PELO LUGAR DA RESIDÊNCIA',
        'DACOMPETÊNCIAPORPREVENÇÃO': 'DA COMPETÊNCIA POR PREVENÇÃO',
        'DACOMPETÊNCIAPORCONEXÃOOUCONTINÊNCIA': 'DA COMPETÊNCIA POR CONEXÃO OU CONTINÊNCIA',
        'DOFOROPORVIRTUDEDAFUNÇÃO': 'DO FORO POR VIRTUDE DA FUNÇÃO',
        'DOCONFLITODEJURISDIÇÃO': 'DO CONFLITO DE JURISDIÇÃO',
        'DASQUESTÕESEPREJUDICIAIS': 'DAS QUESTÕES E PREJUDICIAIS',
        'DOPROCESSOEMGERAL': 'DO PROCESSO EM GERAL',
      };

      if (mapeamento[original]) {
        corrigido = mapeamento[original];
      } else if (mapeamento[corrigido]) {
        corrigido = mapeamento[corrigido];
      }

      // 4. Lógica adicional: se ainda não há espaços e é texto longo, tentar separar por mudanças de caso
      if (corrigido.length > 20 && !corrigido.includes(' ') && corrigido !== corrigido.toUpperCase()) {
        // Adicionar espaço antes de maiúsculas após minúsculas (ex: "Dosauxiliares" -> "Dos auxiliares")
        corrigido = corrigido.replace(/([a-záàâãéèêíïóôõöúç])([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])/g, '$1 $2');
      }

      return corrigido;
    }

    // Buscar todos os registros sem número de artigo (títulos estruturais)
    const { data: registros, error: selectError } = await supabase
      .from("CPPM – Código de Processo Penal Militar")
      .select("id, \"Artigo\"")
      .is("Número do Artigo", null)
      .order("id");

    if (selectError) throw selectError;

    console.log(`📋 ${registros?.length || 0} registros estruturais encontrados`);

    let corrigidos = 0;
    let semAlteracao = 0;
    const BATCH_SIZE = 50;

    // Processar em batches
    for (let i = 0; i < (registros?.length || 0); i += BATCH_SIZE) {
      const batch = registros!.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processando batch ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1}-${Math.min(i + BATCH_SIZE, registros!.length)} de ${registros!.length})`);

      for (const registro of batch) {
        const textoOriginal = (registro.Artigo || "").trim();
        const textoCorrigido = corrigirEspacamento(textoOriginal);

        if (textoOriginal !== textoCorrigido) {
          console.log(`\n✏️ ID ${registro.id}:`);
          console.log(`  Antes: "${textoOriginal}"`);
          console.log(`  Depois: "${textoCorrigido}"`);

          const { error: updateError } = await supabase
            .from("CPPM – Código de Processo Penal Militar")
            .update({ "Artigo": textoCorrigido })
            .eq("id", registro.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar ID ${registro.id}:`, updateError);
          } else {
            corrigidos++;
          }
        } else {
          semAlteracao++;
        }
      }

      // Pequeno delay entre batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Correção concluída!`);
    console.log(`✅ ${corrigidos} registros corrigidos`);
    console.log(`⏭️ ${semAlteracao} registros sem alteração necessária`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: registros?.length || 0,
        corrigidos,
        semAlteracao,
        message: `${corrigidos} títulos estruturais corrigidos com espaçamento adequado`
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

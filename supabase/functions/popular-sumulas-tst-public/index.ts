import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SumulaData {
  numero: number;
  texto: string;
  data: string | null;
}

/**
 * Busca uma súmula específica do TST via web scraping usando regex
 */
async function buscarSumula(numero: number): Promise<SumulaData | null> {
  try {
    console.log(`[${new Date().toISOString()}] Buscando súmula TST ${numero}...`);
    
    const grupo = Math.ceil(numero / 50);
    const inicio = (grupo - 1) * 50 + 1;
    const fim = grupo * 50;
    
    const url = `https://www3.tst.jus.br/jurisprudencia/Sumulas_com_indice/Sumulas_Ind_${inicio}_${fim}.html`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    // Decodificar HTML em ISO-8859-1 (Latin-1) para UTF-8
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const html = decoder.decode(buffer);
    
    // Regex simplificada sem word boundary
    const sumulaRegex = new RegExp(
      `<h2[^>]*>[\\s\\S]*?${numero}\\s+do\\s+TST[\\s\\S]*?</h2>([\\s\\S]{100,3000}?)(?:<h2|$)`,
      'i'
    );
    
    const match = html.match(sumulaRegex);
    
    if (!match) {
      console.warn(`[${new Date().toISOString()}] Regex não encontrou bloco para súmula ${numero}`);
      return null;
    }
    
    console.log(`[${new Date().toISOString()}] ✓ Bloco HTML encontrado (${match[1].length} chars)`);
    const blocoHtml = match[1];
    
    // Extrair data (DJ ou RA - Resolução Administrativa)
    const dataMatch = blocoHtml.match(/(?:DJ|RA)\s+(\d{2}[.,]?\s*\d{2}?\s*e\s*\d{2}\.\d{2}\.\d{4}|\d{2}\.\d{2}\.\d{4}|\d+\/\d{4})/i);
    const data = dataMatch ? dataMatch[1] : null;
    
    // Extrair texto da súmula (classe RES ou Textoenun, não Histrico)
    const textoMatch = blocoHtml.match(/<p[^>]*class="(?:RES|Textoenun)"[^>]*>([\s\S]*?)<\/p>/i);
    
    if (!textoMatch) {
      console.warn(`[${new Date().toISOString()}] Texto não encontrado para súmula ${numero}`);
      return null;
    }
    
    const textoSumula = textoMatch[1]
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (textoSumula.length < 20) return null;
    
    console.log(`[${new Date().toISOString()}] ✓ Súmula ${numero} encontrada (${textoSumula.length} chars)`);
    
    return {
      numero,
      texto: textoSumula,
      data
    };
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro:`, error);
    return null;
  }
}

/**
 * Função principal - PÚBLICA para popular súmulas TST
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inicio, fim } = await req.json();

    if (!inicio || !fim) {
      throw new Error('Parâmetros inicio e fim são obrigatórios');
    }

    console.log(`[${new Date().toISOString()}] === Iniciando população de súmulas TST ${inicio}-${fim} ===`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resultados = [];

    for (let numero = inicio; numero <= fim; numero++) {
      console.log(`[${new Date().toISOString()}] --- Processando súmula ${numero} ---`);
      
      const sumulaData = await buscarSumula(numero);
      
      if (sumulaData) {
        // Inserir no banco com os nomes de colunas corretos
        const { error: insertError } = await supabaseClient
          .from('SUMULAS TST')
          .insert({
            id: sumulaData.numero,
            "Título da Súmula": `Súmula TST nº ${sumulaData.numero}`,
            "Texto da Súmula": sumulaData.texto,
            "Data de Aprovação": sumulaData.data
          });

        if (insertError) {
          // Pode ser duplicada (já existe)
          if (insertError.code === '23505') {
            console.log(`[${new Date().toISOString()}] Súmula ${numero} já existe no banco`);
            resultados.push({
              numero,
              sucesso: true,
              mensagem: 'Já existente'
            });
          } else {
            console.error(`[${new Date().toISOString()}] Erro ao inserir súmula ${numero}:`, insertError);
            resultados.push({
              numero,
              sucesso: false,
              erro: insertError.message
            });
          }
        } else {
          console.log(`[${new Date().toISOString()}] ✓ Súmula ${numero} inserida com sucesso`);
          resultados.push({
            numero,
            sucesso: true,
            mensagem: 'Inserida'
          });
        }
      } else {
        // Súmula não encontrada (cancelada ou inexistente)
        resultados.push({
          numero,
          sucesso: false,
          erro: 'Súmula não encontrada ou cancelada'
        });
      }

      // Delay de 2 segundos entre requisições
      if (numero < fim) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const sucesso = resultados.filter(r => r.sucesso).length;
    const total = resultados.length;

    console.log(`[${new Date().toISOString()}] === Concluído: ${sucesso}/${total} súmulas processadas ===`);

    return new Response(
      JSON.stringify({
        sucesso: true,
        total,
        processadas: sucesso,
        resultados
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro na função:`, error);
    
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

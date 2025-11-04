import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArtigoData {
  numero: string;
  texto: string;
}

async function buscarArtigos(): Promise<ArtigoData[]> {
  try {
    console.log(`[${new Date().toISOString()}] Buscando Lei 14.197/2021...`);
    
    const url = 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14197.htm';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const html = decoder.decode(buffer);
    
    const artigos: ArtigoData[] = [];
    
    // Função para formatar artigo com quebras duplas
    const formatArtigo = (texto: string): string => {
      return texto
        // Quebras antes de parágrafos
        .replace(/(\S)\s+(Parágrafo único[\.:])/g, '$1\n\n$2')
        .replace(/(\S)\s+(§\s*\d+[ºª°]?)/g, '$1\n\n$2')
        // Quebras antes de incisos romanos
        .replace(/(\S)\s+(I\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(II\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(III\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(IV\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(V\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(VI\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(VII\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(VIII\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(IX\s*[-–])/g, '$1\n\n$2')
        .replace(/(\S)\s+(X\s*[-–])/g, '$1\n\n$2')
        // Quebras antes de alíneas
        .replace(/(\S)\s+([a-z]\))/g, '$1\n\n$2')
        // Quebra antes de Pena
        .replace(/(\S)\s+(Pena\s*[-–])/g, '$1\n\n$2');
    };
    
    // Extrair cabeçalho
    const cabecalhoMatch = html.match(/LEI\s*Nº\s*14\.197[^<]*(?:<[^>]+>[^<]*)*?(?=<p|Art\.|TÍTULO)/i);
    if (cabecalhoMatch) {
      const cabecalho = cabecalhoMatch[0]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cabecalho.length > 20) {
        artigos.push({
          numero: '',
          texto: cabecalho
        });
        console.log(`[${new Date().toISOString()}] ✓ Cabeçalho capturado`);
      }
    }
    
    // Regex para capturar artigos 359-L a 359-U
    const artigoRegex = /Art\.\s*359-([L-U])\s*[-–]\s*([^]*?)(?=Art\.\s*359-[L-U]|$)/gi;
    
    let match;
    while ((match = artigoRegex.exec(html)) !== null) {
      const letra = match[1].trim();
      let texto = match[2]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (texto.length > 20) {
        texto = formatArtigo(texto);
        artigos.push({
          numero: `359-${letra}`,
          texto: `Art. 359-${letra} ${texto}`
        });
        console.log(`[${new Date().toISOString()}] ✓ Artigo 359-${letra} capturado`);
      }
    }
    
    return artigos;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro:`, error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${new Date().toISOString()}] === Iniciando população Lei 14.197/2021 ===`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const artigos = await buscarArtigos();
    
    if (artigos.length === 0) {
      throw new Error('Nenhum artigo encontrado');
    }

    const resultados = [];

    for (const artigo of artigos) {
      const { error: insertError } = await supabaseClient
        .from('Lei 14.197 de 2021 - Crimes Contra o Estado Democrático')
        .insert({
          "Número do Artigo": artigo.numero,
          "Artigo": artigo.texto
        });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`[${new Date().toISOString()}] ${artigo.numero} já existe`);
          resultados.push({ numero: artigo.numero, sucesso: true, mensagem: 'Já existente' });
        } else {
          console.error(`[${new Date().toISOString()}] Erro em ${artigo.numero}:`, insertError);
          resultados.push({ numero: artigo.numero, sucesso: false, erro: insertError.message });
        }
      } else {
        console.log(`[${new Date().toISOString()}] ✓ ${artigo.numero} inserido`);
        resultados.push({ numero: artigo.numero, sucesso: true, mensagem: 'Inserido' });
      }
    }

    const sucesso = resultados.filter(r => r.sucesso).length;

    return new Response(
      JSON.stringify({
        sucesso: true,
        total: artigos.length,
        processados: sucesso,
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

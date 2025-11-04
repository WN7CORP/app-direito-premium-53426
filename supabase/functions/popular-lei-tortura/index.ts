import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Função para decodificar ArrayBuffer com fallback robusto
function decodeWithFallback(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  
  // Tentar UTF-8 primeiro
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(uint8Array);
  } catch {
    console.warn('⚠️ Falha UTF-8, tentando Windows-1252...');
  }

  // Fallback para Windows-1252
  try {
    const decoder = new TextDecoder('windows-1252');
    return decoder.decode(uint8Array);
  } catch {
    console.warn('⚠️ Falha Windows-1252, tentando ISO-8859-1...');
  }

  // Último fallback para ISO-8859-1
  const decoder = new TextDecoder('iso-8859-1');
  return decoder.decode(uint8Array);
}

// Pré-processar HTML
function preprocessHTML(html: string): string {
  let texto = html;

  // Remover scripts, styles e comentários
  texto = texto.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  texto = texto.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  texto = texto.replace(/<!--[\s\S]*?-->/g, '');

  // Converter tags de bloco em quebras de linha
  texto = texto.replace(/<\/?(p|div|br|h[1-6]|li|tr|td)[^>]*>/gi, '\n');

  // Remover todas as outras tags HTML
  texto = texto.replace(/<[^>]+>/g, '');

  // Decodificar entidades HTML
  texto = texto.replace(/&nbsp;/g, ' ');
  texto = texto.replace(/&quot;/g, '"');
  texto = texto.replace(/&amp;/g, '&');
  texto = texto.replace(/&lt;/g, '<');
  texto = texto.replace(/&gt;/g, '>');
  texto = texto.replace(/&aacute;/g, 'á');
  texto = texto.replace(/&eacute;/g, 'é');
  texto = texto.replace(/&iacute;/g, 'í');
  texto = texto.replace(/&oacute;/g, 'ó');
  texto = texto.replace(/&uacute;/g, 'ú');
  texto = texto.replace(/&atilde;/g, 'ã');
  texto = texto.replace(/&otilde;/g, 'õ');
  texto = texto.replace(/&ccedil;/g, 'ç');
  texto = texto.replace(/&Aacute;/g, 'Á');
  texto = texto.replace(/&Eacute;/g, 'É');
  texto = texto.replace(/&Iacute;/g, 'Í');
  texto = texto.replace(/&Oacute;/g, 'Ó');
  texto = texto.replace(/&Uacute;/g, 'Ú');
  texto = texto.replace(/&Atilde;/g, 'Ã');
  texto = texto.replace(/&Otilde;/g, 'Õ');
  texto = texto.replace(/&Ccedil;/g, 'Ç');
  texto = texto.replace(/&ordm;/g, 'º');
  texto = texto.replace(/&ordf;/g, 'ª');
  texto = texto.replace(/&#170;/g, 'ª');
  texto = texto.replace(/&#186;/g, 'º');

  // Normalizar espaços em branco
  texto = texto.replace(/[ \t]+/g, ' ');
  texto = texto.replace(/\n\s+/g, '\n');
  texto = texto.replace(/\s+\n/g, '\n');
  texto = texto.replace(/\n{3,}/g, '\n\n');

  return texto.trim();
}

// Extrair cabeçalho da lei
function extrairCabecalho(texto: string): { numero: string | null; texto: string } | null {
  const match = texto.match(/LEI\s*N[ºO°]?\s*9\.?455[^]*?(?=Art)/i);
  
  if (match) {
    let cabecalhoTexto = match[0].trim();
    
    // Remover todas as quebras de linha e normalizar espaços
    cabecalhoTexto = cabecalhoTexto.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Remover textos extras
    cabecalhoTexto = cabecalhoTexto.replace(/Texto compilado/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Mensagem de veto/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Vigência/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Promulgação/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/partes vetadas/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Produção de efeito/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Regulamento/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Conversão da/gi, '');
    
    // Normalizar espaços novamente
    cabecalhoTexto = cabecalhoTexto.replace(/\s+/g, ' ').trim();
    
    console.log(`📋 Cabeçalho encontrado: ${cabecalhoTexto.substring(0, 100)}...`);
    return { numero: null, texto: cabecalhoTexto };
  }
  
  console.warn('⚠️ Cabeçalho não encontrado no texto');
  return null;
}

// Normalizar texto para comparação
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Formatar artigo com quebras duplas
function formatArtigo(texto: string): string {
  let formatted = texto;

  // Quebras duplas antes de "Parágrafo único"
  formatted = formatted.replace(/\n?(Parágrafo único)/gi, '\n\n$1');

  // Quebras duplas antes de parágrafos (§)
  formatted = formatted.replace(/\n?(§\s*\d+)/g, '\n\n$1');

  // Quebras duplas antes de incisos romanos (I –, II –, III –, etc)
  formatted = formatted.replace(/\n?([IVXLCDM]+)\s*[–-]/g, '\n\n$1 –');

  // Quebras duplas antes de alíneas (a), b), c))
  formatted = formatted.replace(/\n?([a-z])\)/g, '\n\n$1)');

  // Quebras duplas antes de "Pena –"
  formatted = formatted.replace(/\n?(Pena\s*[–-])/gi, '\n\n$1');

  // Normalizar múltiplas quebras para no máximo duplas
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Normalizar espaços múltiplos
  formatted = formatted.replace(/ {2,}/g, ' ');

  return formatted.trim();
}

// Parse artigos da lei
function parseArtigos(texto: string): Array<{ numero: string; texto: string }> {
  const artigos: Array<{ numero: string; texto: string }> = [];
  
  // Regex para capturar artigos (Art. 1º até Art. 8º)
  const regexArtigos = /Art\.?\s*(\d+º)[\s\S]*?(?=Art\.?\s*\d+º|$)/gi;
  
  let match;
  while ((match = regexArtigos.exec(texto)) !== null) {
    const numeroArtigo = match[1]; // "1º", "2º", etc
    let textoArtigo = match[0].trim();
    
    // Aplicar formatação com quebras duplas
    textoArtigo = formatArtigo(textoArtigo);
    
    console.log(`✅ Artigo ${numeroArtigo} capturado (${textoArtigo.length} caracteres)`);
    
    artigos.push({
      numero: numeroArtigo,
      texto: textoArtigo
    });
  }
  
  return artigos;
}

// Buscar artigos da fonte
async function buscarArtigos(): Promise<{
  cabecalho: { numero: string | null; texto: string } | null;
  artigos: Array<{ numero: string; texto: string }>;
}> {
  const url = 'https://www.planalto.gov.br/ccivil_03/leis/l9455.htm';
  
  console.log(`🌐 Buscando lei em: ${url}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
  }
  
  const buffer = await response.arrayBuffer();
  const htmlText = decodeWithFallback(buffer);
  const textoLimpo = preprocessHTML(htmlText);
  
  console.log(`📄 Texto limpo (${textoLimpo.length} caracteres)`);
  
  // Extrair cabeçalho
  const cabecalho = extrairCabecalho(textoLimpo);
  
  // Parse artigos
  const artigos = parseArtigos(textoLimpo);
  
  console.log(`📊 Total capturado: ${artigos.length} artigos`);
  
  return { cabecalho, artigos };
}

// Handler da função
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando população da Lei de Tortura...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados
    const { cabecalho, artigos } = await buscarArtigos();

    // Validar quantidade esperada (8 artigos)
    if (artigos.length < 8) {
      throw new Error(`❌ Apenas ${artigos.length} artigos capturados. Esperado: 8`);
    }

    console.log(`✅ ${artigos.length} artigos capturados com sucesso`);

    // Limpar tabela existente
    console.log('🗑️ Limpando tabela existente...');
    const { error: deleteError } = await supabase
      .from('Lei 9.455 de 1997 - Tortura')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.error('❌ Erro ao limpar tabela:', deleteError);
      throw deleteError;
    }

    // Montar estrutura ordenada para inserção
    const estruturaOrdenada = [];

    // 1. Cabeçalho
    if (cabecalho) {
      estruturaOrdenada.push({
        'Número do Artigo': null,
        'Artigo': cabecalho.texto,
        'Narração': null,
        'Comentario': null,
        'Aula': null
      });
    }

    // 2. Artigos (1º ao 8º)
    for (let i = 1; i <= 8; i++) {
      const numeroStr = `${i}º`;
      const artigo = artigos.find(a => a.numero === numeroStr);
      
      if (artigo) {
        estruturaOrdenada.push({
          'Número do Artigo': artigo.numero,
          'Artigo': artigo.texto,
          'Narração': null,
          'Comentario': null,
          'Aula': null
        });
      } else {
        console.warn(`⚠️ Artigo ${numeroStr} não encontrado`);
      }
    }

    console.log(`📦 Total de registros para inserir: ${estruturaOrdenada.length}`);

    // Inserir dados
    const { data, error: insertError } = await supabase
      .from('Lei 9.455 de 1997 - Tortura')
      .insert(estruturaOrdenada)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir dados:', insertError);
      throw insertError;
    }

    console.log(`✅ ${data?.length || 0} registros inseridos com sucesso!`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lei de Tortura populada com sucesso',
        stats: {
          total_registros: data?.length || 0,
          cabecalho: cabecalho ? 1 : 0,
          artigos: artigos.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

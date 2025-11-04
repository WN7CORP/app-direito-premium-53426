import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArtigoData {
  numero: string | null; // null para títulos/capítulos
  texto: string;
}

interface ParseResult {
  artigos: ArtigoData[];
  titulos: ArtigoData[];
  cabecalho: ArtigoData | null;
  fonte: string;
  gaps: number[];
}

/**
 * Decodificação robusta com fallback para Windows-1252
 */
function decodeWithFallback(buffer: ArrayBuffer, contentTypeHeader?: string, encodingPreferido?: string): string {
  const headerCharset = (contentTypeHeader || '').match(/charset=([^;]+)/i)?.[1]?.toLowerCase();
  
  const tryDecode = (encoding: string): string | null => {
    try {
      return new TextDecoder(encoding, { fatal: false }).decode(buffer);
    } catch {
      return null;
    }
  };

  // Detectar mojibake com padrões mais amplos
  const isMojibake = (s: string): boolean => {
    // Detectar replacement chars (�)
    const replacementChars = (s.match(/�/g) || []).length;
    
    // Padrões típicos de mojibake em português
    const mojibakePatterns = [
      /[ÃÂ][^a-zA-Z0-9\s]/,  // Ã§, Ã£, Â§, etc
      /�/,                    // Replacement character
      /[þð]/,                 // Caracteres nórdicos em contexto português
      /p�blico/i,             // "público" corrompido
      /administra��o/i,       // "administração" corrompida
      /judici�ri/i,           // "judiciário" corrompido
    ];
    
    const hasStrangePatterns = mojibakePatterns.some(pattern => pattern.test(s));
    
    return replacementChars > 3 || hasStrangePatterns;
  };

  // Se encoding preferido for especificado, tentar ele primeiro
  if (encodingPreferido) {
    console.log(`🎯 Tentando encoding preferido: ${encodingPreferido}`);
    const decoded = tryDecode(encodingPreferido);
    if (decoded && !isMojibake(decoded)) {
      console.log(`✅ Encoding preferido funcionou: ${encodingPreferido}`);
      return decoded;
    }
  }

  // Se o header HTTP especifica charset, tentar usar
  if (headerCharset && headerCharset !== 'utf-8') {
    const decoded = tryDecode(headerCharset);
    if (decoded && !isMojibake(decoded)) {
      console.log(`✅ Usando charset do header: ${headerCharset}`);
      return decoded;
    }
  }

  // Tentar UTF-8
  let text = tryDecode('utf-8') || '';
  
  // Se detectar mojibake, tentar Windows-1252
  if (isMojibake(text)) {
    console.log('⚠️ Detectado mojibake no UTF-8, tentando Windows-1252...');
    const win1252 = tryDecode('windows-1252');
    if (win1252 && !isMojibake(win1252)) {
      console.log('✅ Windows-1252 funcionou!');
      return win1252;
    }
    
    // Fallback: ISO-8859-1
    console.log('⚠️ Windows-1252 falhou, tentando ISO-8859-1...');
    const iso = tryDecode('iso-8859-1');
    if (iso && !isMojibake(iso)) {
      console.log('✅ ISO-8859-1 funcionou!');
      return iso;
    }
    
    console.warn('⚠️ Todos os encodings falharam, usando UTF-8 com possíveis erros');
  }

  return text;
}

/**
 * Pré-processar HTML para texto limpo
 */
function preprocessHTML(html: string): string {
  // 1. Remover scripts e styles
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // 2. Converter tags de bloco em quebras de linha
  html = html.replace(/<br\s*\/?>/gi, '\n');
  html = html.replace(/<\/p>/gi, '\n\n');
  html = html.replace(/<\/div>/gi, '\n');
  html = html.replace(/<\/li>/gi, '\n');
  html = html.replace(/<\/tr>/gi, '\n');
  html = html.replace(/<\/td>/gi, ' ');
  html = html.replace(/<\/h[1-6]>/gi, '\n\n');
  
  // 3. Remover todas as outras tags
  html = html.replace(/<[^>]+>/g, ' ');
  
  // 4. Decodificar entidades HTML comuns
  html = html.replace(/&nbsp;/g, ' ');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&quot;/g, '"');
  html = html.replace(/&lt;/g, '<');
  html = html.replace(/&gt;/g, '>');
  html = html.replace(/&apos;/g, "'");
  html = html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)));
  
  // 5. Normalizar espaços e quebras
  html = html.replace(/[ \t]+/g, ' ');
  html = html.replace(/\n\s+/g, '\n');
  html = html.replace(/\n{3,}/g, '\n\n');
  html = html.trim();
  
  return html;
}

/**
 * Extrai o cabeçalho da lei (LEI Nº 13.869...)
 */
function extrairCabecalho(texto: string): ArtigoData | null {
  const match = texto.match(/LEI\s*N[ºo°]\s*13\.?869[^]*?(?=(?:CAPÍTULO|TÍTULO|Art\.|$))/i);
  if (match) {
    let cabecalhoTexto = match[0].trim();
    
    // Remover todas as quebras de linha e normalizar espaços primeiro
    cabecalhoTexto = cabecalhoTexto.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Remover textos extras de forma mais direta (não usar word boundaries em frases)
    cabecalhoTexto = cabecalhoTexto.replace(/Texto compilado/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Mensagem de veto/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Vigência/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Promulgação/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/partes vetadas/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Produção de efeito/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Regulamento/gi, '');
    cabecalhoTexto = cabecalhoTexto.replace(/Conversão da/gi, '');
    
    // Normalizar espaços novamente após remoção
    cabecalhoTexto = cabecalhoTexto.replace(/\s+/g, ' ').trim();
    
    console.log(`📋 Cabeçalho encontrado: ${cabecalhoTexto.substring(0, 100)}...`);
    return { numero: null, texto: cabecalhoTexto };
  }
  return null;
}

/**
 * Extrai títulos e capítulos (sem número de artigo)
 */
function extrairTitulos(texto: string): ArtigoData[] {
  const titulos: ArtigoData[] = [];
  const padroes = [
    /(?:^|\n)\s*(CAPÍTULO\s+[IVX]+[^\n]*(?:\n[A-ZÇÃÕÁÉÍÓÚÂÊÔÀÜ\s]+)?)/gi,
    /(?:^|\n)\s*(TÍTULO\s+[IVX]+[^\n]*(?:\n[A-ZÇÃÕÁÉÍÓÚÂÊÔÀÜ\s]+)?)/gi,
    /(?:^|\n)\s*(SEÇÃO\s+[IVX]+[^\n]*(?:\n[A-ZÇÃÕÁÉÍÓÚÂÊÔÀÜ\s]+)?)/gi,
    /(?:^|\n)\s*(Seção\s+[IVX]+[^\n]*(?:\n[^\n]+)?)/gi,
  ];

  const titulosVistos = new Set<string>();

  for (const padrao of padroes) {
    let match;
    while ((match = padrao.exec(texto)) !== null) {
      let tituloTexto = match[1].trim();
      
      // Remover "Art" ou "Art." grudado no final do título
      tituloTexto = tituloTexto.replace(/\s*Art\.?\s*$/i, '').trim();
      
      // Normalizar romanos para maiúsculo (II não Ii)
      tituloTexto = tituloTexto.replace(/\b([ivxlcdm]+)\b/gi, (match) => match.toUpperCase());
      
      // Evitar duplicados
      const chave = tituloTexto.substring(0, 30);
      if (titulosVistos.has(chave)) continue;
      
      if (tituloTexto.length > 5) {
        titulos.push({ numero: null, texto: tituloTexto });
        titulosVistos.add(chave);
        console.log(`📑 Título encontrado: ${tituloTexto.substring(0, 60)}`);
      }
    }
  }

  return titulos;
}

/**
 * Remove títulos do texto para não interferir na extração de artigos
 */
function removerTitulos(texto: string): string {
  let textoLimpo = texto;
  
  // Remover cabeçalho da lei
  textoLimpo = textoLimpo.replace(/LEI\s*N[ºo°]\s*13\.?869[^]*?(?=Art\.)/i, '');
  
  // Remover títulos principais
  textoLimpo = textoLimpo.replace(/(?:^|\n)\s*(?:CAPÍTULO|TÍTULO|SEÇÃO|Seção)\s+[IVX]+[^\n]*(?:\n[^\n]+)?/gi, '\n');
  
  // Limpar múltiplas quebras
  textoLimpo = textoLimpo.replace(/\n{3,}/g, '\n\n');
  
  return textoLimpo;
}

/**
 * Normaliza string para comparação (remove acentos, case-insensitive, espaços)
 */
function normalizar(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formata o texto do artigo com quebras duplas antes de §, incisos, alíneas e "Pena –"
 * Idêntico à Lei Maria da Penha
 */
function formatArtigo(texto: string): string {
  let formatado = texto;
  
  // Remover títulos/capítulos que aparecem no final
  formatado = formatado.replace(/\n\s*(?:CAPÍTULO|TÍTULO|SEÇÃO|Seção)\s+[IVX]+[\s\S]*$/gi, '');
  
  // Normalizar espaços primeiro
  formatado = formatado.replace(/\s+/g, ' ').trim();
  
  // Parágrafo único
  formatado = formatado.replace(/\s*Parágrafo\s+único\.?/gi, '\n\nParágrafo único');
  
  // Parágrafos numerados (§ 1º, § 2º, etc)
  formatado = formatado.replace(/\s*§\s*(\d+º?)/g, '\n\n§ $1');
  
  // Incisos romanos seguidos de traço (I –, II –, III –, ... até XXX)
  // Captura romanos de I até XXX
  formatado = formatado.replace(/(?:\s*)([IVXLCDM]+)\s*[-–—]\s*/g, '\n\n$1 – ');
  
  // Alíneas (a), b), c), etc)
  formatado = formatado.replace(/(?:\s*)([a-z])\)\s*/g, '\n\n$1) ');
  
  // "Pena –" sempre com quebra dupla antes
  formatado = formatado.replace(/\s*Pena\s*[-–—]\s*/gi, '\n\nPena – ');
  
  // Normalizar múltiplas quebras e espaços
  formatado = formatado.replace(/[ \t]+/g, ' ');
  formatado = formatado.replace(/\n{3,}/g, '\n\n');
  
  return formatado.trim();
}

/**
 * Parser baseado em marcadores de início
 */
function parseArtigos(texto: string): ArtigoData[] {
  console.log(`🔍 Iniciando parser baseado em marcadores...`);
  
  // Padrão refinado: Art. deve estar em início de linha
  const inicioRegex = /(?:^|\n)\s*(Art\.\s*(\d+)(?:º|o|O)?(?:-[A-Z])?\s*\.?)/gim;
  
  const marcadores: Array<{ index: number; numero: string; matchLength: number }> = [];
  let match;
  
  // Encontrar todos os marcadores de início
  while ((match = inicioRegex.exec(texto)) !== null) {
    const numeroRaw = match[2];
    const numeroInt = parseInt(numeroRaw);
    
    // FILTRO: apenas artigos 1-45
    if (numeroInt < 1 || numeroInt > 45) {
      continue;
    }
    
    const artigoStart = match[0].indexOf('Art.');
    const realIndex = match.index + artigoStart;
    
    marcadores.push({
      index: realIndex,
      numero: numeroRaw,
      matchLength: match[1].length
    });
  }
  
  console.log(`📍 ${marcadores.length} marcadores encontrados (1-45)`);
  
  if (marcadores.length === 0) {
    return [];
  }
  
  const artigos: ArtigoData[] = [];
  const numerosVistos = new Set<string>();
  
  // Processar cada bloco
  for (let i = 0; i < marcadores.length; i++) {
    const marcadorAtual = marcadores[i];
    const proximoMarcador = marcadores[i + 1];
    
    const inicioBloco = marcadorAtual.index;
    const fimBloco = proximoMarcador ? proximoMarcador.index : texto.length;
    let blocoTexto = texto.substring(inicioBloco, fimBloco).trim();
    
    const numero = marcadorAtual.numero;
    
    // Verificar duplicados
    if (numerosVistos.has(numero)) {
      console.log(`⚠️ Art. ${numero} duplicado, ignorando`);
      continue;
    }
    
    // Remover cabeçalho "Art. X" do texto
    // O frontend já exibe "Art. X" como cabeçalho visual (igual LMP)
    blocoTexto = blocoTexto.replace(/^Art\.\s*\d+(?:º|o|O)?(?:-[A-Z])?\s*\.?\s*/i, '').trim();
    
    // Detectar VETADO
    if (/\(?\s*VETADO\s*\)?/i.test(blocoTexto) || /\(?\s*Vetado\s*\)?/i.test(blocoTexto)) {
      blocoTexto = '(VETADO)';
      console.log(`🚫 Art. ${numero} é VETADO`);
    } else {
      // Aplicar formatação completa (quebras duplas antes de §, incisos, alíneas, "Pena –")
      blocoTexto = formatArtigo(blocoTexto);
    }
    
    // Adicionar se tiver conteúdo válido
    if (blocoTexto.length >= 3) {
      numerosVistos.add(numero);
      artigos.push({
        numero: numero,
        texto: blocoTexto
      });
      
      const preview = blocoTexto.length > 80 ? blocoTexto.substring(0, 80) + '...' : blocoTexto;
      console.log(`✓ Art. ${numero} (${blocoTexto.length} chars): "${preview}"`);
    } else {
      console.log(`⚠️ Art. ${numero} REJEITADO (${blocoTexto.length} chars)`);
    }
  }
  
  return artigos;
}

/**
 * Busca e parseia artigos de uma fonte específica
 */
async function buscarDeFonte(url: string, nomeFonte: string, encodingPreferido?: string): Promise<ParseResult> {
  console.log(`\n🔍 Tentando buscar de ${nomeFonte}: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status} ao buscar ${nomeFonte}`);
      return { artigos: [], titulos: [], cabecalho: null, fonte: nomeFonte, gaps: [] };
    }

    // Detectar encoding automaticamente com fallback e encoding preferido
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';
    const html = decodeWithFallback(buffer, contentType, encodingPreferido);
    console.log(`✅ HTML baixado e decodificado (${html.length} chars)`);
    
    const textoLimpo = preprocessHTML(html);
    console.log(`📝 Texto limpo: ${textoLimpo.length} chars`);
    
    // Extrair cabeçalho da lei
    const cabecalho = extrairCabecalho(textoLimpo);
    
    // Extrair títulos/capítulos
    const titulos = extrairTitulos(textoLimpo);
    console.log(`📑 ${titulos.length} títulos/capítulos encontrados`);
    
    // Remover títulos do texto antes de parsear artigos
    const textoSemTitulos = removerTitulos(textoLimpo);
    
    const artigos = parseArtigos(textoSemTitulos);
    console.log(`📊 ${nomeFonte}: ${artigos.length} artigos capturados`);
    
    const gaps = calcularGaps(artigos);
    
    return { artigos, titulos, cabecalho, fonte: nomeFonte, gaps };
  } catch (error) {
    console.error(`❌ Erro ao buscar de ${nomeFonte}:`, error);
    return { artigos: [], titulos: [], cabecalho: null, fonte: nomeFonte, gaps: [] };
  }
}

/**
 * Tenta buscar artigos das fontes disponíveis com fallback
 */
async function buscarArtigosComFallback(forceFonte?: string): Promise<ParseResult> {
  const fontes = [
    { 
      nome: 'Planalto', 
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13869.htm',
      encoding: 'windows-1252' // Planalto sempre usa Windows-1252
    },
    { 
      nome: 'Câmara', 
      url: 'https://www2.camara.leg.br/legin/fed/lei/2019/lei-13869-5-setembro-2019-789229-publicacaooriginal-159170-pl.html',
      encoding: undefined
    }
  ];

  // Se forçou uma fonte específica, tentar apenas ela
  if (forceFonte) {
    const fonte = fontes.find(f => f.nome.toLowerCase() === forceFonte.toLowerCase());
    if (fonte) {
      console.log(`🎯 Fonte forçada: ${fonte.nome}`);
      return await buscarDeFonte(fonte.url, fonte.nome, fonte.encoding);
    }
  }

  // Tentar cada fonte em ordem
  for (const fonte of fontes) {
    const resultado = await buscarDeFonte(fonte.url, fonte.nome, fonte.encoding);
    
    if (resultado.artigos.length >= 45) {
      console.log(`✅ Sucesso com ${fonte.nome}: ${resultado.artigos.length} artigos`);
      return resultado;
    }
    
    console.log(`⚠️ ${fonte.nome} retornou apenas ${resultado.artigos.length} artigos, tentando próxima fonte...`);
  }

  // Se nenhuma fonte funcionou bem, retornar a melhor tentativa
  console.log('⚠️ Nenhuma fonte retornou 45+ artigos');
  return await buscarDeFonte(fontes[0].url, fontes[0].nome, fontes[0].encoding);
}

/**
 * Calcular artigos faltando (gaps)
 */
function calcularGaps(artigos: ArtigoData[]): number[] {
  const numerosCapturados = artigos
    .map(a => a.numero ? parseInt(a.numero) : NaN)
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
  
  const gaps: number[] = [];
  for (let i = 1; i <= 45; i++) {
    if (!numerosCapturados.includes(i)) {
      gaps.push(i);
    }
  }
  
  return gaps;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('═══ Iniciando população Lei 13.869/2019 ═══');
    
    // Verificar query params
    const url = new URL(req.url);
    const forceFonte = url.searchParams.get('source') || undefined;
    
    if (forceFonte) {
      console.log(`🎯 Query param source=${forceFonte}`);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resultado = await buscarArtigosComFallback(forceFonte);
    
    console.log('📊 Resultado final:');
    console.log(`  - Fonte: ${resultado.fonte}`);
    console.log(`  - Total artigos: ${resultado.artigos.length}`);
    console.log(`  - Total títulos: ${resultado.titulos.length}`);
    console.log(`  - Cabeçalho: ${resultado.cabecalho ? 'Sim' : 'Não'}`);
    console.log(`  - Gaps: ${resultado.gaps.length > 0 ? resultado.gaps.join(', ') : 'nenhum'}`);
    
    // Se não conseguiu capturar 45+ artigos, não modificar o banco
    if (resultado.artigos.length < 45) {
      console.error(`❌ Apenas ${resultado.artigos.length} artigos capturados. Esperado: 45`);
      console.error(`❌ Gaps encontrados: ${resultado.gaps.join(', ')}`);
      
      return new Response(
        JSON.stringify({ 
          sucesso: false,
          total_artigos: resultado.artigos.length,
          esperado: 45,
          faltando: resultado.gaps,
          fonte: resultado.fonte,
          mensagem: 'Número insuficiente de artigos capturados. Banco não foi modificado.',
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ ${resultado.artigos.length} artigos capturados com sucesso da fonte: ${resultado.fonte}`);
    
    // Limpar tabela
    console.log('🗑️ Limpando tabela...');
    const { error: deleteError } = await supabaseClient
      .from('Lei 13.869 de 2019 - Abuso de Autoridade')
      .delete()
      .gte('id', 0);

    if (deleteError) {
      console.error('❌ Erro ao limpar tabela:', deleteError);
      throw deleteError;
    }

    console.log('✅ Tabela limpa');

    // Preparar dados para inserção: cabeçalho + títulos intercalados + artigos
    const dadosParaInserir: Array<{ 'Número do Artigo': string | null, 'Artigo': string }> = [];
    
    // Estrutura ordenada da lei (títulos intercalados com artigos)
    type EstruturaElemento = 
      | { tipo: 'cabecalho' }
      | { tipo: 'titulo'; buscar: string }
      | { tipo: 'artigo'; numero: string };

    const estruturaOrdenada: EstruturaElemento[] = [
      { tipo: 'cabecalho' },
      { tipo: 'titulo', buscar: 'CAPÍTULO I' },
      { tipo: 'artigo', numero: '1' },
      { tipo: 'titulo', buscar: 'CAPÍTULO II' },
      { tipo: 'artigo', numero: '2' },
      { tipo: 'titulo', buscar: 'CAPÍTULO III' },
      { tipo: 'artigo', numero: '3' },
      { tipo: 'titulo', buscar: 'CAPÍTULO IV' },
      { tipo: 'titulo', buscar: 'Seção I' },
      { tipo: 'artigo', numero: '4' },
      { tipo: 'titulo', buscar: 'Seção II' },
      { tipo: 'artigo', numero: '5' },
      { tipo: 'titulo', buscar: 'CAPÍTULO V' },
      { tipo: 'artigo', numero: '6' },
      { tipo: 'artigo', numero: '7' },
      { tipo: 'artigo', numero: '8' },
      { tipo: 'titulo', buscar: 'CAPÍTULO VI' },
      ...Array.from({ length: 29 }, (_, i) => ({ tipo: 'artigo' as const, numero: String(9 + i) })),
      { tipo: 'titulo', buscar: 'CAPÍTULO VII' },
      { tipo: 'artigo', numero: '38' },
      { tipo: 'artigo', numero: '39' },
      { tipo: 'titulo', buscar: 'CAPÍTULO VIII' },
      { tipo: 'artigo', numero: '40' },
      { tipo: 'artigo', numero: '41' },
      { tipo: 'artigo', numero: '42' },
      { tipo: 'artigo', numero: '43' },
      { tipo: 'artigo', numero: '44' },
      { tipo: 'artigo', numero: '45' },
    ];

    console.log('🔄 Montando estrutura ordenada...');
    
    // Processar cada elemento da estrutura ordenada
    for (const elemento of estruturaOrdenada) {
      if (elemento.tipo === 'cabecalho') {
        if (resultado.cabecalho) {
          dadosParaInserir.push({
            'Número do Artigo': null,
            'Artigo': resultado.cabecalho.texto
          });
          console.log('📋 Cabeçalho adicionado');
        }
      } else if (elemento.tipo === 'titulo') {
        // Buscar título com correspondência tolerante (case-insensitive, sem acentos)
        const tituloNormalizado = normalizar(elemento.buscar);
        const titulo = resultado.titulos.find(t => 
          normalizar(t.texto).includes(tituloNormalizado)
        );
        
        if (titulo) {
          // Verificar se não foi já adicionado (evitar duplicatas de "CAPÍTULO IV" etc)
          const jaAdicionado = dadosParaInserir.some(d => 
            d['Número do Artigo'] === null && 
            normalizar(d['Artigo']).includes(tituloNormalizado)
          );
          
          if (!jaAdicionado) {
            dadosParaInserir.push({
              'Número do Artigo': null,
              'Artigo': titulo.texto
            });
            console.log(`📑 Título adicionado: ${elemento.buscar}`);
          } else {
            console.log(`⏭️ Título já adicionado anteriormente: ${elemento.buscar}`);
          }
        } else {
          console.warn(`⚠️ Título não encontrado: ${elemento.buscar}`);
        }
      } else if (elemento.tipo === 'artigo') {
        // Buscar artigo pelo número
        const artigo = resultado.artigos.find(a => a.numero === elemento.numero);
        
        if (artigo) {
          dadosParaInserir.push({
            'Número do Artigo': artigo.numero,
            'Artigo': artigo.texto
          });
        } else {
          console.warn(`⚠️ Art. ${elemento.numero} não encontrado`);
        }
      }
    }

    console.log(`📝 Inserindo ${dadosParaInserir.length} registros (cabeçalho + títulos + artigos)...`);
    
    // Inserir em lote
    const { error: insertError } = await supabaseClient
      .from('Lei 13.869 de 2019 - Abuso de Autoridade')
      .insert(dadosParaInserir);

    if (insertError) {
      console.error('❌ Erro ao inserir dados:', insertError);
      throw insertError;
    }

    console.log('✅ Dados inseridos com sucesso!');

    return new Response(
      JSON.stringify({ 
        sucesso: true,
        total_artigos: resultado.artigos.length,
        total_titulos: resultado.titulos.length,
        total_registros: dadosParaInserir.length,
        fonte: resultado.fonte,
        gaps: resultado.gaps,
        mensagem: `${resultado.artigos.length} artigos + ${resultado.titulos.length} títulos inseridos com sucesso da fonte ${resultado.fonte}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    
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

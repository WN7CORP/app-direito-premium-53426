// Converte texto em CAIXA ALTA para capitalização adequada
const toTitleCase = (text: string): string => {
  // Palavras que devem ficar em minúscula (exceto quando são a primeira palavra)
  const lowercaseWords = new Set([
    'a', 'ao', 'aos', 'as', 'à', 'às',
    'da', 'das', 'de', 'do', 'dos',
    'e', 'em', 'na', 'nas', 'no', 'nos',
    'o', 'os', 'ou', 'para', 'pela', 'pelas',
    'pelo', 'pelos', 'por', 'sobre', 'um', 'uma'
  ]);

  const words = text.split(/\s+/);
  
  return words.map((word, index) => {
    // Remove pontuação para checar a palavra
    const cleanWord = word.replace(/[,;:\.\(\)]/g, '');
    
    // Se é um número romano (I, II, III, IV, V, etc), mantém maiúsculo
    if (/^[IVXLCDM]+$/i.test(cleanWord)) {
      return cleanWord.toUpperCase();
    }
    
    // Primeira palavra sempre capitalizada
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Se é uma palavra pequena, mantém minúscula
    if (lowercaseWords.has(cleanWord.toLowerCase())) {
      return word.toLowerCase();
    }
    
    // Caso contrário, capitaliza primeira letra
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

// Formata texto da Constituição aplicando estilos específicos
export const formatTextWithUppercase = (text: string): string => {
  if (!text) return "";
  
  // Normalizar quebras de linha múltiplas LOGO NO INÍCIO
  let result = text.replace(/\n{2,}/g, '\n\n');
  
  // Aplicar quebra de linha e negrito a "Parágrafo único" (incluindo variações com ponto)
  result = result.replace(/([.;:!?])\s*(Parágrafo único\.?)/gi, '$1<br><br><strong class="font-bold">$2</strong>');
  result = result.replace(/^(Parágrafo único\.?)/gim, '<br><br><strong class="font-bold">$1</strong>');
  // Regra geral para pegar qualquer "Parágrafo único" que ainda não tenha sido formatado
  result = result.replace(/(Parágrafo único\.?)(?!<)/gi, '<strong class="font-bold">$1</strong>');
  
  // Aplicar quebra de linha e negrito a parágrafos (§) - após pontuação
  result = result.replace(/([.;:!?])\s+(§\s*\d+º)/g, '$1<br><br><strong class="font-bold">$2</strong>');
  // Para parágrafos no início de linha
  result = result.replace(/^(§\s*\d+º)/gm, '<br><br><strong class="font-bold">$1</strong>');
  
  // Aplicar negrito a incisos romanos (I, II, III, etc) seguidos de hífen/traço
  // Adiciona quebra de linha dupla antes de cada inciso que vem após pontuação
  result = result.replace(/([.;:!?])\s+([IVXLCDM]+)\s*[-–—]\s*/g, '$1<br><br><strong class="font-bold">$2</strong> - ');
  // Para incisos no início de linha
  result = result.replace(/^([IVXLCDM]+)\s*[-–—]\s*/gm, '<strong class="font-bold">$1</strong> - ');
  // Para incisos após dois pontos ou parênteses
  result = result.replace(/:\s+([IVXLCDM]+)\s*[-–—]/g, ':<br><br><strong class="font-bold">$1</strong> -');
  
  // Aplicar negrito a alíneas (a), b), c)) com quebra de linha
  // Alíneas no início de linha
  result = result.replace(/^\s*([a-z])\)\s*/gm, '<br><strong class="font-bold">$1)</strong> ');
  // Alíneas após pontuação
  result = result.replace(/([.;:!?])\s*([a-z])\)\s*/g, '$1<br><strong class="font-bold">$2)</strong> ');
  
  // Identificar e marcar apenas TÍTULOS principais (linhas completas em caixa alta)
  // NÃO aplicar em textos após §, incisos, alíneas ou dentro de artigos
  const lines = result.split('\n');
  const processedLines = lines.map((line, lineIndex) => {
    const trimmedLine = line.trim();
    
    // Ignora linhas vazias ou muito curtas (aumentado de 3 para 10)
    if (!trimmedLine || trimmedLine.length < 10) return line;
    
    // NÃO aplicar se a linha começa com §, números romanos seguidos de -, ou alíneas
    if (/^(§|\d+º|[IVXLCDM]+\s*[-–—]|[a-z]\))/.test(trimmedLine)) {
      return line;
    }
    
    // NÃO aplicar se está dentro de um artigo (começa com "Art.")
    if (/^Art\./.test(trimmedLine)) {
      return line;
    }
    
    // NÃO aplicar se está no MEIO do artigo (depois de já ter aparecido um Art. acima)
    const hasArticleAbove = lines.slice(0, lineIndex).some(l => /^Art\./i.test(l.trim()));
    if (hasArticleAbove) {
      return line; // É um subtítulo interno, não um título principal
    }
    
    // Contar palavras em CAIXA ALTA
    const words = trimmedLine.split(/\s+/);
    const upperWords = words.filter(word => 
      /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\-\(\),;:\.0-9]+$/.test(word.replace(/[,;:\.\(\)]/g, ''))
    );
    
    // Se mais de 70% das palavras estão em caixa alta E tem pelo menos 2 palavras, é um título
    if (upperWords.length >= 2 && (upperWords.length / words.length) > 0.7) {
      const titleText = toTitleCase(trimmedLine);
      return `<span class="text-[hsl(45,93%,58%)]">${titleText}</span>`;
    }
    
    return line;
  });
  
  result = processedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n'); // Normaliza múltiplas quebras para apenas dupla
  
  // Envolve o texto completo sem forçar tamanho de fonte (herda do container)
  return `<div class="font-normal">${result}</div>`;
};

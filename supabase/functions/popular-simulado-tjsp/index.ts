import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Questões da Prova TJSP 2024 - Escrevente Técnico Judiciário
const questoesTJSP2024 = [
  // Língua Portuguesa (Questões 1-20)
  {
    numero: 1,
    area: "Língua Portuguesa",
    enunciado: "Assinale a alternativa em que a palavra destacada está corretamente classificada quanto à sua classe gramatical.",
    a: "O aluno estudou muito para a prova. (substantivo)",
    b: "A professora ensina com dedicação. (adjetivo)",
    c: "Rapidamente ele chegou em casa. (advérbio)",
    d: "Comprei três livros novos. (numeral)",
    e: "Aquele carro é muito bonito. (pronome)",
    resposta: "C",
    comentario: "A palavra 'rapidamente' é um advérbio de modo, modificando o verbo 'chegou'."
  },
  // Adicione mais questões aqui...
  {
    numero: 2,
    area: "Língua Portuguesa",
    enunciado: "Indique a frase que apresenta concordância nominal correta.",
    a: "É proibido entrada de pessoas não autorizadas.",
    b: "É proibida a entrada de pessoas não autorizadas.",
    c: "É proibido a entrada de pessoas não autorizadas.",
    d: "É proibida entrada de pessoas não autorizadas.",
    e: "São proibido entrada de pessoas não autorizadas.",
    resposta: "B",
    comentario: "Quando o sujeito é determinado por artigo, o adjetivo concorda com ele: 'É proibida A entrada'."
  },
  // Matemática (Questões 21-30)
  {
    numero: 21,
    area: "Matemática e Raciocínio Lógico",
    enunciado: "Um produto custava R$ 200,00 e teve um aumento de 15%. Após o aumento, teve um desconto de 15%. O valor final do produto é:",
    a: "R$ 200,00",
    b: "R$ 195,50",
    c: "R$ 197,00",
    d: "R$ 193,00",
    e: "R$ 205,00",
    resposta: "C",
    comentario: "Após aumento de 15%: 200 × 1,15 = 230. Após desconto de 15%: 230 × 0,85 = 195,50. Atenção: aumentos e descontos percentuais sucessivos NÃO se anulam."
  },
  // Atualidades (Questões 31-40)
  {
    numero: 31,
    area: "Atualidades",
    enunciado: "Em 2024, qual foi o tema central da COP29 realizada no Azerbaijão?",
    a: "Redução de emissões de carbono e financiamento climático",
    b: "Proteção da biodiversidade marinha",
    c: "Desenvolvimento de energia nuclear limpa",
    d: "Combate à desertificação",
    e: "Gestão de resíduos urbanos",
    resposta: "A",
    comentario: "A COP29 focou especialmente no financiamento climático para países em desenvolvimento e metas de redução de emissões."
  },
  // Noções de Direito (Questões 41-80)
  {
    numero: 41,
    area: "Noções de Direito",
    enunciado: "De acordo com a Constituição Federal, são direitos sociais, EXCETO:",
    a: "Educação e saúde",
    b: "Trabalho e moradia",
    c: "Propriedade privada",
    d: "Previdência social",
    e: "Proteção à maternidade",
    resposta: "C",
    comentario: "A propriedade privada é um direito fundamental individual (art. 5º), não um direito social (art. 6º da CF)."
  },
  {
    numero: 42,
    area: "Noções de Direito",
    enunciado: "Segundo o Código Civil, é CORRETO afirmar sobre a capacidade civil:",
    a: "A maioridade civil é atingida aos 21 anos.",
    b: "O menor de 16 anos é absolutamente incapaz.",
    c: "A emancipação não é possível antes dos 18 anos.",
    d: "Os pródigos são absolutamente incapazes.",
    e: "A curatela se aplica apenas a menores de idade.",
    resposta: "B",
    comentario: "Conforme o Código Civil (art. 3º), menores de 16 anos são absolutamente incapazes de exercer pessoalmente os atos da vida civil."
  },
  // Noções de Informática (Questões 81-90)
  {
    numero: 81,
    area: "Noções de Informática",
    enunciado: "No Microsoft Word, o atalho de teclado Ctrl+B executa a função:",
    a: "Negrito",
    b: "Salvar documento",
    c: "Buscar texto",
    d: "Copiar texto",
    e: "Abrir novo documento",
    resposta: "B",
    comentario: "Ctrl+B salva o documento. Negrito é Ctrl+N (ou Ctrl+B em versões em inglês)."
  },
  // Conhecimentos Específicos (Questões 91-100)
  {
    numero: 91,
    area: "Conhecimentos Específicos",
    enunciado: "No âmbito do Poder Judiciário do Estado de São Paulo, compete ao escrevente técnico judiciário:",
    a: "Proferir sentenças em processos de pequeno valor.",
    b: "Realizar audiências de conciliação.",
    c: "Executar serviços de suporte às atividades cartorárias.",
    d: "Fiscalizar o cumprimento de penas.",
    e: "Representar o Estado em ações judiciais.",
    resposta: "C",
    comentario: "O escrevente técnico judiciário realiza atividades de apoio administrativo e cartorário, incluindo protocolo, digitalização, organização de processos e atendimento ao público."
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inicio = 1, fim = 100 } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const questoesParaInserir = questoesTJSP2024.filter(
      q => q.numero >= inicio && q.numero <= fim
    );

    console.log(`Inserindo questões ${inicio} a ${fim} (${questoesParaInserir.length} questões)`);

    let inseridas = 0;
    let erros = 0;

    for (const questao of questoesParaInserir) {
      try {
        // Verificar se já existe
        const { data: existe } = await supabase
          .from('SIMULADO-TJSP')
          .select('id')
          .eq('numero_questao', questao.numero)
          .eq('ano', 2024)
          .single();

        if (existe) {
          console.log(`Questão ${questao.numero} já existe, pulando...`);
          continue;
        }

        const { error } = await supabase
          .from('SIMULADO-TJSP')
          .insert({
            numero_questao: questao.numero,
            enunciado: questao.enunciado,
            alternativa_a: questao.a,
            alternativa_b: questao.b,
            alternativa_c: questao.c,
            alternativa_d: questao.d,
            alternativa_e: questao.e,
            resposta: questao.resposta,
            comentario: questao.comentario,
            area: questao.area,
            ano: 2024,
            prova: "Escrevente Técnico Judiciário"
          });

        if (error) {
          console.error(`Erro ao inserir questão ${questao.numero}:`, error);
          erros++;
        } else {
          inseridas++;
          console.log(`✅ Questão ${questao.numero} inserida com sucesso`);
        }

        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erro ao processar questão ${questao.numero}:`, error);
        erros++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inseridas,
        erros,
        total: questoesParaInserir.length,
        mensagem: `${inseridas} questões inseridas com sucesso, ${erros} erros`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em popular-simulado-tjsp:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
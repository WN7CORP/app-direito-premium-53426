// Seed inicial dos artigos da Lei 8.429/92 (Improbidade Administrativa)
// OBS: Este seed insere o CAPÍTULO I e os Artigos 1º ao 8º como base.
// Podemos complementar os demais artigos em seguida.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "SUPABASE_URL ou SUPABASE_ANON_KEY não configurados" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const registros = [
      { "Número do Artigo": "CAPÍTULO I", Artigo: "CAPÍTULO I - DAS DISPOSIÇÕES GERAIS" },
      { "Número do Artigo": "1", Artigo: "Art. 1º Os atos de improbidade praticados por qualquer agente público, servidor ou não, contra a administração direta, indireta ou fundacional de qualquer dos Poderes da União, dos Estados, do Distrito Federal, dos Municípios, de Território, de empresa incorporada ao patrimônio público ou de entidade para cuja criação ou custeio o erário haja concorrido ou concorra com mais de cinquenta por cento do patrimônio ou da receita anual, serão punidos na forma desta lei. Parágrafo único. Estão também sujeitos às penalidades desta lei os atos de improbidade praticados contra o patrimônio de entidade que receba subvenção, benefício ou incentivo, fiscal ou creditício, de órgão público bem como daquelas para cuja criação ou custeio o erário haja concorrido ou concorra com menos de cinquenta por cento do patrimônio ou da receita anual, limitando-se, nestes casos, a sanção patrimonial à repercussão do ilícito sobre a contribuição dos cofres públicos." },
      { "Número do Artigo": "2", Artigo: "Art. 2º Para os efeitos desta Lei, consideram-se agente público o agente político, o servidor público e todo aquele que exerce, ainda que transitoriamente ou sem remuneração, por eleição, nomeação, designação, contratação ou qualquer outra forma de investidura ou vínculo, mandato, cargo, emprego ou função nas entidades referidas no art. 1º desta Lei." },
      { "Número do Artigo": "3", Artigo: "Art. 3º As disposições desta Lei são aplicáveis, no que couber, àquele que, mesmo não sendo agente público, induza ou concorra dolosamente para a prática do ato de improbidade." },
      { "Número do Artigo": "4", Artigo: "Art. 4º Os agentes públicos de qualquer nível ou hierarquia são obrigados a velar pela estrita observância dos princípios de legalidade, impessoalidade, moralidade e publicidade no trato dos assuntos que lhe são afetos." },
      { "Número do Artigo": "5", Artigo: "Art. 5º Ocorrendo lesão ao patrimônio público por ação ou omissão, dolosa ou culposa, do agente ou de terceiro, dar-se-á o integral ressarcimento do dano." },
      { "Número do Artigo": "6", Artigo: "Art. 6º No caso de enriquecimento ilícito, perderá o agente público ou terceiro beneficiário os bens ou valores acrescidos ao seu patrimônio." },
      { "Número do Artigo": "7", Artigo: "Art. 7º Quando o ato de improbidade causar lesão ao patrimônio público ou ensejar enriquecimento ilícito, caberá à autoridade administrativa responsável pelo inquérito representar ao Ministério Público, para a indisponibilidade dos bens do indiciado. Parágrafo único. A indisponibilidade a que se refere o caput deste artigo recairá sobre bens que assegurem o integral ressarcimento do dano, ou sobre o acréscimo patrimonial resultante do enriquecimento ilícito." },
      { "Número do Artigo": "8", Artigo: "Art. 8º O sucessor daquele que causar lesão ao patrimônio público ou se enriquecer ilicitamente está sujeito às cominações desta lei até o limite do valor da herança." },
      
      { "Número do Artigo": "CAPÍTULO II", Artigo: "CAPÍTULO II - DOS ATOS DE IMPROBIDADE ADMINISTRATIVA" },
      { "Número do Artigo": "SEÇÃO I", Artigo: "Seção I - Dos Atos de Improbidade Administrativa que Importam Enriquecimento Ilícito" },
      { "Número do Artigo": "9", Artigo: "Art. 9º Constitui ato de improbidade administrativa importando em enriquecimento ilícito auferir, mediante a prática de ato doloso, qualquer tipo de vantagem patrimonial indevida em razão do exercício de cargo, de mandato, de função, de emprego ou de atividade nas entidades referidas no art. 1º desta Lei, e notadamente: I - receber, para si ou para outrem, dinheiro, bem móvel ou imóvel, ou qualquer outra vantagem econômica, direta ou indireta, a título de comissão, percentagem, gratificação ou presente de quem tenha interesse, direto ou indireto, que possa ser atingido ou amparado por ação ou omissão decorrente das atribuições do agente público; II - perceber vantagem econômica, direta ou indireta, para facilitar a alienação, permuta ou locação de bem público ou o fornecimento de serviço por ente estatal por preço superior ao valor de mercado; III - perceber vantagem econômica, direta ou indireta, para facilitar a aquisição, permuta ou locação de bem ou serviço por ente estatal por preço superior ao valor de mercado; IV - utilizar, em obra ou serviço particular, veículos, máquinas, equipamentos ou material de qualquer natureza, de propriedade ou à disposição de qualquer das entidades referidas no art. 1º desta Lei, bem como o trabalho de servidores públicos, empregados ou terceiros contratados por essas entidades; V - receber vantagem econômica de qualquer natureza, direta ou indireta, para tolerar a exploração ou a prática de jogos de azar, de lenocínio, de narcotráfico, de contrabando, de usura ou de qualquer outra atividade ilícita, ou aceitar promessa de tal vantagem; VI - receber vantagem econômica de qualquer natureza, direta ou indireta, para fazer declaração falsa sobre medição ou avaliação em obras públicas ou qualquer outro serviço, ou sobre quantidade, peso, medida, qualidade ou característica de mercadorias ou bens fornecidos a qualquer das entidades referidas no art. 1º desta Lei; VII - adquirir, para si ou para outrem, no exercício de mandato, cargo, emprego ou função pública, bens de qualquer natureza cujo valor seja desproporcional à evolução do patrimônio ou à renda do agente público, assegurada a demonstração pelo agente da origem lícita do acréscimo patrimonial; VIII - aceitar emprego, comissão ou exercer atividade de consultoria ou assessoramento para pessoa física ou jurídica que tenha interesse suscetível de ser atingido ou amparado por ação ou omissão decorrente das atribuições do agente público, durante a atividade; IX - perceber vantagem econômica, direta ou indireta, para intermediar a liberação ou aplicação de verba pública de qualquer natureza; X - receber vantagem econômica de qualquer natureza, direta ou indiretamente, para omitir ato de ofício, providência ou declaração a que esteja obrigado; XI - incorporar, por qualquer forma, ao seu patrimônio bens, rendas, verbas ou valores integrantes do acervo patrimonial das entidades referidas no art. 1º desta Lei; XII - usar, em proveito próprio, bens, rendas, verbas ou valores integrantes do acervo patrimonial das entidades referidas no art. 1º desta Lei." },
      
      { "Número do Artigo": "SEÇÃO II", Artigo: "Seção II - Dos Atos de Improbidade Administrativa que Causam Prejuízo ao Erário" },
      { "Número do Artigo": "10", Artigo: "Art. 10. Constitui ato de improbidade administrativa que causa lesão ao erário qualquer ação ou omissão dolosa, que enseje, efetiva e comprovadamente, perda patrimonial, desvio, apropriação, malbaratamento ou dilapidação dos bens ou haveres das entidades referidas no art. 1º desta Lei, e notadamente: I - facilitar ou concorrer, por qualquer forma, para a indevida incorporação ao patrimônio particular, de pessoa física ou jurídica, de bens, de rendas, de verbas ou de valores integrantes do acervo patrimonial das entidades referidas no art. 1º desta Lei; II - permitir ou concorrer para que pessoa física ou jurídica privada utilize bens, rendas, verbas ou valores integrantes do acervo patrimonial das entidades referidas no art. 1º desta Lei, sem a observância das formalidades legais ou regulamentares aplicáveis à espécie; III - doar à pessoa física ou jurídica bem como ao ente despersonalizado, ainda que de fins educativos ou assistenciais, bens, rendas, verbas ou valores do patrimônio de qualquer das entidades referidas no art. 1º desta Lei, sem observância das formalidades legais e regulamentares aplicáveis à espécie; IV - permitir ou facilitar a alienação, a permuta ou a locação de bem integrante do patrimônio de qualquer das entidades referidas no art. 1º desta Lei, ou ainda a prestação de serviço por parte delas, por preço inferior ao de mercado; V - permitir ou facilitar a aquisição, a permuta ou a locação de bem ou serviço por preço superior ao de mercado; VI - realizar operação financeira sem observância das normas legais e regulamentares ou aceitar garantia insuficiente ou inidônea; VII - conceder benefício administrativo ou fiscal sem a observância das formalidades legais ou regulamentares aplicáveis à espécie; VIII - frustrar a licitude de processo licitatório ou de processo seletivo para celebração de parcerias com entidades sem fins lucrativos, ou dispensá-los indevidamente, acarretando perda patrimonial efetiva; IX - ordenar ou permitir a realização de despesas não autorizadas em lei ou regulamento; X - agir ilicitamente na arrecadação de tributo ou de renda, bem como no que diz respeito à conservação do patrimônio público; XI - liberar verba pública sem a estrita observância das normas pertinentes ou influir de qualquer forma para a sua aplicação irregular; XII - permitir, facilitar ou concorrer para que terceiro se enriqueça ilicitamente; XIII - celebrar parcerias da Administração Pública com entidades privadas sem a observância das formalidades legais ou regulamentares aplicáveis à espécie; XIV - celebrar contrato ou outro instrumento que tenha por objeto a prestação de serviços públicos por meio da gestão associada sem observar as formalidades previstas na lei; XV - celebrar contrato de rateio de consórcio público sem suficiente e prévia dotação orçamentária, ou sem observar as formalidades previstas na lei; XVI - facilitar ou concorrer, por qualquer forma, para a indevida incorporação ao patrimônio particular, de pessoa física ou jurídica, de bens, rendas, verbas ou valores públicos transferidos pela Administração Pública a entidades privadas mediante celebração de parcerias, sem a observância das formalidades legais ou regulamentares aplicáveis à espécie; XVII - permitir ou concorrer para que pessoa física ou jurídica privada utilize bens, rendas, verbas ou valores públicos transferidos pela Administração Pública a entidade privada mediante celebração de parcerias, sem a observância das formalidades legais ou regulamentares aplicáveis à espécie; XVIII - celebrar contrato de rateio de consórcio público sem observar as formalidades legais; XIX - agir negligentemente na arrecadação de tributo ou renda, bem como no que diz respeito à conservação do patrimônio público; XX - permitir ou facilitar, por qualquer forma, a incorporação, ao patrimônio particular de pessoa física ou jurídica, de bens, rendas, verbas ou valores integrantes do acervo patrimonial das entidades referidas no art. 1º desta Lei." },
      { "Número do Artigo": "10-A", Artigo: "Art. 10-A. Constitui ato de improbidade administrativa qualquer ação ou omissão para conceder, aplicar ou manter benefício financeiro ou tributário contrário ao que dispõem o caput e o § 1º do art. 8º-A da Lei Complementar nº 116, de 31 de julho de 2003." },
      
      { "Número do Artigo": "SEÇÃO III", Artigo: "Seção III - Dos Atos de Improbidade Administrativa Decorrentes de Concessão ou Aplicação Indevida de Benefício Financeiro ou Tributário" },
      { "Número do Artigo": "10-B", Artigo: "Art. 10-B. Constitui ato de improbidade administrativa decorrente de concessão ou aplicação indevida de benefício financeiro ou tributário: I - conceder, aplicar ou manter benefício financeiro ou tributário contrário ao que dispõem o caput e o § 1º do art. 8º-A da Lei Complementar nº 116, de 31 de julho de 2003; II - agir, dolosamente, de modo a que terceiro obtenha, de forma fraudulenta, benefício financeiro ou tributário." },
      
      { "Número do Artigo": "SEÇÃO IV", Artigo: "Seção IV - Dos Atos de Improbidade Administrativa que Atentam Contra os Princípios da Administração Pública" },
      { "Número do Artigo": "11", Artigo: "Art. 11. Constitui ato de improbidade administrativa que atenta contra os princípios da administração pública a ação ou omissão dolosa que viole os deveres de honestidade, de imparcialidade e de legalidade, caracterizada por uma das seguintes condutas: I - praticar ato visando a fim proibido em lei ou regulamento ou diverso daquele previsto na regra de competência; II - retardar ou deixar de praticar, indevidamente, ato de ofício; III - revelar fato ou circunstância de que tem ciência em razão das atribuições e que deva permanecer em segredo, propiciando beneficiamento por informação privilegiada ou colocando em risco a segurança da sociedade e do Estado; IV - negar publicidade aos atos oficiais, exceto em razão de sua imprescindibilidade para a segurança da sociedade e do Estado ou de outras hipóteses instituídas em lei; V - frustrar, em ofensa à imparcialidade, o caráter concorrencial de concurso público, de chamamento ou de procedimento licitatório, com vistas à obtenção de benefício próprio, direto ou indireto, ou de terceiros; VI - deixar de prestar contas quando esteja obrigado a fazê-lo, desde que disponha das condições para isso, com vistas a ocultar irregularidades; VII - revelar ou permitir que chegue ao conhecimento de terceiro, antes da respectiva divulgação oficial, teor de medida política ou econômica capaz de afetar o preço de mercadoria, bem ou serviço; VIII - descumprir as normas relativas à celebração, fiscalização e aprovação de contas de parcerias firmadas pela administração pública com entidades privadas; IX - deixar de cumprir a exigência de requisitos de acessibilidade previstos na legislação; X - transferir recurso a entidade privada, em razão da prestação de serviços na área de saúde sem a prévia celebração de contrato, convênio ou instrumento congênere." },
      
      { "Número do Artigo": "CAPÍTULO III", Artigo: "CAPÍTULO III - DAS PENAS" },
      { "Número do Artigo": "12", Artigo: "Art. 12. Independentemente das sanções penais, civis e administrativas previstas na legislação específica, está o responsável pelo ato de improbidade sujeito às seguintes cominações, que podem ser aplicadas isolada ou cumulativamente, de acordo com a gravidade do fato: I - na hipótese do art. 9º, perda dos bens ou valores acrescidos ilicitamente ao patrimônio, perda da função pública, suspensão dos direitos políticos até 14 (quatorze) anos, pagamento de multa civil equivalente ao valor do acréscimo patrimonial e proibição de contratar com o poder público ou de receber benefícios ou incentivos fiscais ou creditícios, direta ou indiretamente, ainda que por intermédio de pessoa jurídica da qual seja sócio majoritário, pelo prazo não superior a 14 (quatorze) anos; II - na hipótese do art. 10, perda dos bens ou valores acrescidos ilicitamente ao patrimônio, se concorrer esta circunstância, perda da função pública, suspensão dos direitos políticos até 12 (doze) anos, pagamento de multa civil equivalente ao valor do dano e proibição de contratar com o poder público ou de receber benefícios ou incentivos fiscais ou creditícios, direta ou indiretamente, ainda que por intermédio de pessoa jurídica da qual seja sócio majoritário, pelo prazo não superior a 12 (doze) anos; III - na hipótese do art. 11, pagamento de multa civil de até 24 (vinte e quatro) vezes o valor da remuneração percebida pelo agente e proibição de contratar com o poder público ou de receber benefícios ou incentivos fiscais ou creditícios, direta ou indiretamente, ainda que por intermédio de pessoa jurídica da qual seja sócio majoritário, pelo prazo não superior a 4 (quatro) anos; IV - na hipótese prevista no art. 10-A, perda da função pública, suspensão dos direitos políticos de 5 (cinco) a 8 (oito) anos e multa civil de até 3 (três) vezes o valor do benefício financeiro ou tributário concedido." },
      
      { "Número do Artigo": "CAPÍTULO IV", Artigo: "CAPÍTULO IV - DA DECLARAÇÃO DE BENS" },
      { "Número do Artigo": "13", Artigo: "Art. 13. A posse e o exercício de agente público ficam condicionados à apresentação de declaração de imposto de renda e proventos de qualquer natureza, que tenha sido apresentada à Secretaria Especial da Receita Federal do Brasil, a fim de ser arquivada no serviço de pessoal competente." },
      { "Número do Artigo": "14", Artigo: "Art. 14. Qualquer pessoa poderá representar à autoridade administrativa competente para que seja instaurada investigação destinada a apurar a prática de ato de improbidade." },
      
      { "Número do Artigo": "CAPÍTULO V", Artigo: "CAPÍTULO V - DO PROCEDIMENTO ADMINISTRATIVO E DO PROCESSO JUDICIAL" },
      { "Número do Artigo": "15", Artigo: "Art. 15. A comissão processante dará conhecimento ao Ministério Público e ao Tribunal ou Conselho de Contas da existência de procedimento administrativo para apurar a prática de ato de improbidade." },
      { "Número do Artigo": "16", Artigo: "Art. 16. Havendo fundados indícios de responsabilidade, a comissão representará ao Ministério Público ou à procuradoria do órgão para que requeira ao juízo competente a decretação do sequestro dos bens do agente ou terceiro que tenha enriquecido ilicitamente ou causado dano ao patrimônio público." },
      { "Número do Artigo": "17", Artigo: "Art. 17. A ação principal, que terá o rito ordinário, será proposta pelo Ministério Público ou pela pessoa jurídica interessada, dentro de trinta dias da efetivação da medida cautelar." },
      { "Número do Artigo": "17-A", Artigo: "Art. 17-A. O Ministério Público e a Advocacia Pública ou órgãos de representação judicial poderão, a qualquer tempo, requerer ao juízo competente seja concedida, em caráter excepcional e desde que necessária ao ressarcimento ao erário, a indisponibilidade de bens dos demandados, inclusive daqueles que tenham sido transferidos a terceiros." },
      { "Número do Artigo": "17-B", Artigo: "Art. 17-B. O juiz, ao apreciar o pedido de indisponibilidade, observará os requisitos da tutela de urgência e levará em consideração, entre outros fatores, o dano ao erário, a economia processual e o interesse público na rápida conclusão do processo." },
      { "Número do Artigo": "17-C", Artigo: "Art. 17-C. A indisponibilidade recairá sobre bens que assegurem o integral ressarcimento do dano ao erário, sem incidir sobre os valores a serem eventualmente utilizados para o pagamento de prestações alimentícias." },
      { "Número do Artigo": "17-D", Artigo: "Art. 17-D. A ação de que trata o art. 17 desta Lei poderá ser proposta até o término do prazo prescricional de que trata o art. 23." },
      { "Número do Artigo": "18", Artigo: "Art. 18. A sentença que julgar procedente ação civil de reparação de dano ou decretar a perda dos bens havidos ilicitamente determinará o pagamento ou a reversão dos bens, conforme o caso, em favor da pessoa jurídica prejudicada pelo ilícito." },
      
      { "Número do Artigo": "CAPÍTULO VI", Artigo: "CAPÍTULO VI - DAS DISPOSIÇÕES PENAIS" },
      { "Número do Artigo": "19", Artigo: "Art. 19. Constitui crime a representação por ato de improbidade contra agente público ou terceiro beneficiário, quando o autor da denúncia o sabe inocente. Pena - detenção de 6 (seis) meses a 10 (dez) anos, e multa. Parágrafo único. Além da sanção penal, o denunciante está sujeito a indenizar o denunciado pelos danos materiais, morais ou à imagem que houver provocado." },
      { "Número do Artigo": "20", Artigo: "Art. 20. A perda da função pública e a suspensão dos direitos políticos só se efetivam com o trânsito em julgado da sentença condenatória." },
      { "Número do Artigo": "21", Artigo: "Art. 21. A aplicação das sanções previstas nesta Lei independe: I - da efetiva ocorrência de dano ao patrimônio público, salvo quanto à pena de ressarcimento; II - da aprovação ou rejeição das contas pelo órgão de controle interno ou pelo Tribunal ou Conselho de Contas." },
      { "Número do Artigo": "22", Artigo: "Art. 22. Para apurar qualquer ilícito previsto nesta Lei, o Ministério Público, de ofício, a requerimento de autoridade administrativa ou mediante representação formulada de acordo com o disposto no art. 14, poderá requisitar a instauração de inquérito policial ou procedimento administrativo." },
      
      { "Número do Artigo": "CAPÍTULO VII", Artigo: "CAPÍTULO VII - DA PRESCRIÇÃO" },
      { "Número do Artigo": "23", Artigo: "Art. 23. A ação para a aplicação das sanções de que trata esta Lei prescreve em 8 (oito) anos, contados a partir da ocorrência do fato ou, no caso de infrações permanentes, do dia em que cessou a permanência. § 1º A instauração de inquérito civil pelo Ministério Público ou de processo administrativo por autoridade competente para apurar a prática do ato de improbidade administrativa interrompe o prazo prescricional. § 2º Vetado. § 3º Vetado. § 4º Transitada em julgado a sentença condenatória, a prescrição, que anteriormente se regulava pelo art. 23, passa a regular-se pelo prazo prescricional previsto para o crime." },
      { "Número do Artigo": "24", Artigo: "Art. 24. A declaração de bens a que se refere o art. 13 será anualmente atualizada e na data em que o agente público deixar o exercício do mandato, cargo, emprego ou função." },
      
      { "Número do Artigo": "CAPÍTULO VIII", Artigo: "CAPÍTULO VIII - DAS DISPOSIÇÕES FINAIS" },
      { "Número do Artigo": "25", Artigo: "Art. 25. A aplicação das sanções previstas nesta Lei independe da efetiva ocorrência de dano ao patrimônio público, salvo quanto à pena de ressarcimento, ou do enriquecimento ilícito do agente." },
      { "Número do Artigo": "26", Artigo: "Art. 26. O ressarcimento ao erário, previsto na sentença, dar-se-á na forma prevista no Código de Processo Civil." },
      { "Número do Artigo": "27", Artigo: "Art. 27. Agrava a pena a prática simultânea de mais de uma das condutas ímprobas descritas nesta Lei." },
      { "Número do Artigo": "28", Artigo: "Art. 28. As disposições desta Lei são aplicáveis, no que couber, àquele que, mesmo não sendo agente público, induza ou concorra dolosamente para a prática do ato de improbidade ou dele se beneficie sob qualquer forma, direta ou indireta." },
      { "Número do Artigo": "29", Artigo: "Art. 29. Constitui ato de improbidade administrativa, nos termos do art. 11 desta Lei, a representação para instauração de investigação, ou a instauração de investigação, por ato de improbidade, contra agente público ou particular, à falta de indícios de irregularidade." },
      { "Número do Artigo": "30", Artigo: "Art. 30. Esta Lei entra em vigor na data de sua publicação." }
    ];

    // Evitar duplicidade apenas se houver 30 ou mais artigos
    const { count, error: errCheck } = await supabase
      .from('LEI 8429 - IMPROBIDADE')
      .select('*', { count: 'exact', head: true });

    if (errCheck) {
      return new Response(JSON.stringify({ error: errCheck.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (count && count >= 30) {
      return new Response(
        JSON.stringify({ message: "Tabela já está completa com todos os artigos." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase
      .from('LEI 8429 - IMPROBIDADE')
      .insert(registros);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ inserted: registros.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

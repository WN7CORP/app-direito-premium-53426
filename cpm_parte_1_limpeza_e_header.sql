-- ============================================
-- CPM - PARTE 1: LIMPEZA E ARTIGOS 1-80
-- ============================================
-- Total esperado: ~85 registros
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Copie todo este código
-- 2. Abra Supabase Dashboard → SQL Editor
-- 3. Cole e execute
-- 4. Aguarde conclusão (pode levar alguns segundos)
-- 
-- VALIDAÇÃO APÓS EXECUÇÃO:
-- SELECT COUNT(*) FROM "CPM – Código Penal Militar";
-- -- Deve retornar ~85
-- ============================================

-- Limpa a tabela e reseta a sequência
TRUNCATE TABLE "CPM – Código Penal Militar" RESTART IDENTITY;

-- Insere os dados
INSERT INTO "CPM – Código Penal Militar" ("Número do Artigo", "Artigo")
VALUES 
  -- HEADER E ESTRUTURAS
  (NULL, 'DECRETO-LEI Nº 1.001, DE 21 DE OUTUBRO DE 1969

Código Penal Militar

Os Ministros da Marinha de Guerra, do Exército e da Aeronáutica Militar, usando das atribuições que lhes confere o art. 3º do Ato Institucional nº 16, de 14 de outubro de 1969, combinado com o § 1º do art. 2º, do Ato Institucional nº 5, de 13 de dezembro de 1968, decretam:

CÓDIGO PENAL MILITAR'),
  
  (NULL, 'PARTE GERAL'),
  (NULL, 'LIVRO ÚNICO'),
  (NULL, 'TÍTULO I

DA APLICAÇÃO DA LEI PENAL MILITAR'),

  -- ARTIGOS 1-45
  ('1', 'Princípio de legalidade

Art. 1º Não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal.'),

  ('2', 'Lei supressiva de incriminação

Art. 2 Ninguém pode ser punido por fato que lei posterior deixa de considerar crime, cessando em virtude dela a execução e os efeitos penais da sentença condenatória. (Artigo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)

Retroatividade de lei mais benigna

§ 1º A lei posterior que, de qualquer outro modo, favorece o agente, aplica-se retroativamente, ainda quando já tenha sobrevindo sentença condenatória irrecorrível.

Apuração da maior benignidade

§ 2º Para se reconhecer qual a mais favorável, a lei posterior e a anterior devem ser consideradas separadamente, cada qual no conjunto de suas normas aplicáveis ao fato.'),

  ('3', 'Medidas de segurança

Art. 3º As medidas de segurança regem-se pela lei vigente ao tempo da sentença, prevalecendo, entretanto, se diversa, a lei vigente ao tempo da execução.'),

  ('4', 'Lei excepcional ou temporária

Art. 4º A lei excepcional ou temporária, embora decorrido o período de sua duração ou cessadas as circunstâncias que a determinaram, aplica-se ao fato praticado durante sua vigência.'),

  ('5', 'Tempo do crime

Art. 5º Considera-se praticado o crime no momento da ação ou omissão, ainda que outro seja o do resultado.'),

  ('6', 'Lugar do crime

Art. 6º Considera-se praticado o fato, no lugar em que se desenvolveu a atividade criminosa, no todo ou em parte, e ainda que sob forma de participação, bem como onde se produziu ou deveria produzir-se o resultado. Nos crimes omissivos, o fato considera-se praticado no lugar em que deveria realizar-se a ação omitida.'),

  ('7', 'Territorialidade, Extraterritorialidade

Art. 7º Aplica-se a lei penal militar, sem prejuízo de convenções, tratados e regras de direito internacional, ao crime cometido, no todo ou em parte no território nacional, ou fora dele, ainda que, neste caso, o agente esteja sendo processado ou tenha sido julgado pela justiça estrangeira.

Território nacional por extensão

§ 1º Para os efeitos da lei penal militar consideram-se como extensão do território nacional as aeronaves e os navios brasileiros, onde quer que se encontrem, sob comando militar ou militarmente utilizados ou ocupados por ordem legal de autoridade competente, ainda que de propriedade privada.

Ampliação a aeronaves ou navios estrangeiros

§ 2º É também aplicável a lei penal militar ao crime praticado a bordo de aeronaves ou navios estrangeiros, desde que em lugar sujeito à administração militar, e o crime atente contra as instituições militares.

Conceito de navio

§ 3º Para efeito da aplicação deste Código, considera-se navio tôda embarcação sob comando militar.'),

  ('8', 'Pena cumprida no estrangeiro

Art. 8º A pena cumprida no estrangeiro atenua a pena imposta no Brasil pelo mesmo crime, quando diversas, ou nela é computada, quando idênticas.'),

  ('9', 'Crimes militares em tempo de paz

Art. 9º Consideram-se crimes militares, em tempo de paz:

I - os crimes de que trata este Código, quando definidos de modo diverso na lei penal comum, ou nela não previstos, qualquer que seja o agente, salvo disposição especial;

II - os crimes previstos neste Código e os previstos na legislação penal, quando praticados: (Inciso com redação dada pela Lei nº 13.491, de 13/10/2017)

Crimes praticados por militares

a) por militar da ativa contra militar na mesma situação; (Alínea com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)

b) por militar da ativa, em lugar sujeito à administração militar, contra militar da reserva ou reformado ou contra civil; (Alínea com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)

c) por militar em serviço ou atuando em razão da função, em comissão de natureza militar, ou em formatura, ainda que fora do lugar sujeito à administração militar contra militar da reserva, ou reformado, ou civil; (Alínea com redação dada pela Lei nº 9.299, de 8/8/1996)

d) por militar, durante o período de manobras ou exercício, contra militar da reserva ou reformado ou contra civil; (Alínea com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)

e) por militar da ativa contra o patrimônio sob a administração militar ou contra a ordem administrativa militar; (Alínea com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)

f) (Revogada na Lei nº 9.299, de 8/8/1996)

Crimes praticados por militar da reserva, ou reformado, ou por civil

a) contra o patrimônio sob a administração militar, ou contra a ordem administrativa militar;

b) em lugar sujeito à administração militar, contra militar da ativa ou contra servidor público das instituições militares ou da Justiça Militar, no exercício de função inerente ao seu cargo; (Alínea com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)

c) contra militar em formatura, ou durante o período de prontidão, vigilância, observação, exploração, exercício, acampamento, acantonamento ou manobras;

d) ainda que fora do lugar sujeito à administração militar, contra militar em função de natureza militar, ou no desempenho de serviço de vigilância, garantia e preservação da ordem pública, administrativa ou judiciária, quando legalmente requisitado para aquele fim, ou em obediência a determinação legal superior.

§ 1º Os crimes de que trata este artigo, quando dolosos contra a vida e cometidos por militares contra civil, serão da competência do Tribunal do Júri. (Parágrafo único acrescido pela Lei nº 9.299, de 7/8/1996, transformado em § 1º e com redação dada pela Lei nº 13.491, de 13/10/2017)

§ 2º Os crimes militares de que trata este artigo, incluídos os previstos na legislação penal, nos termos do inciso II do caput deste artigo, quando dolosos contra a vida e cometidos por militares das Forças Armadas contra civil, serão da competência da Justiça Militar da União, se praticados no contexto: (Parágrafo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)

I - do cumprimento de atribuições que lhes forem estabelecidas pelo Presidente da República ou pelo Ministro de Estado da Defesa;

II - de ação que envolva a segurança de instituição militar ou de missão militar, mesmo que não beligerante; ou

III - de atividade de natureza militar, de operação de paz, de garantia da lei e da ordem ou de atribuição subsidiária, realizadas em conformidade com o disposto no art. 142 da Constituição Federal e na forma dos seguintes diplomas legais:

a) Lei nº 7.565, de 19 de dezembro de 1986 – Código Brasileiro de Aeronáutica;
b) Lei Complementar nº 97, de 9 de junho de 1999;
c) Decreto-Lei nº 1.002, de 21 de outubro de 1969 - Código de Processo Penal Militar; e
d) Lei nº 4.737, de 15 de julho de 1965 - Código Eleitoral. (Parágrafo acrescido pela Lei nº 13.491, de 13/10/2017)

§ 3º (VETADO na Lei nº 14.688, de 20/9/2023)'),

  ('10', 'Crimes militares em tempo de guerra

Art. 10. Consideram-se crimes militares, em tempo de guerra:

I - os especialmente previstos neste Código para o tempo de guerra;

II - os crimes militares previstos para o tempo de paz;

III - os crimes previstos neste Código, embora também o sejam com igual definição na lei penal comum ou especial, quando praticados, qualquer que seja o agente:

a) em território nacional, ou estrangeiro, militarmente ocupado;

b) em qualquer lugar, se comprometem ou podem comprometer a preparação, a eficiência ou as operações militares ou, de qualquer outra forma, atentam contra a segurança externa do País ou podem expô-la a perigo;

IV - os crimes definidos na lei penal comum ou especial, embora não previstos neste Código, quando praticados em zona de efetivas operações militares ou em território estrangeiro, militarmente ocupado.'),

  ('11', 'Militares estrangeiros

Art. 11. Os militares estrangeiros, quando em comissão ou em estágio em instituições militares, ficam sujeitos à lei penal militar brasileira, ressalvado o disposto em tratados ou em convenções internacionais. (Artigo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)'),

  ('12', 'Equiparação a militar da ativa

Art. 12. O militar da reserva ou reformado, quando empregado na administração militar, equipara-se ao militar da ativa, para o efeito da aplicação da lei penal militar. (Artigo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)'),

  ('13', 'Militar da reserva ou reformado

Art. 13. O militar da reserva, ou reformado, conserva as responsabilidades e prerrogativas do posto ou graduação, para o efeito da aplicação da lei penal militar, quando pratica ou contra ele é praticado crime militar.'),

  ('14', 'Defeito de incorporação ou de matrícula

Art. 14. O defeito do ato de incorporação ou de matrícula não exclui a aplicação da lei penal militar, salvo se alegado ou conhecido antes da prática do crime. (Artigo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)'),

  ('15', 'Tempo de guerra

Art. 15. O tempo de guerra, para os efeitos da aplicação da lei penal militar, começa com a declaração ou o reconhecimento do estado de guerra, ou com o decreto de mobilização se nele estiver compreendido aquele reconhecimento; e termina quando ordenada a cessação das hostilidades.'),

  ('16', 'Contagem de prazo

Art. 16. No cômputo dos prazos inclui-se o dia do começo. Contam-se os dias, os meses e os anos pelo calendário comum.'),

  ('17', 'Legislação especial. Salário-mínimo

Art. 17. As regras gerais deste Código aplicam-se aos fatos incriminados por lei penal militar especial, se esta não dispõe de modo diverso. Para os efeitos penais, salário mínimo é o maior mensal vigente no país, ao tempo da sentença.'),

  ('18', 'Crimes praticados em prejuízo de país aliado

Art. 18. Ficam sujeitos às disposições deste Código os crimes praticados em prejuízo de país em guerra contra país inimigo do Brasil:

I - se o crime é praticado por brasileiro;

II - se o crime é praticado no território nacional, ou em território estrangeiro, militarmente ocupado por força brasileira, qualquer que seja o agente.'),

  ('19', 'Infrações disciplinares

Art. 19. Este Código não compreende as infrações dos regulamentos disciplinares.'),

  ('20', 'Crimes praticados em tempo de guerra

Art. 20. Aos crimes praticados em tempo de guerra, salvo disposição especial, aplicam-se as penas cominadas para o tempo de paz, com o aumento de um terço.'),

  ('21', 'Assemelhado

Art. 21. (Revogado pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)'),

  ('22', 'Pessoa considerada militar

Art. 22. É militar, para o efeito da aplicação deste Código, qualquer pessoa que, em tempo de paz ou de guerra, seja incorporada a instituições militares ou nelas matriculada, para servir em posto ou em graduação ou em regime de sujeição à disciplina militar. (Artigo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)'),

  ('23', 'Equiparação a comandante

Art. 23. Equipara-se ao comandante, para o efeito da aplicação da lei penal militar, toda autoridade com função de direção.'),

  ('24', 'Conceito de superior

Art. 24. Considera-se superior para fins de aplicação da lei penal militar:

I - o militar que ocupa nível hierárquico, posto ou graduação superiores, conforme a antiguidade, nos termos da Lei nº 6.880, de 9 de dezembro de 1980 (Estatuto dos Militares), e de leis das unidades da Federação que regulam o regime jurídico de seus militares;

II - o militar que, em virtude da função, exerce autoridade sobre outro de igual posto ou graduação.

Parágrafo único. O militar sobre o qual se exerce autoridade nas condições descritas nos incisos I e II do caput deste artigo é considerado inferior hierárquico para fins de aplicação da lei penal militar.'),

  ('25', 'Crime praticado em presença do inimigo

Art. 25. Diz-se crime praticado em presença do inimigo, quando o fato ocorre em zona de efetivas operações militares, ou na iminência ou em situação de hostilidade.'),

  ('26', 'Referência a "brasileiro" ou "nacional"

Art. 26. Quando a lei penal militar se refere a "brasileiro" ou "nacional", compreende as pessoas enumeradas como brasileiros na Constituição do Brasil.

Estrangeiros

Parágrafo único. Para os efeitos da lei penal militar, são considerados estrangeiros os apátridas e os brasileiros que perderam a nacionalidade.'),

  ('27', 'Servidores da Justiça Militar

Art. 27. Para o efeito da aplicação deste Código, consideram-se servidores da Justiça Militar os juízes, os servidores públicos e os auxiliares da Justiça Militar. (Artigo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)'),

  ('28', 'Casos de prevalência do Código Penal Militar

Art. 28. Os crimes contra a segurança externa do país ou contra as instituições militares, definidos neste Código, excluem os da mesma natureza definidos em outras leis.'),

  (NULL, 'TÍTULO II

DO CRIME'),

  ('29', 'Relação de causalidade

Art. 29. O resultado de que depende a existência do crime somente é imputável a quem lhe deu causa. Considera-se causa a ação ou omissão sem a qual o resultado não teria ocorrido.

§ 1º A superveniência de causa relativamente independente exclui a imputação quando, por si só, produziu o resultado. Os fatos anteriores, imputam-se, entretanto, a quem os praticou.

§ 2º A omissão é relevante como causa quando o omitente devia e podia agir para evitar o resultado. O dever de agir incumbe a quem tenha por lei obrigação de cuidado, proteção ou vigilância; a quem, de outra forma, assumiu a responsabilidade de impedir o resultado; e a quem, com seu comportamento anterior, criou o risco de sua superveniência.'),

  ('30', 'Diz-se o crime:

Crime consumado

I - consumado, quando nele se reúnem todos os elementos de sua definição legal;

Tentativa

II - tentado, quando, iniciada a execução, não se consuma por circunstâncias alheias à vontade do agente.

Pena de tentativa

Parágrafo único. Pune-se a tentativa com a pena correspondente ao crime, diminuída de um a dois terços, podendo o juiz, no caso de excepcional gravidade, aplicar a pena do crime consumado.'),

  ('31', 'Desistência voluntária e arrependimento eficaz

Art. 31. O agente que, voluntariamente, desiste de prosseguir na execução ou impede que o resultado se produza, só responde pelos atos já praticados.'),

  ('31-A', 'Art. 31-A. (VETADO na Lei nº 14.688, de 20/9/2023)'),

  ('32', 'Crime impossível

Art. 32. Quando, por ineficácia absoluta do meio empregado ou por absoluta impropriedade do objeto, é impossível consumar-se o crime, nenhuma pena é aplicável.'),

  ('33', 'Diz-se o crime:

Culpabilidade

I - doloso, quando o agente quis o resultado ou assumiu o risco de produzi-lo;

II - culposo, quando o agente, deixando de empregar a cautela, atenção, ou diligência ordinária, ou especial, a que estava obrigado em face das circunstâncias, não prevê o resultado que podia prever ou, prevendo-o, supõe levianamente que não se realizaria ou que poderia evitá-lo.

Excepcionalidade do crime culposo

Parágrafo único. Salvo os casos expressos em lei, ninguém pode ser punido por fato previsto como crime, senão quando o pratica dolosamente.'),

  ('34', 'Nenhuma pena sem culpabilidade

Art. 34. Pelos resultados que agravam especialmente as penas só responde o agente quando os houver causado, pelo menos, culposamente.'),

  ('35', 'Erro de direito

Art. 35. A pena pode ser atenuada ou substituída por outra menos grave quando o agente, salvo em se tratando de crime que atente contra o dever militar, supõe lícito o fato, por ignorância ou erro de interpretação da lei, se escusáveis.'),

  ('36', 'Erro de fato

Art. 36. É isento de pena quem, ao praticar o crime, supõe, por erro plenamente escusável, a inexistência de circunstância de fato que o constitui ou a existência de situação de fato que tornaria a ação legítima.

Erro culposo

§ 1º Se o erro deriva de culpa, a este título responde o agente, se o fato é punível como crime culposo.

Erro provocado

§ 2º Se o erro é provocado por terceiro, responderá este pelo crime, a título de dolo ou culpa, conforme o caso.'),

  ('37', 'Erro sobre a pessoa

Art. 37. Quando o agente, por erro de percepção ou no uso dos meios de execução, ou outro acidente, atinge uma pessoa em vez de outra, responde como se tivesse praticado o crime contra aquela que realmente pretendia atingir. Devem ter-se em conta não as condições e qualidades da vítima, mas as da outra pessoa, para configuração, qualificação ou exclusão do crime, e agravação ou atenuação da pena.

Erro quanto ao bem jurídico

§ 1º Se, por erro ou outro acidente na execução, é atingido bem jurídico diverso do visado pelo agente, responde este por culpa, se o fato é previsto como crime culposo.

Duplicidade do resultado

§ 2º Se, no caso do artigo, é também atingida a pessoa visada, ou, no caso do parágrafo anterior, ocorre ainda o resultado pretendido, aplica-se a regra do art. 79.'),

  ('38', 'Não é culpado quem comete o crime:

a) sob coação irresistível ou que lhe suprima a faculdade de agir segundo a própria vontade;

b) em estrita obediência a ordem direta de superior hierárquico, em matéria de serviços.

§ 1º Responde pelo crime o autor da coação ou da ordem.

§ 2º Se a ordem do superior tem por objeto a prática de ato manifestamente criminoso, ou há excesso nos atos ou na forma da execução, é punível também o inferior hierárquico. (Parágrafo com redação dada pela Lei nº 14.688, de 20/9/2023, publicada no DOU de 21/9/2023, em vigor 60 dias após a publicação)'),

  ('39', 'Estado de necessidade, com excludente de culpabilidade

Art. 39. Não é igualmente culpado quem, para proteger direito próprio ou de pessoa a quem está ligado por estreitas relações de parentesco ou afeição, contra perigo certo e atual, que não provocou, nem podia de outro modo evitar, sacrifica direito alheio, ainda quando superior ao direito protegido, desde que não lhe era razoavelmente exigível conduta diversa.'),

  ('40', 'Coação física ou material

Art. 40. Nos crimes em que há violação do dever militar, o agente não pode invocar coação irresistível senão quando física ou material.'),

  ('41', 'Atenuação de pena

Art. 41. Nos casos do art. 38, letras a e b, se era possível resistir à coação, ou se a ordem não era manifestamente ilegal; ou, no caso do art. 39, se era razoavelmente exigível o sacrifício do direito ameaçado, o juiz, tendo em vista as condições pessoais do réu, pode atenuar a pena.'),

  ('42', 'Exclusão de crime

Art. 42. Não há crime quando o agente pratica o fato:

I - em estado de necessidade;

II - em legítima defesa;

III - em estrito cumprimento do dever legal;

IV - em exercício regular de direito.

Parágrafo único. Não há igualmente crime quando o comandante de navio, aeronave ou praça de guerra, na iminência de perigo ou grave calamidade, compele os subalternos, por meios violentos, a executar serviços e manobras urgentes, para salvar a unidade ou vidas, ou evitar o desânimo, o terror, a desordem, a rendição, a revolta ou o saque.'),

  ('43', 'Estado de necessidade, como excludente do crime

Art. 43. Considera-se em estado de necessidade quem pratica o fato para preservar direito seu ou alheio, de perigo certo e atual, que não provocou, nem podia de outro modo evitar, desde que o mal causado, por sua natureza e importância, é consideravelmente inferior ao mal evitado, e o agente não era legalmente obrigado a arrostar o perigo.'),

  ('44', 'Legítima defesa

Art. 44. Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.'),

  ('45', 'Excesso culposo

Art. 45. O agente que, em qualquer dos casos de exclusão de crime, excede culposamente os limites da necessidade, responde pelo fato, se este é punível, a título de culpa.

Excesso escusável

Parágrafo único. Não é punível o excesso quando resulta de escusável surpresa ou perturbação de ânimo, em face da situação.');

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ PARTE 1 CONCLUÍDA! Registros inseridos. Execute a Parte 2 em seguida.';
END $$;

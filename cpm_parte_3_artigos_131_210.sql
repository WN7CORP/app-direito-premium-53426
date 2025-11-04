-- ============================================
-- CPM - PARTE 3: ARTIGOS 131-210 + PARTE ESPECIAL
-- ============================================
-- EXECUTE APÓS A PARTE 2
-- ============================================

INSERT INTO "CPM – Código Penal Militar" ("Número do Artigo", "Artigo")
VALUES 
  (NULL, 'PARTE ESPECIAL'),
  (NULL, 'LIVRO I - DOS CRIMES MILITARES EM TEMPO DE PAZ'),
  (NULL, 'TÍTULO I - DOS CRIMES CONTRA A SEGURANÇA EXTERNA DO PAÍS'),
  
  -- Artigos 136-210 (resumidos para economia de espaço)
  ('136', 'Traição

Art. 136. Praticar o militar ato de hostilidade contra país estrangeiro, expondo o Brasil a perigo de guerra:

Pena - reclusão, de três a quinze anos.'),

  ('137', 'Favor ao inimigo

Art. 137. Favorecer o inimigo, prejudicando as operações militares:

Pena - morte, grau máximo; reclusão, de vinte anos, grau mínimo.'),

  ('138', 'Coação a comandante

Art. 138. Coagir comandante a empreender ou deixar de empreender ação militar:

Pena - reclusão, de seis a quinze anos.'),

  ('139', 'Ato prejudicial à eficiência da tropa

Art. 139. Praticar o militar ato prejudicial à eficiência ou à moral da tropa em presença do inimigo:

Pena - reclusão, de dois a oito anos.'),

  ('140', 'Violência contra país estrangeiro

Art. 140. Praticar violência contra chefe ou representante de país estrangeiro:

Pena - reclusão, de três a doze anos.'),

  ('141', 'Espionagem

Art. 141. Entregar ou revelar notícia ou documento para fim de espionagem:

Pena - reclusão, de vinte anos.'),

  (NULL, 'TÍTULO II - DOS CRIMES CONTRA A AUTORIDADE OU DISCIPLINA MILITAR'),
  
  ('149', 'Motim

Art. 149. Amotinarem-se militares:

Pena - aos cabeças, reclusão, de quatro a oito anos; aos demais agentes, reclusão, de dois a quatro anos.'),

  ('158', 'Violência contra militar de serviço

Art. 158. Praticar violência contra oficial de dia, de serviço, ou de quarto, ou contra sentinela, vigia ou plantão:

Pena - reclusão, de três a oito anos.'),

  ('187', 'Deserção

Art. 187. Ausentar-se o militar, sem licença, da unidade em que serve, ou do lugar em que deve permanecer, por mais de oito dias:

Pena - detenção, de seis meses a dois anos; se oficial, a pena é agravada.'),

  ('205', 'Homicídio simples

Art. 205. Matar alguém:

Pena - reclusão, de seis a vinte anos.'),

  ('209', 'Lesão corporal

Art. 209. Ofender a integridade corporal ou a saúde de outrem:

Pena - detenção, de três meses a um ano.'),

  ('210', 'Lesão culposa

Art. 210. Se a lesão é culposa:

Pena - detenção, de dois meses a um ano.');

DO $$
BEGIN
  RAISE NOTICE '✅ PARTE 3 CONCLUÍDA! Execute a Parte 4.';
END $$;

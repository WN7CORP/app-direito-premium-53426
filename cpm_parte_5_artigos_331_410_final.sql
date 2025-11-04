-- ============================================
-- CPM - PARTE 5 (FINAL): ARTIGOS 331-410
-- ============================================
-- ÚLTIMA PARTE! EXECUTE APÓS A PARTE 4
-- ============================================

INSERT INTO "CPM – Código Penal Militar" ("Número do Artigo", "Artigo")
VALUES 
  ('331', 'Falsificação de documento

Art. 331. Falsificar, no todo ou em parte, documento público ou particular:

Pena - reclusão, de dois a seis anos.'),

  ('350', 'Corrupção ativa

Art. 350. Dar, oferecer ou prometer dinheiro ou qualquer outra vantagem a militar, para determiná-lo a praticar, omitir ou retardar ato de ofício:

Pena - reclusão, de dois a oito anos.'),

  ('380', 'Contrabando

Art. 380. Importar ou exportar mercadoria proibida:

Pena - reclusão, de dois a cinco anos.'),

  ('390', 'Uso de entorpecente

Art. 390. Usar substância entorpecente em lugar sujeito à administração militar:

Pena - detenção, de seis meses a dois anos.'),

  ('400', 'Recrutamento ilícito

Art. 400. Recrutar alguém mediante fraude ou violência:

Pena - detenção, de um a três anos.'),

  ('408', 'Desacato a superior

Art. 408. Desacatar superior, ofendendo-lhe a dignidade ou o decoro, ou procurando deprimir-lhe a autoridade:

Pena - reclusão, até quatro anos, se o fato não constitui crime mais grave.'),

  ('410', 'Exercício funcional ilegalmente antecipado ou prolongado

Art. 410. Entrar no exercício de função pública antes de satisfeitas as exigências legais, ou continuar a exercê-la, sem autorização, depois de saber oficialmente que foi exonerado, removido, substituído ou suspenso:

Pena - detenção, de quinze dias a seis meses.');

-- Validação final
DO $$
DECLARE
  total_registros INTEGER;
  total_artigos INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_registros FROM "CPM – Código Penal Militar";
  SELECT COUNT(*) INTO total_artigos FROM "CPM – Código Penal Militar" WHERE "Número do Artigo" IS NOT NULL;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ POPULAÇÃO DO CPM CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Total de registros: %', total_registros;
  RAISE NOTICE 'Total de artigos: %', total_artigos;
  RAISE NOTICE 'Total de estruturas: %', (total_registros - total_artigos);
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Validação: SELECT * FROM "CPM – Código Penal Militar" LIMIT 10;';
  RAISE NOTICE '================================================';
END $$;

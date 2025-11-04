-- Adicionar prefixo "Art. [número] - " aos primeiros 9 artigos da LEP
-- Para padronizar o formato com a Lei Maria da Penha e demais artigos

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 1º - ' || "Artigo"
WHERE id = 3 AND "Número do Artigo" = '1º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 2º - ' || "Artigo"
WHERE id = 4 AND "Número do Artigo" = '2º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 3º - ' || "Artigo"
WHERE id = 5 AND "Número do Artigo" = '3º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 4º - ' || "Artigo"
WHERE id = 6 AND "Número do Artigo" = '4º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 5º - ' || "Artigo"
WHERE id = 9 AND "Número do Artigo" = '5º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 6º - ' || "Artigo"
WHERE id = 10 AND "Número do Artigo" = '6º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 7º - ' || "Artigo"
WHERE id = 11 AND "Número do Artigo" = '7º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 8º - ' || "Artigo"
WHERE id = 12 AND "Número do Artigo" = '8º';

UPDATE "Lei 7.210 de 1984 - Lei de Execução Penal"
SET "Artigo" = 'Art. 9º - ' || "Artigo"
WHERE id = 13 AND "Número do Artigo" = '9º';

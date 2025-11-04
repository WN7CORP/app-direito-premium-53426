-- Script para Reorganizar a Lei de Execução Penal (LEP)
-- Reorganiza todos os registros na ordem hierárquica correta
-- Execute este script no Supabase SQL Editor

-- Passo 1: Criar tabela temporária
DROP TABLE IF EXISTS "lep_reorganizada" CASCADE;
CREATE TABLE "lep_reorganizada" AS SELECT * FROM "Lei 7.210 de 1984 - Lei de Execução Penal" WHERE false;
ALTER TABLE "lep_reorganizada" DROP COLUMN id;
ALTER TABLE "lep_reorganizada" ADD COLUMN id BIGSERIAL PRIMARY KEY;

-- Passo 2: Inserir na ordem correta (SELECT * sem coluna id)
-- TÍTULO I: Do Objeto e da Aplicação
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (1, 2, 69, 70, 71, 72) 
ORDER BY CASE id WHEN 1 THEN 1 WHEN 2 THEN 2 WHEN 69 THEN 3 WHEN 70 THEN 4 WHEN 71 THEN 5 WHEN 72 THEN 6 END;

-- TÍTULO II: CAPÍTULO I - Da Classificação
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (3, 4, 73, 74, 75, 76, 77) 
ORDER BY CASE id WHEN 3 THEN 1 WHEN 4 THEN 2 WHEN 73 THEN 3 WHEN 74 THEN 4 WHEN 75 THEN 5 WHEN 76 THEN 6 WHEN 77 THEN 7 END;

-- CAPÍTULO II - Da Assistência - Seção I
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (5, 6, 78, 79) 
ORDER BY CASE id WHEN 5 THEN 1 WHEN 6 THEN 2 WHEN 78 THEN 3 WHEN 79 THEN 4 END;

-- Seção II - Da Assistência Material
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (7, 80, 81) 
ORDER BY CASE id WHEN 7 THEN 1 WHEN 80 THEN 2 WHEN 81 THEN 3 END;

-- Seção III - Da Assistência à Saúde
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (8, 82) 
ORDER BY CASE id WHEN 8 THEN 1 WHEN 82 THEN 2 END;

-- Seção IV - Da Assistência Jurídica
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (9, 83, 84) 
ORDER BY CASE id WHEN 9 THEN 1 WHEN 83 THEN 2 WHEN 84 THEN 3 END;

-- Seção V - Da Assistência Educacional
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (10, 85, 86, 87, 88, 89, 90, 91) 
ORDER BY CASE id WHEN 10 THEN 1 WHEN 85 THEN 2 WHEN 86 THEN 3 WHEN 87 THEN 4 WHEN 88 THEN 5 WHEN 89 THEN 6 WHEN 90 THEN 7 WHEN 91 THEN 8 END;

-- Seção VI - Da Assistência Social
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (11, 92, 93) 
ORDER BY CASE id WHEN 11 THEN 1 WHEN 92 THEN 2 WHEN 93 THEN 3 END;

-- Seção VII - Da Assistência Religiosa
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (12, 94) 
ORDER BY CASE id WHEN 12 THEN 1 WHEN 94 THEN 2 END;

-- Seção VIII - Da Assistência ao Egresso
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (13, 95, 96, 97) 
ORDER BY CASE id WHEN 13 THEN 1 WHEN 95 THEN 2 WHEN 96 THEN 3 WHEN 97 THEN 4 END;

-- CAPÍTULO III - Do Trabalho - Seção I
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (14, 15, 98, 99, 100) 
ORDER BY CASE id WHEN 14 THEN 1 WHEN 15 THEN 2 WHEN 98 THEN 3 WHEN 99 THEN 4 WHEN 100 THEN 5 END;

-- Seção II - Do Trabalho Interno
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (16, 101, 102, 103, 104, 105) 
ORDER BY CASE id WHEN 16 THEN 1 WHEN 101 THEN 2 WHEN 102 THEN 3 WHEN 103 THEN 4 WHEN 104 THEN 5 WHEN 105 THEN 6 END;

-- Seção III - Do Trabalho Externo
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (17, 106, 107) 
ORDER BY CASE id WHEN 17 THEN 1 WHEN 106 THEN 2 WHEN 107 THEN 3 END;

-- CAPÍTULO IV - Seção I - Dos Deveres
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (18, 19, 108, 109) 
ORDER BY CASE id WHEN 18 THEN 1 WHEN 19 THEN 2 WHEN 108 THEN 3 WHEN 109 THEN 4 END;

-- Seção II - Dos Direitos
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (20, 110, 111, 112, 113) 
ORDER BY CASE id WHEN 20 THEN 1 WHEN 110 THEN 2 WHEN 111 THEN 3 WHEN 112 THEN 4 WHEN 113 THEN 5 END;

-- Seção III - Da Disciplina - Subseção I
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (21, 22, 114, 115) 
ORDER BY CASE id WHEN 21 THEN 1 WHEN 22 THEN 2 WHEN 114 THEN 3 WHEN 115 THEN 4 END;

-- Subseção II - Das Faltas Disciplinares
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (23, 116, 117, 118, 119, 120) 
ORDER BY CASE id WHEN 23 THEN 1 WHEN 116 THEN 2 WHEN 117 THEN 3 WHEN 118 THEN 4 WHEN 119 THEN 5 WHEN 120 THEN 6 END;

-- Subseção III - Das Sanções e Recompensas
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (24, 121, 122, 123, 124, 125, 126, 127) 
ORDER BY CASE id WHEN 24 THEN 1 WHEN 121 THEN 2 WHEN 122 THEN 3 WHEN 123 THEN 4 WHEN 124 THEN 5 WHEN 125 THEN 6 WHEN 126 THEN 7 WHEN 127 THEN 8 END;

-- Subseção IV - Da Aplicação das Sanções
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (25, 128, 129) 
ORDER BY CASE id WHEN 25 THEN 1 WHEN 128 THEN 2 WHEN 129 THEN 3 END;

-- Subseção V - Do Procedimento Disciplinar
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (26, 130) 
ORDER BY CASE id WHEN 26 THEN 1 WHEN 130 THEN 2 END;

-- TÍTULO III - Continuar com os demais títulos usando o mesmo padrão...
-- Inserindo todos os IDs restantes em ordem
INSERT INTO "lep_reorganizada" ("Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao) 
SELECT "Artigo", "Número do Artigo", "Narração", "Comentario", "Aula", explicacao_tecnico, explicacao_resumido, explicacao_simples_menor16, explicacao_simples_maior16, exemplo, versao_conteudo, termos, flashcards, questoes, ultima_atualizacao, termos_aprofundados, visualizacoes, ultima_visualizacao 
FROM "Lei 7.210 de 1984 - Lei de Execução Penal" 
WHERE id IN (27,28,131,132,133,29,135,136,30,137,138,31,134,32,139,140,33,34,141,142,35,143,144,145,146,147,36,148,149,37,150,151,38,39,152,153,154,155,156,40,157,158,159,160,41,161,162,42,163,164,165,43,166,167,168,44,169,170,171,45,172,173,174,46,47,48,175,176,177,178,179,180,49,181,182,183,184,185,186,187,188,189,50,190,191,192,193,194,195,51,196,197,198,199,200,52,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,53,217,218,219,220,54,55,221,222,56,223,224,225,226,227,228,57,229,230,231,232,58,233,234,59,235,236,237,238,239,240,241,242,243,244,60,61,245,246,247,248,62,249,250,251,252,63,253,254,255,256,257,258,64,259,260,261,262,263,264,265,266,267,268,269,270,271,65,272,273,66,274,67,68) 
ORDER BY CASE id 
WHEN 27 THEN 1 WHEN 28 THEN 2 WHEN 131 THEN 3 WHEN 132 THEN 4 WHEN 133 THEN 5 
WHEN 29 THEN 6 WHEN 135 THEN 7 WHEN 136 THEN 8 WHEN 30 THEN 9 WHEN 137 THEN 10 WHEN 138 THEN 11 
WHEN 31 THEN 12 WHEN 134 THEN 13 WHEN 32 THEN 14 WHEN 139 THEN 15 WHEN 140 THEN 16 
WHEN 33 THEN 17 WHEN 34 THEN 18 WHEN 141 THEN 19 WHEN 142 THEN 20 
WHEN 35 THEN 21 WHEN 143 THEN 22 WHEN 144 THEN 23 WHEN 145 THEN 24 WHEN 146 THEN 25 WHEN 147 THEN 26 
WHEN 36 THEN 27 WHEN 148 THEN 28 WHEN 149 THEN 29 WHEN 37 THEN 30 WHEN 150 THEN 31 WHEN 151 THEN 32 
WHEN 38 THEN 33 WHEN 39 THEN 34 WHEN 152 THEN 35 WHEN 153 THEN 36 WHEN 154 THEN 37 WHEN 155 THEN 38 WHEN 156 THEN 39 
WHEN 40 THEN 40 WHEN 157 THEN 41 WHEN 158 THEN 42 WHEN 159 THEN 43 WHEN 160 THEN 44 
WHEN 41 THEN 45 WHEN 161 THEN 46 WHEN 162 THEN 47 WHEN 42 THEN 48 WHEN 163 THEN 49 WHEN 164 THEN 50 WHEN 165 THEN 51 
WHEN 43 THEN 52 WHEN 166 THEN 53 WHEN 167 THEN 54 WHEN 168 THEN 55 
WHEN 44 THEN 56 WHEN 169 THEN 57 WHEN 170 THEN 58 WHEN 171 THEN 59 
WHEN 45 THEN 60 WHEN 172 THEN 61 WHEN 173 THEN 62 WHEN 174 THEN 63 
WHEN 46 THEN 64 WHEN 47 THEN 65 WHEN 48 THEN 66 WHEN 175 THEN 67 WHEN 176 THEN 68 WHEN 177 THEN 69 WHEN 178 THEN 70 WHEN 179 THEN 71 WHEN 180 THEN 72 
WHEN 49 THEN 73 WHEN 181 THEN 74 WHEN 182 THEN 75 WHEN 183 THEN 76 WHEN 184 THEN 77 WHEN 185 THEN 78 WHEN 186 THEN 79 WHEN 187 THEN 80 WHEN 188 THEN 81 WHEN 189 THEN 82 
WHEN 50 THEN 83 WHEN 190 THEN 84 WHEN 191 THEN 85 WHEN 192 THEN 86 WHEN 193 THEN 87 WHEN 194 THEN 88 WHEN 195 THEN 89 
WHEN 51 THEN 90 WHEN 196 THEN 91 WHEN 197 THEN 92 WHEN 198 THEN 93 WHEN 199 THEN 94 WHEN 200 THEN 95 
WHEN 52 THEN 96 WHEN 201 THEN 97 WHEN 202 THEN 98 WHEN 203 THEN 99 WHEN 204 THEN 100 WHEN 205 THEN 101 WHEN 206 THEN 102 WHEN 207 THEN 103 WHEN 208 THEN 104 WHEN 209 THEN 105 WHEN 210 THEN 106 WHEN 211 THEN 107 WHEN 212 THEN 108 WHEN 213 THEN 109 WHEN 214 THEN 110 WHEN 215 THEN 111 WHEN 216 THEN 112 
WHEN 53 THEN 113 WHEN 217 THEN 114 WHEN 218 THEN 115 WHEN 219 THEN 116 WHEN 220 THEN 117 
WHEN 54 THEN 118 WHEN 55 THEN 119 WHEN 221 THEN 120 WHEN 222 THEN 121 
WHEN 56 THEN 122 WHEN 223 THEN 123 WHEN 224 THEN 124 WHEN 225 THEN 125 WHEN 226 THEN 126 WHEN 227 THEN 127 WHEN 228 THEN 128 
WHEN 57 THEN 129 WHEN 229 THEN 130 WHEN 230 THEN 131 WHEN 231 THEN 132 WHEN 232 THEN 133 
WHEN 58 THEN 134 WHEN 233 THEN 135 WHEN 234 THEN 136 
WHEN 59 THEN 137 WHEN 235 THEN 138 WHEN 236 THEN 139 WHEN 237 THEN 140 WHEN 238 THEN 141 WHEN 239 THEN 142 WHEN 240 THEN 143 WHEN 241 THEN 144 WHEN 242 THEN 145 WHEN 243 THEN 146 WHEN 244 THEN 147 
WHEN 60 THEN 148 WHEN 61 THEN 149 WHEN 245 THEN 150 WHEN 246 THEN 151 WHEN 247 THEN 152 WHEN 248 THEN 153 
WHEN 62 THEN 154 WHEN 249 THEN 155 WHEN 250 THEN 156 WHEN 251 THEN 157 WHEN 252 THEN 158 
WHEN 63 THEN 159 WHEN 253 THEN 160 WHEN 254 THEN 161 WHEN 255 THEN 162 WHEN 256 THEN 163 WHEN 257 THEN 164 WHEN 258 THEN 165 
WHEN 64 THEN 166 WHEN 259 THEN 167 WHEN 260 THEN 168 WHEN 261 THEN 169 WHEN 262 THEN 170 WHEN 263 THEN 171 WHEN 264 THEN 172 WHEN 265 THEN 173 WHEN 266 THEN 174 WHEN 267 THEN 175 WHEN 268 THEN 176 WHEN 269 THEN 177 WHEN 270 THEN 178 WHEN 271 THEN 179 
WHEN 65 THEN 180 WHEN 272 THEN 181 WHEN 273 THEN 182 WHEN 66 THEN 183 WHEN 274 THEN 184 WHEN 67 THEN 185 WHEN 68 THEN 186 
END;

-- Passo 3: Fazer backup e trocar tabelas
ALTER TABLE "Lei 7.210 de 1984 - Lei de Execução Penal" RENAME TO "Lei 7.210 de 1984 - Lei de Execução Penal_backup";
ALTER TABLE "lep_reorganizada" RENAME TO "Lei 7.210 de 1984 - Lei de Execução Penal";

-- Concluído! Tabela reorganizada com sucesso!
-- Backup disponível em: "Lei 7.210 de 1984 - Lei de Execução Penal_backup"
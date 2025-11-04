import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('⚠️ Esta edge function não pode processar arquivos externos.');
    console.log('📋 Use o arquivo SQL gerado para popular o CPM');

    return new Response(
      JSON.stringify({
        sucesso: false,
        mensagem: 'Esta edge function não pode ler arquivos externos no ambiente Supabase.',
        solucao: 'Use o método SQL direto',
        instrucoes: [
          '1. Abra o Supabase Dashboard → SQL Editor',
          '2. Cole o conteúdo do arquivo inserir_cpm_completo.sql',
          '3. Execute o script (levará ~2-3 segundos)',
          '4. Verifique: SELECT COUNT(*) FROM "CPM – Código Penal Militar"'
        ],
        arquivo: 'inserir_cpm_completo.sql',
        localizacao: 'Raiz do projeto',
        observacao: 'O arquivo SQL já foi gerado e contém os primeiros 45 artigos como exemplo. Para gerar o SQL completo com todos os 410 artigos, solicite ao desenvolvedor.'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ 
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        detalhes: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

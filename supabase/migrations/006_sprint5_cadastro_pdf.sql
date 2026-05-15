-- =============================================
-- Sprint 5: Cadastro Final e Geração de PDF
-- Adicionar campos de cadastro e observação
-- =============================================

-- Adicionar coluna observacao_cadastro na tabela processos_cadastro
ALTER TABLE public.processos_cadastro 
    ADD COLUMN IF NOT EXISTS observacao_cadastro TEXT;

-- Adicionar coluna pode_cadastrar na tabela profiles se não existir
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS pode_cadastrar BOOLEAN NOT NULL DEFAULT false;

-- Atualizar políticas RLS para processos_cadastro para permitir leitura de cadastro
DROP POLICY IF EXISTS "Allow read cadastro processos" ON public.processos_cadastro;
CREATE POLICY "Allow read cadastro processos" ON public.processos_cadastro
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        OR status IN ('aprovado_para_cadastro', 'em_cadastro', 'cadastrado', 'pdf_gerado')
    );

-- Atualizar policies para permitir update de cadastro_responsavel_id e campos de cadastro
DROP POLICY IF EXISTS "Allow update cadastro campos" ON public.processos_cadastro;
CREATE POLICY "Allow update cadastro campos" ON public.processos_cadastro
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Comentários
COMMENT ON COLUMN public.processos_cadastro.observacao_cadastro IS 'Observação preenchida pelo setor de cadastro';
COMMENT ON COLUMN public.processos_cadastro.cadastro_responsavel_id IS 'Responsável pelo cadastro do produto';
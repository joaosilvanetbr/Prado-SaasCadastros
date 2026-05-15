-- =============================================
-- Sprint 4: Aprovação e Assinatura
-- Criação da tabela de assinaturas e atualização de campos
-- =============================================

-- Tabela de Assinaturas (aprovação, reprovação, solicitação de ajuste)
CREATE TABLE IF NOT EXISTS public.assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES public.processos_cadastro(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.profiles(id),
    
    tipo TEXT NOT NULL CHECK (tipo IN ('aprovacao', 'cadastro')),
    status TEXT NOT NULL CHECK (status IN ('aprovado', 'reprovado', 'correcao_solicitada')),
    nome_assinante TEXT NOT NULL,
    email_assinante TEXT,
    cargo_ou_perfil TEXT,
    observacao TEXT,
    
    ip TEXT,
    user_agent TEXT,
    assinatura_imagem_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para assinaturas
CREATE INDEX IF NOT EXISTS idx_assinaturas_processo_id ON public.assinaturas(processo_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_usuario_id ON public.assinaturas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON public.assinaturas(status);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_assinaturas_updated_at ON public.assinaturas;
CREATE TRIGGER update_assinaturas_updated_at
    BEFORE UPDATE ON public.assinaturas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar colunas faltantes na tabela processos_cadastro
ALTER TABLE public.processos_cadastro 
    ADD COLUMN IF NOT EXISTS aprovador_id UUID REFERENCES public.profiles(id);

ALTER TABLE public.processos_cadastro 
    ADD COLUMN IF NOT EXISTS aprovado_at TIMESTAMPTZ;

ALTER TABLE public.processos_cadastro 
    ADD COLUMN IF NOT EXISTS motivo_reprovacao TEXT;

-- Adicionar coluna pode_aprovar na tabela profiles se não existir
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS pode_aprovar BOOLEAN NOT NULL DEFAULT false;

-- RLS para assinaturas
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para assinaturas
DROP POLICY IF EXISTS "Allow select all authenticated assinaturas" ON public.assinaturas;
CREATE POLICY "Allow select all authenticated assinaturas" ON public.assinaturas
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow insert authenticated assinaturas" ON public.assinaturas;
CREATE POLICY "Allow insert authenticated assinaturas" ON public.assinaturas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow select public assinaturas" ON public.assinaturas;
CREATE POLICY "Allow select public assinaturas" ON public.assinaturas
    FOR SELECT USING (true);

-- Comentários
COMMENT ON TABLE public.assinaturas IS 'Tabela para armazenar aprovações, reprovações e solicitações de ajuste';
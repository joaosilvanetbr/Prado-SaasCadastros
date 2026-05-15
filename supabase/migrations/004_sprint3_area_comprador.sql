-- =============================================
-- Sprint 3: Área do Comprador
-- Criação das tabelas para dados do comprador e mix de lojas
-- =============================================

-- Tabela de Dados do Comprador (parte comercial)
CREATE TABLE IF NOT EXISTS public.dados_comprador_produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES public.processos_cadastro(id) ON DELETE CASCADE,
    
    -- Descrição e dados comerciais
    descricao_prado TEXT,
    
    -- Tipo de entrega
    entrega_cd BOOLEAN NOT NULL DEFAULT false,
    entrega_loja BOOLEAN NOT NULL DEFAULT false,
    cross_dock BOOLEAN NOT NULL DEFAULT false,
    
    -- Substituição
    substituicao BOOLEAN,
    
    -- Estrutura mercadológica
    departamento TEXT,
    categoria TEXT,
    subcategoria TEXT,
    segmento TEXT,
    subsegmento TEXT,
    
    -- Preços e margem
    margem_lucro NUMERIC(8, 2),
    preco_prado NUMERIC(12, 2),
    preco_pradao NUMERIC(12, 2),
    codigo_item_similar TEXT,
    
    -- Timestamps
    salvo_em TIMESTAMPTZ,
    enviado_aprovacao_em TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Mix de Lojas
CREATE TABLE IF NOT EXISTS public.processo_mix_lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES public.processos_cadastro(id) ON DELETE CASCADE,
    
    loja_codigo TEXT NOT NULL,
    loja_nome TEXT NOT NULL,
    selecionado BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para dados_comprador_produto
CREATE UNIQUE INDEX IF NOT EXISTS idx_dados_comprador_produto_processo_id 
    ON public.dados_comprador_produto(processo_id);
CREATE INDEX IF NOT EXISTS idx_dados_comprador_produto_departamento 
    ON public.dados_comprador_produto(departamento);
CREATE INDEX IF NOT EXISTS idx_dados_comprador_produto_categoria 
    ON public.dados_comprador_produto(categoria);

-- Índices para processo_mix_lojas
CREATE INDEX IF NOT EXISTS idx_processo_mix_lojas_processo_id 
    ON public.processo_mix_lojas(processo_id);
CREATE INDEX IF NOT EXISTS idx_processo_mix_lojas_codigo 
    ON public.processo_mix_lojas(loja_codigo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_processo_mix_lojas_unique 
    ON public.processo_mix_lojas(processo_id, loja_codigo);

-- Trigger para atualizar updated_at em dados_comprador_produto
DROP TRIGGER IF EXISTS update_dados_comprador_produto_updated_at ON public.dados_comprador_produto;
CREATE TRIGGER update_dados_comprador_produto_updated_at
    BEFORE UPDATE ON public.dados_comprador_produto
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em processo_mix_lojas
DROP TRIGGER IF EXISTS update_processo_mix_lojas_updated_at ON public.processo_mix_lojas;
CREATE TRIGGER update_processo_mix_lojas_updated_at
    BEFORE UPDATE ON public.processo_mix_lojas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar colunas faltantes na tabela processos_cadastro
ALTER TABLE public.processos_cadastro 
    ADD COLUMN IF NOT EXISTS enviado_aprovacao_at TIMESTAMPTZ;

ALTER TABLE public.processos_cadastro 
    ADD COLUMN IF NOT EXISTS motivo_correcao TEXT;

-- RLS para dados_comprador_produto
ALTER TABLE public.dados_comprador_produto ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para dados_comprador_produto
DROP POLICY IF EXISTS "Allow select all authenticated" ON public.dados_comprador_produto;
CREATE POLICY "Allow select all authenticated" ON public.dados_comprador_produto
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow insert authenticated" ON public.dados_comprador_produto;
CREATE POLICY "Allow insert authenticated" ON public.dados_comprador_produto
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow update authenticated" ON public.dados_comprador_produto;
CREATE POLICY "Allow update authenticated" ON public.dados_comprador_produto
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS para processo_mix_lojas
ALTER TABLE public.processo_mix_lojas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para processo_mix_lojas
DROP POLICY IF EXISTS "Allow select all authenticated mix" ON public.processo_mix_lojas;
CREATE POLICY "Allow select all authenticated mix" ON public.processo_mix_lojas
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow insert authenticated mix" ON public.processo_mix_lojas;
CREATE POLICY "Allow insert authenticated mix" ON public.processo_mix_lojas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow update authenticated mix" ON public.processo_mix_lojas;
CREATE POLICY "Allow update authenticated mix" ON public.processo_mix_lojas
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow delete authenticated mix" ON public.processo_mix_lojas;
CREATE POLICY "Allow delete authenticated mix" ON public.processo_mix_lojas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE public.dados_comprador_produto IS 'Tabela para armazenar os dados preenchidos pelo comprador na ficha de cadastro';
COMMENT ON TABLE public.processo_mix_lojas IS 'Tabela para armazenar o mix de lojas selecionado para o processo';
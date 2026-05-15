-- =============================================
-- Sprint 2: Fluxo do Fornecedor
-- Criação das tabelas para geração de link e dados do fornecedor
-- =============================================

-- Tabela de Links para Fornecedor
CREATE TABLE IF NOT EXISTS links_fornecedor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES processos_cadastro(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true,
    usado BOOLEAN DEFAULT false,
    criado_por UUID REFERENCES perfis(id),
    data_expiracao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca por token_hash
CREATE INDEX IF NOT EXISTS idx_links_fornecedor_token_hash ON links_fornecedor(token_hash);
CREATE INDEX IF NOT EXISTS idx_links_fornecedor_processo_id ON links_fornecedor(processo_id);

-- Tabela de Dados do Fornecedor (produto)
CREATE TABLE IF NOT EXISTS dados_fornecedor_produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES processos_cadastro(id) ON DELETE CASCADE,
    
    -- Dados do Produto
    codigo_barra VARCHAR(50),
    descricao_produto TEXT,
    marca VARCHAR(100),
    gramagem VARCHAR(50),
    usa_balanca BOOLEAN DEFAULT false,
    preco_custo DECIMAL(12, 2),
    referencia VARCHAR(100),
    
    -- Dados do Fornecedor
    cnpj VARCHAR(18),
    fornecedor_nome VARCHAR(200),
    
    -- Dados da Caixa/Display
    codigo_caixa VARCHAR(50),
    quantidade_na_caixa INTEGER,
    codigo_display VARCHAR(50),
    quantidade_do_display INTEGER,
    
    -- Informações Logísticas
    altura_cm DECIMAL(8, 2),
    largura_cm DECIMAL(8, 2),
    comprimento_cm DECIMAL(8, 2),
    cubagem_m3 DECIMAL(12, 6),
    peso_bruto_kg DECIMAL(8, 3),
    palete VARCHAR(50),
    lastro VARCHAR(50),
    
    -- Status do preenchimento
    status ENUM('rascunho', 'enviado') DEFAULT 'rascunho',
    enviado_em TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca por processo_id
CREATE INDEX IF NOT EXISTS idx_dados_fornecedor_produto_processo_id ON dados_fornecedor_produto(processo_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_links_fornecedor_updated_at
    BEFORE UPDATE ON links_fornecedor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dados_fornecedor_produto_updated_at
    BEFORE UPDATE ON dados_fornecedor_produto
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para links_fornecedor
ALTER TABLE links_fornecedor ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode buscar por token (sem autenticação)
CREATE POLICY "Allow select by token hash" ON links_fornecedor
    FOR SELECT USING (true);

-- Apenas usuários autenticados podem inserir
CREATE POLICY "Allow insert by authenticated users" ON links_fornecedor
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apenas usuários autenticados podem atualizar (marcar como usado)
CREATE POLICY "Allow update by authenticated users" ON links_fornecedor
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas RLS para dados_fornecedor_produto
ALTER TABLE dados_fornecedor_produto ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (fornecedor preenchendo)
CREATE POLICY "Allow insert by anyone" ON dados_fornecedor_produto
    FOR INSERT WITH CHECK (true);

-- Qualquer pessoa pode buscar por processo_id
CREATE POLICY "Allow select by processo_id" ON dados_fornecedor_produto
    FOR SELECT USING (true);

-- Qualquer pessoa pode atualizar (fornecedor editando)
CREATE POLICY "Allow update by anyone" ON dados_fornecedor_produto
    FOR UPDATE USING (true);

-- Comentários das tabelas
COMMENT ON TABLE links_fornecedor IS 'Tabela para armazenar links de acesso para fornecedores preenchimento de dados do produto';
COMMENT ON TABLE dados_fornecedor_produto IS 'Tabela para armazenar os dados do produto preenchidos pelo fornecedor';
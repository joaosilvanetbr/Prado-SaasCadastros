export type FornecedorLink = {
  id: string
  processo_id: string
  token_hash: string
  email_destino: string | null
  expira_em: string | null
  usado_em: string | null
  ativo: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type DadosFornecedorProduto = {
  id: string
  processo_id: string

  codigo_barra: string | null
  descricao_produto: string | null
  marca: string | null
  gramagem: string | null
  usa_balanca: boolean | null
  preco_custo: number | null
  referencia: string | null
  cnpj: string | null
  fornecedor_nome: string | null

  codigo_caixa: string | null
  quantidade_na_caixa: number | null
  codigo_display: string | null
  quantidade_do_display: number | null

  altura_cm: number | null
  largura_cm: number | null
  comprimento_cm: number | null
  cubagem_m3: number | null
  peso_bruto_kg: number | null
  palete: string | null
  lastro: string | null

  enviado_em: string | null
  created_at: string
  updated_at: string
}

export type FornecedorTokenValidationResult = {
  valid: boolean
  reason?: 'invalid' | 'expired' | 'already_submitted' | 'cancelled' | 'not_allowed' | 'error'
  linkId?: string
  processoId?: string
  numeroProcesso?: number
  fornecedorNome?: string
  emailDestino?: string | null
  status?: string
}

export type FornecedorFormData = {
  codigo_barra: string
  descricao_produto: string
  marca: string
  gramagem: string
  usa_balanca: boolean
  preco_custo: number
  referencia?: string
  cnpj: string
  fornecedor_nome: string
  codigo_caixa?: string
  quantidade_na_caixa?: number
  codigo_display?: string
  quantidade_do_display?: number
  altura_cm: number
  largura_cm: number
  comprimento_cm: number
  cubagem_m3?: number
  peso_bruto_kg: number
  palete?: string
  lastro?: string
}
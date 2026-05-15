export type AssinaturaStatus = 'aprovado' | 'reprovado' | 'correcao_solicitada'
export type AssinaturaTipo = 'aprovacao' | 'cadastro'

export interface Assinatura {
  id: string
  processo_id: string
  usuario_id: string | null
  tipo: AssinaturaTipo
  status: AssinaturaStatus
  nome_assinante: string
  email_assinante: string | null
  cargo_ou_perfil: string | null
  observacao: string | null
  ip: string | null
  user_agent: string | null
  assinatura_imagem_url: string | null
  created_at: string
}

export interface AprovacaoProcessoView {
  processo: {
    id: string
    numero_processo: number
    status: string
    titulo: string | null
    descricao_produto_resumo: string | null
    codigo_barra_resumo: string | null
    comprador_responsavel_id: string
    aprovador_id: string | null
    aprovado_at: string | null
    motivo_reprovacao: string | null
    motivo_correcao: string | null
    criado_em?: string
    updated_at: string
  }
  fornecedor: {
    id: string
    razao_social: string
    cnpj: string | null
    email: string | null
    contato_nome: string | null
  } | null
  dadosFornecedor: {
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
  } | null
  dadosComprador: {
    descricao_prado: string | null
    entrega_cd: boolean
    entrega_loja: boolean
    cross_dock: boolean
    substituicao: boolean | null
    departamento: string | null
    categoria: string | null
    subcategoria: string | null
    segmento: string | null
    subsegmento: string | null
    margem_lucro: number | null
    preco_prado: number | null
    preco_pradao: number | null
    codigo_item_similar: string | null
  } | null
  mixLojas: Array<{
    loja_codigo: string
    loja_nome: string
    selecionado: boolean
  }>
  historico: Array<{
    id: string
    acao: string
    observacao: string | null
    created_at: string
    usuario?: { nome: string }
  }>
  assinaturas: Assinatura[]
  compradorResponsavel: {
    id: string
    nome: string
    email: string
  } | null
  aprovador?: {
    id: string
    nome: string
    email: string
  } | null
}

export const APROVACAO_ACTION_LABELS = {
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  correcao_solicitada: 'Correção solicitada',
} as const

export const BLOQUEAR_AUTOAPROVACAO = true
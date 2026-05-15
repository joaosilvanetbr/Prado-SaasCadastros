export type ProfilePerfil = 'admin' | 'comprador' | 'cadastro'

export type UserProfile = {
  id: string
  nome: string
  email: string
  perfil: ProfilePerfil
  pode_aprovar: boolean
  pode_cadastrar: boolean
  pode_gerenciar_usuarios: boolean
  pode_ver_todos_processos: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Fornecedor = {
  id: string
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  email: string | null
  telefone: string | null
  contato_nome: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type ProcessoStatus = 
  | 'rascunho'
  | 'aguardando_fornecedor'
  | 'enviado_pelo_fornecedor'
  | 'em_analise_comprador'
  | 'correcao_solicitada_fornecedor'
  | 'correcao_solicitada_comprador'
  | 'aguardando_aprovacao'
  | 'aprovado_para_cadastro'
  | 'reprovado'
  | 'em_cadastro'
  | 'cadastrado'
  | 'pdf_gerado'
  | 'cancelado'

export type ProcessoCadastro = {
  id: string
  numero_processo: number
  status: ProcessoStatus
  fornecedor_id: string | null
  comprador_responsavel_id: string
  aprovador_id: string | null
  cadastro_responsavel_id: string | null
  titulo: string | null
  descricao_produto_resumo: string | null
  codigo_barra_resumo: string | null
  observacao_interna: string | null
  motivo_reprovacao: string | null
  motivo_correcao: string | null
  enviado_fornecedor_at: string | null
  respondido_fornecedor_at: string | null
  enviado_aprovacao_at: string | null
  aprovado_at: string | null
  em_cadastro_at: string | null
  cadastrado_at: string | null
  pdf_gerado_at: string | null
  codigo_interno_produto: string | null
  pdf_url: string | null
  observacao_cadastro: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export type HistoricoProcesso = {
  id: string
  processo_id: string
  usuario_id: string | null
  status_anterior: string | null
  status_novo: string | null
  acao: string
  observacao: string | null
  dados_anteriores: Record<string, unknown> | null
  dados_novos: Record<string, unknown> | null
  created_at: string
}

export type ProcessoWithRelations = ProcessoCadastro & {
  fornecedor?: Fornecedor | null
  comprador_responsavel?: UserProfile | null
  aprovador?: UserProfile | null
}

import type { Assinatura } from './aprovacao'
import type { DadosFornecedorProduto } from './fornecedor'
import type { DadosCompradorProduto, ProcessoMixLoja } from './comprador'
import type { ProcessoCadastro, Fornecedor, UserProfile, HistoricoProcesso } from './database'

export type CadastroProcessoView = {
  processo: ProcessoCadastro
  fornecedor: Fornecedor | null
  dadosFornecedor: DadosFornecedorProduto | null
  dadosComprador: DadosCompradorProduto | null
  mixLojas: ProcessoMixLoja[]
  historico: HistoricoProcesso[]
  assinaturas: Assinatura[]
  compradorResponsavel: UserProfile | null
  aprovador: UserProfile | null
  cadastroResponsavel: UserProfile | null
}

export type CadastroFormData = {
  codigo_interno_produto?: string | null
  observacao_cadastro?: string | null
}

// Extensão do ProcessoCadastro para incluir campos de cadastro
export type ProcessoCadastroComCadastro = {
  id: string
  numero_processo: number
  status: string
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
  // Relations
  fornecedor?: { razao_social: string; cnpj: string } | null
  comprador_responsavel?: { nome: string } | null
  cadastro_responsavel?: { nome: string } | null
  aprovador?: { nome: string } | null
}

export type PdfGenerationResult = {
  success: boolean
  pdfUrl?: string
  storagePath?: string
  error?: string
}

export const CADASTRO_STATUS = {
  APROVADO_PARA_CADASTRO: 'aprovado_para_cadastro',
  EM_CADASTRO: 'em_cadastro',
  CADASTRADO: 'cadastrado',
  PDF_GERADO: 'pdf_gerado',
} as const

export const CADASTRO_STATUS_LABELS = {
  aprovado_para_cadastro: 'Aprovado para cadastro',
  em_cadastro: 'Em cadastro',
  cadastrado: 'Cadastrado',
  pdf_gerado: 'PDF gerado',
} as const

export const CODIGO_INTERNO_OBRIGATORIO = true

export type CadastroStatus = typeof CADASTRO_STATUS[keyof typeof CADASTRO_STATUS]

export function verificarPodeCadastrar(profile: UserProfile | null): boolean {
  if (!profile) return false
  return profile.perfil === 'cadastro' || profile.pode_cadastrar || profile.perfil === 'admin'
}

export function verificarPodeGerarPdf(processo: ProcessoCadastro, profile: UserProfile | null): boolean {
  if (!profile) return false
  if (processo.status !== 'cadastrado') return false
  
  const podeCadastrar = verificarPodeCadastrar(profile)
  if (!podeCadastrar) return false
  
  // Verificar campos obrigatórios
  if (!processo.aprovador_id || !processo.aprovado_at || !processo.cadastro_responsavel_id || !processo.cadastrado_at) {
    return false
  }
  
  return true
}
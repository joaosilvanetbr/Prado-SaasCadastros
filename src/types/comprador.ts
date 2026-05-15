export interface DadosCompradorProduto {
  id: string
  processo_id: string
  descricao_prado: string | null
  entrega_cd: boolean | null | undefined
  entrega_loja: boolean | null | undefined
  cross_dock: boolean | null | undefined
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
  salvo_em: string | null
  enviado_aprovacao_em: string | null
  created_at: string
  updated_at: string
}

export interface ProcessoMixLoja {
  id: string
  processo_id: string
  loja_codigo: string
  loja_nome: string
  selecionado: boolean
  created_at: string
  updated_at: string
}

export interface DadosCompradorFormData {
  descricao_prado: string
  entrega_cd: boolean
  entrega_loja: boolean
  cross_dock: boolean
  substituicao: boolean
  departamento: string
  categoria: string
  subcategoria?: string | null
  segmento?: string | null
  subsegmento?: string | null
  margem_lucro: number
  preco_prado: number
  preco_pradao?: number | null
  codigo_item_similar?: string | null
  lojasSelecionadas: string[]
}

export interface DadosCompradorCompleto extends DadosCompradorProduto {
  mix_lojas: ProcessoMixLoja[]
}

export const LOJAS_MIX = [
  { codigo: "1", nome: "Biguaçu" },
  { codigo: "2", nome: "Governador Celso Ramos" },
  { codigo: "3", nome: "Canasvieiras" },
  { codigo: "4", nome: "São José" },
  { codigo: "5", nome: "Palhoça" },
  { codigo: "7", nome: "Estreito" },
  { codigo: "8", nome: "Porto Belo" },
  { codigo: "9", nome: "Saco dos Limões" },
  { codigo: "99", nome: "Centro de Distribuição" },
] as const

export type LojaMix = typeof LOJAS_MIX[number]
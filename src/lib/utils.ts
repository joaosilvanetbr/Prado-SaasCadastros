import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  aguardando_fornecedor: 'Aguardando Fornecedor',
  enviado_pelo_fornecedor: 'Enviado pelo Fornecedor',
  em_analise_comprador: 'Em Análise do Comprador',
  correcao_solicitada_fornecedor: 'Correção Solicitada ao Fornecedor',
  correcao_solicitada_comprador: 'Correção Solicitada ao Comprador',
  aguardando_aprovacao: 'Aguardando Aprovação',
  aprovado_para_cadastro: 'Aprovado para Cadastro',
  reprovado: 'Reprovado',
  em_cadastro: 'Em Cadastro',
  cadastrado: 'Cadastrado',
  pdf_gerado: 'PDF Gerado',
  cancelado: 'Cancelado',
}

export const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  aguardando_fornecedor: 'bg-blue-100 text-blue-700',
  enviado_pelo_fornecedor: 'bg-purple-100 text-purple-700',
  em_analise_comprador: 'bg-yellow-100 text-yellow-700',
  correcao_solicitada_fornecedor: 'bg-orange-100 text-orange-700',
  correcao_solicitada_comprador: 'bg-orange-100 text-orange-700',
  aguardando_aprovacao: 'bg-orange-100 text-orange-700',
  aprovado_para_cadastro: 'bg-green-100 text-green-700',
  reprovado: 'bg-red-100 text-red-700',
  em_cadastro: 'bg-blue-100 text-blue-700',
  cadastrado: 'bg-green-100 text-green-700',
  pdf_gerado: 'bg-green-800 text-white',
  cancelado: 'bg-gray-400 text-white',
}
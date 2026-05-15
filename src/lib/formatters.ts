import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCNPJ(cnpj: string): string {
  const numbers = cnpj.replace(/\D/g, '')
  if (numbers.length !== 14) return cnpj
  
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[R$\s.,]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

export function formatCubagem(value: number): string {
  return `${value.toFixed(6).replace('.', ',')} m³`
}

export function calculateCubagem(altura: number, largura: number, comprimento: number): number {
  return (altura * largura * comprimento) / 1000000
}

export function formatarBoolean(value: boolean | null | undefined): string {
  if (value == null) return '-'
  return value ? 'Sim' : 'Não'
}

export function formatarMoeda(value: number | null | undefined): string {
  return formatCurrency(value)
}

export function formatarPercentual(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${value.toFixed(2).replace('.', ',')}%`
}

export function formatarData(value: string | null | undefined): string {
  if (!value) return '-'
  return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export { format, ptBR }
export { ptBR as locale }
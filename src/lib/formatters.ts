export function formatCNPJ(cnpj: string): string {
  const numbers = cnpj.replace(/\D/g, '')
  if (numbers.length !== 14) return cnpj
  
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCurrency(value: number): string {
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
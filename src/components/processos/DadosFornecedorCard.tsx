import { DadosFornecedorProduto } from '@/types/fornecedor'
import { formatCurrency, formatCubagem } from '@/lib/formatters'
import { Package, Box, Ruler } from 'lucide-react'

interface DadosFornecedorCardProps {
  dados: DadosFornecedorProduto | null
  isLoading?: boolean
}

export default function DadosFornecedorCard({ dados, isLoading }: DadosFornecedorCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} />
          Dados do Fornecedor
        </h2>
        <p className="text-gray-500 text-sm">Aguardando preenchimento do fornecedor.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Package size={20} />
        Dados Enviados pelo Fornecedor
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Dados do Produto</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400">Código de Barra</p>
              <p className="text-sm font-medium">{dados.codigo_barra || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Descrição</p>
              <p className="text-sm font-medium">{dados.descricao_produto || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Marca</p>
              <p className="text-sm font-medium">{dados.marca || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Gramagem</p>
              <p className="text-sm font-medium">{dados.gramagem || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Usa Balança</p>
              <p className="text-sm font-medium">{dados.usa_balanca ? 'Sim' : 'Não'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Preço de Custo</p>
              <p className="text-sm font-medium">{dados.preco_custo ? formatCurrency(dados.preco_custo) : '-'}</p>
            </div>
            {dados.referencia && (
              <div>
                <p className="text-xs text-gray-400">Referência</p>
                <p className="text-sm font-medium">{dados.referencia}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Dados do Fornecedor</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400">CNPJ</p>
              <p className="text-sm font-medium">{dados.cnpj || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fornecedor</p>
              <p className="text-sm font-medium">{dados.fornecedor_nome || '-'}</p>
            </div>
          </div>
        </div>

        {(dados.codigo_caixa || dados.codigo_display) && (
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Box size={16} />
              Caixa e Display
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {dados.codigo_caixa && (
                <div>
                  <p className="text-xs text-gray-400">Código da Caixa</p>
                  <p className="text-sm font-medium">{dados.codigo_caixa}</p>
                  {dados.quantidade_na_caixa && (
                    <p className="text-xs text-gray-500">Qtd: {dados.quantidade_na_caixa}</p>
                  )}
                </div>
              )}
              {dados.codigo_display && (
                <div>
                  <p className="text-xs text-gray-400">Código do Display</p>
                  <p className="text-sm font-medium">{dados.codigo_display}</p>
                  {dados.quantidade_do_display && (
                    <p className="text-xs text-gray-500">Qtd: {dados.quantidade_do_display}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Ruler size={16} />
            Informações Logísticas
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Altura (cm)</p>
              <p className="text-sm font-medium">{dados.altura_cm || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Largura (cm)</p>
              <p className="text-sm font-medium">{dados.largura_cm || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Comprimento (cm)</p>
              <p className="text-sm font-medium">{dados.comprimento_cm || '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-400">Cubagem</p>
              <p className="text-sm font-medium">
                {dados.cubagem_m3 ? formatCubagem(dados.cubagem_m3) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Peso Bruto (kg)</p>
              <p className="text-sm font-medium">{dados.peso_bruto_kg || '-'}</p>
            </div>
            {dados.palete && (
              <div>
                <p className="text-xs text-gray-400">Palete</p>
                <p className="text-sm font-medium">{dados.palete}</p>
              </div>
            )}
            {dados.lastro && (
              <div>
                <p className="text-xs text-gray-400">Lastro</p>
                <p className="text-sm font-medium">{dados.lastro}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {dados.enviado_em && (
        <p className="text-xs text-gray-400 mt-4 pt-4 border-t">
          Enviado em: {new Date(dados.enviado_em).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  )
}
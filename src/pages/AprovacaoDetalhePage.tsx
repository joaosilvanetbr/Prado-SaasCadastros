import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { aprovacoesService } from '@/services/aprovacoesService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency, formatCubagem } from '@/lib/formatters'
import { APROVACAO_ACTION_LABELS } from '@/types/aprovacao'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Package, 
  Truck, 
  DollarSign, 
  MapPin,
  Building2,
  ShoppingBag,
  History
} from 'lucide-react'

export default function AprovacaoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAprovarDialog, setShowAprovarDialog] = useState(false)
  const [showReprovarDialog, setShowReprovarDialog] = useState(false)
  const [showAjusteDialog, setShowAjusteDialog] = useState(false)
  const [observacao, setObservacao] = useState('')
  const [motivo, setMotivo] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      
      try {
        const result = await aprovacoesService.buscarProcessoParaAprovacao(id)
        setData(result)
      } catch (err) {
        console.error('Error loading:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [id])

  const handleAprovar = async () => {
    if (!profile?.id) return
    
    setIsProcessing(true)
    setError(null)
    
    const result = await aprovacoesService.aprovarProcesso(id!, profile, observacao || undefined)
    
    if (result.success) {
      navigate('/app/aprovacoes')
    } else {
      setError(result.error || 'Erro ao aprovar')
    }
    
    setIsProcessing(false)
  }

  const handleReprovar = async () => {
    if (!profile?.id || !motivo.trim()) return
    
    setIsProcessing(true)
    setError(null)
    
    const result = await aprovacoesService.reprovarProcesso(id!, profile, motivo)
    
    if (result.success) {
      navigate('/app/aprovacoes')
    } else {
      setError(result.error || 'Erro ao reprovar')
    }
    
    setIsProcessing(false)
  }

  const handleSolicitarAjuste = async () => {
    if (!profile?.id || !motivo.trim()) return
    
    setIsProcessing(true)
    setError(null)
    
    const result = await aprovacoesService.solicitarAjusteComprador(id!, profile, motivo)
    
    if (result.success) {
      navigate('/app/aprovacoes')
    } else {
      setError(result.error || 'Erro ao solicitar ajuste')
    }
    
    setIsProcessing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Processo não encontrado.</p>
      </div>
    )
  }

  const { processo, fornecedor, dadosFornecedor, dadosComprador, mixLojas, historico, assinaturas, compradorResponsavel } = data

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/app/aprovacoes')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Revisão de Aprovação
            </h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Aguardando aprovação
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            Processo #{processo.numero_processo.toString().padStart(6, '0')}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Dados do Fornecedor */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={20} />
            Dados do Fornecedor
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Fornecedor</p>
              <p className="font-medium">{fornecedor?.razao_social || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CNPJ</p>
              <p className="font-medium">{fornecedor?.cnpj || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">E-mail</p>
              <p className="font-medium">{fornecedor?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Comprador Responsável</p>
              <p className="font-medium">{compradorResponsavel?.nome || '-'}</p>
            </div>
          </div>
        </div>

        {/* Dados do Produto (Fornecedor) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={20} />
            Dados do Produto
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Código de Barra</p>
              <p className="font-medium">{dadosFornecedor?.codigo_barra || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Descrição</p>
              <p className="font-medium">{dadosFornecedor?.descricao_produto || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Marca</p>
              <p className="font-medium">{dadosFornecedor?.marca || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gramagem</p>
              <p className="font-medium">{dadosFornecedor?.gramagem || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preço de Custo</p>
              <p className="font-medium text-green-600">
                {dadosFornecedor?.preco_custo ? formatCurrency(dadosFornecedor.preco_custo) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Usa Balança</p>
              <p className="font-medium">{dadosFornecedor?.usa_balanca ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>

        {/* Logística */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck size={20} />
            Informações Logísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Altura (cm)</p>
              <p className="font-medium">{dadosFornecedor?.altura_cm || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Largura (cm)</p>
              <p className="font-medium">{dadosFornecedor?.largura_cm || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Comprimento (cm)</p>
              <p className="font-medium">{dadosFornecedor?.comprimento_cm || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cubagem</p>
              <p className="font-medium">
                {dadosFornecedor?.cubagem_m3 ? formatCubagem(dadosFornecedor.cubagem_m3) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Peso Bruto (kg)</p>
              <p className="font-medium">{dadosFornecedor?.peso_bruto_kg || '-'}</p>
            </div>
          </div>
        </div>

        {/* Dados do Comprador */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Dados Comerciais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Descrição Prado</p>
              <p className="font-medium">{dadosComprador?.descricao_prado || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Margem de Lucro</p>
              <p className="font-medium text-blue-600">
                {dadosComprador?.margem_lucro ? `${dadosComprador.margem_lucro}%` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preço Prado</p>
              <p className="font-medium text-green-600">
                {dadosComprador?.preco_prado ? formatCurrency(dadosComprador.preco_prado) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preço Pradão</p>
              <p className="font-medium">
                {dadosComprador?.preco_pradao ? formatCurrency(dadosComprador.preco_pradao) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Substituição</p>
              <p className="font-medium">{dadosComprador?.substituicao ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>

        {/* Estrutura Mercadológica */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Estrutura Mercadológica
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Departamento</p>
              <p className="font-medium">{dadosComprador?.departamento || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Categoria</p>
              <p className="font-medium">{dadosComprador?.categoria || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subcategoria</p>
              <p className="font-medium">{dadosComprador?.subcategoria || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Segmento</p>
              <p className="font-medium">{dadosComprador?.segmento || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subsegmento</p>
              <p className="font-medium">{dadosComprador?.subsegmento || '-'}</p>
            </div>
          </div>
        </div>

        {/* Mix de Lojas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={20} />
            Mix de Lojas ({mixLojas.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {mixLojas.map((loja: any) => (
              <span key={loja.loja_codigo} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {loja.loja_nome}
              </span>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History size={20} />
            Histórico
          </h2>
          <div className="space-y-3">
            {historico.map((item: any, index: number) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <p className="text-sm font-medium text-gray-900">{item.acao}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  {item.usuario?.nome && ` - ${item.usuario.nome}`}
                </p>
                {item.observacao && (
                  <p className="text-sm text-gray-600 mt-1">{item.observacao}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Decisão</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAprovarDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={20} />
              <span>Aprovar e Assinar</span>
            </button>
            
            <button
              onClick={() => setShowAjusteDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <AlertTriangle size={20} />
              <span>Solicitar Ajuste</span>
            </button>
            
            <button
              onClick={() => setShowReprovarDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle size={20} />
              <span>Reprovar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dialog Aprovar */}
      {showAprovarDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aprovar e Assinar</h2>
            <p className="text-gray-600 mb-4">
              Ao aprovar, esta ficha será liberada para o setor de cadastro. Esta ação ficará registrada com seu nome, data e hora.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observação (opcional)</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Adicione uma observação..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAprovarDialog(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprovar}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'Aprovando...' : 'Aprovar e Assinar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Reprovar */}
      {showReprovarDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reprovar Processo</h2>
            <p className="text-gray-600 mb-4">Informe o motivo da reprovação:</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                placeholder="Ex: Produto não aprovado para cadastro por divergência comercial."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReprovarDialog(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleReprovar}
                disabled={isProcessing || !motivo.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Reprovando...' : 'Confirmar Reprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Solicitar Ajuste */}
      {showAjusteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Solicitar Ajuste ao Comprador</h2>
            <p className="text-gray-600 mb-4">Informe o motivo do ajuste:</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
                placeholder="Ex: Preço Prado precisa ser revisado."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAjusteDialog(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleSolicitarAjuste}
                disabled={isProcessing || !motivo.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {isProcessing ? 'Solicitando...' : 'Solicitar Ajuste'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
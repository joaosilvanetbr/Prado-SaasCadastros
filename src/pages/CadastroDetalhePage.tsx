import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cadastroService } from '@/services/cadastroService'
import { verificarPodeCadastrar, verificarPodeGerarPdf, CADASTRO_STATUS_LABELS } from '@/types/cadastro'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, FileText, Package, Building2, Truck, MapPin, DollarSign, CheckCircle, Download, Loader2, AlertCircle, User, Clock } from 'lucide-react'
import MarcarCadastradoDialog from '@/components/cadastro/MarcarCadastradoDialog'
import type { CadastroProcessoView, CadastroFormData } from '@/types/cadastro'
import type { Assinatura } from '@/types/aprovacao'

export default function CadastroDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [data, setData] = useState<CadastroProcessoView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMarcarCadastradoDialog, setShowMarcarCadastradoDialog] = useState(false)
  const [error, setError] = useState('')
  const [showPdfPreview, setShowPdfPreview] = useState(false)

  useEffect(() => {
    if (!verificarPodeCadastrar(profile)) {
      navigate('/app')
      return
    }

    if (id) {
      loadData()
    }
  }, [id, profile, navigate])

  async function loadData() {
    if (!id) return
    setIsLoading(true)
    setError('')
    try {
      const data = await cadastroService.buscarProcessoParaCadastro(id)
      setData(data)
    } catch (err) {
      setError('Erro ao carregar dados do processo')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssumirCadastro = async () => {
    if (!data || !profile) return
    setIsProcessing(true)
    setError('')
    try {
      const success = await cadastroService.assumirCadastro(data.processo.id, profile)
      if (success) {
        await loadData()
      } else {
        setError('Erro ao assumir cadastro')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao assumir cadastro')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMarcarCadastrado = async (formData: CadastroFormData) => {
    if (!data || !profile) return
    const success = await cadastroService.marcarComoCadastrado(data.processo.id, formData, profile)
    if (success) {
      setShowMarcarCadastradoDialog(false)
      await loadData()
    } else {
      throw new Error('Erro ao marcar como cadastrado')
    }
  }

  const handleGerarPdf = async () => {
    if (!data || !profile) return
    setIsProcessing(true)
    setError('')
    try {
      const result = await cadastroService.gerarPdfFinal(data.processo.id, profile)
      if (result.success) {
        // Por enquanto, abrir preview do PDF
        const html = cadastroService.gerarHtmlPdf(data)
        const previewWindow = window.open('', '_blank')
        if (previewWindow) {
          previewWindow.document.write(html)
          previewWindow.document.close()
        }
      } else {
        setError(result.error || 'Erro ao gerar PDF')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado_para_cadastro':
        return 'bg-blue-100 text-blue-800'
      case 'em_cadastro':
        return 'bg-yellow-100 text-yellow-800'
      case 'cadastrado':
        return 'bg-green-100 text-green-800'
      case 'pdf_gerado':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatarMoeda = (valor: number | null) => {
    if (valor === null || valor === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
  }

  const formatarBoolean = (valor: boolean | null) => {
    return valor ? 'Sim' : 'Não'
  }

  const mixSelecionadas = data?.mixLojas.filter(m => m.selecionado) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data || error && !data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="text-gray-500">{error || 'Processo não encontrado.'}</p>
        <Link to="/app/cadastro" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Voltar para fila de cadastro
        </Link>
      </div>
    )
  }

  const { processo, fornecedor, dadosFornecedor, dadosComprador, compradorResponsavel, aprovador, cadastroResponsavel, historico, assinaturas } = data

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/app/cadastro')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Processo #{processo.numero_processo.toString().padStart(6, '0')}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(processo.status)}`}>
              {CADASTRO_STATUS_LABELS[processo.status as keyof typeof CADASTRO_STATUS_LABELS] || processo.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {processo.descricao_produto_resumo || 'Sem descrição'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Produto */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Dados do Produto
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Código de Barra</p>
                <p className="font-medium">{processo.codigo_barra_resumo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="font-medium">{processo.descricao_produto_resumo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descrição Prado</p>
                <p className="font-medium">{dadosComprador?.descricao_prado || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marca</p>
                <p className="font-medium">{dadosFornecedor?.marca || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gramagem</p>
                <p className="font-medium">{dadosFornecedor?.gramatura || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usa Balança</p>
                <p className="font-medium">{formatarBoolean(dadosFornecedor?.usa_balanca)}</p>
              </div>
            </div>
          </div>

          {/* Fornecedor */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Fornecedor
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
                <p className="text-sm text-gray-500">Preço de Custo</p>
                <p className="font-medium">{formatarMoeda(dadosFornecedor?.preco_custo)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Referência</p>
                <p className="font-medium">{dadosFornecedor?.referencia || '-'}</p>
              </div>
            </div>
          </div>

          {/* Informações Logísticas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={20} />
              Informações Logísticas
            </h2>
            <div className="grid grid-cols-2 gap-4">
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
                <p className="text-sm text-gray-500">Cubagem (m³)</p>
                <p className="font-medium">{dadosFornecedor?.cubagem_m3 || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Peso Bruto (kg)</p>
                <p className="font-medium">{dadosFornecedor?.peso_bruto_kg || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Palete / Lastro</p>
                <p className="font-medium">{dadosFornecedor?.palete || '-'} / {dadosFornecedor?.lastro || '-'}</p>
              </div>
            </div>

            <h3 className="font-medium text-gray-700 mt-6 mb-3">Caixa / Display</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Código da Caixa</p>
                <p className="font-medium">{dadosFornecedor?.codigo_caixa || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantidade na Caixa</p>
                <p className="font-medium">{dadosFornecedor?.quantidade_na_caixa || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código do Display</p>
                <p className="font-medium">{dadosFornecedor?.codigo_display || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantidade do Display</p>
                <p className="font-medium">{dadosFornecedor?.quantidade_do_display || '-'}</p>
              </div>
            </div>
          </div>

          {/* Tipo de Entrega */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Tipo de Entrega
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Entrega CD</p>
                <p className="font-medium">{formatarBoolean(dadosComprador?.entrega_cd)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Entrega Loja</p>
                <p className="font-medium">{formatarBoolean(dadosComprador?.entrega_loja)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cross Dock</p>
                <p className="font-medium">{formatarBoolean(dadosComprador?.cross_dock)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Substituição</p>
                <p className="font-medium">{formatarBoolean(dadosComprador?.substituicao)}</p>
              </div>
            </div>
          </div>

          {/* Mix de Lojas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mix de Lojas</h2>
            {mixSelecionadas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mixSelecionadas.map((loja, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {loja.loja_nome}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma loja selecionada</p>
            )}
          </div>

          {/* Estrutura Mercadológica */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estrutura Mercadológica</h2>
            <div className="grid grid-cols-2 gap-4">
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

          {/* Dados Comerciais */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Dados Comerciais
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Margem de Lucro</p>
                <p className="font-medium">
                  {dadosComprador?.margem_lucro != null ? `${dadosComprador.margem_lucro.toFixed(2).replace('.', ',')}%` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preço Prado</p>
                <p className="font-medium">{formatarMoeda(dadosComprador?.preco_prado)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preço Pradão</p>
                <p className="font-medium">{formatarMoeda(dadosComprador?.preco_pradao)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código Item Similar</p>
                <p className="font-medium">{dadosComprador?.codigo_item_similar || '-'}</p>
              </div>
            </div>
          </div>

          {/* Aprovação */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              Aprovação / Assinatura
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Aprovado por</p>
                <p className="font-medium">{aprovador?.nome || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data da Aprovação</p>
                <p className="font-medium">{formatarData(processo.aprovado_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Comprador Responsável</p>
                <p className="font-medium">{compradorResponsavel?.nome || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ações */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações</h2>
            <div className="space-y-3">
              {processo.status === 'aprovado_para_cadastro' && (
                <button
                  onClick={handleAssumirCadastro}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <User size={18} />
                  )}
                  <span>Assumir Cadastro</span>
                </button>
              )}

              {processo.status === 'em_cadastro' && (
                <>
                  <button
                    onClick={() => setShowMarcarCadastradoDialog(true)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    <span>Marcar como Cadastrado</span>
                  </button>
                </>
              )}

              {processo.status === 'cadastrado' && (
                <button
                  onClick={handleGerarPdf}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  <span>Gerar PDF Final</span>
                </button>
              )}

              {processo.status === 'pdf_gerado' && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                  <p className="text-sm text-green-800">PDF gerado com sucesso</p>
                  <a
                    href={processo.pdf_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Download size={18} />
                    Baixar PDF
                  </a>
                </div>
              )}

              {processo.status === 'em_cadastro' && !verificarPodeCadastrar(profile) && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="mx-auto text-yellow-600 mb-2" size={24} />
                  <p className="text-sm text-yellow-800">
                    Aguardando cadastro por {cadastroResponsavel?.nome || 'outro responsável'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dados do Cadastro */}
          {(processo.status === 'em_cadastro' || processo.status === 'cadastrado' || processo.status === 'pdf_gerado') && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cadastro</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Responsável</p>
                  <p className="font-medium">{cadastroResponsavel?.nome || '-'}</p>
                </div>
                {processo.em_cadastro_at && (
                  <div>
                    <p className="text-sm text-gray-500">Assumido em</p>
                    <p className="font-medium">{formatarData(processo.em_cadastro_at)}</p>
                  </div>
                )}
                {processo.codigo_interno_produto && (
                  <div>
                    <p className="text-sm text-gray-500">Código Interno</p>
                    <p className="font-medium">{processo.codigo_interno_produto}</p>
                  </div>
                )}
                {processo.observacao_cadastro && (
                  <div>
                    <p className="text-sm text-gray-500">Observação</p>
                    <p className="text-sm text-gray-700">{processo.observacao_cadastro}</p>
                  </div>
                )}
                {processo.cadastrado_at && (
                  <div>
                    <p className="text-sm text-gray-500">Cadastrado em</p>
                    <p className="font-medium">{formatarData(processo.cadastrado_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Histórico */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h2>
            {historico.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum registro.</p>
            ) : (
              <div className="space-y-4">
                {historico.map((item, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-900">{item.acao}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {(item as any).usuario?.nome && ` - ${(item as any).usuario.nome}`}
                    </p>
                    {item.observacao && (
                      <p className="text-sm text-gray-600 mt-1">{item.observacao}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MarcarCadastradoDialog
        isOpen={showMarcarCadastradoDialog}
        onClose={() => setShowMarcarCadastradoDialog(false)}
        onConfirm={handleMarcarCadastrado}
      />
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { processosService } from '@/services/processosService'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { ProcessoWithRelations } from '@/types/database'
import { ArrowLeft, Send, XCircle, History, Building2, Package, Play, Edit, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DadosFornecedorCard from '@/components/processos/DadosFornecedorCard'
import GerarLinkFornecedorButton from '@/components/fornecedor/GerarLinkFornecedorButton'
import { dadosFornecedorService } from '@/services/dadosFornecedorService'
import { dadosCompradorService } from '@/services/dadosCompradorService'
import { DadosFornecedorProduto } from '@/types/fornecedor'

export default function ProcessoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [processo, setProcesso] = useState<ProcessoWithRelations | null>(null)
  const [historico, setHistorico] = useState<Array<{ created_at: string; acao: string; observacao: string | null; usuario?: { nome: string } }>>([])
  const [dadosFornecedor, setDadosFornecedor] = useState<DadosFornecedorProduto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelMotivo, setCancelMotivo] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      
      try {
        const [processoData, historicoData, dadosFornecedorData] = await Promise.all([
          processosService.buscarProcessoPorId(id),
          processosService.listarHistorico(id),
          dadosFornecedorService.buscarDadosFornecedorPorProcesso(id)
        ])
        setProcesso(processoData)
        setHistorico(historicoData)
        setDadosFornecedor(dadosFornecedorData)
      } catch (error) {
        console.error('Error loading processo:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleMudarStatus = async (novoStatus: 'aguardando_fornecedor' | 'cancelado') => {
    if (!processo || !profile?.id) return
    
    setIsProcessing(true)
    try {
      const observacao = novoStatus === 'cancelado' 
        ? cancelMotivo || 'Processo cancelado pelo usuário'
        : 'Enviado para aguardando fornecedor'
      
      await processosService.alterarStatusProcesso(processo.id, novoStatus, observacao, profile.id)
      
      const updatedProcesso = await processosService.buscarProcessoPorId(processo.id)
      setProcesso(updatedProcesso)
      
      const historicoAtualizado = await processosService.listarHistorico(processo.id)
      setHistorico(historicoAtualizado)
      
      setShowCancelModal(false)
      setCancelMotivo('')
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!processo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Processo não encontrado.</p>
        <Link to="/app/processos" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Voltar para processos
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/app/processos')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Processo #{processo.numero_processo.toString().padStart(6, '0')}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[processo.status]}`}>
              {STATUS_LABELS[processo.status]}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {processo.titulo || 'Sem título'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Dados do Fornecedor
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Razão Social</p>
                <p className="font-medium">{processo.fornecedor?.razao_social || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CNPJ</p>
                <p className="font-medium">{processo.fornecedor?.cnpj || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">E-mail</p>
                <p className="font-medium">{processo.fornecedor?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contato</p>
                <p className="font-medium">{processo.fornecedor?.contato_nome || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Dados do Produto
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="font-medium">{processo.descricao_produto_resumo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código de Barra</p>
                <p className="font-medium">{processo.codigo_barra_resumo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Comprador Responsável</p>
                <p className="font-medium">{processo.comprador_responsavel?.nome || '-'}</p>
              </div>
            </div>
          </div>

          {processo.observacao_interna && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Observação Interna</h2>
              <p className="text-gray-600">{processo.observacao_interna}</p>
            </div>
          )}

          {(processo.status === 'aguardando_fornecedor' || processo.status === 'enviado_pelo_fornecedor' || ['em_analise_comprador', 'correcao_solicitada_fornecedor', 'correcao_solicitada_comprador', 'aguardando_aprovacao', 'aprovado_para_cadastro', 'reprovado', 'em_cadastro', 'cadastrado', 'pdf_gerado'].includes(processo.status)) && (
            <DadosFornecedorCard dados={dadosFornecedor} />
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações</h2>
            <div className="space-y-3">
              {processo.status === 'rascunho' && (
                <>
                  <button
                    onClick={() => handleMudarStatus('aguardando_fornecedor')}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
                    <span>Enviar para Fornecedor</span>
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    <span>Cancelar Processo</span>
                  </button>
                </>
              )}
              
              {processo.status === 'aguardando_fornecedor' && (
                <>
                  <GerarLinkFornecedorButton 
                    processoId={processo.id} 
                    status={processo.status} 
                  />
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    <span>Cancelar Processo</span>
                  </button>
                </>
              )}

              {processo.status === 'enviado_pelo_fornecedor' && (
                <>
                  <button
                    onClick={async () => {
                      if (!profile?.id) return
                      setIsProcessing(true)
                      const success = await dadosCompradorService.iniciarAnalise(processo.id, profile.id)
                      if (success) {
                        const updated = await processosService.buscarProcessoPorId(processo.id)
                        setProcesso(updated)
                        const historicoAtualizado = await processosService.listarHistorico(processo.id)
                        setHistorico(historicoAtualizado)
                      }
                      setIsProcessing(false)
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Play size={18} />
                    <span>Iniciar Análise</span>
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    <span>Cancelar Processo</span>
                  </button>
                </>
              )}

              {processo.status === 'em_analise_comprador' && (
                <>
                  <button
                    onClick={() => navigate(`/app/processos/${processo.id}/comprador`)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={18} />
                    <span>Preencher Análise</span>
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    <span>Cancelar Processo</span>
                  </button>
                </>
              )}

              {processo.status === 'correcao_solicitada_fornecedor' && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="mx-auto text-yellow-600 mb-2" size={24} />
                  <p className="text-sm text-yellow-800">
                    Aguardando correção do fornecedor.
                  </p>
                  {processo.motivo_correcao && (
                    <p className="text-xs text-yellow-700 mt-2">
                      Motivo: {processo.motivo_correcao}
                    </p>
                  )}
                </div>
              )}

              {processo.status === 'correcao_solicitada_comprador' && (
                <div className="space-y-3">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <AlertTriangle className="mx-auto text-orange-600 mb-2" size={24} />
                    <p className="text-sm text-orange-800">
                      Correção solicitada pelo aprovador.
                    </p>
                    {processo.motivo_correcao && (
                      <p className="text-xs text-orange-700 mt-2">
                        Motivo: {processo.motivo_correcao}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (!profile?.id) return
                      setIsProcessing(true)
                      try {
                        await processosService.alterarStatusProcesso(
                          processo.id,
                          'em_analise_comprador',
                          'Comprador iniciando correção solicitada',
                          profile.id
                        )
                        const updated = await processosService.buscarProcessoPorId(processo.id)
                        setProcesso(updated)
                        const historicoAtualizado = await processosService.listarHistorico(processo.id)
                        setHistorico(historicoAtualizado)
                        navigate(`/app/processos/${processo.id}/comprador`)
                      } catch (error) {
                        console.error('Error correcting:', error)
                      } finally {
                        setIsProcessing(false)
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    <Edit size={18} />
                    <span>Corrigir Dados</span>
                  </button>
                </div>
              )}

              {processo.status === 'aprovado_para_cadastro' && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                  <p className="text-sm text-green-800">
                    Processo aprovado para cadastro.
                  </p>
                  {processo.aprovador_id && (
                    <p className="text-xs text-green-600 mt-2">
                      Aprovado por: {processo.aprovador?.nome || 'Usuário'}
                    </p>
                  )}
                  {processo.aprovado_at && (
                    <p className="text-xs text-green-600">
                      Data: {format(new Date(processo.aprovado_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              )}

              {processo.status === 'reprovado' && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="mx-auto text-red-600 mb-2" size={24} />
                  <p className="text-sm text-red-800">
                    Processo reprovado.
                  </p>
                  {processo.motivo_reprovacao && (
                    <p className="text-xs text-red-700 mt-2">
                      Motivo: {processo.motivo_reprovacao}
                    </p>
                  )}
                  {processo.aprovador_id && (
                    <p className="text-xs text-red-600 mt-2">
                      Reprovardo por: {processo.aprovador?.nome || 'Usuário'}
                    </p>
                  )}
                </div>
              )}

              {processo.status === 'aguardando_aprovacao' && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                  <p className="text-sm text-green-800">
                    Processo enviado para aprovação.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Aguardando comprador aprovador.
                  </p>
                </div>
              )}

              {processo.status === 'em_cadastro' && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <CheckCircle className="mx-auto text-yellow-600 mb-2" size={24} />
                  <p className="text-sm text-yellow-800">
                    Processo em cadastro.
                  </p>
                  {(processo as any).cadastro_responsavel?.nome && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Responsável: {(processo as any).cadastro_responsavel?.nome}
                    </p>
                  )}
                </div>
              )}

              {processo.status === 'cadastrado' && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                  <p className="text-sm text-green-800">
                    Produto cadastrado.
                  </p>
                  {processo.codigo_interno_produto && (
                    <p className="text-xs text-green-600 mt-2">
                      Código: {processo.codigo_interno_produto}
                    </p>
                  )}
                </div>
              )}

              {processo.status === 'pdf_gerado' && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="mx-auto text-purple-600 mb-2" size={24} />
                  <p className="text-sm text-purple-800">
                    PDF gerado com sucesso.
                  </p>
                  <a
                    href={processo.pdf_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                  >
                    Baixar PDF
                  </a>
                </div>
              )}

              {!['rascunho', 'aguardando_fornecedor', 'enviado_pelo_fornecedor', 'em_analise_comprador', 'correcao_solicitada_fornecedor', 'aguardando_aprovacao'].includes(processo.status) && (
                <p className="text-gray-500 text-sm text-center">Nenhuma ação disponível</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History size={20} />
              Histórico
            </h2>
            {historico.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum histórico registrado.</p>
            ) : (
              <div className="space-y-4">
                {historico.map((item, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                    <p className="text-sm font-medium text-gray-900">{item.acao}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {item.usuario && ` - ${item.usuario.nome}`}
                    </p>
                    {item.observacao && (
                      <p className="text-sm text-gray-600 mt-1">{item.observacao}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Criado em</h2>
            <p className="text-gray-900">
              {format(new Date(processo.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <h2 className="text-sm font-medium text-gray-500 mb-2 mt-4">Última atualização</h2>
            <p className="text-gray-900">
              {format(new Date(processo.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cancelar Processo</h2>
            <p className="text-gray-600 mb-4">Informe o motivo do cancelamento:</p>
            <textarea
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4"
              rows={3}
              placeholder="Motivo do cancelamento (opcional)"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Voltar
              </button>
              <button
                onClick={() => handleMudarStatus('cancelado')}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cadastroService } from '@/services/cadastroService'
import { verificarPodeCadastrar } from '@/types/cadastro'
import { CADASTRO_STATUS_LABELS } from '@/types/cadastro'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Search, CheckCircle, Clock, FileCheck, Download, User, AlertCircle } from 'lucide-react'
import type { ProcessoCadastro } from '@/types/database'

export default function CadastroPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [processos, setProcessos] = useState<ProcessoCadastro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!verificarPodeCadastrar(profile)) {
      navigate('/app')
      return
    }

    loadProcessos()
  }, [profile, navigate])

  async function loadProcessos() {
    setIsLoading(true)
    try {
      const data = await cadastroService.listarProcessosCadastro()
      setProcessos(data)
    } catch (error) {
      console.error('Error loading processos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProcessos = processos.filter(processo => {
    const search = searchTerm.toLowerCase()
    return (
      processo.numero_processo.toString().includes(search) ||
      processo.descricao_produto_resumo?.toLowerCase().includes(search) ||
      processo.codigo_barra_resumo?.toLowerCase().includes(search) ||
      (processo as any).fornecedor?.razao_social?.toLowerCase().includes(search)
    )
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado_para_cadastro':
        return <CheckCircle className="text-blue-500" size={16} />
      case 'em_cadastro':
        return <Clock className="text-yellow-500" size={16} />
      case 'cadastrado':
        return <FileCheck className="text-green-500" size={16} />
      case 'pdf_gerado':
        return <Download className="text-purple-500" size={16} />
      default:
        return <FileText className="text-gray-400" size={16} />
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fila de Cadastro</h1>
        <p className="text-gray-600 mt-1">Processos aprovados prontos para cadastro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Aguardando</p>
              <p className="text-xl font-bold text-gray-900">
                {processos.filter(p => p.status === 'aprovado_para_cadastro').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Em Cadastro</p>
              <p className="text-xl font-bold text-gray-900">
                {processos.filter(p => p.status === 'em_cadastro').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cadastrados</p>
              <p className="text-xl font-bold text-gray-900">
                {processos.filter(p => p.status === 'cadastrado').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">PDFs Gerados</p>
              <p className="text-xl font-bold text-gray-900">
                {processos.filter(p => p.status === 'pdf_gerado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por número, produto, código de barra ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredProcessos.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">
              {searchTerm
                ? 'Nenhum processo encontrado para a busca.'
                : 'Nenhum processo aprovado para cadastro encontrado.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comprador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aprovado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProcessos.map((processo) => (
                  <tr key={processo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        #{processo.numero_processo.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {processo.descricao_produto_resumo || '-'}
                        </p>
                        {processo.codigo_barra_resumo && (
                          <p className="text-xs text-gray-500">
                            Código: {processo.codigo_barra_resumo}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(processo as any).fornecedor?.razao_social || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(processo as any).comprador_responsavel?.nome || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {processo.aprovado_at
                        ? format(new Date(processo.aprovado_at), "dd/MM/yyyy", { locale: ptBR })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(processo.status)}`}>
                        {getStatusIcon(processo.status)}
                        {CADASTRO_STATUS_LABELS[processo.status as keyof typeof CADASTRO_STATUS_LABELS] || processo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(processo as any).cadastro_responsavel?.nome || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/app/cadastro/${processo.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
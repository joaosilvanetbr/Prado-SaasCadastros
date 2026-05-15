import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { aprovacoesService } from '@/services/aprovacoesService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react'

interface ProcessoAguardando {
  id: string
  numero_processo: number
  titulo: string | null
  descricao_produto_resumo: string | null
  enviado_aprovacao_at: string | null
  status: string
  fornecedor?: {
    razao_social: string
  } | null
  comprador_responsavel?: {
    nome: string
  } | null
}

export default function AprovacoesPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [processos, setProcessos] = useState<ProcessoAguardando[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!profile?.pode_aprovar) {
      navigate('/app/dashboard')
      return
    }

    async function loadData() {
      try {
        const data = await aprovacoesService.listarProcessosAguardandoAprovacao()
        setProcessos(data)
      } catch (error) {
        console.error('Error loading approvals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [profile, navigate])

  const filteredProcessos = processos.filter(p => {
    const search = searchTerm.toLowerCase()
    return (
      p.numero_processo.toString().includes(search) ||
      p.titulo?.toLowerCase().includes(search) ||
      p.fornecedor?.razao_social.toLowerCase().includes(search) ||
      p.comprador_responsavel?.nome.toLowerCase().includes(search)
    )
  })

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
        <h1 className="text-2xl font-bold text-gray-900">Aprovações</h1>
        <p className="text-gray-600">Processos aguardando aprovação</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por número, produto, fornecedor ou comprador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Aguardando aprovação</p>
            <p className="text-2xl font-bold text-gray-900">{processos.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fornecedor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Comprador</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Enviado em</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProcessos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum processo aguardando aprovação
                  </td>
                </tr>
              ) : (
                filteredProcessos.map((processo) => (
                  <tr key={processo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-blue-600">
                        #{processo.numero_processo.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{processo.titulo || '-'}</p>
                      <p className="text-sm text-gray-500">{processo.descricao_produto_resumo || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{processo.fornecedor?.razao_social || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{processo.comprador_responsavel?.nome || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 text-sm">
                        {processo.enviado_aprovacao_at
                          ? format(new Date(processo.enviado_aprovacao_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/app/processos/${processo.id}/aprovacao`)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
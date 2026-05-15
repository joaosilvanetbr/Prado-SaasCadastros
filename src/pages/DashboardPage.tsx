import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { processosService } from '@/services/processosService'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const contagens = await processosService.contarProcessosPorStatus()
        setStats(contagens)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  const getCount = (status: string) => stats[status] || 0

  const cardsComprador = [
    { label: 'Rascunhos', status: 'rascunho', icon: FileText, color: 'bg-gray-500' },
    { label: 'Aguardando Fornecedor', status: 'aguardando_fornecedor', icon: Clock, color: 'bg-blue-500' },
    { label: 'Em Andamento', status: 'enviado_pelo_fornecedor', icon: Clock, color: 'bg-purple-500' },
    { label: 'Finalizados', status: 'cadastrado', icon: CheckCircle, color: 'bg-green-500' },
  ]

  const cardsAdmin = [
    { label: 'Total de Processos', status: 'total', icon: FileText, color: 'bg-blue-600' },
    { label: 'Rascunhos', status: 'rascunho', icon: FileText, color: 'bg-gray-500' },
    { label: 'Aguardando Fornecedor', status: 'aguardando_fornecedor', icon: Clock, color: 'bg-blue-500' },
    { label: 'Cancelados', status: 'cancelado', icon: XCircle, color: 'bg-gray-400' },
  ]

  const cardsCadastro = [
    { label: 'Aguardando Cadastro', status: 'aprovado_para_cadastro', icon: Clock, color: 'bg-green-500' },
    { label: 'Em Cadastro', status: 'em_cadastro', icon: Clock, color: 'bg-blue-500' },
    { label: 'Cadastrados', status: 'cadastrado', icon: CheckCircle, color: 'bg-green-600' },
    { label: 'PDFs Gerados', status: 'pdf_gerado', icon: CheckCircle, color: 'bg-green-800' },
  ]

  const getCards = () => {
    if (profile?.perfil === 'admin') return cardsAdmin
    if (profile?.perfil === 'cadastro') return cardsCadastro
    return cardsComprador
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral dos processos de cadastro</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getCards().map((card) => {
            const Icon = card.icon
            const count = card.status === 'total' 
              ? Object.values(stats).reduce((a, b) => a + b, 0)
              : getCount(card.status)

            return (
              <div key={card.status} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Processos Recentes</h2>
          <Link 
            to="/app/processos" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : Object.keys(stats).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum processo encontrado.</p>
            <Link 
              to="/app/processos/novo" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
            >
              Criar primeiro processo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats).slice(0, 5).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[status] || status}
                  </span>
                </div>
                <span className="text-gray-600 font-medium">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
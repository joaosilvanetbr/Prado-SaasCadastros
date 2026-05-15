import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { solicitarCorrecaoSchema, type SolicitarCorrecaoFormData } from '@/validations/compradorProdutoSchema'
import { dadosCompradorService } from '@/services/dadosCompradorService'

interface SolicitarCorrecaoDialogProps {
  processoId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SolicitarCorrecaoDialog({
  processoId,
  isOpen,
  onClose,
  onSuccess,
}: SolicitarCorrecaoDialogProps) {
  const [motivo, setMotivo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = solicitarCorrecaoSchema.safeParse({ motivo })
    
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Motivo inválido')
      return
    }

    setIsLoading(true)
    try {
      const { profile } = await import('@/contexts/AuthContext').then(m => m.useAuth())
      
      if (!profile?.id) {
        setError('Usuário não identificado')
        return
      }

      const success = await dadosCompradorService.solicitarCorrecaoFornecedor(
        processoId,
        profile.id,
        result.data.motivo
      )

      if (success) {
        onSuccess()
        onClose()
        setMotivo('')
      } else {
        setError('Erro ao solicitar correção')
      }
    } catch (err) {
      setError('Erro ao solicitar correção')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Solicitar Correção</h2>
              <p className="text-sm text-gray-500">Ao fornecedor</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da correção *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Informe o motivo da correção. Ex: A cubagem informada não confere com as dimensões da caixa."
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 10 caracteres. O fornecedor receberá esta informação.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Solicitar Correção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
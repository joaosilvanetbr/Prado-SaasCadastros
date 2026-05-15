import { useState } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import type { CadastroFormData } from '@/types/cadastro'
import { CODIGO_INTERNO_OBRIGATORIO } from '@/types/cadastro'

interface MarcarCadastradoDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: CadastroFormData) => Promise<void>
}

export default function MarcarCadastradoDialog({ isOpen, onClose, onConfirm }: MarcarCadastradoDialogProps) {
  const [codigoInterno, setCodigoInterno] = useState('')
  const [observacao, setObservacao] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (CODIGO_INTERNO_OBRIGATORIO && !codigoInterno.trim()) {
      setError('Código interno do produto é obrigatório')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await onConfirm({
        codigo_interno_produto: codigoInterno.trim() || null,
        observacao_cadastro: observacao.trim() || null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar como cadastrado')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirmar cadastro do produto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Confirme que o produto foi cadastrado no sistema interno antes de continuar.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código interno do produto {CODIGO_INTERNO_OBRIGATORIO && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={codigoInterno}
              onChange={(e) => {
                setCodigoInterno(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: 12345"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação de cadastro (opcional)
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={3}
              placeholder="Observações sobre o cadastro..."
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Confirmar cadastro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
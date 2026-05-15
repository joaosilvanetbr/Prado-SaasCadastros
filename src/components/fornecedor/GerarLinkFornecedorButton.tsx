import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fornecedorLinkService } from '@/services/fornecedorLinkService'
import { Link2, Copy, Check, RefreshCw } from 'lucide-react'

interface GerarLinkFornecedorButtonProps {
  processoId: string
  status: string
  onLinkGerado?: (token: string) => void
}

export default function GerarLinkFornecedorButton({ processoId, status, onLinkGerado }: GerarLinkFornecedorButtonProps) {
  const { profile } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const [linkGerado, setLinkGerado] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const podeGerar = status === 'rascunho' || status === 'aguardando_fornecedor'

  const handleGerarLink = async () => {
    if (!profile?.id) return

    setIsLoading(true)
    try {
      const result = await fornecedorLinkService.gerarLinkFornecedor(processoId, profile.id)
      setLinkGerado(`${window.location.origin}/fornecedor/${result.token}`)
      setShowDialog(true)
      onLinkGerado?.(result.token)
    } catch (error) {
      console.error('Error generating link:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(linkGerado)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const handleRegerar = async () => {
    setLinkGerado('')
    await handleGerarLink()
  }

  if (!podeGerar) return null

  return (
    <>
      <button
        onClick={handleGerarLink}
        disabled={isLoading}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {status === 'aguardando_fornecedor' ? (
          <>
            <RefreshCw size={18} />
            <span>Regerar Link</span>
          </>
        ) : (
          <>
            <Link2 size={18} />
            <span>Gerar Link para Fornecedor</span>
          </>
        )}
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Link Gerado com Sucesso</h2>
            <p className="text-gray-600 mb-4">
              Envie este link para o fornecedor preencher a ficha:
            </p>
            
            {linkGerado ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={linkGerado}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopiar}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copiar link"
                  >
                    {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                  </button>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={handleRegerar}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <RefreshCw size={18} />
                    <span>Regerar Link</span>
                  </button>
                  <button
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
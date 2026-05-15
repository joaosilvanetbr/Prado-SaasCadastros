import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fornecedorProdutoSchema, FornecedorProdutoFormData } from '@/validations/fornecedorProdutoSchema'
import { fornecedorLinkService } from '@/services/fornecedorLinkService'
import { dadosFornecedorService } from '@/services/dadosFornecedorService'
import { formatCNPJ, formatCurrency, calculateCubagem } from '@/lib/formatters'
import FornecedorLayout from './FornecedorLayout'
import { AlertCircle, CheckCircle, Send, Save } from 'lucide-react'

export default function FornecedorForm() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [validationResult, setValidationResult] = useState<{ valid: boolean; reason?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FornecedorProdutoFormData>({
    resolver: zodResolver(fornecedorProdutoSchema),
  })

  const altura = watch('altura_cm')
  const largura = watch('largura_cm')
  const comprimento = watch('comprimento_cm')

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidationResult({ valid: false, reason: 'invalid' })
        setIsLoading(false)
        return
      }

      const result = await fornecedorLinkService.validarTokenFornecedor(token)
      setValidationResult(result)
      setIsLoading(false)
    }

    validateToken()
  }, [token])

  useEffect(() => {
    if (altura && largura && comprimento) {
      const cubagem = calculateCubagem(Number(altura), Number(largura), Number(comprimento))
      setValue('cubagem_m3', cubagem)
    }
  }, [altura, largura, comprimento, setValue])

  const onSubmit = async (data: FornecedorProdutoFormData) => {
    if (!validationResult?.valid || !validationResult.linkId) return

    setIsSubmitting(true)
    setError('')

    try {
      await dadosFornecedorService.enviarDadosFornecedor(
        validationResult.processoId!,
        data,
        validationResult.linkId
      )

      await processosService?.alterarStatusProcesso?.(
        validationResult.processoId!,
        'enviado_pelo_fornecedor',
        'Fornecedor enviou dados do produto',
        'fornecedor'
      )

      setSubmitSuccess(true)
    } catch (err) {
      console.error('Error sending data:', err)
      setError('Erro ao enviar os dados. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <FornecedorLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FornecedorLayout>
    )
  }

  if (submitSuccess) {
    return (
      <FornecedorLayout>
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ficha enviada com sucesso!</h2>
          <p className="text-gray-600">Os dados foram encaminhados para o comprador responsável.</p>
        </div>
      </FornecedorLayout>
    )
  }

  if (!validationResult?.valid) {
    const messages: Record<string, string> = {
      invalid: 'Link inválido. Solicite um novo link ao comprador responsável.',
      expired: 'Este link expirou. Solicite um novo link ao comprador responsável.',
      already_submitted: 'Esta ficha já foi enviada.',
      cancelled: 'Este processo foi cancelado.',
      not_allowed: 'Você não tem permissão para acessar esta ficha.',
      error: 'Não foi possível carregar a ficha. Tente novamente ou solicite apoio ao comprador responsável.',
    }

    return (
      <FornecedorLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600">{messages[validationResult?.reason || 'error']}</p>
        </div>
      </FornecedorLayout>
    )
  }

  return (
    <FornecedorLayout>
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Preencha os dados do produto com atenção. Após o envio, a ficha será encaminhada ao comprador responsável.
        </p>
        <p className="text-sm text-gray-500">
          Processo nº {validationResult.numeroProcesso?.toString().padStart(6, '0')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Produto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barra *
              </label>
              <input
                {...register('codigo_barra')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Código numérico do produto"
              />
              {errors.codigo_barra && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo_barra.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Produto *
              </label>
              <input
                {...register('descricao_produto')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Nome/descrição do produto"
              />
              {errors.descricao_produto && (
                <p className="text-red-500 text-sm mt-1">{errors.descricao_produto.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <input
                {...register('marca')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Marca do produto"
              />
              {errors.marca && (
                <p className="text-red-500 text-sm mt-1">{errors.marca.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gramagem *
              </label>
              <input
                {...register('gramagem')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 500g, 1kg, 350ml"
              />
              {errors.gramagem && (
                <p className="text-red-500 text-sm mt-1">{errors.gramagem.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usa Balança? *
              </label>
              <select
                {...register('usa_balanca')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Selecione</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
              {errors.usa_balanca && (
                <p className="text-red-500 text-sm mt-1">{errors.usa_balanca.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Custo *
              </label>
              <input
                {...register('preco_custo')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="R$ 0,00"
              />
              {errors.preco_custo && (
                <p className="text-red-500 text-sm mt-1">{errors.preco_custo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referência
              </label>
              <input
                {...register('referencia')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Código de referência (opcional)"
              />
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Fornecedor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ *
              </label>
              <input
                {...register('cnpj')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="00.000.000/0000-00"
              />
              {errors.cnpj && (
                <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Fornecedor *
              </label>
              <input
                {...register('fornecedor_nome')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Razão social ou nome"
              />
              {errors.fornecedor_nome && (
                <p className="text-red-500 text-sm mt-1">{errors.fornecedor_nome.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Caixa e Display</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código da Caixa
              </label>
              <input
                {...register('codigo_caixa')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Código da caixa (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade na Caixa
              </label>
              <input
                {...register('quantidade_na_caixa')}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Quantidade por caixa"
              />
              {errors.quantidade_na_caixa && (
                <p className="text-red-500 text-sm mt-1">{errors.quantidade_na_caixa.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código do Display
              </label>
              <input
                {...register('codigo_display')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Código do display (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade do Display
              </label>
              <input
                {...register('quantidade_do_display')}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Quantidade por display"
              />
              {errors.quantidade_do_display && (
                <p className="text-red-500 text-sm mt-1">{errors.quantidade_do_display.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Logísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura (cm) *
              </label>
              <input
                {...register('altura_cm')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Altura em centímetros"
              />
              {errors.altura_cm && (
                <p className="text-red-500 text-sm mt-1">{errors.altura_cm.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largura (cm) *
              </label>
              <input
                {...register('largura_cm')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Largura em centímetros"
              />
              {errors.largura_cm && (
                <p className="text-red-500 text-sm mt-1">{errors.largura_cm.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprimento (cm) *
              </label>
              <input
                {...register('comprimento_cm')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Comprimento em centímetros"
              />
              {errors.comprimento_cm && (
                <p className="text-red-500 text-sm mt-1">{errors.comprimento_cm.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cubagem (m³)
              </label>
              <input
                {...register('cubagem_m3')}
                type="number"
                step="0.000001"
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none"
                placeholder="Calculado automaticamente"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Bruto (kg) *
              </label>
              <input
                {...register('peso_bruto_kg')}
                type="number"
                step="0.001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Peso em kg"
              />
              {errors.peso_bruto_kg && (
                <p className="text-red-500 text-sm mt-1">{errors.peso_bruto_kg.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palete
              </label>
              <input
                {...register('palete')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Código da palete (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lastro
              </label>
              <input
                {...register('lastro')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Código do lastro (opcional)"
              />
            </div>
          </div>
        </section>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Envio</h2>
              <p className="text-gray-600 mb-6">
                Após enviar, você não poderá alterar os dados, exceto se o comprador solicitar correção.
                Deseja enviar a ficha?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Envio'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
            <span>Enviar Ficha</span>
          </button>
        </div>
      </form>
    </FornecedorLayout>
  )
}
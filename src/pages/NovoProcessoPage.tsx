import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { processosService } from '@/services/processosService'
import { novoProcessoSchema, NovoProcessoFormData } from '@/validations/processoSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, Send } from 'lucide-react'

export default function NovoProcessoPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NovoProcessoFormData>({
    resolver: zodResolver(novoProcessoSchema),
  })

  const onSubmit = async (data: NovoProcessoFormData) => {
    if (!profile?.id) return
    
    setIsLoading(true)
    setError('')

    try {
      const processo = await processosService.criarProcesso(data, profile.id)
      navigate(`/app/processos/${processo.id}`)
    } catch (err) {
      console.error('Error creating processo:', err)
      setError('Erro ao criar processo. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Processo</h1>
          <p className="text-gray-600 mt-1">Crie um novo processo de cadastro de produto</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Título do Processo *
            </label>
            <input
              id="titulo"
              type="text"
              {...register('titulo')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Cadastro de Produto - Marca X"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Fornecedor</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fornecedor_razao_social" className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social / Nome do Fornecedor *
                </label>
                <input
                  id="fornecedor_razao_social"
                  type="text"
                  {...register('fornecedor_razao_social')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nome da empresa ou fornecedor"
                />
                {errors.fornecedor_razao_social && (
                  <p className="text-red-500 text-sm mt-1">{errors.fornecedor_razao_social.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="fornecedor_cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  id="fornecedor_cnpj"
                  type="text"
                  {...register('fornecedor_cnpj')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label htmlFor="fornecedor_email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail do Fornecedor
                </label>
                <input
                  id="fornecedor_email"
                  type="email"
                  {...register('fornecedor_email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="contato@fornecedor.com"
                />
                {errors.fornecedor_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.fornecedor_email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="fornecedor_contato_nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Contato
                </label>
                <input
                  id="fornecedor_contato_nome"
                  type="text"
                  {...register('fornecedor_contato_nome')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nome da pessoa de contato"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Produto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="descricao_produto_resumo" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Resumida do Produto
                </label>
                <input
                  id="descricao_produto_resumo"
                  type="text"
                  {...register('descricao_produto_resumo')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Breve descrição do produto"
                />
              </div>

              <div>
                <label htmlFor="codigo_barra_resumo" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Barra
                </label>
                <input
                  id="codigo_barra_resumo"
                  type="text"
                  {...register('codigo_barra_resumo')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Código de barras (EAN)"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div>
              <label htmlFor="observacao_interna" className="block text-sm font-medium text-gray-700 mb-1">
                Observação Interna
              </label>
              <textarea
                id="observacao_interna"
                rows={3}
                {...register('observacao_interna')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Observações internas para referência futura"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/app/processos')}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  <Save size={20} />
                  <span>Salvar Rascunho</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
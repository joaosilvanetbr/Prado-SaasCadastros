import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { compradorProdutoSchema, type CompradorProdutoFormData } from '@/validations/compradorProdutoSchema'
import type { DadosCompradorFormData } from '@/types/comprador'
import { dadosCompradorService } from '@/services/dadosCompradorService'
import { processosService } from '@/services/processosService'
import { dadosFornecedorService } from '@/services/dadosFornecedorService'
import type { DadosFornecedorProduto } from '@/types/fornecedor'
import type { DadosCompradorProduto, ProcessoMixLoja } from '@/types/comprador'
import { formatCurrency } from '@/lib/formatters'
import MixLojasSelector from './MixLojasSelector'
import TipoEntregaSelector from './TipoEntregaSelector'
import SolicitarCorrecaoDialog from './SolicitarCorrecaoDialog'
import DadosFornecedorCard from '@/components/processos/DadosFornecedorCard'
import { 
  Save, 
  Send, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  MapPin,
  ArrowLeft
} from 'lucide-react'

export default function CompradorForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCorrecaoDialog, setShowCorrecaoDialog] = useState(false)
  const [dadosFornecedor, setDadosFornecedor] = useState<DadosFornecedorProduto | null>(null)
  const [dadosComprador, setDadosComprador] = useState<DadosCompradorProduto | null>(null)
  const [mixLojas, setMixLojas] = useState<ProcessoMixLoja[]>([])
  const [showFornecedorReview, setShowFornecedorReview] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompradorProdutoFormData>({
    resolver: zodResolver(compradorProdutoSchema),
    defaultValues: {
      descricao_prado: '',
      entrega_cd: false,
      entrega_loja: false,
      cross_dock: false,
      substituicao: false,
      departamento: '',
      categoria: '',
      subcategoria: '',
      segmento: '',
      subsegmento: '',
      margem_lucro: 0,
      preco_prado: 0,
      preco_pradao: undefined,
      codigo_item_similar: '',
      lojasSelecionadas: [],
    },
  })

  const watchedValues = watch()
  const lojasSelecionadas = watchedValues.lojasSelecionadas

  useEffect(() => {
    async function loadData() {
      if (!id) return
      
      try {
        const [fornecedorData, compradorData, mixLojasData] = await Promise.all([
          dadosFornecedorService.buscarDadosFornecedorPorProcesso(id),
          dadosCompradorService.buscarDadosCompradorPorProcesso(id),
          dadosCompradorService.buscarMixLojasPorProcesso(id)
        ])
        
        setDadosFornecedor(fornecedorData)
        setDadosComprador(compradorData)
        setMixLojas(mixLojasData)

        // Preencher formulário com dados existentes
        if (compradorData) {
          setValue('descricao_prado', compradorData.descricao_prado || '')
          setValue('entrega_cd', compradorData.entrega_cd)
          setValue('entrega_loja', compradorData.entrega_loja)
          setValue('cross_dock', compradorData.cross_dock)
          setValue('substituicao', compradorData.substituicao || false)
          setValue('departamento', compradorData.departamento || '')
          setValue('categoria', compradorData.categoria || '')
          setValue('subcategoria', compradorData.subcategoria || '')
          setValue('segmento', compradorData.segmento || '')
          setValue('subsegmento', compradorData.subsegmento || '')
          setValue('margem_lucro', compradorData.margem_lucro || 0)
          setValue('preco_prado', compradorData.preco_prado || 0)
          setValue('preco_pradao', compradorData.preco_pradao || undefined)
          setValue('codigo_item_similar', compradorData.codigo_item_similar || '')
        }

        // Preencher mix de lojas
        if (mixLojasData.length > 0) {
          setValue('lojasSelecionadas', mixLojasData.map(m => m.loja_codigo))
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [id, setValue])

  const onSubmitSalvarRascunho = async (data: CompradorProdutoFormData) => {
    if (!id || !profile?.id) return
    
    setIsSaving(true)
    try {
      const result = await dadosCompradorService.salvarRascunhoComprador(id, profile.id, data as unknown as DadosCompradorFormData)
      if (result.success) {
        alert('Rascunho salvo com sucesso!')
      } else {
        alert('Erro ao salvar rascunho')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Erro ao salvar rascunho')
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmitEnviarAprovacao = async (data: CompradorProdutoFormData) => {
    if (!id || !profile?.id) return
    
    const confirm = window.confirm(
      'Tem certeza que deseja enviar este processo para aprovação? Após o envio, o formulário ficará bloqueado para edição.'
    )
    
    if (!confirm) return
    
    setIsSaving(true)
    try {
      const result = await dadosCompradorService.enviarParaAprovacao(id, profile.id, data as unknown as DadosCompradorFormData)
      if (result.success) {
        alert('Processo enviado para aprovação!')
        navigate('/app/processos')
      } else {
        alert('Erro ao enviar para aprovação')
      }
    } catch (error) {
      console.error('Error sending:', error)
      alert('Erro ao enviar para aprovação')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSuccessCorrecao = async () => {
    navigate(`/app/processos/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/app/processos/${id}`)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análise do Comprador</h1>
          <p className="text-gray-600">Preencha os dados comerciais do produto</p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Revisão do Fornecedor */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package size={20} />
              Dados do Fornecedor
            </h2>
            <button
              type="button"
              onClick={() => setShowFornecedorReview(!showFornecedorReview)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showFornecedorReview ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showFornecedorReview && (
            <DadosFornecedorCard dados={dadosFornecedor} />
          )}
        </div>

        {/* Dados Comerciais */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <DollarSign size={20} />
            Dados Comerciais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição Prado *
              </label>
              <input
                type="text"
                {...register('descricao_prado')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: ARROZ PARBOILIZADO TIPO 1 5KG"
              />
              {errors.descricao_prado && (
                <p className="text-sm text-red-600 mt-1">{errors.descricao_prado.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margem de Lucro (%) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('margem_lucro')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 25.50"
              />
              {errors.margem_lucro && (
                <p className="text-sm text-red-600 mt-1">{errors.margem_lucro.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Prado (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('preco_prado')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 25.90"
              />
              {errors.preco_prado && (
                <p className="text-sm text-red-600 mt-1">{errors.preco_prado.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Pradão (R$)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('preco_pradao')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 22.90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Item Similar
              </label>
              <input
                type="text"
                {...register('codigo_item_similar')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Código do produto similar"
              />
            </div>
          </div>
        </div>

        {/* Tipo de Entrega */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TipoEntregaSelector
            entrega_cd={watchedValues.entrega_cd}
            entrega_loja={watchedValues.entrega_loja}
            cross_dock={watchedValues.cross_dock}
            onChange={(campo, valor) => setValue(campo, valor)}
            error={errors.entrega_cd?.message}
          />
        </div>

        {/* Substituição */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Substituição *</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register('substituicao')}
                value="true"
                checked={watchedValues.substituicao === true}
                onChange={() => setValue('substituicao', true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Sim</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register('substituicao')}
                value="false"
                checked={watchedValues.substituicao === false}
                onChange={() => setValue('substituicao', false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Não</span>
            </label>
          </div>
          {errors.substituicao && (
            <p className="text-sm text-red-600 mt-1">{errors.substituicao.message}</p>
          )}
        </div>

        {/* Mix de Lojas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <MixLojasSelector
            selecionadas={lojasSelecionadas}
            onChange={(codigos) => setValue('lojasSelecionadas', codigos)}
            error={errors.lojasSelecionadas?.message}
          />
        </div>

        {/* Estrutura Mercadológica */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <MapPin size={20} />
            Estrutura Mercadológica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento *
              </label>
              <input
                type="text"
                {...register('departamento')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: Alimentos"
              />
              {errors.departamento && (
                <p className="text-sm text-red-600 mt-1">{errors.departamento.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <input
                type="text"
                {...register('categoria')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: Grãos e Cereais"
              />
              {errors.categoria && (
                <p className="text-sm text-red-600 mt-1">{errors.categoria.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoria
              </label>
              <input
                type="text"
                {...register('subcategoria')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Subcategoria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segmento
              </label>
              <input
                type="text"
                {...register('segmento')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Segmento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subsegmento
              </label>
              <input
                type="text"
                {...register('subsegmento')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Subsegmento"
              />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit(onSubmitSalvarRascunho)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>Salvar Rascunho</span>
            </button>
            
            <button
              type="button"
              onClick={() => setShowCorrecaoDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <AlertTriangle size={18} />
              <span>Solicitar Correção</span>
            </button>
            
            <button
              type="button"
              onClick={handleSubmit(onSubmitEnviarAprovacao)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
              <span>Enviar para Aprovação</span>
            </button>
          </div>
        </div>
      </form>

      <SolicitarCorrecaoDialog
        processoId={id!}
        isOpen={showCorrecaoDialog}
        onClose={() => setShowCorrecaoDialog(false)}
        onSuccess={handleSuccessCorrecao}
      />
    </div>
  )
}
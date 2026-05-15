import { supabase } from '@/lib/supabase'
import { NovoProcessoFormData } from '@/validations/processoSchema'
import { ProcessoCadastro, ProcessoStatus, ProcessoWithRelations, HistoricoProcesso } from '@/types/database'

interface CreateProcessoData {
  titulo: string
  fornecedor_id?: string
  fornecedor_razao_social?: string
  fornecedor_cnpj?: string
  fornecedor_email?: string
  fornecedor_contato_nome?: string
  descricao_produto_resumo?: string
  codigo_barra_resumo?: string
  observacao_interna?: string
}

interface UpdateProcessoData {
  titulo?: string
  fornecedor_id?: string
  descricao_produto_resumo?: string
  codigo_barra_resumo?: string
  observacao_interna?: string
  status?: ProcessoStatus
}

export const processosService = {
  async listarProcessos(compradorId?: string, status?: string) {
    let query = supabase
      .from('processos_cadastro')
      .select(`
        *,
        fornecedor:fornecedores(*),
        comprador_responsavel:profiles!comprador_responsavel_id(*),
        aprovador:profiles!aprovador_id(*)
      `)
      .order('created_at', { ascending: false })

    if (compradorId) {
      query = query.eq('comprador_responsavel_id', compradorId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as unknown as ProcessoWithRelations[]
  },

  async buscarProcessoPorId(id: string) {
    const { data, error } = await supabase
      .from('processos_cadastro')
      .select(`
        *,
        fornecedor:fornecedores(*),
        comprador_responsavel:profiles!comprador_responsavel_id(*),
        aprovador:profiles!aprovador_id(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as unknown as ProcessoWithRelations
  },

  async criarProcesso(data: NovoProcessoFormData, compradorId: string) {
    let fornecedorId = data.fornecedor_id

    if (!fornecedorId && data.fornecedor_razao_social) {
      const { data: novoFornecedor, error: errorFornecedor } = await supabase
        .from('fornecedores')
        .insert({
          razao_social: data.fornecedor_razao_social,
          cnpj: data.fornecedor_cnpj || null,
          email: data.fornecedor_email || null,
          contato_nome: data.fornecedor_contato_nome || null,
        })
        .select()
        .single()

      if (errorFornecedor) throw errorFornecedor
      fornecedorId = novoFornecedor.id
    }

    const { data: processo, error } = await supabase
      .from('processos_cadastro')
      .insert({
        titulo: data.titulo,
        fornecedor_id: fornecedorId,
        comprador_responsavel_id: compradorId,
        descricao_produto_resumo: data.descricao_produto_resumo,
        codigo_barra_resumo: data.codigo_barra_resumo,
        observacao_interna: data.observacao_interna,
        status: 'rascunho',
        created_by: compradorId,
      })
      .select()
      .single()

    if (error) throw error

    await this.registrarHistorico(processo.id, compradorId, null, 'rascunho', 'processo_criado', 'Processo criado')

    return processo as ProcessoCadastro
  },

  async atualizarProcesso(id: string, data: UpdateProcessoData, usuarioId: string) {
    const { data: processo, error } = await supabase
      .from('processos_cadastro')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: usuarioId,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return processo as ProcessoCadastro
  },

  async alterarStatusProcesso(id: string, novoStatus: ProcessoStatus, observacao: string, usuarioId: string) {
    const processoAtual = await this.buscarProcessoPorId(id)
    const statusAnterior = processoAtual.status

    const { data: processo, error } = await supabase
      .from('processos_cadastro')
      .update({
        status: novoStatus,
        updated_at: new Date().toISOString(),
        updated_by: usuarioId,
        ...(novoStatus === 'aguardando_fornecedor' && { enviado_fornecedor_at: new Date().toISOString() }),
        ...(novoStatus === 'aprovado_para_cadastro' && { aprovado_at: new Date().toISOString() }),
        ...(novoStatus === 'em_cadastro' && { em_cadastro_at: new Date().toISOString() }),
        ...(novoStatus === 'cadastrado' && { cadastrado_at: new Date().toISOString() }),
        ...(novoStatus === 'pdf_gerado' && { pdf_gerado_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await this.registrarHistorico(id, usuarioId, statusAnterior, novoStatus, 'status_alterado', observacao)

    return processo as ProcessoCadastro
  },

  async cancelarProcesso(id: string, observacao: string, usuarioId: string) {
    return this.alterarStatusProcesso(id, 'cancelado', observacao || 'Processo cancelado', usuarioId)
  },

  async contarProcessosPorStatus() {
    const { data, error } = await supabase
      .from('processos_cadastro')
      .select('status')

    if (error) throw error

    const contagens: Record<string, number> = {}
    data?.forEach((item: { status: string }) => {
      contagens[item.status] = (contagens[item.status] || 0) + 1
    })

    return contagens
  },

  async registrarHistorico(
    processoId: string,
    usuarioId: string,
    statusAnterior: string | null,
    statusNovo: string,
    acao: string,
    observacao: string
  ) {
    const { error } = await supabase
      .from('historico_processos')
      .insert({
        processo_id: processoId,
        usuario_id: usuarioId,
        status_anterior: statusAnterior,
        status_novo: statusNovo,
        acao,
        observacao,
      })

    if (error) console.error('Error registering history:', error)
  },

  async listarHistorico(processoId: string) {
    const { data, error } = await supabase
      .from('historico_processos')
      .select(`
        *,
        usuario:profiles!usuario_id(nome, email)
      `)
      .eq('processo_id', processoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as (HistoricoProcesso & { usuario?: { nome: string; email: string } })[]
  },
}
import { supabase } from '@/lib/supabase'
import type { DadosCompradorProduto, DadosCompradorFormData, ProcessoMixLoja } from '@/types/comprador'
import { processosService } from './processosService'

interface SalvarRascunhoResult {
  success: boolean
  dados?: DadosCompradorProduto
  error?: string
}

interface MixLojasData {
  loja_codigo: string
  loja_nome: string
  selecionado: boolean
}

export const dadosCompradorService = {
  async buscarDadosCompradorPorProcesso(processoId: string): Promise<DadosCompradorProduto | null> {
    const { data, error } = await supabase
      .from('dados_comprador_produto')
      .select('*')
      .eq('processo_id', processoId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching comprador data:', error)
      throw error
    }

    return data || null
  },

  async buscarMixLojasPorProcesso(processoId: string): Promise<ProcessoMixLoja[]> {
    const { data, error } = await supabase
      .from('processo_mix_lojas')
      .select('*')
      .eq('processo_id', processoId)
      .eq('selecionado', true)

    if (error) {
      console.error('Error fetching mix lojas:', error)
      throw error
    }

    return data || []
  },

  async salvarRascunhoComprador(
    processoId: string,
    userId: string,
    data: DadosCompradorFormData
  ): Promise<SalvarRascunhoResult> {
    try {
      const dadosExistentes = await this.buscarDadosCompradorPorProcesso(processoId)

      const dadosComprador = {
        processo_id: processoId,
        descricao_prado: data.descricao_prado,
        entrega_cd: data.entrega_cd,
        entrega_loja: data.entrega_loja,
        cross_dock: data.cross_dock,
        substituicao: data.substituicao,
        departamento: data.departamento,
        categoria: data.categoria,
        subcategoria: data.subcategoria || null,
        segmento: data.segmento || null,
        subsegmento: data.subsegmento || null,
        margem_lucro: data.margem_lucro,
        preco_prado: data.preco_prado,
        preco_pradao: data.preco_pradao || null,
        codigo_item_similar: data.codigo_item_similar || null,
        salvo_em: new Date().toISOString(),
      }

      let dadosCompradorResult: DadosCompradorProduto | null = null

      if (dadosExistentes) {
        const { data: updated, error: updateError } = await supabase
          .from('dados_comprador_produto')
          .update(dadosComprador)
          .eq('processo_id', processoId)
          .select()
          .single()

        if (updateError) throw updateError
        dadosCompradorResult = updated
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('dados_comprador_produto')
          .insert(dadosComprador)
          .select()
          .single()

        if (insertError) throw insertError
        dadosCompradorResult = inserted
      }

      await this.salvarMixLojas(processoId, data.lojasSelecionadas)

      await processosService.registrarHistorico(
        processoId,
        userId,
        'em_analise_comprador',
        'em_analise_comprador',
        'comprador_salvou_rascunho',
        'Rascunho do comprador salvo com sucesso'
      )

      return { success: true, dados: dadosCompradorResult || undefined }
    } catch (error) {
      console.error('Error saving comprador draft:', error)
      return { success: false, error: 'Erro ao salvar rascunho' }
    }
  },

  async salvarMixLojas(processoId: string, lojasSelecionadas: string[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from('processo_mix_lojas')
      .delete()
      .eq('processo_id', processoId)

    if (deleteError) {
      console.error('Error deleting old mix:', deleteError)
      throw deleteError
    }

    const { LOJAS_MIX } = await import('@/types/comprador')

    const mixData: MixLojasData[] = LOJAS_MIX.map(loja => ({
      loja_codigo: loja.codigo,
      loja_nome: loja.nome,
      selecionado: lojasSelecionadas.includes(loja.codigo),
    })).filter(mix => mix.selecionado)

    if (mixData.length > 0) {
      const { error: insertError } = await supabase
        .from('processo_mix_lojas')
        .insert(mixData.map(m => ({
          ...m,
          processo_id: processoId,
        })))

      if (insertError) {
        console.error('Error inserting mix:', insertError)
        throw insertError
      }
    }
  },

  async iniciarAnalise(processoId: string, userId: string): Promise<boolean> {
    try {
      const processo = await processosService.buscarProcessoPorId(processoId)
      if (!processo) throw new Error('Processo não encontrado')

      if (processo.status !== 'enviado_pelo_fornecedor') {
        throw new Error('Não é possível iniciar análise neste status')
      }

      const { error } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'em_analise_comprador',
          updated_at: new Date().toISOString(),
        })
        .eq('id', processoId)

      if (error) throw error

      await processosService.registrarHistorico(
        processoId,
        userId,
        'enviado_pelo_fornecedor',
        'em_analise_comprador',
        'comprador_iniciou_analise',
        'Comprador iniciou análise dos dados do fornecedor'
      )

      return true
    } catch (error) {
      console.error('Error initiating analysis:', error)
      return false
    }
  },

  async enviarParaAprovacao(
    processoId: string,
    userId: string,
    data: DadosCompradorFormData
  ): Promise<SalvarRascunhoResult> {
    try {
      const dadosExistentes = await this.buscarDadosCompradorPorProcesso(processoId)

      const dadosComprador = {
        processo_id: processoId,
        descricao_prado: data.descricao_prado,
        entrega_cd: data.entrega_cd,
        entrega_loja: data.entrega_loja,
        cross_dock: data.cross_dock,
        substituicao: data.substituicao,
        departamento: data.departamento,
        categoria: data.categoria,
        subcategoria: data.subcategoria || null,
        segmento: data.segmento || null,
        subsegmento: data.subsegmento || null,
        margem_lucro: data.margem_lucro,
        preco_prado: data.preco_prado,
        preco_pradao: data.preco_pradao || null,
        codigo_item_similar: data.codigo_item_similar || null,
        salvo_em: new Date().toISOString(),
        enviado_aprovacao_em: new Date().toISOString(),
      }

      if (dadosExistentes) {
        const { error: updateError } = await supabase
          .from('dados_comprador_produto')
          .update(dadosComprador)
          .eq('processo_id', processoId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('dados_comprador_produto')
          .insert(dadosComprador)

        if (insertError) throw insertError
      }

      await this.salvarMixLojas(processoId, data.lojasSelecionadas)

      const { error: processoError } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'aguardando_aprovacao',
          enviado_aprovacao_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', processoId)

      if (processoError) throw processoError

      await processosService.registrarHistorico(
        processoId,
        userId,
        'em_analise_comprador',
        'aguardando_aprovacao',
        'comprador_enviou_para_aprovacao',
        'Comprador concluiu preenchimento e enviou para aprovação'
      )

      return { success: true }
    } catch (error) {
      console.error('Error sending to approval:', error)
      return { success: false, error: 'Erro ao enviar para aprovação' }
    }
  },

  async solicitarCorrecaoFornecedor(
    processoId: string,
    userId: string,
    motivo: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'correcao_solicitada_fornecedor',
          motivo_correcao: motivo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', processoId)

      if (error) throw error

      await processosService.registrarHistorico(
        processoId,
        userId,
        'em_analise_comprador',
        'correcao_solicitada_fornecedor',
        'comprador_solicitou_correcao_fornecedor',
        `Correção solicitada ao fornecedor: ${motivo}`
      )

      return true
    } catch (error) {
      console.error('Error requesting correction:', error)
      return false
    }
  },
}
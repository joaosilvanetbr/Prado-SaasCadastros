import { supabase } from '@/lib/supabase'
import { DadosFornecedorProduto } from '@/types/fornecedor'
import { FornecedorProdutoFormData } from '@/validations/fornecedorProdutoSchema'
import { calculateCubagem } from '@/lib/formatters'
import { processosService } from './processosService'

export const dadosFornecedorService = {
  async buscarDadosFornecedorPorProcesso(processoId: string) {
    const { data, error } = await supabase
      .from('dados_fornecedor_produto')
      .select('*')
      .eq('processo_id', processoId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data as DadosFornecedorProduto | null
  },

  async salvarRascunhoFornecedor(processoId: string, data: Partial<FornecedorProdutoFormData>) {
    const existing = await this.buscarDadosFornecedorPorProcesso(processoId)
    
    const cubagem = data.altura_cm && data.largura_cm && data.comprimento_cm
      ? calculateCubagem(data.altura_cm, data.largura_cm, data.comprimento_cm)
      : null

    const dados = {
      processo_id: processoId,
      codigo_barra: data.codigo_barra || null,
      descricao_produto: data.descricao_produto || null,
      marca: data.marca || null,
      gramagem: data.gramagem || null,
      usa_balanca: data.usa_balanca ?? null,
      preco_custo: data.preco_custo || null,
      referencia: data.referencia || null,
      cnpj: data.cnpj || null,
      fornecedor_nome: data.fornecedor_nome || null,
      codigo_caixa: data.codigo_caixa || null,
      quantidade_na_caixa: data.quantidade_na_caixa || null,
      codigo_display: data.codigo_display || null,
      quantidade_do_display: data.quantidade_do_display || null,
      altura_cm: data.altura_cm || null,
      largura_cm: data.largura_cm || null,
      comprimento_cm: data.comprimento_cm || null,
      cubagem_m3: cubagem,
      peso_bruto_kg: data.peso_bruto_kg || null,
      palete: data.palete || null,
      lastro: data.lastro || null,
    }

    if (existing) {
      const { data: updated, error } = await supabase
        .from('dados_fornecedor_produto')
        .update(dados)
        .eq('processo_id', processoId)
        .select()
        .single()

      if (error) throw error
      return updated as DadosFornecedorProduto
    } else {
      const { data: created, error } = await supabase
        .from('dados_fornecedor_produto')
        .insert(dados)
        .select()
        .single()

      if (error) throw error
      return created as DadosFornecedorProduto
    }
  },

  async enviarDadosFornecedor(
    processoId: string,
    data: FornecedorProdutoFormData,
    linkId: string,
    usuarioId?: string
  ) {
    const cubagem = calculateCubagem(data.altura_cm, data.largura_cm, data.comprimento_cm)

    const dados = {
      processo_id: processoId,
      codigo_barra: data.codigo_barra,
      descricao_produto: data.descricao_produto,
      marca: data.marca,
      gramagem: data.gramagem,
      usa_balanca: data.usa_balanca,
      preco_custo: data.preco_custo,
      referencia: data.referencia || null,
      cnpj: data.cnpj,
      fornecedor_nome: data.fornecedor_nome,
      codigo_caixa: data.codigo_caixa || null,
      quantidade_na_caixa: data.quantidade_na_caixa || null,
      codigo_display: data.codigo_display || null,
      quantidade_do_display: data.quantidade_do_display || null,
      altura_cm: data.altura_cm,
      largura_cm: data.largura_cm,
      comprimento_cm: data.comprimento_cm,
      cubagem_m3: cubagem,
      peso_bruto_kg: data.peso_bruto_kg,
      palete: data.palete || null,
      lastro: data.lastro || null,
      enviado_em: new Date().toISOString(),
    }

    const existing = await this.buscarDadosFornecedorPorProcesso(processoId)

    if (existing) {
      const { data: updated, error } = await supabase
        .from('dados_fornecedor_produto')
        .update(dados)
        .eq('processo_id', processoId)
        .select()
        .single()

      if (error) throw error
    } else {
      const { data: created, error } = await supabase
        .from('dados_fornecedor_produto')
        .insert(dados)
        .select()
        .single()

      if (error) throw error
    }

    const processo = await processosService.buscarProcessoPorId(processoId)
    
    await processosService.atualizarProcesso(
      processoId,
      {
        descricao_produto_resumo: data.descricao_produto,
        codigo_barra_resumo: data.codigo_barra,
      },
      'fornecedor'
    )

    const link = await import('./fornecedorLinkService').then(m => m.fornecedorLinkService.buscarLinkPorId(linkId))
    if (link) {
      await supabase
        .from('links_fornecedor')
        .update({
          ativo: false,
          usado_em: new Date().toISOString(),
        })
        .eq('id', linkId)
    }

    return true
  },
}
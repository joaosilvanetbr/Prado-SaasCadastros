import { supabase } from '@/lib/supabase'
import { generateLinkToken, hashToken } from '@/lib/token'
import { FornecedorLink, FornecedorTokenValidationResult } from '@/types/fornecedor'
import { processosService } from './processosService'

export const fornecedorLinkService = {
  async gerarLinkFornecedor(processoId: string, usuarioId: string, emailDestino?: string) {
    const { token, hash } = generateLinkToken()

    await supabase
      .from('links_fornecedor')
      .update({ ativo: false })
      .eq('processo_id', processoId)
      .eq('ativo', true)

    const { data: link, error } = await supabase
      .from('links_fornecedor')
      .insert({
        processo_id: processoId,
        token_hash: hash,
        email_destino: emailDestino || null,
        ativo: true,
        created_by: usuarioId,
      })
      .select()
      .single()

    if (error) throw error

    await processosService.alterarStatusProcesso(
      processoId,
      'aguardando_fornecedor',
      'Link gerado para fornecedor',
      usuarioId
    )

    return { link: data as FornecedorLink, token }
  },

  async validarTokenFornecedor(token: string): Promise<FornecedorTokenValidationResult> {
    try {
      const tokenHash = hashToken(token)

      const { data: link, error } = await supabase
        .from('links_fornecedor')
        .select('*, processos_cadastro(*)')
        .eq('token_hash', tokenHash)
        .eq('ativo', true)
        .single()

      if (error || !link) {
        return { valid: false, reason: 'invalid' }
      }

      const processo = (link as unknown as { processos_cadastro: { status: string; numero_processo: number; fornecedores?: { razao_social: string } } }).processos_cadastro

      if (!processo) {
        return { valid: false, reason: 'error' }
      }

      if (processo.status === 'cancelado') {
        return { valid: false, reason: 'cancelled' }
      }

      if (processo.status !== 'aguardando_fornecedor') {
        if (link.usado_em) {
          return { valid: false, reason: 'already_submitted' }
        }
        return { valid: false, reason: 'not_allowed' }
      }

      if (link.expira_em && new Date(link.expira_em) < new Date()) {
        return { valid: false, reason: 'expired' }
      }

      const fornecedorNome = processo.fornecedores?.razao_social || null

      return {
        valid: true,
        linkId: link.id,
        processoId: link.processo_id,
        numeroProcesso: processo.numero_processo,
        fornecedorNome: fornecedorNome || undefined,
        emailDestino: link.email_destino,
        status: processo.status,
      }
    } catch (err) {
      console.error('Error validating token:', err)
      return { valid: false, reason: 'error' }
    }
  },

  async buscarLinkAtivo(processoId: string) {
    const { data, error } = await supabase
      .from('links_fornecedor')
      .select('*')
      .eq('processo_id', processoId)
      .eq('ativo', true)
      .single()

    if (error) return null
    return data as FornecedorLink
  },

  async marcarLinkComoUsado(linkId: string) {
    const { error } = await supabase
      .from('links_fornecedor')
      .update({
        ativo: false,
        usado_em: new Date().toISOString(),
      })
      .eq('id', linkId)

    if (error) throw error
  },

  async buscarLinkPorId(linkId: string) {
    const { data, error } = await supabase
      .from('links_fornecedor')
      .select('*')
      .eq('id', linkId)
      .single()

    if (error) throw error
    return data as FornecedorLink
  },
}
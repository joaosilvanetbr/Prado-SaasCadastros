import { supabase } from '@/lib/supabase'
import { BLOQUEAR_AUTOAPROVACAO } from '@/types/aprovacao'
import type { UserProfile } from '@/types/database'
import type { AprovacaoProcessoView, AssinaturaStatus, AssinaturaTipo } from '@/types/aprovacao'

interface AprovacaoResult {
  success: boolean
  error?: string
}

export const aprovacoesService = {
  async listarProcessosAguardandoAprovacao() {
    const { data, error } = await supabase
      .from('processos_cadastro')
      .select(`
        *,
        fornecedor:fornecedores(*),
        comprador_responsavel:profiles!comprador_responsavel_id(*)
      `)
      .eq('status', 'aguardando_aprovacao')
      .order('enviado_aprovacao_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async buscarProcessoParaAprovacao(processoId: string): Promise<AprovacaoProcessoView | null> {
    // Buscar processo com todas as relações
    const { data: processo, error: processoError } = await supabase
      .from('processos_cadastro')
      .select(`
        *,
        fornecedor:fornecedores(*),
        comprador_responsavel:profiles!comprador_responsavel_id(*),
        aprovador:profiles!aprovador_id(*)
      `)
      .eq('id', processoId)
      .single()

    if (processoError) throw processoError

    // Buscar dados do fornecedor
    const { data: dadosFornecedor } = await supabase
      .from('dados_fornecedor_produto')
      .select('*')
      .eq('processo_id', processoId)
      .single()

    // Buscar dados do comprador
    const { data: dadosComprador } = await supabase
      .from('dados_comprador_produto')
      .select('*')
      .eq('processo_id', processoId)
      .single()

    // Buscar mix de lojas
    const { data: mixLojas } = await supabase
      .from('processo_mix_lojas')
      .select('*')
      .eq('processo_id', processoId)
      .eq('selecionado', true)

    // Buscar histórico
    const { data: historico } = await supabase
      .from('historico_processos')
      .select('*, usuario:profiles!usuario_id(nome)')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: true })

    // Buscar assinaturas
    const { data: assinaturas } = await supabase
      .from('assinaturas')
      .select('*')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: true })

    return {
      processo: processo as AprovacaoProcessoView['processo'],
      fornecedor: processo.fornecedor as AprovacaoProcessoView['fornecedor'],
      dadosFornecedor: dadosFornecedor as AprovacaoProcessoView['dadosFornecedor'],
      dadosComprador: dadosComprador as AprovacaoProcessoView['dadosComprador'],
      mixLojas: mixLojas || [],
      historico: historico || [],
      assinaturas: assinaturas || [],
      compradorResponsavel: processo.comprador_responsavel as AprovacaoProcessoView['compradorResponsavel'],
      aprovador: processo.aprovador,
    }
  },

  verificarPodeAprovar(processo: { comprador_responsavel_id: string; status: string }, profile: UserProfile): { pode: boolean; erro?: string } {
    // Verificar se usuário pode aprovar
    if (!profile.pode_aprovar) {
      return { pode: false, erro: 'Você não tem permissão para aprovar processos.' }
    }

    // Verificar se processo está aguardando aprovação
    if (processo.status !== 'aguardando_aprovacao') {
      return { pode: false, erro: 'Este processo não está aguardando aprovação.' }
    }

    // Verificar autoaprovação
    if (BLOQUEAR_AUTOAPROVACAO && processo.comprador_responsavel_id === profile.id) {
      return { pode: false, erro: 'Você não pode aprovar um processo em que você é o comprador responsável. Solicite aprovação de outro comprador aprovador.' }
    }

    return { pode: true }
  },

  async aprovarProcesso(processoId: string, profile: UserProfile, observacao?: string): Promise<AprovacaoResult> {
    try {
      // Buscar processo
      const { data: processo, error: processoError } = await supabase
        .from('processos_cadastro')
        .select('comprador_responsavel_id, status')
        .eq('id', processoId)
        .single()

      if (processoError) throw processoError

      // Verificar se pode aprovar
      const verificacao = this.verificarPodeAprovar(processo, profile)
      if (!verificacao.pode) {
        return { success: false, error: verificacao.erro }
      }

      // Inserir assinatura
      const { error: assinaturaError } = await supabase
        .from('assinaturas')
        .insert({
          processo_id: processoId,
          usuario_id: profile.id,
          tipo: 'aprovacao' as AssinaturaTipo,
          status: 'aprovado' as AssinaturaStatus,
          nome_assinante: profile.nome,
          email_assinante: profile.email,
          cargo_ou_perfil: profile.perfil,
          observacao: observacao || null,
        })

      if (assinaturaError) throw assinaturaError

      // Atualizar processo
      const { error: updateError } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'aprovado_para_cadastro',
          aprovador_id: profile.id,
          aprovado_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: profile.id,
        })
        .eq('id', processoId)

      if (updateError) throw updateError

      // Registrar histórico
      await supabase.from('historico_processos').insert({
        processo_id: processoId,
        usuario_id: profile.id,
        status_anterior: 'aguardando_aprovacao',
        status_novo: 'aprovado_para_cadastro',
        acao: 'aprovador_aprovou_e_assinou',
        observacao: observacao || 'Aprovado e assinado',
      })

      return { success: true }
    } catch (error) {
      console.error('Error approving process:', error)
      return { success: false, error: 'Erro ao aprovar processo' }
    }
  },

  async reprovarProcesso(processoId: string, profile: UserProfile, motivo: string): Promise<AprovacaoResult> {
    try {
      // Buscar processo
      const { data: processo, error: processoError } = await supabase
        .from('processos_cadastro')
        .select('comprador_responsavel_id, status')
        .eq('id', processoId)
        .single()

      if (processoError) throw processoError

      // Verificar se pode aprovar
      const verificacao = this.verificarPodeAprovar(processo, profile)
      if (!verificacao.pode) {
        return { success: false, error: verificacao.erro }
      }

      // Inserir assinatura
      const { error: assinaturaError } = await supabase
        .from('assinaturas')
        .insert({
          processo_id: processoId,
          usuario_id: profile.id,
          tipo: 'aprovacao' as AssinaturaTipo,
          status: 'reprovado' as AssinaturaStatus,
          nome_assinante: profile.nome,
          email_assinante: profile.email,
          cargo_ou_perfil: profile.perfil,
          observacao: motivo,
        })

      if (assinaturaError) throw assinaturaError

      // Atualizar processo
      const { error: updateError } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'reprovado',
          motivo_reprovacao: motivo,
          updated_at: new Date().toISOString(),
          updated_by: profile.id,
        })
        .eq('id', processoId)

      if (updateError) throw updateError

      // Registrar histórico
      await supabase.from('historico_processos').insert({
        processo_id: processoId,
        usuario_id: profile.id,
        status_anterior: 'aguardando_aprovacao',
        status_novo: 'reprovado',
        acao: 'aprovador_reprovou',
        observacao: motivo,
      })

      return { success: true }
    } catch (error) {
      console.error('Error reproving process:', error)
      return { success: false, error: 'Erro ao reprovar processo' }
    }
  },

  async solicitarAjusteComprador(processoId: string, profile: UserProfile, motivo: string): Promise<AprovacaoResult> {
    try {
      // Buscar processo
      const { data: processo, error: processoError } = await supabase
        .from('processos_cadastro')
        .select('comprador_responsavel_id, status')
        .eq('id', processoId)
        .single()

      if (processoError) throw processoError

      // Verificar se pode aprovar
      const verificacao = this.verificarPodeAprovar(processo, profile)
      if (!verificacao.pode) {
        return { success: false, error: verificacao.erro }
      }

      // Inserir assinatura
      const { error: assinaturaError } = await supabase
        .from('assinaturas')
        .insert({
          processo_id: processoId,
          usuario_id: profile.id,
          tipo: 'aprovacao' as AssinaturaTipo,
          status: 'correcao_solicitada' as AssinaturaStatus,
          nome_assinante: profile.nome,
          email_assinante: profile.email,
          cargo_ou_perfil: profile.perfil,
          observacao: motivo,
        })

      if (assinaturaError) throw assinaturaError

      // Atualizar processo
      const { error: updateError } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'correcao_solicitada_comprador',
          motivo_correcao: motivo,
          updated_at: new Date().toISOString(),
          updated_by: profile.id,
        })
        .eq('id', processoId)

      if (updateError) throw updateError

      // Registrar histórico
      await supabase.from('historico_processos').insert({
        processo_id: processoId,
        usuario_id: profile.id,
        status_anterior: 'aguardando_aprovacao',
        status_novo: 'correcao_solicitada_comprador',
        acao: 'aprovador_solicitou_ajuste_comprador',
        observacao: motivo,
      })

      return { success: true }
    } catch (error) {
      console.error('Error requesting adjustment:', error)
      return { success: false, error: 'Erro ao solicitar ajuste' }
    }
  },
}
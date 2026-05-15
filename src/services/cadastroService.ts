import { supabase } from '@/lib/supabase'
import { processosService } from './processosService'
import { dadosFornecedorService } from './dadosFornecedorService'
import { dadosCompradorService } from './dadosCompradorService'
import type { CadastroProcessoView, CadastroFormData, PdfGenerationResult } from '@/types/cadastro'
import type { UserProfile, ProcessoCadastro } from '@/types/database'
import type { Assinatura } from '@/types/aprovacao'

export const cadastroService = {
  async listarProcessosCadastro(): Promise<ProcessoCadastro[]> {
    const { data, error } = await supabase
      .from('processos_cadastro')
      .select(`
        *,
        fornecedor:fornecedores(*),
        comprador_responsavel:profiles!comprador_responsavel_id(*),
        aprovador:profiles!aprovador_id(*),
        cadastro_responsavel:profiles!cadastro_responsavel_id(*)
      `)
      .in('status', ['aprovado_para_cadastro', 'em_cadastro', 'cadastrado', 'pdf_gerado'])
      .order('aprovado_at', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as ProcessoCadastro[]
  },

  async buscarProcessoParaCadastro(processoId: string): Promise<CadastroProcessoView> {
    const [processoData, dadosFornecedor, dadosComprador, mixLojasData, historicoData, assinaturasData] = await Promise.all([
      processosService.buscarProcessoPorId(processoId),
      dadosFornecedorService.buscarDadosFornecedorPorProcesso(processoId),
      dadosCompradorService.buscarDadosCompradorPorProcesso(processoId),
      dadosCompradorService.buscarMixLojasPorProcesso(processoId),
      processosService.listarHistorico(processoId),
      this.listarAssinaturas(processoId)
    ])

    // Buscar aprovador e cadastro responsavel
    let aprovador: UserProfile | null = null
    let cadastroResponsavel: UserProfile | null = null

    if (processoData.aprovador_id) {
      const { data: aprovadorData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', processoData.aprovador_id)
        .single()
      aprovador = aprovadorData as unknown as UserProfile
    }

    if (processoData.cadastro_responsavel_id) {
      const { data: cadastroData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', processoData.cadastro_responsavel_id)
        .single()
      cadastroResponsavel = cadastroData as unknown as UserProfile
    }

    return {
      processo: processoData,
      fornecedor: processoData.fornecedor || null,
      dadosFornecedor,
      dadosComprador,
      mixLojas: mixLojasData,
      historico: historicoData,
      assinaturas: assinaturasData,
      compradorResponsavel: processoData.comprador_responsavel || null,
      aprovador,
      cadastroResponsavel
    }
  },

  async listarAssinaturas(processoId: string): Promise<Assinatura[]> {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('*')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async assumirCadastro(processoId: string, profile: UserProfile): Promise<boolean> {
    try {
      const processo = await processosService.buscarProcessoPorId(processoId)
      
      if (processo.status !== 'aprovado_para_cadastro') {
        throw new Error('Processo não está aprovado para cadastro')
      }

      if (!processo.aprovador_id || !processo.aprovado_at) {
        throw new Error('Processo não possui aprovação válida')
      }

      const { error } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'em_cadastro',
          cadastro_responsavel_id: profile.id,
          em_cadastro_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: profile.id
        })
        .eq('id', processoId)

      if (error) throw error

      await processosService.registrarHistorico(
        processoId,
        profile.id,
        'aprovado_para_cadastro',
        'em_cadastro',
        'cadastro_assumiu_processo',
        `Cadastro assumido por ${profile.nome}`
      )

      return true
    } catch (error) {
      console.error('Error assuming cadastro:', error)
      return false
    }
  },

  async salvarDadosCadastro(
    processoId: string,
    data: CadastroFormData,
    profile: UserProfile
  ): Promise<boolean> {
    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: profile.id
      }

      if (data.codigo_interno_produto !== undefined) {
        updates.codigo_interno_produto = data.codigo_interno_produto
      }

      if (data.observacao_cadastro !== undefined) {
        updates.observacao_cadastro = data.observacao_cadastro
      }

      const { error } = await supabase
        .from('processos_cadastro')
        .update(updates)
        .eq('id', processoId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error saving cadastro data:', error)
      return false
    }
  },

  async marcarComoCadastrado(
    processoId: string,
    data: CadastroFormData,
    profile: UserProfile
  ): Promise<boolean> {
    try {
      const processo = await processosService.buscarProcessoPorId(processoId)
      
      if (processo.status !== 'em_cadastro') {
        throw new Error('Processo não está em cadastro')
      }

      if (processo.cadastro_responsavel_id !== profile.id && profile.perfil !== 'admin') {
        throw new Error('Você não é o responsável por este cadastro')
      }

      // Validar código interno obrigatório
      if (data.codigo_interno_produto === undefined || data.codigo_interno_produto === null || data.codigo_interno_produto === '') {
        throw new Error('Código interno do produto é obrigatório')
      }

      const { error } = await supabase
        .from('processos_cadastro')
        .update({
          status: 'cadastrado',
          codigo_interno_produto: data.codigo_interno_produto,
          observacao_cadastro: data.observacao_cadastro || null,
          cadastrado_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: profile.id
        })
        .eq('id', processoId)

      if (error) throw error

      // Registrar assinatura de cadastro
      await supabase.from('assinaturas').insert({
        processo_id: processoId,
        usuario_id: profile.id,
        tipo: 'cadastro',
        status: 'aprovado',
        nome_assinante: profile.nome,
        email_assinante: profile.email,
        cargo_ou_perfil: profile.perfil,
        observacao: data.observacao_cadastro || null
      })

      await processosService.registrarHistorico(
        processoId,
        profile.id,
        'em_cadastro',
        'cadastrado',
        'cadastro_marcou_como_cadastrado',
        `Produto cadastrado com código ${data.codigo_interno_produto}`
      )

      return true
    } catch (error) {
      console.error('Error marking as cadastrado:', error)
      return false
    }
  },

  async gerarPdfFinal(processoId: string, profile: UserProfile): Promise<PdfGenerationResult> {
    try {
      const processo = await processosService.buscarProcessoPorId(processoId)
      
      if (processo.status !== 'cadastrado') {
        return { success: false, error: 'PDF só pode ser gerado após o produto ser cadastrado' }
      }

      if (!processo.aprovador_id || !processo.aprovado_at || !processo.cadastro_responsavel_id || !processo.cadastrado_at) {
        return { success: false, error: 'Dados de aprovação ou cadastro incompletos' }
      }

      // Gerar caminho do arquivo
      const now = new Date()
      const ano = now.getFullYear()
      const mes = String(now.getMonth() + 1).padStart(2, '0')
      const numeroProcesso = processo.numero_processo.toString().padStart(6, '0')
      const codigoBarra = processo.codigo_barra_resumo || ''
      const fileName = `cadastro-produto-${numeroProcesso}${codigoBarra ? '-' + codigoBarra : ''}.pdf`
      const storagePath = `pdfs/cadastros/${ano}/${mes}/${fileName}`

      // Buscar dados completos para o PDF
      const dadosCompletos = await this.buscarProcessoParaCadastro(processoId)

      // Gerar o PDF usando window.print() ou uma biblioteca
      // Para MVP, vamos criar uma versão HTML que pode ser impressa
      const pdfHtml = this.gerarHtmlPdf(dadosCompletos)

      // Converter HTML para PDF usando uma abordagem simples
      // No frontend, podemos usar jsPDF ou html2canvas + jsPDF
      // Por enquanto, vamos retornar o HTML para preview
      
      return {
        success: true,
        pdfUrl: undefined,
        storagePath
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      return { success: false, error: 'Erro ao gerar PDF' }
    }
  },

  gerarHtmlPdf(dados: CadastroProcessoView): string {
    const { processo, fornecedor, dadosFornecedor, dadosComprador, mixLojas, aprovador, cadastroResponsavel } = dados

    const formatarData = (data: string | null) => {
      if (!data) return '-'
      return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatarMoeda = (valor: number | null) => {
      if (valor === null || valor === undefined) return '-'
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    const formatarPercentual = (valor: number | null) => {
      if (valor === null || valor === undefined) return '-'
      return `${valor.toFixed(2).replace('.', ',')}%`
    }

    const formatarBoolean = (valor: boolean | null) => {
      return valor ? 'Sim' : 'Não'
    }

    const mixSelecionadas = mixLojas.filter(m => m.selecionado).map(m => m.loja_nome).join(', ') || '-'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
    h1 { font-size: 18px; text-align: center; margin-bottom: 5px; }
    h2 { font-size: 14px; background: #f0f0f0; padding: 5px; margin-top: 15px; }
    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
    td { border: 1px solid #ddd; padding: 4px; }
    .label { font-weight: bold; background: #f9f9f9; width: 30%; }
    .section { margin-bottom: 20px; }
    .header { text-align: center; background: #003366; color: white; padding: 10px; }
    .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PRADO - CADASTRO DE PRODUTO</h1>
    <p>Processo nº ${processo.numero_processo.toString().padStart(6, '0')} | ${formatarData(processo.updated_at)}</p>
  </div>

  <div class="section">
    <h2>DADOS DO PRODUTO</h2>
    <table>
      <tr><td class="label">Código de Barra</td><td>${processo.codigo_barra_resumo || '-'}</td></tr>
      <tr><td class="label">Descrição</td><td>${processo.descricao_produto_resumo || '-'}</td></tr>
      <tr><td class="label">Descrição Prado</td><td>${dadosComprador?.descricao_prado || '-'}</td></tr>
      <tr><td class="label">Marca</td><td>${dadosFornecedor?.marca || '-'}</td></tr>
      <tr><td class="label">Gramagem</td><td>${dadosFornecedor?.gramagem || '-'}</td></tr>
      <tr><td class="label">Usa Balança</td><td>${formatarBoolean(dadosFornecedor?.usa_balanca)}</td></tr>
      <tr><td class="label">Referência</td><td>${dadosFornecedor?.referencia || '-'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>FORNECEDOR</h2>
    <table>
      <tr><td class="label">Fornecedor</td><td>${fornecedor?.razao_social || '-'}</td></tr>
      <tr><td class="label">CNPJ</td><td>${fornecedor?.cnpj || '-'}</td></tr>
      <tr><td class="label">Preço de Custo</td><td>${formatarMoeda(dadosFornecedor?.preco_custo)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>INFORMAÇÕES LOGÍSTICAS</h2>
    <table>
      <tr><td class="label">Altura (cm)</td><td>${dadosFornecedor?.altura_cm || '-'}</td></tr>
      <tr><td class="label">Largura (cm)</td><td>${dadosFornecedor?.largura_cm || '-'}</td></tr>
      <tr><td class="label">Comprimento (cm)</td><td>${dadosFornecedor?.comprimento_cm || '-'}</td></tr>
      <tr><td class="label">Cubagem (m³)</td><td>${dadosFornecedor?.cubagem_m3 || '-'}</td></tr>
      <tr><td class="label">Peso Bruto (kg)</td><td>${dadosFornecedor?.peso_bruto_kg || '-'}</td></tr>
      <tr><td class="label">Palete</td><td>${dadosFornecedor?.palete || '-'}</td></tr>
      <tr><td class="label">Lastro</td><td>${dadosFornecedor?.lastro || '-'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>DIMENSÕES DA CAIXA</h2>
    <table>
      <tr><td class="label">Código da Caixa</td><td>${dadosFornecedor?.codigo_caixa || '-'}</td></tr>
      <tr><td class="label">Quantidade na Caixa</td><td>${dadosFornecedor?.quantidade_na_caixa || '-'}</td></tr>
      <tr><td class="label">Código do Display</td><td>${dadosFornecedor?.codigo_display || '-'}</td></tr>
      <tr><td class="label">Quantidade do Display</td><td>${dadosFornecedor?.quantidade_do_display || '-'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>TIPO DE ENTREGA</h2>
    <table>
      <tr><td class="label">Entrega CD</td><td>${formatarBoolean(dadosComprador?.entrega_cd)}</td></tr>
      <tr><td class="label">Entrega Loja</td><td>${formatarBoolean(dadosComprador?.entrega_loja)}</td></tr>
      <tr><td class="label">Cross Dock</td><td>${formatarBoolean(dadosComprador?.cross_dock)}</td></tr>
      <tr><td class="label">Substituição</td><td>${formatarBoolean(dadosComprador?.substituicao)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>MIX DE LOJAS</h2>
    <table>
      <tr><td>${mixSelecionadas}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>ESTRUTURA MERCADOLÓGICA</h2>
    <table>
      <tr><td class="label">Departamento</td><td>${dadosComprador?.departamento || '-'}</td></tr>
      <tr><td class="label">Categoria</td><td>${dadosComprador?.categoria || '-'}</td></tr>
      <tr><td class="label">Subcategoria</td><td>${dadosComprador?.subcategoria || '-'}</td></tr>
      <tr><td class="label">Segmento</td><td>${dadosComprador?.segmento || '-'}</td></tr>
      <tr><td class="label">Subsegmento</td><td>${dadosComprador?.subsegmento || '-'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>DADOS COMERCIAIS</h2>
    <table>
      <tr><td class="label">Margem de Lucro</td><td>${formatarPercentual(dadosComprador?.margem_lucro)}</td></tr>
      <tr><td class="label">Preço Prado</td><td>${formatarMoeda(dadosComprador?.preco_prado)}</td></tr>
      <tr><td class="label">Preço Pradão</td><td>${formatarMoeda(dadosComprador?.preco_pradao)}</td></tr>
      <tr><td class="label">Código Item Similar</td><td>${dadosComprador?.codigo_item_similar || '-'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>APROVAÇÃO / ASSINATURA</h2>
    <table>
      <tr><td class="label">Aprovado por</td><td>${aprovador?.nome || '-'}</td></tr>
      <tr><td class="label">Data da Aprovação</td><td>${formatarData(processo.aprovado_at)}</td></tr>
      <tr><td class="label">Responsável pelo Cadastro</td><td>${cadastroResponsavel?.nome || '-'}</td></tr>
      <tr><td class="label">Data do Cadastro</td><td>${formatarData(processo.cadastrado_at)}</td></tr>
      <tr><td class="label">Código Interno</td><td>${processo.codigo_interno_produto || '-'}</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>Ficha gerada automaticamente pelo Sistema de Cadastro de Produtos Prado.</p>
    <p>Processo nº ${processo.numero_processo.toString().padStart(6, '0')}.</p>
    ${aprovador ? `<p>Aprovado por ${aprovador.nome} em ${formatarData(processo.aprovado_at)}.</p>` : ''}
    ${cadastroResponsavel ? `<p>Cadastrado por ${cadastroResponsavel.nome} em ${formatarData(processo.cadastrado_at)}.</p>` : ''}
  </div>
</body>
</html>
    `
  },

  async baixarPdf(processoId: string, profile: UserProfile): Promise<string | null> {
    try {
      const processo = await processosService.buscarProcessoPorId(processoId)
      
      if (processo.status !== 'pdf_gerado' || !processo.pdf_url) {
        throw new Error('PDF não disponível')
      }

      // Gerar URL assinada para download
      const { data: urlData } = await supabase.storage
        .from('pdfs')
        .createSignedUrl(processo.pdf_url.replace('pdfs/', ''), 60)

      return urlData?.signedUrl || processo.pdf_url
    } catch (error) {
      console.error('Error downloading PDF:', error)
      return null
    }
  }
}
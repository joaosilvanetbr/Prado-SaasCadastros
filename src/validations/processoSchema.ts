import { z } from 'zod'

export const novoProcessoSchema = z.object({
  titulo: z.string().min(3, 'Informe um título com pelo menos 3 caracteres'),
  fornecedor_id: z.string().optional(),
  fornecedor_razao_social: z.string().min(2, 'Informe o fornecedor'),
  fornecedor_cnpj: z.string().optional(),
  fornecedor_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  fornecedor_contato_nome: z.string().optional(),
  descricao_produto_resumo: z.string().optional(),
  codigo_barra_resumo: z.string().optional(),
  observacao_interna: z.string().optional(),
})

export type NovoProcessoFormData = z.infer<typeof novoProcessoSchema>
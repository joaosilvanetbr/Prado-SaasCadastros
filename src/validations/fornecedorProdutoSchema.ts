import { z } from 'zod'

export const fornecedorProdutoSchema = z.object({
  codigo_barra: z
    .string()
    .min(1, 'Informe o código de barra')
    .regex(/^\d+$/, 'Use apenas números no código de barra'),

  descricao_produto: z
    .string()
    .min(3, 'Informe a descrição do produto'),

  marca: z
    .string()
    .min(1, 'Informe a marca'),

  gramagem: z
    .string()
    .min(1, 'Informe a gramagem'),

  usa_balanca: z
    .boolean({
      required_error: 'Informe se usa balança',
    }),

  preco_custo: z
    .coerce
    .number()
    .positive('Informe um preço de custo válido'),

  referencia: z
    .string()
    .optional()
    .nullable(),

  cnpj: z
    .string()
    .min(14, 'Informe o CNPJ'),

  fornecedor_nome: z
    .string()
    .min(2, 'Informe o fornecedor'),

  codigo_caixa: z
    .string()
    .optional()
    .nullable(),

  quantidade_na_caixa: z
    .coerce
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  codigo_display: z
    .string()
    .optional()
    .nullable(),

  quantidade_do_display: z
    .coerce
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  altura_cm: z
    .coerce
    .number()
    .positive('Informe a altura'),

  largura_cm: z
    .coerce
    .number()
    .positive('Informe a largura'),

  comprimento_cm: z
    .coerce
    .number()
    .positive('Informe o comprimento'),

  cubagem_m3: z
    .coerce
    .number()
    .optional()
    .nullable(),

  peso_bruto_kg: z
    .coerce
    .number()
    .positive('Informe o peso bruto'),

  palete: z
    .string()
    .optional()
    .nullable(),

  lastro: z
    .string()
    .optional()
    .nullable(),
}).superRefine((data, ctx) => {
  if (data.codigo_caixa && !data.quantidade_na_caixa) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['quantidade_na_caixa'],
      message: 'Informe a quantidade na caixa',
    })
  }

  if (data.codigo_display && !data.quantidade_do_display) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['quantidade_do_display'],
      message: 'Informe a quantidade do display',
    })
  }
})

export type FornecedorProdutoFormData = z.infer<typeof fornecedorProdutoSchema>
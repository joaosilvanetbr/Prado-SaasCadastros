import { z } from 'zod'

export const compradorProdutoSchema = z.object({
  descricao_prado: z
    .string()
    .min(3, 'Informe a descrição Prado (mínimo 3 caracteres)'),

  entrega_cd: z.boolean().default(false),
  entrega_loja: z.boolean().default(false),
  cross_dock: z.boolean().default(false),

  substituicao: z.boolean({
    required_error: 'Informe se há substituição',
  }),

  departamento: z
    .string()
    .min(1, 'Informe o departamento'),

  categoria: z
    .string()
    .min(1, 'Informe a categoria'),

  subcategoria: z
    .string()
    .optional()
    .nullable(),

  segmento: z
    .string()
    .optional()
    .nullable(),

  subsegmento: z
    .string()
    .optional()
    .nullable(),

  margem_lucro: z
    .coerce
    .number()
    .positive('Informe uma margem válida'),

  preco_prado: z
    .coerce
    .number()
    .positive('Informe o preço Prado'),

  preco_pradao: z
    .coerce
    .number()
    .optional()
    .nullable(),

  codigo_item_similar: z
    .string()
    .optional()
    .nullable(),

  lojasSelecionadas: z
    .array(z.string())
    .min(1, 'Selecione pelo menos uma loja ou CD'),
}).superRefine((data, ctx) => {
  const temTipoEntrega = data.entrega_cd || data.entrega_loja || data.cross_dock

  if (!temTipoEntrega) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['entrega_cd'],
      message: 'Selecione pelo menos um tipo de entrega',
    })
  }
})

export type CompradorProdutoFormData = z.infer<typeof compradorProdutoSchema>

export const solicitarCorrecaoSchema = z.object({
  motivo: z
    .string()
    .min(10, 'Informe o motivo da correção (mínimo 10 caracteres)')
    .max(1000, 'Motivo muito longo (máximo 1000 caracteres)'),
})

export type SolicitarCorrecaoFormData = z.infer<typeof solicitarCorrecaoSchema>
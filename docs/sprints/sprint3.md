# SPRINT 3 - Área do Comprador

## 1. Objetivo da Sprint

Implementar a etapa em que o comprador responsável revisa os dados enviados pelo fornecedor e completa a parte comercial da ficha de cadastro de produto.

Nesta sprint, o comprador deve conseguir:

1. Ver os processos enviados pelo fornecedor.
2. Abrir os dados preenchidos pelo fornecedor.
3. Conferir dados básicos, logísticos, caixa/display e cubagem.
4. Preencher a parte obrigatória do comprador.
5. Informar descrição Prado.
6. Selecionar tipo de entrega.
7. Informar substituição.
8. Selecionar mix de lojas.
9. Preencher estrutura mercadológica.
10. Preencher margem, preços e item similar.
11. Salvar rascunho da análise.
12. Solicitar correção ao fornecedor, se necessário.
13. Enviar processo para aprovação.
14. Registrar histórico de todas as ações importantes.

---

## 2. Contexto do Projeto

Até aqui, as sprints anteriores prepararam:

### Sprint 1

- login;
- perfis;
- dashboard;
- processos;
- fornecedores;
- histórico;
- criação de processo;
- status iniciais.

### Sprint 2

- link externo do fornecedor;
- formulário público do fornecedor;
- dados básicos do produto;
- informações logísticas;
- caixa/display;
- cubagem;
- envio do fornecedor;
- status `enviado_pelo_fornecedor`.

A Sprint 3 começa quando o processo já possui dados enviados pelo fornecedor.

Fluxo desta sprint:

```text
Fornecedor enviou ficha
↓
Processo fica como enviado pelo fornecedor
↓
Comprador responsável abre o processo
↓
Comprador inicia análise
↓
Comprador revisa dados do fornecedor
↓
Comprador preenche dados comerciais
↓
Comprador seleciona mix e estrutura
↓
Comprador envia para aprovação
↓
Processo fica aguardando aprovação
```

---

## 3. Regras Obrigatórias para IA / Coding Agent

### 3.1 Não alterar documentação sem autorização

Durante esta sprint:

- não alterar arquivos `.md` existentes;
- não alterar a pasta `docs/`;
- não apagar documentação;
- não reescrever `SPEC.md`, `README.md`, `SPRINT1.md`, `SPRINT2.md` ou qualquer outro `.md`;
- não criar documentação extra sem pedido explícito.

Exceção: se o usuário pedir explicitamente alteração em documentação.

### 3.2 Não implementar fora do escopo

Não implementar nesta sprint:

- aprovação/assinatura final;
- fila de cadastro;
- geração de PDF final;
- envio automático por e-mail;
- WhatsApp;
- integração com ERP;
- relatórios avançados;
- importação de Excel;
- OCR;
- assinatura desenhada.

### 3.3 Preservar o que já existe

Não quebrar:

- login;
- permissões;
- criação de processo;
- link do fornecedor;
- formulário público do fornecedor;
- dados enviados pelo fornecedor;
- histórico;
- dashboard;
- listagem de processos.

### 3.4 Manter cada comprador com seus processos

Regra central:

```text
Comprador comum só vê e edita processos onde comprador_responsavel_id = usuário logado.
```

Admin pode ver todos.

Comprador aprovador pode continuar tendo seus próprios processos, mas a fila de aprovação completa será implementada na Sprint 4.

---

## 4. Escopo da Sprint 3

### 4.1 Incluído

Implementar:

1. Tabela `dados_comprador_produto`.
2. Tabela `processo_mix_lojas`, se ainda não existir.
3. Tela/formulário da parte do comprador.
4. Revisão dos dados do fornecedor em modo leitura.
5. Descrição Prado.
6. Tipo de entrega.
7. Substituição.
8. Mix de lojas.
9. Estrutura mercadológica.
10. Margem de lucro.
11. Preço Prado.
12. Preço Pradão.
13. Código de item similar.
14. Salvar rascunho do comprador.
15. Solicitar correção ao fornecedor.
16. Enviar para aprovação.
17. Atualizar status.
18. Registrar histórico.
19. Dashboard/listagem com status da etapa do comprador.

### 4.2 Fora do escopo

Não implementar:

- assinatura;
- aprovação efetiva;
- tela de aprovador;
- cadastro final;
- PDF;
- anexos avançados;
- relatórios;
- cadastros dinâmicos de departamento/categoria;
- cadastro dinâmico de lojas, salvo se for simples.

---

## 5. Status Usados nesta Sprint

Status principais:

```text
enviado_pelo_fornecedor
em_analise_comprador
correcao_solicitada_fornecedor
aguardando_aprovacao
cancelado
```

### 5.1 Transições desta sprint

```text
enviado_pelo_fornecedor -> em_analise_comprador
em_analise_comprador -> correcao_solicitada_fornecedor
correcao_solicitada_fornecedor -> enviado_pelo_fornecedor
em_analise_comprador -> aguardando_aprovacao
qualquer_status_permitido -> cancelado
```

### 5.2 Regras

Ao comprador abrir/iniciar análise:

```text
status = em_analise_comprador
```

Ao comprador solicitar correção ao fornecedor:

```text
status = correcao_solicitada_fornecedor
```

Ao fornecedor reenviar após correção:

```text
status = enviado_pelo_fornecedor
```

Ao comprador concluir sua parte:

```text
status = aguardando_aprovacao
enviado_aprovacao_at = now()
```

---

## 6. Banco de Dados

## 6.1 Criar tabela `dados_comprador_produto`

Tabela responsável pela parte da ficha preenchida pelo comprador.

```sql
create table if not exists public.dados_comprador_produto (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos_cadastro(id) on delete cascade,

  descricao_prado text,

  entrega_cd boolean not null default false,
  entrega_loja boolean not null default false,
  cross_dock boolean not null default false,

  substituicao boolean,

  departamento text,
  categoria text,
  subcategoria text,
  segmento text,
  subsegmento text,

  margem_lucro numeric(8,2),
  preco_prado numeric(12,2),
  preco_pradao numeric(12,2),
  codigo_item_similar text,

  salvo_em timestamptz,
  enviado_aprovacao_em timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6.1.1 Índices recomendados

```sql
create unique index if not exists idx_dados_comprador_produto_processo_id
on public.dados_comprador_produto(processo_id);

create index if not exists idx_dados_comprador_produto_departamento
on public.dados_comprador_produto(departamento);

create index if not exists idx_dados_comprador_produto_categoria
on public.dados_comprador_produto(categoria);
```

### 6.1.2 Relação

A relação deve ser:

```text
1 processo -> 1 registro de dados do comprador
```

Se o comprador salvar várias vezes, atualizar o mesmo registro.

---

## 6.2 Criar tabela `processo_mix_lojas`

Tabela responsável pelo mix de lojas selecionado no processo.

```sql
create table if not exists public.processo_mix_lojas (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos_cadastro(id) on delete cascade,

  loja_codigo text not null,
  loja_nome text not null,
  selecionado boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6.2.1 Índices recomendados

```sql
create index if not exists idx_processo_mix_lojas_processo_id
on public.processo_mix_lojas(processo_id);

create index if not exists idx_processo_mix_lojas_codigo
on public.processo_mix_lojas(loja_codigo);
```

### 6.2.2 Evitar duplicidade

Criar índice único:

```sql
create unique index if not exists idx_processo_mix_lojas_unique
on public.processo_mix_lojas(processo_id, loja_codigo);
```

---

## 6.3 Lojas iniciais do mix

Usar inicialmente as lojas da ficha:

```text
1 - Biguaçu
2 - Governador Celso Ramos
3 - Canasvieiras
4 - São José
5 - Palhoça
7 - Estreito
8 - Porto Belo
9 - Saco dos Limões
99 - Centro de Distribuição
```

No código, criar constante:

```ts
export const LOJAS_MIX = [
  { codigo: "1", nome: "Biguaçu" },
  { codigo: "2", nome: "Governador Celso Ramos" },
  { codigo: "3", nome: "Canasvieiras" },
  { codigo: "4", nome: "São José" },
  { codigo: "5", nome: "Palhoça" },
  { codigo: "7", nome: "Estreito" },
  { codigo: "8", nome: "Porto Belo" },
  { codigo: "9", nome: "Saco dos Limões" },
  { codigo: "99", nome: "Centro de Distribuição" },
];
```

No futuro, essas lojas podem virar tabela dinâmica.

---

## 6.4 Atualizar tabela `processos_cadastro`

Confirmar que existem os campos:

```sql
enviado_aprovacao_at timestamptz
motivo_correcao text
```

Se não existirem:

```sql
alter table public.processos_cadastro
add column if not exists enviado_aprovacao_at timestamptz;

alter table public.processos_cadastro
add column if not exists motivo_correcao text;
```

---

## 6.5 Histórico

Usar tabela `historico_processos`.

Eventos novos:

```text
comprador_iniciou_analise
comprador_salvou_rascunho
comprador_solicitou_correcao_fornecedor
comprador_enviou_para_aprovacao
status_alterado_para_em_analise_comprador
status_alterado_para_correcao_solicitada_fornecedor
status_alterado_para_aguardando_aprovacao
```

---

## 7. Permissões da Sprint 3

## 7.1 Comprador responsável

Pode:

- ver processos onde é responsável;
- abrir processo enviado pelo fornecedor;
- iniciar análise;
- preencher dados do comprador;
- salvar rascunho;
- solicitar correção ao fornecedor;
- enviar para aprovação.

Não pode:

- editar processo de outro comprador;
- aprovar;
- assinar;
- gerar PDF final;
- marcar como cadastrado.

## 7.2 Admin

Pode:

- ver todos os processos;
- editar dados do comprador em caso de necessidade;
- enviar para aprovação;
- cancelar processo.

## 7.3 Cadastro

Nesta sprint:

- não atua no processo;
- pode ver dashboard básico se já existir;
- não deve editar dados do comprador.

## 7.4 Comprador aprovador

Nesta sprint:

- continua atuando como comprador nos seus próprios processos;
- a permissão de aprovação será usada de verdade na Sprint 4.

---

## 8. Tela de Detalhes do Processo

Atualizar a rota:

```text
/app/processos/:id
```

Adicionar visão mais completa.

### 8.1 Seções da tela

```text
Resumo do processo
Dados enviados pelo fornecedor
Ação pendente
Dados do comprador
Histórico
```

### 8.2 Quando status = enviado_pelo_fornecedor

Exibir chamada:

```text
Fornecedor enviou os dados.
Revise as informações e inicie a análise do comprador.
```

Botão:

```text
Iniciar análise
```

Ao clicar:

```text
status = em_analise_comprador
```

### 8.3 Quando status = em_analise_comprador

Exibir botão:

```text
Preencher dados do comprador
```

ou abrir o formulário na própria página.

### 8.4 Quando status = aguardando_aprovacao

Exibir mensagem:

```text
Processo enviado para aprovação.
Aguardando comprador aprovador.
```

Bloquear edição comum, salvo ação de admin.

---

## 9. Tela/Formulário do Comprador

Pode ser uma rota separada ou aba dentro do detalhe.

Rota sugerida:

```text
/app/processos/:id/comprador
```

Ou componente dentro de:

```text
/app/processos/:id
```

## 9.1 Seções do formulário

```text
Revisão do fornecedor
Dados comerciais
Tipo de entrega
Substituição
Mix de lojas
Estrutura mercadológica
Preços e margem
Revisão final
```

---

## 10. Revisão dos Dados do Fornecedor

Mostrar em modo leitura:

```text
Código de barra
Descrição do produto
Marca
Gramagem
Usa balança
Preço de custo
Referência
CNPJ
Fornecedor
Código da caixa
Quantidade na caixa
Código do display
Quantidade do display
Altura
Largura
Comprimento
Cubagem
Peso bruto
Palete
Lastro
```

### 10.1 Ação de correção

Adicionar botão:

```text
Solicitar correção ao fornecedor
```

Ao clicar, abrir modal com campo obrigatório:

```text
Motivo da correção
```

Exemplo:

```text
A cubagem informada não confere com as dimensões da caixa.
```

Ao confirmar:

- status muda para `correcao_solicitada_fornecedor`;
- processo grava `motivo_correcao`;
- histórico registra ação;
- link do fornecedor precisará ser reativado ou regerado, conforme regra da Sprint 2.

### 10.2 Observação sobre link de correção

Se na Sprint 2 o link foi desativado após envio, nesta Sprint 3 deve haver uma das opções:

#### Opção A - Reativar link antigo

Reativar link se ainda existir e não estiver expirado.

#### Opção B - Gerar novo link de correção

Gerar novo link para o fornecedor corrigir.

Recomendação:

```text
Gerar novo link de correção
```

Mas envio automático não é obrigatório. O comprador pode copiar o novo link manualmente.

---

## 11. Dados Comerciais

## 11.1 Descrição Prado

Campo:

```text
descricao_prado
```

Regras:

- obrigatório;
- mínimo 3 caracteres;
- representa a descrição interna/padronizada do produto.

Placeholder:

```text
Ex: ARROZ PARBOILIZADO TIPO 1 5KG
```

---

## 12. Tipo de Entrega

Campos:

```text
entrega_cd
entrega_loja
cross_dock
```

### 12.1 Regra

Pelo menos uma opção deve ser selecionada.

### 12.2 Componente

Usar checkbox ou cards selecionáveis:

```text
Entrega CD
Entrega Loja
Cross Dock
```

### 12.3 Observação

Se a empresa decidir que só pode existir uma opção, alterar futuramente para campo único:

```text
tipo_entrega
```

Nesta sprint, manter igual ao modelo da ficha, permitindo múltipla seleção.

---

## 13. Substituição

Campo:

```text
substituicao
```

Tipo:

```text
radio
```

Opções:

```text
Sim
Não
```

Regra:

- obrigatório.

---

## 14. Mix de Lojas

## 14.1 Componente

Criar componente:

```text
MixLojasSelector
```

Deve exibir as lojas:

```text
Biguaçu
Governador Celso Ramos
Canasvieiras
São José
Palhoça
Estreito
Porto Belo
Saco dos Limões
Centro de Distribuição
```

### 14.2 Regra

Pelo menos uma loja/CD deve ser selecionado.

### 14.3 Ações úteis

Adicionar botões:

```text
Selecionar todas
Limpar seleção
```

Opcional:

```text
Selecionar apenas CD
```

### 14.4 Salvamento

Ao salvar dados do comprador:

- apagar/atualizar seleção anterior;
- inserir registros selecionados em `processo_mix_lojas`;
- manter `selecionado = true`.

---

## 15. Estrutura Mercadológica

Campos:

```text
departamento
categoria
subcategoria
segmento
subsegmento
```

### 15.1 Regras

Obrigatórios no MVP:

```text
departamento
categoria
```

Recomendados:

```text
subcategoria
segmento
subsegmento
```

### 15.2 Tipo dos campos

Nesta sprint, podem ser texto livre ou select simples.

Recomendação para MVP:

```text
texto livre
```

No futuro, criar cadastros dinâmicos relacionados.

---

## 16. Preços e Margem

Campos:

```text
margem_lucro
preco_prado
preco_pradao
codigo_item_similar
```

### 16.1 Margem de lucro

Campo:

```text
margem_lucro
```

Regras:

- obrigatório;
- percentual;
- aceitar decimal.

Exemplo:

```text
25,50%
```

Salvar como:

```text
25.50
```

### 16.2 Preço Prado

Campo:

```text
preco_prado
```

Regras:

- obrigatório;
- monetário;
- formato BRL na tela;
- numeric no banco.

### 16.3 Preço Pradão

Campo:

```text
preco_pradao
```

Regras:

- opcional no MVP, salvo decisão da empresa;
- monetário.

### 16.4 Código de item similar

Campo:

```text
codigo_item_similar
```

Regras:

- opcional;
- texto livre ou número;
- usado para referência com produto parecido.

---

## 17. Validações com Zod

Criar schema:

```ts
export const compradorProdutoSchema = z.object({
  descricao_prado: z
    .string()
    .min(3, "Informe a descrição Prado"),

  entrega_cd: z.boolean().default(false),
  entrega_loja: z.boolean().default(false),
  cross_dock: z.boolean().default(false),

  substituicao: z.boolean({
    required_error: "Informe se há substituição",
  }),

  departamento: z
    .string()
    .min(1, "Informe o departamento"),

  categoria: z
    .string()
    .min(1, "Informe a categoria"),

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
    .positive("Informe uma margem válida"),

  preco_prado: z
    .coerce
    .number()
    .positive("Informe o preço Prado"),

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
    .min(1, "Selecione pelo menos uma loja ou CD"),
}).superRefine((data, ctx) => {
  const temTipoEntrega =
    data.entrega_cd || data.entrega_loja || data.cross_dock;

  if (!temTipoEntrega) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["entrega_cd"],
      message: "Selecione pelo menos um tipo de entrega",
    });
  }
});
```

Ajustar conforme o padrão real do projeto.

---

## 18. Services

## 18.1 `dadosCompradorService.ts`

Criar funções:

```text
buscarDadosCompradorPorProcesso(processoId)
salvarRascunhoComprador(processoId, data)
enviarParaAprovacao(processoId, data)
solicitarCorrecaoFornecedor(processoId, motivo)
```

### 18.1.1 `buscarDadosCompradorPorProcesso`

Responsável por:

- buscar dados já salvos do comprador;
- buscar mix de lojas selecionado;
- retornar tudo em formato pronto para o formulário.

### 18.1.2 `salvarRascunhoComprador`

Responsável por:

1. validar permissão do comprador;
2. inserir ou atualizar `dados_comprador_produto`;
3. salvar mix de lojas;
4. manter status `em_analise_comprador`;
5. registrar histórico `comprador_salvou_rascunho`.

### 18.1.3 `enviarParaAprovacao`

Responsável por:

1. validar dados obrigatórios;
2. salvar dados do comprador;
3. salvar mix de lojas;
4. atualizar processo:
   - `status = aguardando_aprovacao`;
   - `enviado_aprovacao_at = now()`;
5. registrar histórico `comprador_enviou_para_aprovacao`.

### 18.1.4 `solicitarCorrecaoFornecedor`

Responsável por:

1. validar motivo obrigatório;
2. atualizar processo:
   - `status = correcao_solicitada_fornecedor`;
   - `motivo_correcao = motivo`;
3. gerar ou reativar link para fornecedor;
4. registrar histórico `comprador_solicitou_correcao_fornecedor`.

---

## 19. Componentes a Criar

### 19.1 Componentes do comprador

```text
CompradorForm
CompradorReviewFornecedor
TipoEntregaSelector
SubstituicaoSelector
MixLojasSelector
EstruturaMercadologicaForm
DadosComerciaisForm
CompradorReviewFinal
SolicitarCorrecaoFornecedorDialog
EnviarAprovacaoDialog
```

### 19.2 Componentes de processo

Atualizar ou criar:

```text
DadosCompradorCard
ProcessoActionPanel
```

### 19.3 Componentes auxiliares

```text
MoneyInput
PercentInput
```

Se já existirem componentes equivalentes, reutilizar.

---

## 20. Páginas / Rotas

## 20.1 Rota principal do formulário do comprador

Criar:

```text
/app/processos/:id/comprador
```

Esta rota deve:

- exigir login;
- verificar permissão;
- carregar processo;
- carregar dados do fornecedor;
- carregar dados do comprador, se já existirem;
- carregar mix selecionado;
- permitir salvar;
- permitir enviar para aprovação.

## 20.2 Atualizar detalhe do processo

Rota:

```text
/app/processos/:id
```

Adicionar botões conforme status:

### Status `enviado_pelo_fornecedor`

```text
Iniciar análise
```

### Status `em_analise_comprador`

```text
Continuar preenchimento do comprador
Solicitar correção ao fornecedor
```

### Status `aguardando_aprovacao`

```text
Ver dados enviados para aprovação
```

---

## 21. Atualização do Dashboard

Adicionar ou ajustar cards:

Para comprador:

```text
Enviados pelo fornecedor
Em análise comigo
Aguardando aprovação
Correções solicitadas ao fornecedor
```

Para admin:

```text
Enviados pelo fornecedor
Em análise comprador
Aguardando aprovação
Correções fornecedor
```

---

## 22. Atualização da Listagem de Processos

Adicionar ações por status:

### `enviado_pelo_fornecedor`

```text
Revisar fornecedor
```

### `em_analise_comprador`

```text
Continuar comprador
```

### `correcao_solicitada_fornecedor`

```text
Aguardando correção
```

### `aguardando_aprovacao`

```text
Aguardando aprovação
```

---

## 23. Histórico

Registrar:

### 23.1 Iniciar análise

```text
acao = comprador_iniciou_analise
status_anterior = enviado_pelo_fornecedor
status_novo = em_analise_comprador
observacao = Comprador iniciou análise dos dados do fornecedor
```

### 23.2 Salvar rascunho

```text
acao = comprador_salvou_rascunho
status_anterior = em_analise_comprador
status_novo = em_analise_comprador
observacao = Comprador salvou dados comerciais
```

### 23.3 Solicitar correção ao fornecedor

```text
acao = comprador_solicitou_correcao_fornecedor
status_anterior = em_analise_comprador
status_novo = correcao_solicitada_fornecedor
observacao = {motivo informado}
```

### 23.4 Enviar para aprovação

```text
acao = comprador_enviou_para_aprovacao
status_anterior = em_analise_comprador
status_novo = aguardando_aprovacao
observacao = Comprador concluiu preenchimento e enviou para aprovação
```

---

## 24. UX da Tela do Comprador

## 24.1 Layout sugerido

Tela dividida em duas áreas:

### Coluna principal

- revisão dos dados do fornecedor;
- formulário do comprador.

### Coluna lateral

- status atual;
- número do processo;
- comprador responsável;
- fornecedor;
- ações rápidas;
- histórico resumido.

Se ficar complexo, usar layout de uma coluna com cards.

## 24.2 Alertas úteis

Se status for `enviado_pelo_fornecedor`:

```text
Revise os dados enviados pelo fornecedor antes de preencher a parte comercial.
```

Se houver motivo de correção anterior:

```text
Este processo já teve correção solicitada ao fornecedor.
Confira os dados reenviados.
```

Se status for `aguardando_aprovacao`:

```text
Este processo já foi enviado para aprovação e não pode ser editado.
```

## 24.3 Botões

Durante análise:

```text
Salvar rascunho
Solicitar correção ao fornecedor
Enviar para aprovação
```

Após envio para aprovação:

```text
Voltar para processo
```

---

## 25. Formatação

### 25.1 Moeda

Campos monetários:

```text
preco_prado
preco_pradao
```

Exibir em BRL:

```text
R$ 12,34
```

Salvar como numeric:

```text
12.34
```

### 25.2 Percentual

Campo:

```text
margem_lucro
```

Exibir:

```text
25,50%
```

Salvar:

```text
25.50
```

### 25.3 Booleanos

Exibir:

```text
Sim
Não
```

Salvar como:

```text
true
false
```

---

## 26. RLS e Segurança

## 26.1 `dados_comprador_produto`

Ativar RLS:

```sql
alter table public.dados_comprador_produto enable row level security;
```

Regras desejadas:

- comprador responsável pode ler/inserir/atualizar enquanto processo está em `em_analise_comprador`;
- comprador responsável pode ler depois de enviado;
- admin pode ler/editar;
- aprovador lerá na Sprint 4;
- cadastro lerá na Sprint 5.

## 26.2 `processo_mix_lojas`

Ativar RLS:

```sql
alter table public.processo_mix_lojas enable row level security;
```

Regras desejadas:

- comprador responsável pode ler/inserir/atualizar enquanto processo está em análise;
- admin pode ler/editar;
- aprovador lerá na Sprint 4;
- cadastro lerá na Sprint 5.

## 26.3 Permissão de envio para aprovação

Antes de enviar para aprovação, validar:

```text
usuário logado = comprador_responsavel_id
ou usuário é admin
```

E status deve ser:

```text
em_analise_comprador
```

ou, se permitido:

```text
enviado_pelo_fornecedor
```

Neste caso, ao enviar, salvar diretamente e mudar para `aguardando_aprovacao`.

---

## 27. Critérios de Aceite

A Sprint 3 será considerada concluída quando:

1. Comprador visualizar processos com status `enviado_pelo_fornecedor`.
2. Comprador conseguir iniciar análise.
3. Processo mudar para `em_analise_comprador`.
4. Comprador conseguir ver dados enviados pelo fornecedor em modo leitura.
5. Comprador conseguir preencher descrição Prado.
6. Comprador conseguir selecionar tipo de entrega.
7. Comprador conseguir informar substituição.
8. Comprador conseguir selecionar mix de lojas.
9. Comprador conseguir preencher departamento e categoria.
10. Comprador conseguir preencher margem e preço Prado.
11. Comprador conseguir salvar rascunho.
12. Dados forem salvos em `dados_comprador_produto`.
13. Mix for salvo em `processo_mix_lojas`.
14. Comprador conseguir solicitar correção ao fornecedor com motivo.
15. Correção alterar status para `correcao_solicitada_fornecedor`.
16. Comprador conseguir enviar para aprovação.
17. Envio alterar status para `aguardando_aprovacao`.
18. Campo `enviado_aprovacao_at` ser preenchido.
19. Histórico registrar início de análise, rascunho, correção e envio.
20. Comprador comum não conseguir editar processo de outro comprador.
21. Processo em `aguardando_aprovacao` ficar bloqueado para edição comum.
22. Funcionalidades das sprints anteriores continuarem funcionando.

---

## 28. Testes Manuais

## 28.1 Iniciar análise

1. Entrar como comprador responsável.
2. Abrir processo com status `enviado_pelo_fornecedor`.
3. Clicar em "Iniciar análise".
4. Confirmar status `Em análise comprador`.
5. Confirmar histórico.

## 28.2 Preencher dados do comprador

1. Abrir formulário do comprador.
2. Ver dados do fornecedor em modo leitura.
3. Preencher descrição Prado.
4. Selecionar tipo de entrega.
5. Informar substituição.
6. Selecionar lojas.
7. Preencher departamento e categoria.
8. Preencher margem e preço Prado.
9. Salvar rascunho.
10. Reabrir tela e confirmar dados salvos.

## 28.3 Validar obrigatórios

1. Tentar enviar sem descrição Prado.
2. Confirmar erro.
3. Tentar enviar sem tipo de entrega.
4. Confirmar erro.
5. Tentar enviar sem loja.
6. Confirmar erro.
7. Tentar enviar sem departamento/categoria.
8. Confirmar erro.
9. Tentar enviar sem margem/preço Prado.
10. Confirmar erro.

## 28.4 Solicitar correção ao fornecedor

1. Abrir processo em análise.
2. Clicar em "Solicitar correção ao fornecedor".
3. Tentar confirmar sem motivo.
4. Confirmar erro.
5. Informar motivo.
6. Confirmar.
7. Ver status `Correção solicitada ao fornecedor`.
8. Ver histórico.
9. Confirmar que processo não está mais disponível para envio à aprovação até fornecedor corrigir.

## 28.5 Enviar para aprovação

1. Preencher todos os campos obrigatórios.
2. Clicar em "Enviar para aprovação".
3. Confirmar modal.
4. Confirmar status `Aguardando aprovação`.
5. Verificar `enviado_aprovacao_at`.
6. Ver histórico.
7. Confirmar que formulário ficou bloqueado.

## 28.6 Permissão

1. Criar processo com comprador A.
2. Enviar dados pelo fornecedor.
3. Entrar como comprador B.
4. Confirmar que comprador B não consegue editar.
5. Entrar como admin.
6. Confirmar que admin consegue visualizar.

---

## 29. Checklist Técnico

### Banco

- [ ] Criar `dados_comprador_produto`.
- [ ] Criar `processo_mix_lojas`.
- [ ] Criar índices.
- [ ] Ativar RLS.
- [ ] Confirmar campo `enviado_aprovacao_at`.
- [ ] Confirmar campo `motivo_correcao`.

### Services

- [ ] Criar `dadosCompradorService.ts`.
- [ ] Buscar dados do comprador.
- [ ] Salvar rascunho.
- [ ] Salvar mix de lojas.
- [ ] Solicitar correção.
- [ ] Enviar para aprovação.
- [ ] Registrar histórico.

### UI

- [ ] Criar formulário do comprador.
- [ ] Criar revisão dos dados do fornecedor.
- [ ] Criar seletor de tipo de entrega.
- [ ] Criar seletor de substituição.
- [ ] Criar seletor de mix de lojas.
- [ ] Criar seção de estrutura mercadológica.
- [ ] Criar seção de dados comerciais.
- [ ] Criar modal de correção.
- [ ] Criar modal de envio para aprovação.

### Status

- [ ] `enviado_pelo_fornecedor -> em_analise_comprador`.
- [ ] `em_analise_comprador -> correcao_solicitada_fornecedor`.
- [ ] `em_analise_comprador -> aguardando_aprovacao`.

### Histórico

- [ ] Registrar início de análise.
- [ ] Registrar rascunho salvo.
- [ ] Registrar correção solicitada.
- [ ] Registrar envio para aprovação.

### Permissões

- [ ] Comprador comum vê apenas seus processos.
- [ ] Comprador comum edita apenas seus processos.
- [ ] Admin visualiza todos.
- [ ] Processo aguardando aprovação bloqueia edição comum.

---

## 30. Entrega Esperada

Ao final da Sprint 3, o sistema deve permitir o fluxo completo até o envio para aprovação:

```text
Fornecedor envia dados
↓
Comprador revisa
↓
Comprador completa parte comercial
↓
Comprador seleciona mix e estrutura
↓
Comprador envia para aprovação
```

O sistema ainda não precisa aprovar, assinar, cadastrar ou gerar PDF final.

---

## 31. Próxima Sprint

### Sprint 4 - Aprovação e Assinatura

Na Sprint 4, implementar:

- fila de aprovação;
- permissão `pode_aprovar`;
- tela do comprador aprovador;
- revisão completa da ficha;
- aprovar e assinar;
- reprovar com motivo;
- solicitar ajuste ao comprador;
- bloquear autoaprovação, se definido;
- status `aprovado_para_cadastro`;
- histórico de aprovação.

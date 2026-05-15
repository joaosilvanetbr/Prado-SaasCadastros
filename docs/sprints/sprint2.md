# SPRINT 2 - Fluxo do Fornecedor

## 1. Objetivo da Sprint

Implementar o fluxo em que o comprador envia um processo para o fornecedor preencher sua parte da ficha de cadastro de produto.

Nesta sprint, o sistema deve permitir:

1. Comprador gerar um link único para o fornecedor.
2. Fornecedor acessar uma rota pública sem login interno.
3. Fornecedor preencher os dados básicos do produto.
4. Fornecedor preencher informações logísticas.
5. Fornecedor salvar ou enviar a ficha.
6. Sistema validar os campos obrigatórios.
7. Após envio, processo voltar para o comprador responsável.
8. Histórico registrar todas as ações importantes.

---

## 2. Contexto do Projeto

Na Sprint 1 foi criada a base do sistema:

- login;
- perfis;
- dashboard;
- processos;
- fornecedores;
- histórico inicial;
- status `rascunho` e `aguardando_fornecedor`.

A Sprint 2 continua a partir desse ponto.

Fluxo esperado nesta sprint:

```text
Comprador cria processo
↓
Comprador gera link para fornecedor
↓
Processo fica aguardando fornecedor
↓
Fornecedor acessa link público
↓
Fornecedor preenche dados básicos e logísticos
↓
Fornecedor envia
↓
Processo muda para enviado pelo fornecedor
↓
Comprador responsável pode revisar
```

---

## 3. Regras Obrigatórias para IA / Coding Agent

### 3.1 Não alterar documentação sem autorização

Durante esta sprint:

- não alterar arquivos `.md` existentes;
- não alterar a pasta `docs/`;
- não apagar documentação;
- não reescrever `SPEC.md`, `README.md`, `SPRINT1.md` ou qualquer outro `.md`;
- não criar documentação extra sem pedido explícito.

Exceção: se o usuário pedir explicitamente alteração em documentação.

### 3.2 Não mexer fora do escopo

Não implementar ainda:

- aprovação do comprador aprovador;
- assinatura;
- fila de cadastro;
- geração de PDF;
- relatórios avançados;
- anexos complexos;
- envio automático de e-mail;
- WhatsApp;
- integração com ERP;
- importação de Excel.

### 3.3 Preservar a base da Sprint 1

Não quebrar:

- login;
- listagem de processos;
- criação de processo;
- histórico;
- dashboard;
- permissões já criadas.

### 3.4 Implementação segura

- links de fornecedor devem usar token seguro;
- não salvar token puro no banco;
- salvar hash do token;
- link deve ser invalidado após envio ou expiração;
- fornecedor só acessa o próprio processo;
- fornecedor não acessa dashboard interno;
- fornecedor não acessa dados comerciais internos.

---

## 4. Escopo da Sprint 2

### 4.1 Incluído

Implementar:

1. Tabela `links_fornecedor`.
2. Tabela `dados_fornecedor_produto`.
3. Geração de token/link para fornecedor.
4. Rota pública `/fornecedor/:token`.
5. Validação de token.
6. Tela pública do fornecedor.
7. Formulário do fornecedor.
8. Campos básicos do produto.
9. Campos de caixa/display.
10. Campos logísticos.
11. Cálculo automático de cubagem.
12. Salvar rascunho do fornecedor, se possível.
13. Enviar ficha para comprador.
14. Atualizar status do processo.
15. Registrar histórico.
16. Bloquear edição após envio.
17. Melhorar tela de detalhes do processo para mostrar dados enviados pelo fornecedor.

### 4.2 Fora do escopo

Não implementar nesta sprint:

- preenchimento do comprador;
- mix de lojas;
- estrutura mercadológica;
- preço Prado;
- margem;
- aprovação/assinatura;
- cadastro final;
- PDF final;
- upload de anexos, salvo se for muito simples e não atrapalhar;
- envio real por e-mail.

---

## 5. Status Usados nesta Sprint

Status principais:

```text
rascunho
aguardando_fornecedor
enviado_pelo_fornecedor
em_analise_comprador
cancelado
```

### 5.1 Transições desta sprint

```text
rascunho -> aguardando_fornecedor
aguardando_fornecedor -> enviado_pelo_fornecedor
enviado_pelo_fornecedor -> em_analise_comprador
qualquer_status_permitido -> cancelado
```

### 5.2 Regras

Quando o comprador gera link:

```text
status = aguardando_fornecedor
```

Quando fornecedor envia:

```text
status = enviado_pelo_fornecedor
respondido_fornecedor_at = now()
```

Quando comprador abre para revisar, opcionalmente:

```text
status = em_analise_comprador
```

Se o processo for cancelado:

```text
status = cancelado
```

---

## 6. Banco de Dados

## 6.1 Criar tabela `links_fornecedor`

Tabela responsável pelos links públicos de preenchimento.

```sql
create table if not exists public.links_fornecedor (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos_cadastro(id) on delete cascade,

  token_hash text not null,
  email_destino text,
  expira_em timestamptz,
  usado_em timestamptz,
  ativo boolean not null default true,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6.1.1 Índices recomendados

```sql
create index if not exists idx_links_fornecedor_processo_id
on public.links_fornecedor(processo_id);

create index if not exists idx_links_fornecedor_token_hash
on public.links_fornecedor(token_hash);

create index if not exists idx_links_fornecedor_ativo
on public.links_fornecedor(ativo);
```

### 6.1.2 Regras da tabela

- `token_hash` deve armazenar apenas hash do token;
- nunca salvar token puro;
- um processo pode ter mais de um link gerado ao longo do tempo;
- somente o link ativo mais recente deve funcionar;
- ao gerar novo link, desativar links antigos do mesmo processo;
- ao fornecedor enviar ficha, marcar `usado_em = now()` e `ativo = false`, se a regra for link de uso único.

---

## 6.2 Criar tabela `dados_fornecedor_produto`

Tabela para armazenar a parte da ficha preenchida pelo fornecedor.

```sql
create table if not exists public.dados_fornecedor_produto (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos_cadastro(id) on delete cascade,

  codigo_barra text,
  descricao_produto text,
  marca text,
  gramagem text,
  usa_balanca boolean,
  preco_custo numeric(12,2),
  referencia text,
  cnpj text,
  fornecedor_nome text,

  codigo_caixa text,
  quantidade_na_caixa integer,
  codigo_display text,
  quantidade_do_display integer,

  altura_cm numeric(10,2),
  largura_cm numeric(10,2),
  comprimento_cm numeric(10,2),
  cubagem_m3 numeric(12,6),
  peso_bruto_kg numeric(10,3),
  palete text,
  lastro text,

  enviado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6.2.1 Índices recomendados

```sql
create unique index if not exists idx_dados_fornecedor_produto_processo_id
on public.dados_fornecedor_produto(processo_id);

create index if not exists idx_dados_fornecedor_produto_codigo_barra
on public.dados_fornecedor_produto(codigo_barra);

create index if not exists idx_dados_fornecedor_produto_cnpj
on public.dados_fornecedor_produto(cnpj);
```

### 6.2.2 Observação

A relação deve ser:

```text
1 processo -> 1 registro de dados do fornecedor
```

Se o fornecedor salvar várias vezes, atualizar o mesmo registro.

---

## 6.3 Atualizar tabela `processos_cadastro`

Confirmar que existem os campos:

```sql
enviado_fornecedor_at timestamptz
respondido_fornecedor_at timestamptz
descricao_produto_resumo text
codigo_barra_resumo text
```

Se não existirem, criar migration:

```sql
alter table public.processos_cadastro
add column if not exists enviado_fornecedor_at timestamptz;

alter table public.processos_cadastro
add column if not exists respondido_fornecedor_at timestamptz;

alter table public.processos_cadastro
add column if not exists descricao_produto_resumo text;

alter table public.processos_cadastro
add column if not exists codigo_barra_resumo text;
```

---

## 6.4 Histórico

Usar tabela `historico_processos` da Sprint 1.

Eventos novos desta sprint:

```text
link_fornecedor_gerado
link_fornecedor_regerado
fornecedor_acessou_link
fornecedor_salvou_rascunho
fornecedor_enviou_ficha
status_alterado_para_aguardando_fornecedor
status_alterado_para_enviado_pelo_fornecedor
status_alterado_para_em_analise_comprador
```

---

## 7. Segurança do Link do Fornecedor

## 7.1 Token

Ao gerar link, criar token aleatório forte.

Exemplo conceitual:

```text
crypto.randomUUID() + random string
```

O token puro deve aparecer somente no link enviado/copied ao comprador.

No banco, salvar:

```text
hash(token)
```

Nunca salvar token puro.

## 7.2 URL pública

Formato:

```text
/fornecedor/:token
```

Exemplo:

```text
https://sistema.com/fornecedor/abc123token
```

## 7.3 Validação do token

Ao acessar:

1. Capturar token da URL.
2. Gerar hash.
3. Buscar `links_fornecedor.token_hash`.
4. Verificar se `ativo = true`.
5. Verificar se não expirou.
6. Verificar se processo está em status permitido.
7. Carregar somente dados necessários para o fornecedor.

## 7.4 Status permitidos para acesso do fornecedor

Permitir acesso se:

```text
status = aguardando_fornecedor
status = correcao_solicitada_fornecedor
```

Nesta Sprint 2, o principal será:

```text
status = aguardando_fornecedor
```

## 7.5 Bloqueio após envio

Depois que o fornecedor enviar:

- link deve ser desativado ou bloqueado;
- processo muda para `enviado_pelo_fornecedor`;
- fornecedor não pode mais editar;
- se acessar link novamente, mostrar tela informando que a ficha já foi enviada.

Mensagem sugerida:

```text
Ficha já enviada.
Os dados foram encaminhados para o comprador responsável.
```

## 7.6 Expiração

Definir expiração padrão sugerida:

```text
7 dias
```

Se a expiração não for implementada nesta sprint, deixar o campo preparado e criar TODO claro.

---

## 8. Rota Pública do Fornecedor

## 8.1 Rota

Criar rota:

```text
/fornecedor/:token
```

Essa rota:

- não exige login;
- não mostra sidebar;
- não mostra dashboard;
- não mostra menus internos;
- exibe apenas o formulário do fornecedor.

## 8.2 Estados da rota

A rota deve tratar:

### Token válido

Mostrar formulário.

### Token inválido

Mensagem:

```text
Link inválido.
Solicite um novo link ao comprador responsável.
```

### Token expirado

Mensagem:

```text
Este link expirou.
Solicite um novo link ao comprador responsável.
```

### Processo já enviado

Mensagem:

```text
Esta ficha já foi enviada.
```

### Processo cancelado

Mensagem:

```text
Este processo foi cancelado.
```

### Erro inesperado

Mensagem:

```text
Não foi possível carregar a ficha.
Tente novamente ou solicite apoio ao comprador responsável.
```

---

## 9. Formulário do Fornecedor

## 9.1 Seções

O formulário deve ser dividido em blocos:

```text
Dados do produto
Fornecedor
Caixa e display
Informações logísticas
Revisão e envio
```

## 9.2 Campos - Dados do produto

```text
codigo_barra
descricao_produto
marca
gramagem
usa_balanca
preco_custo
referencia
```

### 9.2.1 Código de barra

Campo:

```text
codigo_barra
```

Regras:

- obrigatório;
- aceitar somente números;
- tamanho recomendado: 8, 12, 13 ou 14 dígitos;
- não bloquear códigos diferentes se a empresa usar código interno, mas avisar se formato parecer inválido.

Mensagem:

```text
Informe o código de barra do produto.
```

### 9.2.2 Descrição do produto

Campo:

```text
descricao_produto
```

Regras:

- obrigatório;
- mínimo 3 caracteres;
- texto livre.

Mensagem:

```text
Informe a descrição do produto.
```

### 9.2.3 Marca

Campo:

```text
marca
```

Regras:

- obrigatório;
- texto livre.

### 9.2.4 Gramagem

Campo:

```text
gramagem
```

Regras:

- obrigatório;
- texto livre curto;
- exemplos de placeholder:

```text
500g
1kg
350ml
2L
```

### 9.2.5 Usa balança

Campo:

```text
usa_balanca
```

Tipo:

```text
radio ou select
```

Opções:

```text
Sim
Não
```

Regra:

- obrigatório.

### 9.2.6 Preço de custo

Campo:

```text
preco_custo
```

Regras:

- obrigatório;
- monetário;
- aceitar vírgula brasileira;
- salvar como numeric.

Placeholder:

```text
R$ 0,00
```

### 9.2.7 Referência

Campo:

```text
referencia
```

Regras:

- opcional;
- texto livre.

---

## 9.3 Campos - Fornecedor

```text
cnpj
fornecedor_nome
```

### 9.3.1 CNPJ

Campo:

```text
cnpj
```

Regras:

- obrigatório;
- aplicar máscara `00.000.000/0000-00`;
- validar quantidade de dígitos;
- se possível, validar dígitos verificadores.

### 9.3.2 Nome do fornecedor

Campo:

```text
fornecedor_nome
```

Regras:

- obrigatório;
- pode vir preenchido com o fornecedor vinculado no processo;
- fornecedor pode ajustar se necessário, conforme regra do MVP.

---

## 9.4 Campos - Caixa e display

```text
codigo_caixa
quantidade_na_caixa
codigo_display
quantidade_do_display
```

### 9.4.1 Código da caixa

Campo:

```text
codigo_caixa
```

Regras:

- opcional no MVP;
- aceitar números;
- pode ser DUN-14.

### 9.4.2 Quantidade na caixa

Campo:

```text
quantidade_na_caixa
```

Regras:

- obrigatório se `codigo_caixa` estiver preenchido;
- número inteiro;
- maior que zero.

### 9.4.3 Código do display

Campo:

```text
codigo_display
```

Regras:

- opcional;
- aceitar números.

### 9.4.4 Quantidade do display

Campo:

```text
quantidade_do_display
```

Regras:

- obrigatório se `codigo_display` estiver preenchido;
- número inteiro;
- maior que zero.

---

## 9.5 Campos - Informações logísticas

```text
altura_cm
largura_cm
comprimento_cm
cubagem_m3
peso_bruto_kg
palete
lastro
```

### 9.5.1 Altura

Campo:

```text
altura_cm
```

Regras:

- obrigatório;
- número decimal;
- unidade em centímetros.

### 9.5.2 Largura

Campo:

```text
largura_cm
```

Regras:

- obrigatório;
- número decimal;
- unidade em centímetros.

### 9.5.3 Comprimento

Campo:

```text
comprimento_cm
```

Regras:

- obrigatório;
- número decimal;
- unidade em centímetros.

### 9.5.4 Cubagem

Campo:

```text
cubagem_m3
```

Regras:

- calculado automaticamente;
- permitir edição manual somente se necessário;
- fórmula:

```text
cubagem_m3 = (altura_cm * largura_cm * comprimento_cm) / 1.000.000
```

Exemplo:

```text
altura = 30
largura = 20
comprimento = 40

cubagem = 0,024 m³
```

### 9.5.5 Peso bruto

Campo:

```text
peso_bruto_kg
```

Regras:

- obrigatório;
- número decimal;
- unidade em kg.

### 9.5.6 Palete

Campo:

```text
palete
```

Regras:

- opcional no MVP;
- texto ou número conforme uso da empresa.

### 9.5.7 Lastro

Campo:

```text
lastro
```

Regras:

- opcional no MVP;
- texto ou número conforme uso da empresa.

---

## 10. Validações com Zod

Criar schema:

```ts
export const fornecedorProdutoSchema = z.object({
  codigo_barra: z
    .string()
    .min(1, "Informe o código de barra")
    .regex(/^\d+$/, "Use apenas números no código de barra"),

  descricao_produto: z
    .string()
    .min(3, "Informe a descrição do produto"),

  marca: z
    .string()
    .min(1, "Informe a marca"),

  gramagem: z
    .string()
    .min(1, "Informe a gramagem"),

  usa_balanca: z
    .boolean({
      required_error: "Informe se usa balança",
    }),

  preco_custo: z
    .coerce
    .number()
    .positive("Informe um preço de custo válido"),

  referencia: z
    .string()
    .optional()
    .nullable(),

  cnpj: z
    .string()
    .min(14, "Informe o CNPJ"),

  fornecedor_nome: z
    .string()
    .min(2, "Informe o fornecedor"),

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
    .positive("Informe a altura"),

  largura_cm: z
    .coerce
    .number()
    .positive("Informe a largura"),

  comprimento_cm: z
    .coerce
    .number()
    .positive("Informe o comprimento"),

  cubagem_m3: z
    .coerce
    .number()
    .optional()
    .nullable(),

  peso_bruto_kg: z
    .coerce
    .number()
    .positive("Informe o peso bruto"),

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
      path: ["quantidade_na_caixa"],
      message: "Informe a quantidade na caixa",
    });
  }

  if (data.codigo_display && !data.quantidade_do_display) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["quantidade_do_display"],
      message: "Informe a quantidade do display",
    });
  }
});
```

Ajustar o schema conforme o padrão real do projeto.

---

## 11. Componentes a Criar

## 11.1 Componentes públicos

```text
FornecedorLayout
FornecedorTokenGuard
FornecedorForm
FornecedorSuccess
FornecedorInvalidLink
FornecedorExpiredLink
FornecedorAlreadySubmitted
```

## 11.2 Componentes do formulário

```text
FornecedorDadosProdutoSection
FornecedorDadosEmpresaSection
FornecedorCaixaDisplaySection
FornecedorLogisticaSection
FornecedorReviewSection
CubagemPreview
```

## 11.3 Componentes internos

```text
GerarLinkFornecedorButton
FornecedorLinkDialog
DadosFornecedorCard
```

---

## 12. Páginas / Rotas

## 12.1 Rota pública

```text
/fornecedor/:token
```

Página:

```text
FornecedorPage.tsx
```

Responsabilidades:

- validar token;
- carregar processo;
- carregar dados existentes, se houver;
- exibir formulário;
- salvar rascunho;
- enviar ficha;
- mostrar mensagens de estado.

## 12.2 Rota interna do processo

Atualizar:

```text
/app/processos/:id
```

Adicionar:

- botão para gerar link do fornecedor;
- botão para copiar link;
- seção com dados do fornecedor, quando existirem;
- status visual;
- histórico atualizado.

---

## 13. Services

## 13.1 `fornecedorLinkService.ts`

Criar funções:

```text
gerarLinkFornecedor(processoId, emailDestino)
validarTokenFornecedor(token)
desativarLinksAnteriores(processoId)
marcarLinkComoUsado(linkId)
```

### 13.1.1 `gerarLinkFornecedor`

Responsabilidades:

1. verificar se usuário logado pode gerar link;
2. desativar links antigos do processo;
3. gerar token puro;
4. gerar hash;
5. salvar hash no banco;
6. atualizar processo para `aguardando_fornecedor`;
7. preencher `enviado_fornecedor_at`;
8. registrar histórico;
9. retornar URL pública com token puro.

### 13.1.2 `validarTokenFornecedor`

Responsabilidades:

1. receber token puro;
2. calcular hash;
3. buscar link ativo;
4. verificar expiração;
5. verificar status do processo;
6. retornar dados mínimos do processo e fornecedor.

## 13.2 `dadosFornecedorService.ts`

Criar funções:

```text
buscarDadosFornecedorPorProcesso(processoId)
salvarRascunhoFornecedor(processoId, data)
enviarDadosFornecedor(processoId, data, linkId)
calcularCubagem(altura, largura, comprimento)
```

### 13.2.1 `salvarRascunhoFornecedor`

Responsabilidades:

- inserir ou atualizar dados em `dados_fornecedor_produto`;
- não alterar status final;
- registrar histórico `fornecedor_salvou_rascunho`, se desejado.

### 13.2.2 `enviarDadosFornecedor`

Responsabilidades:

1. validar dados;
2. salvar dados;
3. preencher `enviado_em`;
4. atualizar processo:
   - `status = enviado_pelo_fornecedor`;
   - `respondido_fornecedor_at = now()`;
   - `descricao_produto_resumo`;
   - `codigo_barra_resumo`;
5. desativar link ou marcar usado;
6. registrar histórico `fornecedor_enviou_ficha`.

---

## 14. Tela Interna - Geração de Link

Na tela de detalhes do processo, quando status for `rascunho`, exibir ação:

```text
Gerar link para fornecedor
```

Ao clicar:

- criar link;
- mudar status para `aguardando_fornecedor`;
- mostrar modal com link gerado;
- permitir copiar link.

### 14.1 Modal de link

Conteúdo sugerido:

```text
Link gerado com sucesso

Envie este link para o fornecedor preencher a ficha:

[URL]

[Copiar link]
```

### 14.2 Regerar link

Se status for `aguardando_fornecedor`, permitir:

```text
Regerar link
```

Regra:

- desativar link anterior;
- gerar novo link;
- registrar histórico.

### 14.3 Não enviar e-mail nesta sprint

Nesta sprint, não precisa enviar e-mail automaticamente.

O comprador copia o link e envia manualmente.

---

## 15. Tela Pública do Fornecedor - UX

## 15.1 Cabeçalho

Exibir:

```text
PRADO
Cadastro de Produto
Preenchimento do Fornecedor
```

Texto de apoio:

```text
Preencha os dados do produto com atenção. Após o envio, a ficha será encaminhada ao comprador responsável.
```

## 15.2 Identificação do processo

Mostrar de forma simples:

```text
Processo nº 000123
Fornecedor: Nome do fornecedor
Comprador responsável: Nome do comprador, se permitido
```

Evitar mostrar informações internas sensíveis.

## 15.3 Formulário em seções

Separar em cards:

1. Dados do produto
2. Dados do fornecedor
3. Caixa e display
4. Informações logísticas
5. Revisão

## 15.4 Botões

```text
Salvar rascunho
Enviar ficha
```

Se não implementar rascunho nesta sprint, usar apenas:

```text
Enviar ficha
```

Mas a tabela deve permitir salvar depois.

## 15.5 Confirmação antes de enviar

Antes de enviar, mostrar confirmação:

```text
Após enviar, você não poderá alterar os dados, exceto se o comprador solicitar correção.
Deseja enviar a ficha?
```

Botões:

```text
Cancelar
Enviar ficha
```

## 15.6 Tela de sucesso

Após envio:

```text
Ficha enviada com sucesso!
Os dados foram encaminhados para o comprador responsável.
```

---

## 16. Tela Interna - Visualização dos Dados do Fornecedor

Na tela de detalhes do processo, adicionar seção:

```text
Dados enviados pelo fornecedor
```

Mostrar:

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

Se ainda não tiver dados:

```text
Aguardando preenchimento do fornecedor.
```

---

## 17. Permissões

## 17.1 Comprador responsável

Pode:

- gerar link para fornecedor nos próprios processos;
- regerar link;
- ver dados enviados pelo fornecedor;
- alterar status para `em_analise_comprador` quando começar revisão.

Não pode:

- gerar link para processo de outro comprador, salvo admin;
- gerar link se processo estiver cancelado;
- gerar link se processo já estiver aprovado/cadastrado.

## 17.2 Admin

Pode:

- gerar link para qualquer processo;
- regerar link;
- visualizar dados.

## 17.3 Fornecedor

Pode:

- acessar somente pelo link válido;
- preencher sua parte;
- salvar rascunho, se implementado;
- enviar.

Não pode:

- acessar rotas internas;
- ver outros processos;
- ver dados comerciais;
- alterar após envio.

---

## 18. RLS e Segurança

## 18.1 RLS para `links_fornecedor`

Ativar:

```sql
alter table public.links_fornecedor enable row level security;
```

Políticas recomendadas:

- comprador responsável pode criar link para seus processos;
- admin pode criar link para qualquer processo;
- fornecedor não acessa diretamente por RLS usando client interno comum;
- validação pública deve ser feita por função segura/RPC ou endpoint controlado.

### Observação importante

Como a rota pública não tem usuário autenticado, o acesso por token deve ser bem planejado.

Opções:

### Opção A - RPC segura

Criar funções no Supabase para:

```text
validar token
buscar dados públicos do processo
salvar dados do fornecedor
enviar dados do fornecedor
```

### Opção B - Edge Function

Criar Edge Function para lidar com token.

### Opção C - MVP simples com cuidado

Usar client Supabase anônimo com políticas específicas, tomando muito cuidado para não expor dados.

Recomendação:

```text
Para segurança, preferir Edge Function ou RPC.
```

Se o projeto ainda estiver em MVP local, pode começar simples, mas deixar TODO para endurecer segurança.

## 18.2 RLS para `dados_fornecedor_produto`

Ativar:

```sql
alter table public.dados_fornecedor_produto enable row level security;
```

Regras desejadas:

- comprador responsável lê dados do seu processo;
- admin lê tudo;
- aprovador/cadastro lerão em sprints futuras;
- escrita pública apenas via token validado;
- fornecedor não pode listar tabela inteira.

---

## 19. Atualização do Dashboard

Adicionar contagens:

```text
Aguardando fornecedor
Enviados pelo fornecedor
Em análise comprador
```

Para comprador comum:

- contar apenas seus processos.

Para admin:

- contar todos.

---

## 20. Atualização da Listagem de Processos

Adicionar status novo:

```text
Enviado pelo fornecedor
```

Quando processo estiver nesse status, mostrar ação:

```text
Revisar fornecedor
```

Ao clicar:

- abrir detalhes do processo;
- exibir dados do fornecedor;
- permitir marcar como `em_analise_comprador`.

---

## 21. Histórico

Registrar no histórico:

### 21.1 Ao gerar link

```text
acao = link_fornecedor_gerado
status_anterior = rascunho
status_novo = aguardando_fornecedor
observacao = Link gerado para fornecedor
```

### 21.2 Ao regerar link

```text
acao = link_fornecedor_regerado
status_anterior = aguardando_fornecedor
status_novo = aguardando_fornecedor
observacao = Link anterior desativado e novo link gerado
```

### 21.3 Ao salvar rascunho

```text
acao = fornecedor_salvou_rascunho
status_anterior = aguardando_fornecedor
status_novo = aguardando_fornecedor
observacao = Fornecedor salvou dados parcialmente
```

### 21.4 Ao enviar ficha

```text
acao = fornecedor_enviou_ficha
status_anterior = aguardando_fornecedor
status_novo = enviado_pelo_fornecedor
observacao = Fornecedor enviou dados do produto
```

### 21.5 Ao comprador iniciar análise

```text
acao = comprador_iniciou_analise
status_anterior = enviado_pelo_fornecedor
status_novo = em_analise_comprador
observacao = Comprador iniciou análise dos dados do fornecedor
```

---

## 22. Máscaras e Formatação

Implementar ou preparar:

```text
CNPJ: 00.000.000/0000-00
Preço: R$ 0,00
Medidas: cm
Peso: kg
Cubagem: m³
```

### 22.1 Conversão de moeda

Frontend pode mostrar:

```text
R$ 12,34
```

Banco deve salvar:

```text
12.34
```

### 22.2 Conversão de número decimal

Aceitar entrada brasileira:

```text
1,5
```

Salvar como:

```text
1.5
```

---

## 23. Arquivos e Pastas Sugeridas

Adicionar ou ajustar:

```text
src/
  pages/
    FornecedorPage.tsx

  components/
    fornecedor/
      FornecedorLayout.tsx
      FornecedorForm.tsx
      FornecedorDadosProdutoSection.tsx
      FornecedorEmpresaSection.tsx
      FornecedorCaixaDisplaySection.tsx
      FornecedorLogisticaSection.tsx
      FornecedorReviewSection.tsx
      FornecedorStateMessage.tsx

    processos/
      GerarLinkFornecedorButton.tsx
      FornecedorLinkDialog.tsx
      DadosFornecedorCard.tsx

  services/
    fornecedorLinkService.ts
    dadosFornecedorService.ts

  validations/
    fornecedorProdutoSchema.ts

  types/
    fornecedorProduto.ts
    fornecedorLink.ts

  utils/
    token.ts
    formatters.ts
    numbers.ts
```

Adaptar conforme estrutura real do projeto.

---

## 24. Tipos TypeScript

## 24.1 `FornecedorLink`

```ts
export type FornecedorLink = {
  id: string;
  processo_id: string;
  token_hash: string;
  email_destino: string | null;
  expira_em: string | null;
  usado_em: string | null;
  ativo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
```

## 24.2 `DadosFornecedorProduto`

```ts
export type DadosFornecedorProduto = {
  id: string;
  processo_id: string;

  codigo_barra: string | null;
  descricao_produto: string | null;
  marca: string | null;
  gramagem: string | null;
  usa_balanca: boolean | null;
  preco_custo: number | null;
  referencia: string | null;
  cnpj: string | null;
  fornecedor_nome: string | null;

  codigo_caixa: string | null;
  quantidade_na_caixa: number | null;
  codigo_display: string | null;
  quantidade_do_display: number | null;

  altura_cm: number | null;
  largura_cm: number | null;
  comprimento_cm: number | null;
  cubagem_m3: number | null;
  peso_bruto_kg: number | null;
  palete: string | null;
  lastro: string | null;

  enviado_em: string | null;
  created_at: string;
  updated_at: string;
};
```

## 24.3 `FornecedorTokenValidationResult`

```ts
export type FornecedorTokenValidationResult = {
  valid: boolean;
  reason?:
    | "invalid"
    | "expired"
    | "already_submitted"
    | "cancelled"
    | "not_allowed"
    | "error";
  linkId?: string;
  processoId?: string;
  numeroProcesso?: number;
  fornecedorNome?: string;
  emailDestino?: string | null;
  status?: string;
};
```

---

## 25. Critérios de Aceite

A Sprint 2 será considerada concluída quando:

1. Comprador conseguir gerar link para fornecedor.
2. Processo mudar para `aguardando_fornecedor`.
3. Link gerado puder ser copiado.
4. Link público abrir sem login.
5. Token inválido mostrar mensagem correta.
6. Token expirado ou inativo mostrar mensagem correta, se expiração for implementada.
7. Fornecedor conseguir preencher dados do produto.
8. Fornecedor conseguir preencher dados logísticos.
9. Cubagem for calculada automaticamente.
10. Campos obrigatórios forem validados.
11. Fornecedor conseguir enviar ficha.
12. Dados forem salvos em `dados_fornecedor_produto`.
13. Processo mudar para `enviado_pelo_fornecedor`.
14. `respondido_fornecedor_at` ser preenchido.
15. Link ser marcado como usado ou inativo.
16. Comprador conseguir ver os dados enviados na tela do processo.
17. Histórico registrar geração do link e envio do fornecedor.
18. Fornecedor não conseguir editar após envio.
19. Comprador comum não conseguir gerar link para processo de outro comprador.
20. Nenhuma funcionalidade da Sprint 1 ser quebrada.

---

## 26. Testes Manuais

## 26.1 Gerar link

1. Entrar como comprador.
2. Criar processo novo.
3. Abrir detalhes.
4. Clicar em "Gerar link para fornecedor".
5. Confirmar que o link aparece.
6. Copiar link.
7. Confirmar que status virou `Aguardando fornecedor`.
8. Confirmar histórico.

## 26.2 Acessar link válido

1. Abrir link em aba anônima.
2. Confirmar que não pede login.
3. Confirmar que aparece formulário do fornecedor.
4. Confirmar que mostra número do processo.

## 26.3 Enviar sem campos obrigatórios

1. Abrir formulário.
2. Clicar em enviar sem preencher.
3. Confirmar mensagens de validação.

## 26.4 Calcular cubagem

1. Informar altura `30`.
2. Informar largura `20`.
3. Informar comprimento `40`.
4. Confirmar cubagem `0,024 m³`.

## 26.5 Enviar ficha

1. Preencher todos os campos obrigatórios.
2. Clicar em enviar.
3. Confirmar modal de confirmação.
4. Confirmar envio.
5. Ver tela de sucesso.
6. Confirmar que processo mudou para `Enviado pelo fornecedor`.

## 26.6 Bloquear reenvio

1. Abrir o mesmo link novamente.
2. Confirmar mensagem de ficha já enviada.
3. Confirmar que formulário não permite edição.

## 26.7 Comprador visualiza dados

1. Entrar como comprador responsável.
2. Abrir processo.
3. Confirmar seção "Dados enviados pelo fornecedor".
4. Verificar todos os campos preenchidos.
5. Confirmar histórico de envio.

## 26.8 Permissão

1. Criar processo com comprador A.
2. Entrar como comprador B.
3. Tentar acessar/gerar link do processo A.
4. Confirmar bloqueio.
5. Entrar como admin.
6. Confirmar acesso permitido.

---

## 27. Checklist Técnico

### Banco

- [ ] Criar `links_fornecedor`.
- [ ] Criar `dados_fornecedor_produto`.
- [ ] Criar índices.
- [ ] Ativar RLS.
- [ ] Ajustar policies ou services seguros.
- [ ] Confirmar campos necessários em `processos_cadastro`.

### Link

- [ ] Gerar token seguro.
- [ ] Salvar hash.
- [ ] Desativar links anteriores.
- [ ] Copiar link.
- [ ] Validar token.
- [ ] Bloquear link inválido.
- [ ] Bloquear link usado.
- [ ] Bloquear link expirado, se implementado.

### Formulário

- [ ] Criar rota `/fornecedor/:token`.
- [ ] Criar layout público.
- [ ] Criar formulário do fornecedor.
- [ ] Criar validação com Zod.
- [ ] Criar cálculo de cubagem.
- [ ] Salvar dados.
- [ ] Enviar dados.
- [ ] Mostrar tela de sucesso.

### Processo

- [ ] Atualizar status para `aguardando_fornecedor`.
- [ ] Atualizar status para `enviado_pelo_fornecedor`.
- [ ] Preencher `respondido_fornecedor_at`.
- [ ] Atualizar resumo do processo.
- [ ] Exibir dados do fornecedor internamente.

### Histórico

- [ ] Registrar link gerado.
- [ ] Registrar link regerado.
- [ ] Registrar envio do fornecedor.
- [ ] Registrar mudança de status.

### UI

- [ ] Botão gerar link.
- [ ] Modal copiar link.
- [ ] Badge do novo status.
- [ ] Card com dados do fornecedor.
- [ ] Mensagens públicas de erro/sucesso.

---

## 28. Entrega Esperada

Ao final da Sprint 2, o sistema deve permitir o fluxo completo do fornecedor:

```text
Comprador cria processo
↓
Comprador gera link
↓
Fornecedor acessa
↓
Fornecedor preenche ficha
↓
Fornecedor envia
↓
Comprador vê os dados recebidos
```

O sistema ainda não precisa ter:

```text
parte comercial do comprador
aprovação
assinatura
cadastro final
PDF final
```

Esses pontos entram nas próximas sprints.

---

## 29. Próxima Sprint

### Sprint 3 - Área do Comprador

Na Sprint 3, implementar:

- formulário do comprador;
- descrição Prado;
- tipo de entrega;
- substituição;
- mix de lojas;
- estrutura mercadológica;
- margem;
- preço Prado;
- preço Pradão;
- código de item similar;
- envio para aprovação;
- status `aguardando_aprovacao`.

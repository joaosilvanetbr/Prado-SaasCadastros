# SPRINT 1 - Base do Sistema de Cadastro de Produtos Prado

## 1. Objetivo da Sprint

Criar a base inicial do sistema **Cadastro de Produtos Prado**, preparando autenticação, perfis de usuário, estrutura principal do app, banco de dados inicial e telas básicas para iniciar o fluxo de processos de cadastro de produto.

Nesta sprint, o foco é construir o alicerce do sistema, sem implementar ainda o formulário externo do fornecedor, aprovação, cadastro final ou geração de PDF.

---

## 2. Contexto do Projeto

O sistema será usado para controlar processos de cadastro de produtos.

Fluxo geral futuro:

```text
Comprador cria processo
↓
Fornecedor preenche dados por link externo
↓
Comprador completa parte comercial
↓
Comprador aprovador assina/aprova
↓
Cadastro recebe o processo aprovado
↓
Sistema gera PDF final
```

Nesta Sprint 1, implementar apenas:

```text
Login
Perfis
Layout principal
Dashboard inicial
Cadastro/listagem de processos
Criação inicial de processo
Estrutura inicial do banco
Permissões básicas
```

---

## 3. Regras Obrigatórias para a IA / Coding Agent

### 3.1 Não alterar documentação existente

Durante esta sprint:

- não alterar arquivos `.md` existentes;
- não alterar a pasta `docs/`;
- não apagar documentação;
- não reescrever README, SPEC ou arquivos de sprint sem pedido explícito;
- não criar documentação extra além do que for solicitado.

### 3.2 Não fazer redesign desnecessário

O objetivo é criar uma base limpa, funcional e consistente.

Não gastar tempo com:

- animações complexas;
- redesign exagerado;
- temas muito personalizados;
- telas que não fazem parte da sprint;
- funcionalidades futuras.

### 3.3 Implementação incremental

Implementar em passos pequenos e seguros.

Evitar:

- criar muitas abstrações antes da hora;
- implementar PDF nesta sprint;
- implementar formulário público do fornecedor nesta sprint;
- implementar aprovação completa nesta sprint;
- implementar anexos nesta sprint;
- implementar relatórios avançados nesta sprint.

### 3.4 Código organizado

Manter estrutura clara de pastas, componentes reutilizáveis e separação entre:

- páginas;
- componentes;
- serviços;
- tipos;
- validações;
- integração Supabase.

---

## 4. Escopo da Sprint 1

### 4.1 Incluído nesta sprint

Implementar:

1. Configuração base do projeto.
2. Autenticação com Supabase.
3. Perfis internos de usuário.
4. Layout principal do sistema.
5. Dashboard inicial.
6. Tela de listagem de processos.
7. Tela de criação de processo.
8. Tela de detalhes/visualização inicial do processo.
9. Banco de dados inicial.
10. Regras básicas de permissão.
11. Histórico inicial de criação/status.
12. Componentes básicos de interface.
13. Status iniciais do processo.

### 4.2 Fora do escopo desta sprint

Não implementar ainda:

- rota pública `/fornecedor/:token`;
- formulário do fornecedor;
- geração de link para fornecedor funcional;
- envio de e-mail;
- aprovação/assinatura;
- fila de cadastro;
- geração de PDF;
- anexos;
- relatórios avançados;
- assinatura desenhada;
- integração com ERP;
- importação de Excel;
- OCR;
- WhatsApp.

---

## 5. Stack Recomendada

Usar:

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
Supabase Auth
Supabase Database
Supabase Storage, deixar preparado
React Hook Form
Zod
TanStack Query
date-fns
lucide-react
```

---

## 6. Estrutura de Pastas Recomendada

Criar ou organizar o projeto assim:

```text
src/
  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      Topbar.tsx
    ui/
    processos/
      ProcessoStatusBadge.tsx
      ProcessoTable.tsx
      ProcessoForm.tsx
      ProcessoDetailsCard.tsx
      ProcessoTimeline.tsx
    dashboard/
      DashboardCard.tsx

  contexts/
    AuthContext.tsx

  hooks/
    useAuth.ts
    useProcessos.ts
    useProfile.ts

  lib/
    supabase.ts
    utils.ts
    constants.ts

  pages/
    LoginPage.tsx
    DashboardPage.tsx
    ProcessosPage.tsx
    NovoProcessoPage.tsx
    ProcessoDetalhePage.tsx

  routes/
    AppRoutes.tsx
    ProtectedRoute.tsx

  services/
    processosService.ts
    profilesService.ts
    fornecedoresService.ts
    historicoService.ts

  types/
    database.ts
    processo.ts
    profile.ts
    fornecedor.ts

  validations/
    processoSchema.ts
```

A estrutura pode ser adaptada ao padrão já existente do projeto, se houver.

---

## 7. Banco de Dados da Sprint 1

Criar as tabelas iniciais:

1. `profiles`
2. `fornecedores`
3. `processos_cadastro`
4. `historico_processos`

Não criar ainda tabelas detalhadas do fornecedor/comprador se a implementação ficar grande demais. Porém, se for simples, já pode criar também:

5. `dados_fornecedor_produto`
6. `dados_comprador_produto`

A prioridade da sprint é deixar o processo principal funcionando.

---

## 8. SQL Inicial Sugerido

### 8.1 Tabela `profiles`

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  perfil text not null check (perfil in ('admin', 'comprador', 'cadastro')),
  pode_aprovar boolean not null default false,
  pode_cadastrar boolean not null default false,
  pode_gerenciar_usuarios boolean not null default false,
  pode_ver_todos_processos boolean not null default false,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 8.2 Tabela `fornecedores`

```sql
create table if not exists public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  nome_fantasia text,
  cnpj text,
  email text,
  telefone text,
  contato_nome text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 8.3 Tabela `processos_cadastro`

```sql
create table if not exists public.processos_cadastro (
  id uuid primary key default gen_random_uuid(),
  numero_processo bigint generated always as identity,
  status text not null default 'rascunho',

  fornecedor_id uuid references public.fornecedores(id),
  comprador_responsavel_id uuid references public.profiles(id),
  aprovador_id uuid references public.profiles(id),
  cadastro_responsavel_id uuid references public.profiles(id),

  titulo text,
  descricao_produto_resumo text,
  codigo_barra_resumo text,

  observacao_interna text,
  motivo_reprovacao text,
  motivo_correcao text,

  enviado_fornecedor_at timestamptz,
  respondido_fornecedor_at timestamptz,
  enviado_aprovacao_at timestamptz,
  aprovado_at timestamptz,
  em_cadastro_at timestamptz,
  cadastrado_at timestamptz,
  pdf_gerado_at timestamptz,

  codigo_interno_produto text,
  pdf_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),

  constraint processos_cadastro_status_check check (
    status in (
      'rascunho',
      'aguardando_fornecedor',
      'enviado_pelo_fornecedor',
      'em_analise_comprador',
      'correcao_solicitada_fornecedor',
      'correcao_solicitada_comprador',
      'aguardando_aprovacao',
      'aprovado_para_cadastro',
      'reprovado',
      'em_cadastro',
      'cadastrado',
      'pdf_gerado',
      'cancelado'
    )
  )
);
```

### 8.4 Tabela `historico_processos`

```sql
create table if not exists public.historico_processos (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos_cadastro(id) on delete cascade,
  usuario_id uuid references public.profiles(id),

  status_anterior text,
  status_novo text,
  acao text not null,
  observacao text,

  dados_anteriores jsonb,
  dados_novos jsonb,

  created_at timestamptz not null default now()
);
```

---

## 9. Regras de RLS Básicas

Ativar RLS:

```sql
alter table public.profiles enable row level security;
alter table public.fornecedores enable row level security;
alter table public.processos_cadastro enable row level security;
alter table public.historico_processos enable row level security;
```

### 9.1 Profiles

Regras desejadas:

- usuário pode ler o próprio profile;
- admin pode ler todos;
- admin pode alterar permissões.

### 9.2 Processos

Regras desejadas para MVP:

- admin vê todos;
- comprador vê processos onde ele é o comprador responsável;
- usuário com `pode_ver_todos_processos` vê todos;
- cadastro vê processos aprovados para cadastro ou posteriores;
- comprador aprovador vê processos aguardando aprovação.

Na Sprint 1, se RLS completa atrasar a entrega, implementar RLS simples e isolar as permissões no frontend/service, deixando TODO claro para endurecer RLS na sprint seguinte.

### 9.3 Histórico

- usuários envolvidos no processo podem ler histórico;
- sistema cria histórico ao criar ou alterar processo.

---

## 10. Status Usados na Sprint 1

Nesta sprint, usar principalmente:

```text
rascunho
aguardando_fornecedor
cancelado
```

Pode deixar os demais status definidos no banco, mas nem todos precisam estar funcionais ainda.

### 10.1 Regras de status nesta sprint

Ao criar processo:

```text
status = rascunho
```

Ao clicar em "Preparar para fornecedor" ou "Marcar como aguardando fornecedor":

```text
status = aguardando_fornecedor
```

Ao cancelar:

```text
status = cancelado
```

---

## 11. Funcionalidades Detalhadas

## 11.1 Login

### Objetivo

Permitir que usuários internos acessem o sistema.

### Requisitos

- tela `/login`;
- login com e-mail e senha;
- integração com Supabase Auth;
- redirecionar para dashboard após login;
- botão de sair/logout;
- proteger rotas internas.

### Critérios de aceite

- usuário autenticado acessa `/app/dashboard`;
- usuário não autenticado é enviado para `/login`;
- logout encerra sessão;
- mensagens de erro aparecem em caso de login inválido.

---

## 11.2 AuthContext / useAuth

### Objetivo

Centralizar sessão, usuário e perfil.

### Requisitos

Criar contexto com:

```text
user
profile
session
isLoading
isAuthenticated
signIn
signOut
refreshProfile
```

### Critérios de aceite

- páginas internas conseguem acessar o usuário logado;
- perfil é carregado após login;
- permissões do profile ficam disponíveis para componentes.

---

## 11.3 Layout Principal

### Objetivo

Criar a estrutura visual interna do sistema.

### Requisitos

Layout com:

- sidebar;
- topbar;
- área principal de conteúdo;
- nome do usuário logado;
- botão de sair;
- menu de navegação.

Menu inicial:

```text
Dashboard
Processos
Novo Processo
```

Se perfil for cadastro, pode mostrar:

```text
Cadastro
```

Se perfil for admin, pode mostrar futuramente:

```text
Usuários
Configurações
```

### Critérios de aceite

- layout aparece em todas as rotas internas;
- sidebar navega entre páginas;
- usuário consegue sair do sistema;
- visual é responsivo de forma básica.

---

## 11.4 Dashboard Inicial

### Objetivo

Mostrar visão rápida dos processos.

### Cards iniciais

Para comprador:

```text
Meus rascunhos
Aguardando fornecedor
Em andamento
Finalizados
```

Para comprador aprovador:

```text
Meus processos
Aguardando aprovação
Aprovados por mim
Pendências
```

Para cadastro:

```text
Aprovados para cadastro
Em cadastro
Cadastrados
PDFs gerados
```

Para admin:

```text
Total de processos
Rascunhos
Aguardando fornecedor
Cancelados
```

Na Sprint 1, os cards podem usar os status já disponíveis.

### Critérios de aceite

- dashboard carrega sem erro;
- cards mostram contagens reais do banco;
- os cards respeitam permissão básica do usuário.

---

## 11.5 Listagem de Processos

### Objetivo

Permitir que o comprador acompanhe seus processos.

### Rota

```text
/app/processos
```

### Colunas

```text
Número
Título
Fornecedor
Status
Comprador responsável
Criado em
Atualizado em
Ações
```

### Filtros básicos

```text
Busca por título
Status
Fornecedor
```

### Ações

```text
Ver detalhes
Editar rascunho
Cancelar
```

### Critérios de aceite

- comprador comum vê apenas seus processos;
- admin vê todos;
- tabela mostra status com badge visual;
- clicar em processo abre detalhes;
- filtro por status funciona;
- busca por texto funciona.

---

## 11.6 Criar Novo Processo

### Objetivo

Permitir que o comprador crie o início de um processo de cadastro.

### Rota

```text
/app/processos/novo
```

### Campos

```text
Título do processo
Fornecedor
CNPJ do fornecedor
E-mail do fornecedor
Nome do contato
Descrição resumida do produto
Código de barra, se já souber
Observação interna
```

### Comportamento com fornecedor

Nesta sprint, permitir uma destas abordagens:

#### Opção A - criar fornecedor junto com o processo

Se o fornecedor ainda não existir, criar registro em `fornecedores`.

#### Opção B - selecionar fornecedor existente

Se já existir fornecedor, selecionar na lista.

Para MVP da sprint, pode fazer as duas de forma simples:

- campo de busca/lista para fornecedores existentes;
- opção "novo fornecedor".

### Validações

Obrigatório:

```text
titulo
fornecedor ou razão social
email_fornecedor, se for enviar depois
comprador_responsavel_id
```

### Ao salvar

Criar:

- registro em `processos_cadastro`;
- registro em `fornecedores`, se necessário;
- registro em `historico_processos`.

Status inicial:

```text
rascunho
```

### Critérios de aceite

- comprador consegue criar processo;
- processo fica vinculado ao comprador logado;
- processo aparece em "Meus processos";
- histórico registra a criação;
- status inicial é `rascunho`.

---

## 11.7 Detalhes do Processo

### Objetivo

Exibir uma visão inicial do processo.

### Rota

```text
/app/processos/:id
```

### Exibir

```text
Número do processo
Status atual
Título
Fornecedor
CNPJ
E-mail
Comprador responsável
Descrição resumida
Código de barra
Observação interna
Datas principais
Histórico
```

### Ações nesta sprint

Se status `rascunho`:

```text
Editar informações básicas
Marcar como aguardando fornecedor
Cancelar processo
```

Se status `aguardando_fornecedor`:

```text
Visualizar informações
Cancelar processo
```

A ação "Marcar como aguardando fornecedor" é temporária nesta sprint.
Na Sprint 2, ela será substituída pela geração real do link do fornecedor.

### Critérios de aceite

- detalhes carregam corretamente;
- ações respeitam status;
- histórico aparece;
- ao mudar status, histórico registra a alteração.

---

## 11.8 Histórico

### Objetivo

Registrar rastreabilidade inicial.

### Eventos da Sprint 1

Registrar:

```text
processo_criado
processo_atualizado
status_alterado_para_aguardando_fornecedor
processo_cancelado
```

### Exibição

Na tela de detalhes, mostrar:

```text
Data/hora
Usuário
Ação
Status anterior
Status novo
Observação
```

### Critérios de aceite

- criar processo gera histórico;
- alterar status gera histórico;
- cancelar processo gera histórico;
- histórico é exibido em ordem cronológica decrescente ou crescente.

---

## 11.9 Componentes de Status

### Objetivo

Criar badges visuais consistentes para status.

### Status iniciais e cores sugeridas

```text
rascunho -> cinza
aguardando_fornecedor -> azul
enviado_pelo_fornecedor -> roxo
em_analise_comprador -> amarelo
aguardando_aprovacao -> laranja
aprovado_para_cadastro -> verde
reprovado -> vermelho
em_cadastro -> azul
cadastrado -> verde
pdf_gerado -> verde escuro
cancelado -> cinza escuro
```

### Critérios de aceite

- tabela usa badge;
- detalhes usa badge;
- labels são amigáveis para o usuário.

Exemplo:

```text
aguardando_fornecedor = Aguardando fornecedor
```

---

## 12. Tipos TypeScript

Criar tipos principais.

### 12.1 Profile

```ts
export type UserProfile = {
  id: string;
  nome: string;
  email: string;
  perfil: "admin" | "comprador" | "cadastro";
  pode_aprovar: boolean;
  pode_cadastrar: boolean;
  pode_gerenciar_usuarios: boolean;
  pode_ver_todos_processos: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};
```

### 12.2 ProcessoStatus

```ts
export type ProcessoStatus =
  | "rascunho"
  | "aguardando_fornecedor"
  | "enviado_pelo_fornecedor"
  | "em_analise_comprador"
  | "correcao_solicitada_fornecedor"
  | "correcao_solicitada_comprador"
  | "aguardando_aprovacao"
  | "aprovado_para_cadastro"
  | "reprovado"
  | "em_cadastro"
  | "cadastrado"
  | "pdf_gerado"
  | "cancelado";
```

### 12.3 ProcessoCadastro

```ts
export type ProcessoCadastro = {
  id: string;
  numero_processo: number;
  status: ProcessoStatus;
  fornecedor_id: string | null;
  comprador_responsavel_id: string;
  aprovador_id: string | null;
  cadastro_responsavel_id: string | null;
  titulo: string | null;
  descricao_produto_resumo: string | null;
  codigo_barra_resumo: string | null;
  observacao_interna: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## 13. Serviços

Criar services para isolar Supabase.

### 13.1 `processosService.ts`

Funções:

```text
listarProcessos()
buscarProcessoPorId(id)
criarProcesso(data)
atualizarProcesso(id, data)
alterarStatusProcesso(id, novoStatus, observacao)
cancelarProcesso(id, observacao)
contarProcessosPorStatus()
```

### 13.2 `fornecedoresService.ts`

Funções:

```text
listarFornecedores()
buscarFornecedorPorId(id)
criarFornecedor(data)
buscarOuCriarFornecedor(data)
```

### 13.3 `historicoService.ts`

Funções:

```text
listarHistoricoPorProcesso(processoId)
registrarHistorico(data)
```

---

## 14. Validações com Zod

Criar schema inicial para novo processo.

```ts
const novoProcessoSchema = z.object({
  titulo: z.string().min(3, "Informe um título"),
  fornecedor_id: z.string().optional(),
  fornecedor_razao_social: z.string().min(2, "Informe o fornecedor"),
  fornecedor_cnpj: z.string().optional(),
  fornecedor_email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  fornecedor_contato_nome: z.string().optional(),
  descricao_produto_resumo: z.string().optional(),
  codigo_barra_resumo: z.string().optional(),
  observacao_interna: z.string().optional(),
});
```

---

## 15. Permissões no Frontend

Criar helpers:

```text
isAdmin(profile)
isComprador(profile)
isCadastro(profile)
canApprove(profile)
canManageUsers(profile)
canViewAllProcessos(profile)
```

### 15.1 Regras

#### Comprador comum

- pode ver `/app/processos`;
- pode criar processo;
- vê apenas próprios processos.

#### Comprador aprovador

- nesta sprint, igual comprador comum;
- preparar permissão `pode_aprovar` para Sprint 4.

#### Cadastro

- nesta sprint, pode acessar dashboard;
- tela de cadastro será implementada futuramente.

#### Admin

- vê todos os processos;
- pode criar processo para si ou escolher comprador, se implementado.

---

## 16. UX / Interface

### 16.1 Padrão visual

Usar layout administrativo simples.

Elementos:

- cards;
- tabela;
- badges;
- botões primários e secundários;
- dialogs de confirmação;
- formulário em seções;
- estados vazios.

### 16.2 Estados vazios

Exemplo para listagem sem processos:

```text
Nenhum processo encontrado.
Crie o primeiro processo de cadastro de produto.
```

### 16.3 Loading

Toda página que busca dados deve ter estado de carregamento.

### 16.4 Erros

Mostrar mensagens claras:

```text
Não foi possível carregar os processos.
Não foi possível salvar o processo.
Você não tem permissão para acessar este processo.
```

---

## 17. Dados de Teste

Criar dados manuais ou seed opcional.

Usuários desejados:

```text
Admin
Comprador comum
Comprador aprovador
Cadastro
```

Fornecedores de exemplo:

```text
Fornecedor Teste 1
Fornecedor Teste 2
```

Processos de exemplo:

```text
Produto Teste A - rascunho
Produto Teste B - aguardando fornecedor
```

Se não houver seed, documentar no código ou README interno como criar manualmente pelo Supabase.

Não alterar documentação `.md` se a regra global impedir. Pode deixar comentário no SQL ou no arquivo de seed.

---

## 18. Checklist Técnico

### Configuração

- [ ] Projeto roda localmente.
- [ ] Variáveis do Supabase configuradas.
- [ ] Cliente Supabase criado.
- [ ] Tailwind configurado.
- [ ] shadcn/ui funcionando.
- [ ] Rotas configuradas.

### Auth

- [ ] Login funciona.
- [ ] Logout funciona.
- [ ] Sessão persiste.
- [ ] Rotas protegidas funcionam.
- [ ] Profile carrega após login.

### Banco

- [ ] `profiles` criada.
- [ ] `fornecedores` criada.
- [ ] `processos_cadastro` criada.
- [ ] `historico_processos` criada.
- [ ] RLS ativado ou planejado.
- [ ] Índices básicos criados, se necessário.

### Processos

- [ ] Criar processo.
- [ ] Listar processos.
- [ ] Ver detalhes.
- [ ] Alterar status para aguardando fornecedor.
- [ ] Cancelar processo.
- [ ] Histórico registrado.

### UI

- [ ] Layout principal.
- [ ] Sidebar.
- [ ] Topbar.
- [ ] Dashboard.
- [ ] Tabela de processos.
- [ ] Formulário de novo processo.
- [ ] Detalhes do processo.
- [ ] Badge de status.

---

## 19. Critérios de Aceite da Sprint 1

A sprint será considerada concluída quando:

1. Um usuário interno conseguir fazer login.
2. O sistema carregar o perfil do usuário.
3. O layout interno estiver funcionando.
4. O comprador conseguir criar um processo.
5. O processo criado ficar vinculado ao comprador logado.
6. O comprador conseguir ver a lista dos próprios processos.
7. O comprador conseguir abrir os detalhes de um processo.
8. O processo iniciar com status `rascunho`.
9. O comprador conseguir marcar um processo como `aguardando_fornecedor`.
10. O comprador conseguir cancelar um processo.
11. Cada alteração relevante gerar histórico.
12. O dashboard mostrar contagens básicas.
13. O admin conseguir visualizar todos os processos, se implementado.
14. O código estar organizado e sem funcionalidades fora do escopo.
15. O projeto não alterar arquivos `.md` ou pasta `docs/` sem autorização explícita.

---

## 20. Testes Manuais

### 20.1 Login

1. Abrir `/login`.
2. Entrar com usuário comprador.
3. Confirmar redirecionamento para dashboard.
4. Clicar em sair.
5. Confirmar retorno para login.

### 20.2 Criar processo

1. Entrar como comprador.
2. Ir para "Novo Processo".
3. Preencher fornecedor e dados iniciais.
4. Salvar.
5. Confirmar que aparece em "Meus processos".
6. Confirmar status `Rascunho`.

### 20.3 Alterar status

1. Abrir processo em rascunho.
2. Clicar em "Marcar como aguardando fornecedor".
3. Confirmar alteração de status.
4. Verificar histórico.

### 20.4 Cancelar processo

1. Abrir processo.
2. Clicar em "Cancelar".
3. Informar observação.
4. Confirmar status `Cancelado`.
5. Verificar histórico.

### 20.5 Permissão por comprador

1. Criar processo com comprador A.
2. Entrar com comprador B.
3. Confirmar que comprador B não vê processo do comprador A.
4. Entrar como admin.
5. Confirmar que admin vê todos.

---

## 21. Entrega Esperada

Ao final da Sprint 1, o projeto deve estar pronto para a Sprint 2, que implementará o fluxo real do fornecedor.

A Sprint 2 dependerá destas bases:

- processo criado;
- comprador responsável definido;
- fornecedor vinculado;
- status `aguardando_fornecedor`;
- histórico funcionando;
- tela de detalhes funcionando.

---

## 22. Próxima Sprint

### Sprint 2 - Fluxo do Fornecedor

Na próxima sprint, implementar:

- geração real de link único;
- tabela `links_fornecedor`;
- rota pública `/fornecedor/:token`;
- formulário do fornecedor;
- campos da ficha preenchidos pelo fornecedor;
- validações;
- envio para comprador;
- status `enviado_pelo_fornecedor`.

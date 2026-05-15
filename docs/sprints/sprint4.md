# SPRINT 4 - Aprovação e Assinatura

## 1. Objetivo da Sprint

Implementar a etapa de aprovação do processo de cadastro de produto.

Nesta sprint, o sistema deve permitir que um comprador com permissão de aprovação revise a ficha completa, aprove/assine, reprove ou solicite ajuste ao comprador responsável.

O objetivo é transformar o status `aguardando_aprovacao` em uma etapa real de decisão antes de liberar o processo para o setor de cadastro.

Fluxo da sprint:

```text
Comprador responsável envia para aprovação
↓
Processo fica aguardando aprovação
↓
Comprador aprovador revisa a ficha completa
↓
Comprador aprovador pode aprovar, reprovar ou solicitar ajuste
↓
Se aprovado, processo vai para cadastro
↓
Se ajuste solicitado, volta para comprador
↓
Se reprovado, processo é encerrado como reprovado
```

---

## 2. Contexto do Projeto

Até aqui, as sprints anteriores implementaram:

### Sprint 1

- login;
- perfis;
- dashboard;
- processos;
- fornecedores;
- histórico;
- criação de processo.

### Sprint 2

- link público para fornecedor;
- formulário do fornecedor;
- dados básicos e logísticos;
- envio do fornecedor.

### Sprint 3

- área do comprador;
- revisão dos dados do fornecedor;
- preenchimento comercial;
- mix de lojas;
- estrutura mercadológica;
- envio para aprovação.

A Sprint 4 começa quando o processo está com status:

```text
aguardando_aprovacao
```

---

## 3. Regra de Negócio Importante

No processo real, o gerente também pode ser comprador.

Por isso, o sistema não deve criar obrigatoriamente um perfil separado chamado `gerente`.

O correto é usar:

```text
perfil = comprador
pode_aprovar = true
```

Exemplo:

```text
Nome: Marcos
Perfil: comprador
Pode aprovar: sim
```

Esse usuário:

- pode ter seus próprios processos como comprador;
- pode aprovar processos de outros compradores;
- aparece como comprador aprovador;
- assina a ficha digitalmente.

---

## 4. Regras Obrigatórias para IA / Coding Agent

### 4.1 Não alterar documentação sem autorização

Durante esta sprint:

- não alterar arquivos `.md` existentes;
- não alterar a pasta `docs/`;
- não apagar documentação;
- não reescrever `SPEC.md`, `SPRINT1.md`, `SPRINT2.md`, `SPRINT3.md`, `README.md` ou qualquer outro `.md`;
- não criar documentação extra sem pedido explícito.

Exceção: se o usuário pedir explicitamente alteração em documentação.

### 4.2 Não implementar fora do escopo

Não implementar nesta sprint:

- fila final de cadastro;
- geração de PDF final;
- upload avançado de anexos;
- relatórios avançados;
- envio automático por e-mail;
- WhatsApp;
- integração com ERP;
- assinatura com certificado digital;
- múltiplos níveis de aprovação;
- app mobile nativo.

### 4.3 Preservar funcionalidades anteriores

Não quebrar:

- login;
- listagem de processos;
- criação de processo;
- link do fornecedor;
- formulário do fornecedor;
- dados do comprador;
- envio para aprovação;
- histórico;
- dashboard;
- permissões por comprador.

### 4.4 Não fazer redesign desnecessário

Manter o visual administrativo já definido.

Criar a tela de aprovação seguindo os componentes existentes:

- cards;
- badges;
- tabelas simples;
- dialogs;
- botões claros;
- histórico/timeline.

---

## 5. Escopo da Sprint 4

### 5.1 Incluído

Implementar:

1. Permissão real `pode_aprovar`.
2. Fila de processos aguardando aprovação.
3. Tela de revisão completa da ficha.
4. Visualização dos dados do fornecedor.
5. Visualização dos dados do comprador.
6. Visualização do mix de lojas.
7. Visualização da estrutura mercadológica.
8. Ação de aprovar e assinar.
9. Ação de reprovar com motivo.
10. Ação de solicitar ajuste ao comprador.
11. Bloqueio opcional de autoaprovação.
12. Registro na tabela `assinaturas`.
13. Histórico de aprovação/reprovação/ajuste.
14. Atualização de status.
15. Dashboard com pendências de aprovação.
16. Permissões de leitura para compradores aprovadores.

### 5.2 Fora do escopo

Não implementar:

- cadastro final;
- geração de PDF;
- prévia do PDF;
- assinatura desenhada;
- assinatura com certificado;
- múltiplos aprovadores;
- aprovação por diretoria separada;
- envio automático de notificações.

---

## 6. Status Usados nesta Sprint

Status principais:

```text
aguardando_aprovacao
correcao_solicitada_comprador
aprovado_para_cadastro
reprovado
cancelado
```

### 6.1 Transições desta sprint

```text
aguardando_aprovacao -> aprovado_para_cadastro
aguardando_aprovacao -> reprovado
aguardando_aprovacao -> correcao_solicitada_comprador
correcao_solicitada_comprador -> em_analise_comprador
em_analise_comprador -> aguardando_aprovacao
```

### 6.2 Regras

Ao aprovar:

```text
status = aprovado_para_cadastro
aprovador_id = usuário logado
aprovado_at = now()
```

Ao reprovar:

```text
status = reprovado
motivo_reprovacao = motivo informado
```

Ao solicitar ajuste:

```text
status = correcao_solicitada_comprador
motivo_correcao = motivo informado
```

Quando o comprador corrigir e reenviar:

```text
status = aguardando_aprovacao
enviado_aprovacao_at = now()
```

A correção e reenvio já foram parcialmente tratados na Sprint 3, mas nesta sprint devem ser refinados para funcionar bem com a aprovação.

---

## 7. Banco de Dados

## 7.1 Criar tabela `assinaturas`

Tabela para registrar aprovações, reprovações e solicitações de ajuste.

```sql
create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos_cadastro(id) on delete cascade,
  usuario_id uuid references public.profiles(id),

  tipo text not null,
  status text not null,
  nome_assinante text not null,
  email_assinante text,
  cargo_ou_perfil text,
  observacao text,

  ip text,
  user_agent text,
  assinatura_imagem_url text,

  created_at timestamptz not null default now(),

  constraint assinaturas_tipo_check check (
    tipo in ('aprovacao', 'cadastro')
  ),

  constraint assinaturas_status_check check (
    status in ('aprovado', 'reprovado', 'correcao_solicitada')
  )
);
```

### 7.1.1 Índices recomendados

```sql
create index if not exists idx_assinaturas_processo_id
on public.assinaturas(processo_id);

create index if not exists idx_assinaturas_usuario_id
on public.assinaturas(usuario_id);

create index if not exists idx_assinaturas_status
on public.assinaturas(status);
```

---

## 7.2 Atualizar tabela `processos_cadastro`

Confirmar que existem os campos:

```sql
aprovador_id uuid references public.profiles(id)
aprovado_at timestamptz
motivo_reprovacao text
motivo_correcao text
```

Se não existirem:

```sql
alter table public.processos_cadastro
add column if not exists aprovador_id uuid references public.profiles(id);

alter table public.processos_cadastro
add column if not exists aprovado_at timestamptz;

alter table public.processos_cadastro
add column if not exists motivo_reprovacao text;

alter table public.processos_cadastro
add column if not exists motivo_correcao text;
```

---

## 7.3 Atualizar tabela `profiles`

Confirmar que existe:

```sql
pode_aprovar boolean not null default false
```

Se não existir:

```sql
alter table public.profiles
add column if not exists pode_aprovar boolean not null default false;
```

---

## 7.4 Histórico

Usar tabela `historico_processos`.

Eventos novos:

```text
aprovador_visualizou_processo
aprovador_aprovou_e_assinou
aprovador_reprovou
aprovador_solicitou_ajuste_comprador
status_alterado_para_aprovado_para_cadastro
status_alterado_para_reprovado
status_alterado_para_correcao_solicitada_comprador
```

---

## 8. Permissões

## 8.1 Comprador comum

Pode:

- ver seus próprios processos;
- ver o status da aprovação;
- corrigir processo quando status for `correcao_solicitada_comprador`;
- reenviar para aprovação.

Não pode:

- aprovar;
- reprovar;
- assinar;
- visualizar fila geral de aprovação;
- aprovar processo de outro comprador.

## 8.2 Comprador aprovador

Usuário com:

```text
perfil = comprador
pode_aprovar = true
```

Pode:

- ver seus próprios processos;
- ver fila de processos aguardando aprovação;
- abrir processo aguardando aprovação;
- revisar ficha completa;
- aprovar e assinar;
- reprovar com motivo;
- solicitar ajuste ao comprador.

### 8.2.1 Regra de autoaprovação

Regra recomendada:

```text
comprador_responsavel_id != aprovador_id
```

Ou seja:

```text
Quem criou/conduziu o processo não pode aprovar o próprio processo.
```

Se o usuário for comprador aprovador e tentar aprovar o próprio processo, mostrar:

```text
Você não pode aprovar um processo em que você é o comprador responsável.
Solicite aprovação de outro comprador aprovador.
```

Essa regra pode ser configurável no futuro.

## 8.3 Admin

Pode:

- ver todos os processos;
- acessar fila de aprovação;
- aprovar, se `pode_aprovar = true`;
- ajustar permissões dos usuários, se `pode_gerenciar_usuarios = true`;
- consultar histórico.

## 8.4 Cadastro

Nesta sprint:

- não atua diretamente;
- poderá ver processos aprovados somente se já existir visualização básica;
- a fila de cadastro será implementada na Sprint 5.

---

## 9. RLS e Segurança

## 9.1 Tabela `assinaturas`

Ativar RLS:

```sql
alter table public.assinaturas enable row level security;
```

Regras desejadas:

- comprador responsável pode ler assinaturas do próprio processo;
- comprador aprovador pode inserir assinatura em processos aguardando aprovação;
- admin pode ler todas;
- cadastro poderá ler na Sprint 5;
- fornecedor externo não acessa assinaturas.

## 9.2 Tabelas de dados

Comprador aprovador precisa conseguir ler:

```text
processos_cadastro
dados_fornecedor_produto
dados_comprador_produto
processo_mix_lojas
historico_processos
```

Somente para processos com:

```text
status = aguardando_aprovacao
```

ou processos que ele já aprovou/reprovou.

## 9.3 Validação no service

Mesmo com RLS, validar no service:

```text
usuário logado possui pode_aprovar = true
processo está em status aguardando_aprovacao
usuário não é comprador responsável, se autoaprovação estiver bloqueada
```

---

## 10. Fila de Aprovação

## 10.1 Rota

Criar rota:

```text
/app/aprovacoes
```

ou, se preferir manter dentro de processos:

```text
/app/processos/aprovacao
```

Recomendação:

```text
/app/aprovacoes
```

## 10.2 Quem acessa

Apenas:

```text
pode_aprovar = true
admin com permissão
```

Se usuário sem permissão acessar, mostrar:

```text
Você não tem permissão para acessar aprovações.
```

## 10.3 Listagem

Mostrar processos com status:

```text
aguardando_aprovacao
```

Colunas:

```text
Número
Produto
Fornecedor
Comprador responsável
Enviado para aprovação em
Status
Ações
```

Ação principal:

```text
Revisar
```

## 10.4 Filtros

Filtros básicos:

```text
comprador responsável
fornecedor
data de envio
produto/código de barra
```

Se ficar grande demais, implementar apenas busca textual e status.

---

## 11. Tela de Revisão da Aprovação

## 11.1 Rota

```text
/app/aprovacoes/:id
```

ou reutilizar:

```text
/app/processos/:id/aprovacao
```

Recomendação:

```text
/app/processos/:id/aprovacao
```

## 11.2 Seções

A tela deve mostrar a ficha completa em modo leitura:

```text
Resumo do processo
Dados do fornecedor
Informações logísticas
Caixa e display
Dados do comprador
Tipo de entrega
Substituição
Mix de lojas
Estrutura mercadológica
Dados comerciais
Histórico
Área de decisão
```

## 11.3 Ações

Botões:

```text
Aprovar e assinar
Solicitar ajuste ao comprador
Reprovar
```

## 11.4 Botões por status

Se status for `aguardando_aprovacao`:

- mostrar ações de aprovação.

Se status for `aprovado_para_cadastro`:

- mostrar somente consulta;
- indicar quem aprovou e quando.

Se status for `reprovado`:

- mostrar somente consulta;
- exibir motivo da reprovação.

Se status for `correcao_solicitada_comprador`:

- mostrar somente consulta para aprovador;
- indicar que está aguardando ajuste do comprador.

---

## 12. Aprovar e Assinar

## 12.1 Ação

Ao clicar em:

```text
Aprovar e assinar
```

abrir modal de confirmação.

### 12.1.1 Modal

Título:

```text
Aprovar e assinar ficha
```

Texto:

```text
Ao aprovar, esta ficha será liberada para o setor de cadastro.
Esta ação ficará registrada com seu nome, data e hora.
```

Campo opcional:

```text
Observação
```

Botões:

```text
Cancelar
Aprovar e assinar
```

## 12.2 Dados gravados

Na tabela `assinaturas`:

```text
processo_id
usuario_id
tipo = aprovacao
status = aprovado
nome_assinante
email_assinante
cargo_ou_perfil
observacao
ip
user_agent
created_at
```

Na tabela `processos_cadastro`:

```text
status = aprovado_para_cadastro
aprovador_id = usuário logado
aprovado_at = now()
updated_at = now()
updated_by = usuário logado
```

No histórico:

```text
acao = aprovador_aprovou_e_assinou
status_anterior = aguardando_aprovacao
status_novo = aprovado_para_cadastro
observacao = observação opcional
```

## 12.3 Resultado na interface

Depois de aprovar:

- redirecionar para detalhe do processo ou fila de aprovação;
- mostrar mensagem:

```text
Ficha aprovada e liberada para cadastro.
```

---

## 13. Reprovar

## 13.1 Ação

Ao clicar em:

```text
Reprovar
```

abrir modal exigindo motivo.

### 13.1.1 Modal

Título:

```text
Reprovar processo
```

Campo obrigatório:

```text
Motivo da reprovação
```

Exemplo:

```text
Produto não aprovado para cadastro por divergência comercial.
```

Botões:

```text
Cancelar
Confirmar reprovação
```

## 13.2 Dados gravados

Na tabela `assinaturas`:

```text
tipo = aprovacao
status = reprovado
observacao = motivo
```

Na tabela `processos_cadastro`:

```text
status = reprovado
motivo_reprovacao = motivo
updated_at = now()
updated_by = usuário logado
```

No histórico:

```text
acao = aprovador_reprovou
status_anterior = aguardando_aprovacao
status_novo = reprovado
observacao = motivo
```

## 13.3 Resultado na interface

Mostrar mensagem:

```text
Processo reprovado.
```

Processo não segue para cadastro.

---

## 14. Solicitar Ajuste ao Comprador

## 14.1 Ação

Ao clicar em:

```text
Solicitar ajuste ao comprador
```

abrir modal com motivo obrigatório.

### 14.1.1 Modal

Título:

```text
Solicitar ajuste ao comprador
```

Campo obrigatório:

```text
Motivo do ajuste
```

Exemplos:

```text
Preço Prado precisa ser revisado.
Mix de lojas não confere com a negociação.
Categoria mercadológica precisa ser corrigida.
```

Botões:

```text
Cancelar
Solicitar ajuste
```

## 14.2 Dados gravados

Na tabela `assinaturas`:

```text
tipo = aprovacao
status = correcao_solicitada
observacao = motivo
```

Na tabela `processos_cadastro`:

```text
status = correcao_solicitada_comprador
motivo_correcao = motivo
updated_at = now()
updated_by = usuário logado
```

No histórico:

```text
acao = aprovador_solicitou_ajuste_comprador
status_anterior = aguardando_aprovacao
status_novo = correcao_solicitada_comprador
observacao = motivo
```

## 14.3 Retorno para comprador

O comprador responsável deve ver o processo como:

```text
Correção solicitada ao comprador
```

Ação disponível:

```text
Corrigir e reenviar
```

Ao corrigir:

```text
status = em_analise_comprador
```

Depois, ao reenviar:

```text
status = aguardando_aprovacao
```

---

## 15. Assinatura Eletrônica Simples

## 15.1 Modelo MVP

Nesta sprint, a assinatura será eletrônica simples.

Não precisa desenhar assinatura.

A assinatura será formada por:

```text
nome do usuário
email
perfil/permissão
data e hora
ação realizada
IP, se disponível
user agent, se disponível
```

## 15.2 Exibição da assinatura

Em processos aprovados, mostrar:

```text
Aprovado por: Nome do comprador aprovador
Data: 15/05/2026 14:32
Status: Aprovado
```

## 15.3 Futuro

Em sprint futura, pode evoluir para:

- assinatura desenhada;
- imagem de assinatura;
- certificado digital;
- assinatura em duas etapas;
- aprovação por diretoria.

---

## 16. Services

Criar service:

```text
aprovacoesService.ts
```

## 16.1 Funções

```text
listarProcessosAguardandoAprovacao()
buscarProcessoParaAprovacao(processoId)
aprovarProcesso(processoId, observacao?)
reprovarProcesso(processoId, motivo)
solicitarAjusteComprador(processoId, motivo)
verificarPodeAprovar(processo, profile)
```

## 16.2 `listarProcessosAguardandoAprovacao`

Responsável por:

- buscar processos com status `aguardando_aprovacao`;
- incluir dados resumidos do fornecedor;
- incluir comprador responsável;
- ordenar por `enviado_aprovacao_at` mais antigo primeiro.

## 16.3 `buscarProcessoParaAprovacao`

Responsável por carregar:

```text
processo
fornecedor
dados_fornecedor_produto
dados_comprador_produto
processo_mix_lojas
historico
assinaturas
comprador_responsavel
```

## 16.4 `aprovarProcesso`

Responsável por:

1. validar permissão `pode_aprovar`;
2. validar status `aguardando_aprovacao`;
3. validar autoaprovação, se bloqueada;
4. inserir assinatura;
5. atualizar processo;
6. registrar histórico;
7. retornar processo atualizado.

## 16.5 `reprovarProcesso`

Responsável por:

1. validar permissão;
2. validar motivo obrigatório;
3. inserir assinatura com status `reprovado`;
4. atualizar processo;
5. registrar histórico.

## 16.6 `solicitarAjusteComprador`

Responsável por:

1. validar permissão;
2. validar motivo obrigatório;
3. inserir assinatura com status `correcao_solicitada`;
4. atualizar processo;
5. registrar histórico.

## 16.7 `verificarPodeAprovar`

Regras:

```text
profile.pode_aprovar = true
processo.status = aguardando_aprovacao
se BLOQUEAR_AUTOAPROVACAO = true:
  processo.comprador_responsavel_id !== profile.id
```

---

## 17. Componentes a Criar

## 17.1 Componentes de aprovação

```text
AprovacoesPage
AprovacaoDetalhePage
AprovacaoTable
AprovacaoReview
AprovacaoActionPanel
AprovarAssinarDialog
ReprovarProcessoDialog
SolicitarAjusteCompradorDialog
AssinaturaResumoCard
```

## 17.2 Componentes de visualização

Se ainda não existirem, criar ou reutilizar:

```text
DadosFornecedorReadOnly
DadosCompradorReadOnly
MixLojasReadOnly
EstruturaMercadologicaReadOnly
DadosComerciaisReadOnly
ProcessoHistorico
```

## 17.3 Componentes de permissão

```text
RequireApprovalPermission
```

Ou usar `ProtectedRoute` com regra de permissão.

---

## 18. Páginas / Rotas

Adicionar rotas:

```text
/app/aprovacoes
/app/processos/:id/aprovacao
```

### 18.1 Menu

No sidebar, mostrar item:

```text
Aprovações
```

Somente para:

```text
pode_aprovar = true
admin autorizado
```

### 18.2 Dashboard

Adicionar card clicável:

```text
Aguardando minha aprovação
```

Para compradores aprovadores.

---

## 19. Atualização da Tela do Comprador

Quando status for:

```text
correcao_solicitada_comprador
```

O comprador responsável deve ver:

```text
Ajuste solicitado pelo aprovador
```

Mostrar motivo:

```text
{motivo_correcao}
```

Ação:

```text
Corrigir dados do comprador
```

Ao clicar:

- mudar para `em_analise_comprador`;
- permitir edição dos dados do comprador;
- depois permitir reenviar para aprovação.

### 19.1 Histórico ao comprador retomar correção

Registrar:

```text
acao = comprador_retomou_correcao
status_anterior = correcao_solicitada_comprador
status_novo = em_analise_comprador
observacao = Comprador iniciou correção solicitada pelo aprovador
```

---

## 20. Atualização do Dashboard

## 20.1 Para comprador aprovador

Adicionar cards:

```text
Aguardando minha aprovação
Aprovados por mim
Reprovados por mim
Ajustes solicitados
```

No MVP, pelo menos implementar:

```text
Aguardando aprovação
```

## 20.2 Para comprador comum

Adicionar card:

```text
Correções solicitadas pelo aprovador
```

## 20.3 Para admin

Adicionar:

```text
Total aguardando aprovação
Total aprovado para cadastro
Total reprovado
```

---

## 21. Atualização da Listagem de Processos

Adicionar labels/status amigáveis:

```text
aguardando_aprovacao = Aguardando aprovação
correcao_solicitada_comprador = Correção solicitada ao comprador
aprovado_para_cadastro = Aprovado para cadastro
reprovado = Reprovado
```

### 21.1 Ações por status

#### `aguardando_aprovacao`

Para comprador responsável:

```text
Ver envio
```

Para aprovador:

```text
Revisar aprovação
```

#### `correcao_solicitada_comprador`

Para comprador responsável:

```text
Corrigir
```

#### `aprovado_para_cadastro`

```text
Ver aprovação
```

#### `reprovado`

```text
Ver motivo
```

---

## 22. Validações

## 22.1 Aprovar

Obrigatório:

```text
usuário possui pode_aprovar = true
processo.status = aguardando_aprovacao
dados do fornecedor existem
dados do comprador existem
pelo menos uma loja no mix
se autoaprovação bloqueada, usuário não pode ser comprador responsável
```

## 22.2 Reprovar

Obrigatório:

```text
usuário possui pode_aprovar = true
processo.status = aguardando_aprovacao
motivo de reprovação preenchido
```

## 22.3 Solicitar ajuste

Obrigatório:

```text
usuário possui pode_aprovar = true
processo.status = aguardando_aprovacao
motivo de ajuste preenchido
```

---

## 23. UX da Aprovação

## 23.1 Tela de revisão

A tela deve ser muito clara, pois o aprovador está validando a ficha antes do cadastro.

Sugestão de organização:

```text
Cabeçalho:
- Processo nº
- Produto
- Fornecedor
- Comprador responsável
- Status

Cards:
1. Dados do fornecedor
2. Logística
3. Dados do comprador
4. Mix de lojas
5. Estrutura mercadológica
6. Preços e margem
7. Histórico
8. Decisão
```

## 23.2 Destaques

Destacar campos importantes:

```text
Preço de custo
Margem de lucro
Preço Prado
Preço Pradão
Tipo de entrega
Mix de lojas
Departamento/categoria
```

## 23.3 Botões

Usar botões bem distintos:

```text
Aprovar e assinar
Solicitar ajuste
Reprovar
```

Sugestão visual:

- Aprovar: botão primário/verde;
- Solicitar ajuste: botão secundário/amarelo;
- Reprovar: botão destrutivo/vermelho.

---

## 24. Constantes

Criar constante para autoaprovação:

```ts
export const BLOQUEAR_AUTOAPROVACAO = true;
```

Ou configurar no banco futuramente.

Criar labels:

```ts
export const APROVACAO_ACTION_LABELS = {
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  correcao_solicitada: "Correção solicitada",
};
```

---

## 25. Tipos TypeScript

## 25.1 `Assinatura`

```ts
export type AssinaturaStatus =
  | "aprovado"
  | "reprovado"
  | "correcao_solicitada";

export type AssinaturaTipo =
  | "aprovacao"
  | "cadastro";

export type Assinatura = {
  id: string;
  processo_id: string;
  usuario_id: string | null;
  tipo: AssinaturaTipo;
  status: AssinaturaStatus;
  nome_assinante: string;
  email_assinante: string | null;
  cargo_ou_perfil: string | null;
  observacao: string | null;
  ip: string | null;
  user_agent: string | null;
  assinatura_imagem_url: string | null;
  created_at: string;
};
```

## 25.2 `AprovacaoProcessoView`

```ts
export type AprovacaoProcessoView = {
  processo: ProcessoCadastro;
  fornecedor: Fornecedor | null;
  dadosFornecedor: DadosFornecedorProduto | null;
  dadosComprador: DadosCompradorProduto | null;
  mixLojas: ProcessoMixLoja[];
  historico: HistoricoProcesso[];
  assinaturas: Assinatura[];
  compradorResponsavel: UserProfile | null;
};
```

---

## 26. Critérios de Aceite

A Sprint 4 será considerada concluída quando:

1. Usuário com `pode_aprovar = true` conseguir acessar a fila de aprovação.
2. Usuário sem `pode_aprovar` não conseguir acessar a fila de aprovação.
3. Fila listar processos com status `aguardando_aprovacao`.
4. Aprovador conseguir abrir a revisão completa do processo.
5. Tela de revisão mostrar dados do fornecedor.
6. Tela de revisão mostrar dados do comprador.
7. Tela de revisão mostrar mix de lojas.
8. Tela de revisão mostrar estrutura mercadológica.
9. Tela de revisão mostrar dados comerciais.
10. Aprovador conseguir aprovar e assinar.
11. Aprovação criar registro em `assinaturas`.
12. Aprovação mudar status para `aprovado_para_cadastro`.
13. Aprovação preencher `aprovador_id` e `aprovado_at`.
14. Aprovação registrar histórico.
15. Aprovador conseguir reprovar com motivo.
16. Reprovação mudar status para `reprovado`.
17. Reprovação gravar `motivo_reprovacao`.
18. Reprovação criar assinatura/status de reprovação.
19. Aprovador conseguir solicitar ajuste ao comprador.
20. Ajuste mudar status para `correcao_solicitada_comprador`.
21. Ajuste gravar `motivo_correcao`.
22. Comprador responsável conseguir ver motivo do ajuste.
23. Comprador conseguir corrigir e reenviar para aprovação.
24. Autoaprovação ser bloqueada, se a constante estiver ativa.
25. Processos aprovados ficarem prontos para a Sprint 5.
26. Funcionalidades das sprints anteriores continuarem funcionando.

---

## 27. Testes Manuais

## 27.1 Acessar fila de aprovação

1. Entrar como comprador sem `pode_aprovar`.
2. Confirmar que menu "Aprovações" não aparece.
3. Tentar acessar `/app/aprovacoes`.
4. Confirmar bloqueio.
5. Entrar como comprador com `pode_aprovar = true`.
6. Confirmar que menu aparece.
7. Abrir fila.
8. Confirmar processos aguardando aprovação.

## 27.2 Revisar processo

1. Abrir processo na fila de aprovação.
2. Confirmar dados do fornecedor.
3. Confirmar dados logísticos.
4. Confirmar dados do comprador.
5. Confirmar mix de lojas.
6. Confirmar preços e margem.
7. Confirmar histórico.

## 27.3 Aprovar processo

1. Clicar em "Aprovar e assinar".
2. Confirmar modal.
3. Informar observação opcional.
4. Confirmar.
5. Confirmar status `Aprovado para cadastro`.
6. Confirmar registro em `assinaturas`.
7. Confirmar `aprovador_id`.
8. Confirmar `aprovado_at`.
9. Confirmar histórico.

## 27.4 Reprovar processo

1. Abrir outro processo aguardando aprovação.
2. Clicar em "Reprovar".
3. Tentar confirmar sem motivo.
4. Confirmar erro.
5. Informar motivo.
6. Confirmar.
7. Confirmar status `Reprovado`.
8. Confirmar motivo salvo.
9. Confirmar assinatura de reprovação.
10. Confirmar histórico.

## 27.5 Solicitar ajuste ao comprador

1. Abrir processo aguardando aprovação.
2. Clicar em "Solicitar ajuste".
3. Tentar confirmar sem motivo.
4. Confirmar erro.
5. Informar motivo.
6. Confirmar.
7. Confirmar status `Correção solicitada ao comprador`.
8. Entrar como comprador responsável.
9. Ver processo com motivo do ajuste.
10. Corrigir dados.
11. Reenviar para aprovação.
12. Confirmar status `Aguardando aprovação`.

## 27.6 Bloquear autoaprovação

1. Entrar como comprador aprovador.
2. Criar processo próprio.
3. Enviar até aprovação.
4. Tentar aprovar o próprio processo.
5. Confirmar mensagem de bloqueio.
6. Entrar com outro comprador aprovador.
7. Confirmar que aprovação é permitida.

## 27.7 Permissões

1. Entrar como cadastro.
2. Confirmar que não consegue aprovar.
3. Entrar como comprador comum.
4. Confirmar que não consegue aprovar.
5. Entrar como admin sem `pode_aprovar`.
6. Confirmar comportamento conforme regra definida.
7. Entrar como admin com `pode_aprovar`.
8. Confirmar aprovação permitida.

---

## 28. Checklist Técnico

### Banco

- [ ] Criar tabela `assinaturas`.
- [ ] Criar índices de `assinaturas`.
- [ ] Confirmar campo `pode_aprovar`.
- [ ] Confirmar campo `aprovador_id`.
- [ ] Confirmar campo `aprovado_at`.
- [ ] Confirmar campo `motivo_reprovacao`.
- [ ] Confirmar campo `motivo_correcao`.
- [ ] Ativar RLS em `assinaturas`.

### Services

- [ ] Criar `aprovacoesService.ts`.
- [ ] Listar processos aguardando aprovação.
- [ ] Buscar processo completo para revisão.
- [ ] Aprovar processo.
- [ ] Reprovar processo.
- [ ] Solicitar ajuste ao comprador.
- [ ] Validar autoaprovação.
- [ ] Registrar histórico.

### UI

- [ ] Criar página de aprovações.
- [ ] Criar tabela de aprovação.
- [ ] Criar tela de revisão.
- [ ] Criar cards de dados em modo leitura.
- [ ] Criar modal de aprovação.
- [ ] Criar modal de reprovação.
- [ ] Criar modal de ajuste.
- [ ] Criar card de assinatura.
- [ ] Atualizar sidebar.
- [ ] Atualizar dashboard.
- [ ] Atualizar listagem de processos.

### Permissões

- [ ] Esconder menu de aprovação para quem não pode aprovar.
- [ ] Bloquear rota para quem não pode aprovar.
- [ ] Bloquear autoaprovação, se configurado.
- [ ] Permitir aprovador ler dados completos.
- [ ] Bloquear edição após aprovação.

### Histórico

- [ ] Registrar aprovação.
- [ ] Registrar reprovação.
- [ ] Registrar solicitação de ajuste.
- [ ] Registrar retorno do comprador para correção.
- [ ] Registrar reenvio para aprovação.

### Status

- [ ] `aguardando_aprovacao -> aprovado_para_cadastro`.
- [ ] `aguardando_aprovacao -> reprovado`.
- [ ] `aguardando_aprovacao -> correcao_solicitada_comprador`.
- [ ] `correcao_solicitada_comprador -> em_analise_comprador`.
- [ ] `em_analise_comprador -> aguardando_aprovacao`.

---

## 29. Entrega Esperada

Ao final da Sprint 4, o sistema deve permitir o fluxo completo até a aprovação:

```text
Fornecedor envia dados
↓
Comprador completa parte comercial
↓
Comprador envia para aprovação
↓
Comprador aprovador revisa
↓
Comprador aprovador aprova e assina
↓
Processo fica aprovado para cadastro
```

Também deve permitir os caminhos alternativos:

```text
Aprovador reprova
```

ou

```text
Aprovador solicita ajuste ao comprador
↓
Comprador corrige
↓
Comprador reenvia para aprovação
```

O sistema ainda não precisa:

```text
gerar PDF final
marcar produto como cadastrado
ter fila completa de cadastro
```

Esses pontos entram na Sprint 5.

---

## 30. Próxima Sprint

### Sprint 5 - Cadastro Final e Geração de PDF

Na Sprint 5, implementar:

- fila de processos aprovados para cadastro;
- usuário de cadastro assumir processo;
- marcar como em cadastro;
- informar código interno do produto, se necessário;
- marcar como cadastrado;
- gerar PDF final;
- armazenar PDF;
- baixar PDF;
- registrar histórico de cadastro;
- bloquear geração de PDF antes do cadastro final.

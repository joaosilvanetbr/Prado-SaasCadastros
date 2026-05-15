# SPRINT 5 - Cadastro Final e Geração de PDF

## 1. Objetivo da Sprint

Implementar a etapa final do fluxo de cadastro de produto.

Nesta sprint, o sistema deve permitir que o setor de cadastro receba apenas processos aprovados, assuma o cadastro, marque o produto como cadastrado e gere o PDF final oficial da ficha.

Fluxo da sprint:

```text
Processo aprovado pelo comprador aprovador
↓
Processo fica aprovado para cadastro
↓
Setor de cadastro visualiza na fila
↓
Cadastro assume o processo
↓
Status muda para em cadastro
↓
Cadastro confere os dados
↓
Cadastro informa código interno, se necessário
↓
Cadastro marca como cadastrado
↓
Sistema libera geração do PDF final
↓
PDF é gerado, salvo e disponibilizado para download
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
- revisão do fornecedor;
- parte comercial;
- mix de lojas;
- estrutura mercadológica;
- envio para aprovação.

### Sprint 4

- comprador aprovador;
- fila de aprovação;
- aprovação e assinatura;
- reprovação;
- solicitação de ajuste;
- status `aprovado_para_cadastro`.

A Sprint 5 começa quando o processo está com status:

```text
aprovado_para_cadastro
```

---

## 3. Regras Obrigatórias para IA / Coding Agent

### 3.1 Não alterar documentação sem autorização

Durante esta sprint:

- não alterar arquivos `.md` existentes;
- não alterar a pasta `docs/`;
- não apagar documentação;
- não reescrever `SPEC.md`, `SPRINT1.md`, `SPRINT2.md`, `SPRINT3.md`, `SPRINT4.md`, `README.md` ou qualquer outro `.md`;
- não criar documentação extra sem pedido explícito.

Exceção: se o usuário pedir explicitamente alteração em documentação.

### 3.2 Não implementar fora do escopo

Não implementar nesta sprint:

- integração com ERP;
- cadastro automático no sistema interno;
- assinatura com certificado digital;
- envio automático por e-mail;
- WhatsApp;
- relatórios avançados;
- importação de Excel;
- OCR;
- app mobile nativo;
- múltiplos modelos de PDF;
- editor visual de template de PDF.

### 3.3 Preservar funcionalidades anteriores

Não quebrar:

- login;
- processos do comprador;
- link do fornecedor;
- formulário do fornecedor;
- área do comprador;
- aprovação;
- assinatura;
- histórico;
- permissões;
- dashboard;
- listagens existentes.

### 3.4 PDF final deve ser bloqueado antes da hora

Regra obrigatória:

```text
Não gerar PDF final se o processo não estiver cadastrado.
```

O PDF final só pode ser gerado quando:

```text
status = cadastrado
aprovador_id preenchido
aprovado_at preenchido
cadastro_responsavel_id preenchido
cadastrado_at preenchido
```

Se quiser permitir visualização antes disso, deve ser apenas uma prévia com marca d'água:

```text
PRÉVIA - NÃO CADASTRADO
```

---

## 4. Escopo da Sprint 5

### 4.1 Incluído

Implementar:

1. Fila de cadastro.
2. Permissão real para usuários de cadastro.
3. Visualização de processos aprovados para cadastro.
4. Ação de assumir processo.
5. Status `em_cadastro`.
6. Campo de código interno do produto.
7. Observação de cadastro.
8. Ação de marcar como cadastrado.
9. Status `cadastrado`.
10. Geração de PDF final.
11. Armazenamento do PDF.
12. Download do PDF.
13. Status `pdf_gerado`.
14. Histórico da etapa de cadastro.
15. Registro de assinatura/ação de cadastro, se desejado.
16. Bloqueios de edição após cadastro/PDF.
17. Atualização do dashboard.
18. Atualização da listagem e detalhes do processo.

### 4.2 Fora do escopo

Não implementar:

- cadastro automático no ERP;
- envio automático do PDF por e-mail;
- anexar PDF ao ERP;
- assinatura desenhada;
- edição avançada do PDF;
- templates múltiplos;
- relatórios avançados.

---

## 5. Status Usados nesta Sprint

Status principais:

```text
aprovado_para_cadastro
em_cadastro
cadastrado
pdf_gerado
cancelado
```

### 5.1 Transições desta sprint

```text
aprovado_para_cadastro -> em_cadastro
em_cadastro -> cadastrado
cadastrado -> pdf_gerado
```

### 5.2 Regras

Ao assumir cadastro:

```text
status = em_cadastro
cadastro_responsavel_id = usuário logado
em_cadastro_at = now()
```

Ao marcar como cadastrado:

```text
status = cadastrado
cadastrado_at = now()
codigo_interno_produto = valor informado, se obrigatório
observacao_cadastro = valor informado, se existir campo
```

Ao gerar PDF final:

```text
status = pdf_gerado
pdf_gerado_at = now()
pdf_url = URL do arquivo salvo
```

---

## 6. Banco de Dados

## 6.1 Atualizar tabela `processos_cadastro`

Confirmar que existem os campos:

```sql
cadastro_responsavel_id uuid references public.profiles(id)
em_cadastro_at timestamptz
cadastrado_at timestamptz
pdf_gerado_at timestamptz
codigo_interno_produto text
pdf_url text
```

Adicionar também campo de observação de cadastro, caso ainda não exista:

```sql
alter table public.processos_cadastro
add column if not exists observacao_cadastro text;
```

Se os demais campos não existirem:

```sql
alter table public.processos_cadastro
add column if not exists cadastro_responsavel_id uuid references public.profiles(id);

alter table public.processos_cadastro
add column if not exists em_cadastro_at timestamptz;

alter table public.processos_cadastro
add column if not exists cadastrado_at timestamptz;

alter table public.processos_cadastro
add column if not exists pdf_gerado_at timestamptz;

alter table public.processos_cadastro
add column if not exists codigo_interno_produto text;

alter table public.processos_cadastro
add column if not exists pdf_url text;
```

---

## 6.2 Atualizar tabela `profiles`

Confirmar que existe:

```sql
pode_cadastrar boolean not null default false
```

Se não existir:

```sql
alter table public.profiles
add column if not exists pode_cadastrar boolean not null default false;
```

### 6.2.1 Regra de perfil

Usuário de cadastro pode ser:

```text
perfil = cadastro
```

ou usuário interno com:

```text
pode_cadastrar = true
```

Recomendação:

```text
Usar perfil = cadastro para o setor de cadastro.
```

---

## 6.3 Tabela `assinaturas`

A tabela `assinaturas` já foi criada na Sprint 4.

Nesta sprint, pode ser usado o tipo:

```text
tipo = cadastro
```

Para registrar que o responsável pelo cadastro confirmou a conclusão.

Registro sugerido:

```text
processo_id
usuario_id
tipo = cadastro
status = aprovado
nome_assinante
email_assinante
cargo_ou_perfil = cadastro
observacao
created_at
```

Esse registro não é assinatura de aprovação comercial, mas uma confirmação de execução do cadastro.

---

## 6.4 Storage para PDFs

Criar bucket no Supabase Storage:

```text
pdfs
```

Sugestão de caminho:

```text
pdfs/cadastros/{ano}/{mes}/{numero_processo}.pdf
```

Exemplo:

```text
pdfs/cadastros/2026/05/000123.pdf
```

### 6.4.1 Regras

- PDF deve ficar vinculado ao processo em `pdf_url`;
- se o PDF for regenerado, substituir ou versionar;
- para MVP, pode substituir o PDF anterior;
- histórico deve registrar geração ou regeneração.

---

## 7. Permissões

## 7.1 Cadastro

Usuário com:

```text
perfil = cadastro
```

ou:

```text
pode_cadastrar = true
```

Pode:

- acessar fila de cadastro;
- ver processos aprovados para cadastro;
- ver processos em cadastro assumidos por ele;
- ver processos cadastrados;
- ver PDFs gerados;
- assumir processo;
- marcar como cadastrado;
- gerar PDF final;
- baixar PDF final.

Não pode:

- aprovar processo;
- alterar dados do fornecedor;
- alterar dados comerciais;
- alterar assinatura do aprovador;
- cadastrar processo não aprovado;
- gerar PDF antes de marcar como cadastrado.

## 7.2 Comprador responsável

Pode:

- ver seus processos aprovados;
- ver que está em cadastro;
- baixar PDF final, se regra permitir;
- consultar histórico.

Não pode:

- marcar como cadastrado;
- gerar PDF final;
- editar depois da aprovação, salvo fluxo de correção.

## 7.3 Comprador aprovador

Pode:

- ver processos que aprovou;
- consultar assinatura;
- baixar PDF final, se regra permitir.

Não pode:

- marcar como cadastrado, exceto se também tiver `pode_cadastrar`.

## 7.4 Admin

Pode:

- ver tudo;
- acessar fila de cadastro;
- corrigir exceções;
- regenerar PDF;
- baixar PDF.

---

## 8. RLS e Segurança

## 8.1 Processos

Usuário de cadastro deve conseguir ler processos com status:

```text
aprovado_para_cadastro
em_cadastro
cadastrado
pdf_gerado
```

Deve conseguir atualizar campos de cadastro apenas quando status permitir.

### 8.1.1 Atualização permitida para cadastro

Quando status `aprovado_para_cadastro`, cadastro pode atualizar:

```text
status
cadastro_responsavel_id
em_cadastro_at
updated_at
updated_by
```

Quando status `em_cadastro`, cadastro pode atualizar:

```text
status
codigo_interno_produto
observacao_cadastro
cadastrado_at
updated_at
updated_by
```

Quando status `cadastrado`, cadastro pode atualizar:

```text
status
pdf_gerado_at
pdf_url
updated_at
updated_by
```

Depois de `pdf_gerado`, bloquear edição comum.

## 8.2 Dados da ficha

Cadastro deve conseguir ler:

```text
dados_fornecedor_produto
dados_comprador_produto
processo_mix_lojas
assinaturas
historico_processos
fornecedores
profiles relacionados
```

Não deve editar essas tabelas nesta sprint.

## 8.3 Storage

Configurar permissão para upload do PDF por usuário autorizado.

Para download:

- usuário interno autorizado pode baixar;
- fornecedor externo não baixa PDF final no MVP;
- se for usar URL pública, garantir que não exponha documentos indevidamente;
- recomendação: usar URL assinada/temporária quando possível.

---

## 9. Fila de Cadastro

## 9.1 Rota

Criar rota:

```text
/app/cadastro
```

## 9.2 Quem acessa

Apenas:

```text
perfil = cadastro
pode_cadastrar = true
admin
```

Se usuário sem permissão acessar:

```text
Você não tem permissão para acessar a fila de cadastro.
```

## 9.3 Listagem

Listar processos com status:

```text
aprovado_para_cadastro
em_cadastro
cadastrado
pdf_gerado
```

### 9.3.1 Colunas

```text
Número
Produto
Código de barra
Fornecedor
Comprador responsável
Aprovador
Aprovado em
Status
Responsável pelo cadastro
Ações
```

### 9.3.2 Ações por status

#### `aprovado_para_cadastro`

```text
Abrir
Assumir cadastro
```

#### `em_cadastro`

```text
Abrir
Marcar como cadastrado
```

#### `cadastrado`

```text
Abrir
Gerar PDF
```

#### `pdf_gerado`

```text
Abrir
Baixar PDF
```

## 9.4 Filtros

Filtros básicos:

```text
status
comprador responsável
fornecedor
data de aprovação
produto/código de barra
```

No MVP, pelo menos:

```text
busca textual
status
```

---

## 10. Tela de Cadastro do Processo

## 10.1 Rota

Criar:

```text
/app/cadastro/:id
```

ou reutilizar:

```text
/app/processos/:id/cadastro
```

Recomendação:

```text
/app/cadastro/:id
```

## 10.2 Seções da tela

Mostrar ficha completa em modo leitura:

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
Aprovação/assinatura
Campos do cadastro
Histórico
PDF
```

## 10.3 Ações

Conforme status:

### `aprovado_para_cadastro`

```text
Assumir cadastro
```

### `em_cadastro`

```text
Salvar dados de cadastro
Marcar como cadastrado
```

### `cadastrado`

```text
Gerar PDF final
```

### `pdf_gerado`

```text
Baixar PDF
Regenerar PDF, se permitido
```

---

## 11. Campos da Etapa de Cadastro

## 11.1 Código interno do produto

Campo:

```text
codigo_interno_produto
```

### Regra recomendada

Para MVP, deixar configurável.

Opção recomendada:

```text
Obrigatório para marcar como cadastrado.
```

Motivo:

- facilita rastrear o produto no sistema interno;
- deixa o PDF mais completo;
- evita cadastro sem referência final.

Se a empresa ainda não tiver esse código na hora, pode ser opcional.

Criar constante:

```ts
export const CODIGO_INTERNO_OBRIGATORIO = true;
```

## 11.2 Observação de cadastro

Campo:

```text
observacao_cadastro
```

Regras:

- opcional;
- texto livre;
- usado para informar observações do cadastro no sistema interno.

Exemplos:

```text
Produto cadastrado no ERP com código 12345.
Cadastro realizado conforme ficha aprovada.
```

---

## 12. Assumir Cadastro

## 12.1 Ação

Botão:

```text
Assumir cadastro
```

Disponível quando:

```text
status = aprovado_para_cadastro
```

## 12.2 Ao confirmar

Atualizar processo:

```text
status = em_cadastro
cadastro_responsavel_id = usuário logado
em_cadastro_at = now()
updated_at = now()
updated_by = usuário logado
```

Registrar histórico:

```text
acao = cadastro_assumiu_processo
status_anterior = aprovado_para_cadastro
status_novo = em_cadastro
observacao = Cadastro assumido pelo usuário
```

## 12.3 Regra

Se outro usuário já assumiu, não permitir assumir novamente sem admin.

Mensagem:

```text
Este processo já foi assumido por outro responsável de cadastro.
```

---

## 13. Marcar como Cadastrado

## 13.1 Ação

Botão:

```text
Marcar como cadastrado
```

Disponível quando:

```text
status = em_cadastro
cadastro_responsavel_id = usuário logado
```

Admin pode fazer em exceção.

## 13.2 Modal

Título:

```text
Confirmar cadastro do produto
```

Campos:

```text
Código interno do produto
Observação de cadastro
```

Texto:

```text
Confirme que o produto foi cadastrado no sistema interno antes de continuar.
```

Botões:

```text
Cancelar
Confirmar cadastro
```

## 13.3 Validações

Se `CODIGO_INTERNO_OBRIGATORIO = true`:

```text
codigo_interno_produto obrigatório
```

Sempre exigir:

```text
status = em_cadastro
cadastro_responsavel_id preenchido
```

## 13.4 Ao confirmar

Atualizar processo:

```text
status = cadastrado
codigo_interno_produto = valor informado
observacao_cadastro = valor informado
cadastrado_at = now()
updated_at = now()
updated_by = usuário logado
```

Inserir assinatura/registro de cadastro, se usar:

```text
tipo = cadastro
status = aprovado
nome_assinante = nome do usuário de cadastro
observacao = observação informada
```

Registrar histórico:

```text
acao = cadastro_marcou_como_cadastrado
status_anterior = em_cadastro
status_novo = cadastrado
observacao = Produto marcado como cadastrado
```

---

## 14. Geração de PDF Final

## 14.1 Regra principal

O PDF final só pode ser gerado quando:

```text
status = cadastrado
```

E os campos abaixo devem existir:

```text
dados_fornecedor_produto
dados_comprador_produto
processo_mix_lojas
assinatura de aprovação
aprovador_id
aprovado_at
cadastro_responsavel_id
cadastrado_at
```

## 14.2 Ação

Botão:

```text
Gerar PDF final
```

Disponível quando:

```text
status = cadastrado
```

## 14.3 Ao gerar

O sistema deve:

1. buscar todos os dados do processo;
2. montar HTML/template do PDF;
3. gerar arquivo PDF;
4. salvar no Storage;
5. atualizar processo com `pdf_url`;
6. atualizar status para `pdf_gerado`;
7. preencher `pdf_gerado_at`;
8. registrar histórico.

## 14.4 Histórico

```text
acao = pdf_final_gerado
status_anterior = cadastrado
status_novo = pdf_gerado
observacao = PDF final gerado e salvo
```

## 14.5 Regenerar PDF

Opcional nesta sprint.

Se implementar, permitir apenas para:

```text
admin
cadastro_responsavel
```

Registrar:

```text
acao = pdf_final_regenerado
```

---

## 15. Layout do PDF

## 15.1 Referência visual

O PDF deve seguir visualmente a ficha atual de Cadastro de Produto Prado.

A ficha possui blocos como:

```text
Cadastro de Produto
Informações Logísticas
Dimensões da Caixa
Palete
Obrigatório Comprador Preencher e Diretoria Assinar
Tipo de Entrega
Mix
Estrutura Mercadológica
Assinaturas/Autorizações
```

## 15.2 Conteúdo obrigatório

O PDF final deve conter:

### Cabeçalho

```text
PRADO
CADASTRO DE PRODUTO
Processo nº
Data de geração
Status final
```

### Dados do produto

```text
Código de barra
Descrição do produto
Descrição Prado
Marca
Gramagem
Usa balança
Referência
```

### Fornecedor

```text
Fornecedor
CNPJ
Preço de custo
```

### Caixa/display

```text
Código da caixa
Quantidade na caixa
Código do display
Quantidade do display
```

### Informações logísticas

```text
Altura/cm
Largura/cm
Comprimento/cm
Cubagem/m³
Peso bruto/kg
Palete
Lastro
```

### Tipo de entrega

```text
Entrega CD
Entrega Loja
Cross Dock
```

### Substituição

```text
Sim
Não
```

### Mix

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

### Estrutura mercadológica

```text
Departamento
Categoria
Subcategoria
Segmento
Subsegmento
```

### Dados comerciais

```text
Margem de lucro
Preço Prado
Preço Pradão
Código de item similar
```

### Assinaturas/autorizações

```text
Comprador responsável
Aprovado por
Data da aprovação
Responsável pelo cadastro
Data do cadastro
Código interno do produto
```

### Rodapé

```text
Ficha gerada automaticamente pelo Sistema de Cadastro de Produtos Prado.
Processo nº {numero_processo}.
Aprovado por {nome_aprovador} em {data_aprovacao}.
Cadastrado por {nome_cadastro} em {data_cadastro}.
```

---

## 16. Prévia do PDF

## 16.1 Opcional nesta sprint

Pode implementar uma prévia visual antes da geração final, mas não é obrigatório.

Se implementar prévia antes de `status = cadastrado`, ela deve conter marca d'água:

```text
PRÉVIA - NÃO CADASTRADO
```

## 16.2 Regras da prévia

- prévia não altera status;
- prévia não salva como PDF final;
- prévia não preenche `pdf_url`;
- prévia não substitui o PDF oficial.

---

## 17. Tecnologia para PDF

## 17.1 Recomendação

Usar uma das abordagens:

```text
HTML/CSS -> PDF
React PDF
Puppeteer server-side
```

Para MVP, a melhor recomendação é:

```text
HTML/CSS -> PDF
```

Motivos:

- facilita deixar parecido com a ficha original;
- permite controle visual por CSS;
- reaproveita componentes;
- facilita prévia na tela.

## 17.2 Possibilidades práticas

### Opção A - Gerar via navegador

Usar HTML e `window.print()` ou biblioteca client-side.

Vantagens:

- simples;
- rápido para MVP.

Desvantagens:

- pode variar entre navegadores;
- menos controle no backend.

### Opção B - Gerar via Edge Function/Puppeteer

Vantagens:

- PDF mais consistente;
- melhor para produção;
- salva direto no Storage.

Desvantagens:

- mais trabalhoso;
- precisa configurar ambiente.

### Opção C - React PDF

Vantagens:

- PDF controlado em componentes;
- bom para documentos estruturados.

Desvantagens:

- pode ser mais trabalhoso reproduzir layout da ficha.

### Decisão recomendada para esta sprint

Começar com:

```text
HTML/CSS + geração de PDF
```

Se o projeto já tiver backend/Edge Function preparado, usar server-side.

---

## 18. Nome e Caminho do PDF

## 18.1 Nome do arquivo

Formato:

```text
cadastro-produto-{numero_processo}-{codigo_barra}.pdf
```

Exemplo:

```text
cadastro-produto-000123-7891234567890.pdf
```

Se não houver código de barra:

```text
cadastro-produto-000123.pdf
```

## 18.2 Caminho no Storage

```text
pdfs/cadastros/{ano}/{mes}/{nome_arquivo}
```

Exemplo:

```text
pdfs/cadastros/2026/05/cadastro-produto-000123-7891234567890.pdf
```

---

## 19. Services

Criar service:

```text
cadastroService.ts
```

## 19.1 Funções

```text
listarProcessosCadastro()
buscarProcessoParaCadastro(processoId)
assumirCadastro(processoId)
salvarDadosCadastro(processoId, data)
marcarComoCadastrado(processoId, data)
gerarPdfFinal(processoId)
baixarPdf(processoId)
verificarPodeCadastrar(profile)
verificarPodeGerarPdf(processo)
```

## 19.2 `listarProcessosCadastro`

Responsável por:

- buscar processos com status:
  - `aprovado_para_cadastro`;
  - `em_cadastro`;
  - `cadastrado`;
  - `pdf_gerado`;
- incluir dados resumidos:
  - fornecedor;
  - dados fornecedor;
  - comprador responsável;
  - aprovador;
  - cadastro responsável;
- ordenar por aprovação mais antiga primeiro.

## 19.3 `buscarProcessoParaCadastro`

Responsável por carregar:

```text
processo
fornecedor
dados_fornecedor_produto
dados_comprador_produto
processo_mix_lojas
assinaturas
historico
comprador_responsavel
aprovador
cadastro_responsavel
```

## 19.4 `assumirCadastro`

Responsável por:

1. validar permissão;
2. validar status `aprovado_para_cadastro`;
3. atualizar status para `em_cadastro`;
4. preencher responsável;
5. registrar histórico.

## 19.5 `marcarComoCadastrado`

Responsável por:

1. validar permissão;
2. validar status `em_cadastro`;
3. validar responsável;
4. validar código interno, se obrigatório;
5. atualizar status para `cadastrado`;
6. preencher data de cadastro;
7. registrar assinatura/registro de cadastro;
8. registrar histórico.

## 19.6 `gerarPdfFinal`

Responsável por:

1. validar permissão;
2. validar status `cadastrado`;
3. carregar dados completos;
4. validar dados mínimos;
5. gerar PDF;
6. salvar no Storage;
7. atualizar processo para `pdf_gerado`;
8. salvar `pdf_url`;
9. registrar histórico.

## 19.7 `baixarPdf`

Responsável por:

- verificar permissão;
- verificar `pdf_url`;
- gerar URL assinada, se aplicável;
- iniciar download.

---

## 20. Componentes a Criar

## 20.1 Componentes de cadastro

```text
CadastroPage
CadastroDetalhePage
CadastroTable
CadastroActionPanel
AssumirCadastroDialog
MarcarCadastradoDialog
DadosCadastroForm
CadastroStatusCard
```

## 20.2 Componentes de PDF

```text
PdfFichaCadastroProduto
PdfPreview
PdfGenerateButton
PdfDownloadButton
PdfStatusCard
```

## 20.3 Componentes de visualização

Reutilizar ou criar:

```text
DadosFornecedorReadOnly
DadosCompradorReadOnly
MixLojasReadOnly
AssinaturaResumoCard
ProcessoHistorico
```

## 20.4 Componentes auxiliares

```text
CodigoInternoInput
ObservacaoCadastroTextarea
```

---

## 21. Páginas / Rotas

Adicionar rotas:

```text
/app/cadastro
/app/cadastro/:id
```

### 21.1 Menu

Adicionar item no sidebar:

```text
Cadastro
```

Mostrar somente para:

```text
perfil = cadastro
pode_cadastrar = true
admin
```

### 21.2 Dashboard

Adicionar cards para cadastro:

```text
Aprovados para cadastro
Em cadastro
Cadastrados
PDFs gerados
```

---

## 22. Atualização da Tela de Detalhes do Processo

Na tela geral do processo:

```text
/app/processos/:id
```

Adicionar seção:

```text
Cadastro
```

Mostrar:

```text
Status do cadastro
Responsável pelo cadastro
Data em cadastro
Data cadastrado
Código interno do produto
Observação de cadastro
PDF final
```

Se PDF existir:

```text
Baixar PDF
```

Se ainda não existir:

```text
PDF ainda não gerado
```

---

## 23. Atualização da Listagem de Processos

Adicionar labels/status amigáveis:

```text
aprovado_para_cadastro = Aprovado para cadastro
em_cadastro = Em cadastro
cadastrado = Cadastrado
pdf_gerado = PDF gerado
```

### 23.1 Ações por status

#### `aprovado_para_cadastro`

Para cadastro:

```text
Assumir cadastro
```

Para comprador:

```text
Ver aprovação
```

#### `em_cadastro`

Para cadastro responsável:

```text
Continuar cadastro
```

Para comprador:

```text
Aguardando cadastro
```

#### `cadastrado`

Para cadastro:

```text
Gerar PDF
```

Para comprador:

```text
Aguardando PDF
```

#### `pdf_gerado`

```text
Baixar PDF
```

---

## 24. Histórico

Registrar eventos:

### 24.1 Assumir cadastro

```text
acao = cadastro_assumiu_processo
status_anterior = aprovado_para_cadastro
status_novo = em_cadastro
observacao = Cadastro assumido pelo usuário
```

### 24.2 Marcar como cadastrado

```text
acao = cadastro_marcou_como_cadastrado
status_anterior = em_cadastro
status_novo = cadastrado
observacao = Produto marcado como cadastrado
```

### 24.3 Gerar PDF

```text
acao = pdf_final_gerado
status_anterior = cadastrado
status_novo = pdf_gerado
observacao = PDF final gerado
```

### 24.4 Regenerar PDF, se implementado

```text
acao = pdf_final_regenerado
status_anterior = pdf_gerado
status_novo = pdf_gerado
observacao = PDF final regenerado
```

---

## 25. Validações

## 25.1 Assumir cadastro

Obrigatório:

```text
usuário possui permissão de cadastro
processo.status = aprovado_para_cadastro
processo.aprovador_id preenchido
processo.aprovado_at preenchido
```

## 25.2 Marcar como cadastrado

Obrigatório:

```text
usuário possui permissão de cadastro
processo.status = em_cadastro
processo.cadastro_responsavel_id preenchido
processo.cadastro_responsavel_id = usuário logado ou usuário é admin
```

Se configurado:

```text
codigo_interno_produto obrigatório
```

## 25.3 Gerar PDF final

Obrigatório:

```text
usuário possui permissão de cadastro ou admin
processo.status = cadastrado
dados do fornecedor existem
dados do comprador existem
mix de lojas existe
assinatura de aprovação existe
aprovador_id preenchido
aprovado_at preenchido
cadastro_responsavel_id preenchido
cadastrado_at preenchido
```

## 25.4 Baixar PDF

Obrigatório:

```text
processo.status = pdf_gerado
pdf_url preenchido
usuário autorizado
```

---

## 26. Formatação do PDF

## 26.1 Datas

Usar formato brasileiro:

```text
15/05/2026 14:32
```

## 26.2 Valores monetários

Usar BRL:

```text
R$ 12,34
```

Campos:

```text
preco_custo
preco_prado
preco_pradao
```

## 26.3 Percentual

```text
25,50%
```

Campo:

```text
margem_lucro
```

## 26.4 Medidas

```text
Altura: 30 cm
Largura: 20 cm
Comprimento: 40 cm
Cubagem: 0,024 m³
Peso bruto: 5,500 kg
```

## 26.5 Booleanos

```text
Sim
Não
```

---

## 27. Layout Visual do PDF

## 27.1 Estrutura sugerida

O PDF pode ser uma página A4 paisagem ou retrato.

Como a ficha original tem muitos campos em formato horizontal, recomendação:

```text
A4 paisagem
```

## 27.2 Seções visuais

Usar cabeçalhos de seção com destaque:

```text
CADASTRO DE PRODUTO
INFORMAÇÕES LOGÍSTICAS
DIMENSÕES DA CAIXA
PALETE
COMPRADOR / APROVAÇÃO
MIX
ESTRUTURA MERCADOLÓGICA
ASSINATURAS / AUTORIZAÇÕES
```

## 27.3 Estilo

- bordas finas;
- campos em grade;
- títulos com fundo destacado;
- textos legíveis;
- evitar excesso de cor;
- manter aparência próxima da ficha enviada.

## 27.4 Campos vazios

Se algum campo opcional estiver vazio, mostrar:

```text
-
```

---

## 28. Mensagens de Interface

### 28.1 Sem processos

```text
Nenhum processo aprovado para cadastro encontrado.
```

### 28.2 Assumido com sucesso

```text
Processo assumido para cadastro.
```

### 28.3 Cadastrado com sucesso

```text
Produto marcado como cadastrado.
```

### 28.4 PDF gerado

```text
PDF final gerado com sucesso.
```

### 28.5 PDF bloqueado

```text
O PDF final só pode ser gerado após o produto ser marcado como cadastrado.
```

### 28.6 Sem permissão

```text
Você não tem permissão para executar esta ação.
```

---

## 29. Tipos TypeScript

## 29.1 `CadastroProcessoView`

```ts
export type CadastroProcessoView = {
  processo: ProcessoCadastro;
  fornecedor: Fornecedor | null;
  dadosFornecedor: DadosFornecedorProduto | null;
  dadosComprador: DadosCompradorProduto | null;
  mixLojas: ProcessoMixLoja[];
  historico: HistoricoProcesso[];
  assinaturas: Assinatura[];
  compradorResponsavel: UserProfile | null;
  aprovador: UserProfile | null;
  cadastroResponsavel: UserProfile | null;
};
```

## 29.2 `CadastroFormData`

```ts
export type CadastroFormData = {
  codigo_interno_produto?: string | null;
  observacao_cadastro?: string | null;
};
```

## 29.3 `PdfGenerationResult`

```ts
export type PdfGenerationResult = {
  success: boolean;
  pdfUrl?: string;
  storagePath?: string;
  error?: string;
};
```

---

## 30. Constantes

Criar ou atualizar constantes:

```ts
export const CODIGO_INTERNO_OBRIGATORIO = true;

export const CADASTRO_STATUS = {
  APROVADO_PARA_CADASTRO: "aprovado_para_cadastro",
  EM_CADASTRO: "em_cadastro",
  CADASTRADO: "cadastrado",
  PDF_GERADO: "pdf_gerado",
} as const;
```

Labels:

```ts
export const CADASTRO_STATUS_LABELS = {
  aprovado_para_cadastro: "Aprovado para cadastro",
  em_cadastro: "Em cadastro",
  cadastrado: "Cadastrado",
  pdf_gerado: "PDF gerado",
};
```

---

## 31. Critérios de Aceite

A Sprint 5 será considerada concluída quando:

1. Usuário de cadastro conseguir acessar `/app/cadastro`.
2. Usuário sem permissão não conseguir acessar `/app/cadastro`.
3. Fila listar processos com status `aprovado_para_cadastro`.
4. Cadastro conseguir abrir processo aprovado.
5. Tela de cadastro mostrar dados completos da ficha.
6. Tela de cadastro mostrar assinatura/aprovação.
7. Cadastro conseguir assumir processo.
8. Processo assumido mudar para `em_cadastro`.
9. Processo assumido preencher `cadastro_responsavel_id`.
10. Processo assumido preencher `em_cadastro_at`.
11. Histórico registrar que cadastro assumiu.
12. Cadastro conseguir informar código interno.
13. Cadastro conseguir informar observação.
14. Cadastro conseguir marcar como cadastrado.
15. Processo cadastrado mudar para `cadastrado`.
16. Processo cadastrado preencher `cadastrado_at`.
17. Histórico registrar produto cadastrado.
18. Sistema bloquear PDF antes de status `cadastrado`.
19. Cadastro conseguir gerar PDF final quando status for `cadastrado`.
20. PDF conter dados do fornecedor.
21. PDF conter dados do comprador.
22. PDF conter mix de lojas.
23. PDF conter estrutura mercadológica.
24. PDF conter assinatura/aprovação.
25. PDF conter responsável pelo cadastro.
26. PDF conter código interno, se informado.
27. PDF ser salvo no Storage.
28. Processo mudar para `pdf_gerado`.
29. Processo preencher `pdf_url`.
30. Processo preencher `pdf_gerado_at`.
31. Histórico registrar PDF gerado.
32. Usuário autorizado conseguir baixar PDF.
33. Processo em `pdf_gerado` ficar bloqueado contra edição comum.
34. Funcionalidades das sprints anteriores continuarem funcionando.

---

## 32. Testes Manuais

## 32.1 Acessar fila de cadastro

1. Entrar como usuário sem permissão de cadastro.
2. Tentar acessar `/app/cadastro`.
3. Confirmar bloqueio.
4. Entrar como usuário de cadastro.
5. Acessar `/app/cadastro`.
6. Confirmar que processos aprovados aparecem.

## 32.2 Assumir processo

1. Abrir processo com status `aprovado_para_cadastro`.
2. Clicar em "Assumir cadastro".
3. Confirmar ação.
4. Confirmar status `Em cadastro`.
5. Confirmar responsável de cadastro preenchido.
6. Confirmar histórico.

## 32.3 Marcar como cadastrado

1. Abrir processo em `em_cadastro`.
2. Clicar em "Marcar como cadastrado".
3. Tentar confirmar sem código interno, se obrigatório.
4. Confirmar validação.
5. Informar código interno.
6. Informar observação, se desejar.
7. Confirmar.
8. Ver status `Cadastrado`.
9. Confirmar `cadastrado_at`.
10. Confirmar histórico.

## 32.4 Bloquear PDF antes do cadastro

1. Abrir processo em `aprovado_para_cadastro`.
2. Confirmar que botão "Gerar PDF final" não aparece.
3. Abrir processo em `em_cadastro`.
4. Confirmar que botão "Gerar PDF final" não aparece.
5. Confirmar mensagem adequada, se houver tentativa direta.

## 32.5 Gerar PDF final

1. Abrir processo com status `cadastrado`.
2. Clicar em "Gerar PDF final".
3. Confirmar ação.
4. Aguardar geração.
5. Confirmar mensagem de sucesso.
6. Confirmar status `PDF gerado`.
7. Confirmar `pdf_url`.
8. Confirmar `pdf_gerado_at`.
9. Confirmar histórico.

## 32.6 Validar conteúdo do PDF

Abrir PDF e conferir:

1. Cabeçalho Prado/Cadastro de Produto.
2. Número do processo.
3. Código de barra.
4. Descrição do produto.
5. Descrição Prado.
6. Fornecedor e CNPJ.
7. Dados logísticos.
8. Caixa/display.
9. Tipo de entrega.
10. Substituição.
11. Mix de lojas.
12. Estrutura mercadológica.
13. Preços e margem.
14. Aprovador e data de aprovação.
15. Responsável pelo cadastro.
16. Código interno.
17. Data de geração.

## 32.7 Baixar PDF

1. Abrir processo com status `pdf_gerado`.
2. Clicar em "Baixar PDF".
3. Confirmar download.
4. Abrir arquivo baixado.
5. Confirmar conteúdo.

## 32.8 Permissões

1. Entrar como comprador responsável.
2. Confirmar que ele vê status do processo.
3. Confirmar que ele não consegue marcar como cadastrado.
4. Confirmar que ele não consegue gerar PDF final.
5. Entrar como admin.
6. Confirmar que admin consegue acessar e consultar.

---

## 33. Checklist Técnico

### Banco

- [ ] Confirmar `cadastro_responsavel_id`.
- [ ] Confirmar `em_cadastro_at`.
- [ ] Confirmar `cadastrado_at`.
- [ ] Confirmar `pdf_gerado_at`.
- [ ] Confirmar `codigo_interno_produto`.
- [ ] Confirmar `pdf_url`.
- [ ] Adicionar `observacao_cadastro`.
- [ ] Confirmar `pode_cadastrar`.
- [ ] Configurar bucket `pdfs`.

### Services

- [ ] Criar `cadastroService.ts`.
- [ ] Listar processos de cadastro.
- [ ] Buscar processo completo.
- [ ] Assumir cadastro.
- [ ] Salvar dados de cadastro.
- [ ] Marcar como cadastrado.
- [ ] Gerar PDF final.
- [ ] Baixar PDF.
- [ ] Registrar histórico.

### UI

- [ ] Criar `/app/cadastro`.
- [ ] Criar `/app/cadastro/:id`.
- [ ] Criar tabela de cadastro.
- [ ] Criar tela de detalhe do cadastro.
- [ ] Criar botão assumir.
- [ ] Criar modal marcar cadastrado.
- [ ] Criar botão gerar PDF.
- [ ] Criar botão baixar PDF.
- [ ] Criar card de status do PDF.
- [ ] Atualizar sidebar.
- [ ] Atualizar dashboard.

### PDF

- [ ] Criar template visual.
- [ ] Adicionar dados do fornecedor.
- [ ] Adicionar dados do comprador.
- [ ] Adicionar mix de lojas.
- [ ] Adicionar aprovação.
- [ ] Adicionar cadastro.
- [ ] Gerar arquivo PDF.
- [ ] Salvar no Storage.
- [ ] Atualizar `pdf_url`.
- [ ] Baixar PDF.

### Permissões

- [ ] Bloquear acesso à fila para usuário sem permissão.
- [ ] Permitir cadastro assumir processo aprovado.
- [ ] Bloquear PDF antes de `cadastrado`.
- [ ] Bloquear edição após `pdf_gerado`.

### Histórico

- [ ] Registrar cadastro assumido.
- [ ] Registrar cadastrado.
- [ ] Registrar PDF gerado.
- [ ] Registrar PDF baixado, se desejado.
- [ ] Registrar PDF regenerado, se implementado.

---

## 34. Entrega Esperada

Ao final da Sprint 5, o sistema deve permitir o fluxo completo do cadastro de produto:

```text
Comprador cria processo
↓
Fornecedor preenche
↓
Comprador completa
↓
Comprador aprovador assina
↓
Cadastro assume
↓
Cadastro marca como cadastrado
↓
Sistema gera PDF final
```

Com isso, o MVP principal fica funcional.

O sistema ainda pode receber melhorias futuras, mas o fluxo central estará completo.

---

## 35. Próxima Sprint

### Sprint 6 - Melhorias, Anexos, Filtros e Refinamento

Na Sprint 6, implementar melhorias operacionais:

- anexos;
- imagem do produto;
- filtros avançados;
- busca melhor;
- relatórios simples;
- melhorias visuais;
- ajustes no PDF;
- notificações internas;
- vencimento de links;
- melhorias de segurança/RLS;
- refinamento de dashboard;
- correções de bugs do MVP.

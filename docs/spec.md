# SPEC.md - Sistema de Cadastro de Produtos Prado

## 0. Stack:

**Frontend - Next.js**
**Backend - Neon**
**Linguagem - Typescript**

## 1. Visão Geral

### 1.1 Nome do projeto

**Cadastro de Produtos Prado**

### 1.2 Objetivo

Criar um sistema web para controlar o processo de cadastro de novos produtos, substituindo o preenchimento manual da ficha atual por um fluxo digital com etapas, responsáveis, permissões, aprovação/assinatura e geração de PDF final.

O sistema deve permitir que:

1. Um comprador crie um processo de cadastro de produto.
2. O fornecedor preencha sua parte por meio de um link externo.
3. O comprador responsável complete a parte comercial, mix de lojas e estrutura mercadológica.
4. Um comprador com permissão de aprovação assine/aprove o processo.
5. O setor de cadastro receba apenas processos aprovados.
6. Após o cadastro final, o sistema gere um PDF oficial no modelo da ficha Prado.

### 1.3 Problema que o sistema resolve

Hoje a ficha de cadastro de produto depende de preenchimento manual, troca de arquivos e controle informal de etapas. Isso pode gerar:

- ficha incompleta;
- dados preenchidos pela pessoa errada;
- dificuldade para saber com quem está o processo;
- perda de histórico;
- falta de rastreabilidade de aprovação;
- PDF final gerado antes da aprovação correta;
- dificuldade para cada comprador acompanhar seus próprios processos.

O sistema deve transformar a ficha em um fluxo controlado, com status, responsáveis e histórico.

### 1.4 Conceito principal

Cada ficha será tratada como um **processo de cadastro de produto**.

Um processo possui:

- comprador responsável;
- fornecedor vinculado;
- dados preenchidos pelo fornecedor;
- dados preenchidos pelo comprador;
- aprovação/assinatura;
- etapa de cadastro;
- PDF final;
- histórico completo.

---

## 2. Regras Globais do Projeto

### 2.1 Separação entre perfil e permissão

O sistema não deve assumir que existe um cargo fixo chamado "gerente" separado do comprador.

No fluxo real, o gerente também pode ser comprador. Por isso, o sistema deve trabalhar com:

- **perfil principal do usuário**;
- **permissões extras**.

Exemplo:

```text
Usuário: Marcos
Perfil: comprador
Pode aprovar: sim
Pode cadastrar: não
```

Isso significa que Marcos é comprador, possui seus próprios processos e também pode aprovar/assinar processos quando permitido.

### 2.2 Cada comprador tem seus próprios processos

Todo processo deve ter obrigatoriamente um comprador responsável.

Campo obrigatório:

```text
comprador_responsavel_id
```

Regra:

- comprador comum vê apenas seus próprios processos;
- comprador aprovador vê seus próprios processos e processos aguardando aprovação;
- cadastro vê processos aprovados para cadastro;
- admin vê tudo.

### 2.3 PDF final somente no final do fluxo

O PDF final oficial só pode ser gerado quando todas as condições abaixo forem verdadeiras:

```text
Fornecedor enviou os dados
Comprador completou a parte comercial
Aprovador assinou/aprovou
Cadastro marcou como cadastrado
```

Antes disso, o sistema pode gerar apenas uma prévia com marca d'água:

```text
PRÉVIA - NÃO CADASTRADO
```

### 2.4 Histórico obrigatório

Toda mudança relevante deve gerar histórico:

- criação do processo;
- envio ao fornecedor;
- envio pelo fornecedor;
- comprador completou;
- envio para aprovação;
- aprovação;
- reprovação;
- solicitação de correção;
- início do cadastro;
- marcação como cadastrado;
- geração do PDF;
- alterações relevantes em campos críticos.

### 2.5 Responsabilidade por etapa

Cada etapa deve bloquear edição indevida.

Fornecedor não altera dados do comprador.
Comprador não altera assinatura do aprovador.
Cadastro não altera dados comerciais sem permissão especial.
Aprovador não precisa preencher a ficha inteira; ele revisa, aprova ou reprova.

### 2.6 Regra sobre documentação e agentes de IA

Quando este projeto for trabalhado com ferramentas de IA/coding agents:

- não alterar arquivos de documentação sem pedido explícito;
- não apagar nem reescrever arquivos `.md` existentes sem autorização;
- não modificar a pasta `docs/` sem autorização;
- quando uma sprint for solicitada, criar ou alterar apenas os arquivos combinados;
- não fazer redesign visual sem necessidade;
- preservar o padrão visual definido no projeto;
- priorizar implementação incremental e segura.

Exceção: este próprio arquivo `SPEC.md` pode ser criado ou alterado quando o usuário pedir diretamente.

---

## 3. Perfis e Permissões

### 3.1 Perfis principais

O sistema deve possuir os seguintes perfis:

```text
admin
comprador
cadastro
fornecedor_externo
```

Além disso, usuários internos podem ter permissões extras:

```text
pode_aprovar
pode_cadastrar
pode_gerenciar_usuarios
pode_ver_todos_processos
```

### 3.2 Admin

Pode:

- ver todos os processos;
- criar usuários internos;
- ativar/desativar usuários;
- alterar permissões;
- ver relatórios;
- acessar histórico completo;
- corrigir processo em caso excepcional;
- gerar ou regenerar PDF quando permitido;
- cadastrar lojas, departamentos e categorias se o sistema tiver cadastro dinâmico.

### 3.3 Comprador

Pode:

- criar processo;
- vincular fornecedor;
- gerar link para fornecedor;
- ver seus próprios processos;
- preencher a parte do comprador;
- escolher tipo de entrega;
- escolher substituição;
- selecionar mix de lojas;
- preencher estrutura mercadológica;
- preencher preços e margem;
- solicitar correção ao fornecedor;
- enviar para aprovação;
- acompanhar status de seus processos.

Não pode:

- aprovar se não tiver permissão `pode_aprovar`;
- ver processos de outros compradores, exceto se tiver permissão extra;
- marcar processo como cadastrado;
- gerar PDF final antes do cadastro.

### 3.4 Comprador aprovador

É um comprador com permissão extra:

```text
pode_aprovar = true
```

Pode:

- fazer tudo que um comprador comum faz;
- ver fila de processos aguardando aprovação;
- revisar a ficha completa;
- aprovar e assinar;
- reprovar;
- solicitar ajuste ao comprador;
- solicitar correção ao fornecedor, se necessário.

Regra recomendada para MVP:

```text
Quem criou o processo não deve aprovar o próprio processo.
```

Essa regra pode ser configurável no futuro.

### 3.5 Cadastro

Perfil usado pelo responsável por cadastrar o produto no sistema interno da empresa.

Pode:

- ver processos aprovados para cadastro;
- abrir ficha completa;
- marcar como "em cadastro";
- marcar como "cadastrado";
- informar observação de cadastro;
- gerar PDF final;
- baixar PDF final;
- consultar histórico dos processos que chegaram ao cadastro.

Não pode:

- editar dados do fornecedor após aprovação;
- editar dados comerciais após aprovação, salvo permissão especial;
- aprovar processo;
- ver rascunhos de compradores, salvo permissão especial.

### 3.6 Fornecedor externo

Fornecedor não precisa ter conta completa no sistema.

Acessa por link seguro e único.

Pode:

- preencher dados básicos do produto;
- preencher dados logísticos;
- anexar documentos ou imagens, se habilitado;
- salvar rascunho, se permitido;
- enviar ficha ao comprador.

Não pode:

- acessar dashboard interno;
- ver outros processos;
- editar após enviar, exceto se o comprador solicitar correção;
- acessar dados comerciais internos;
- gerar PDF final.

---

## 4. Fluxo do Processo

### 4.1 Fluxo principal

```text
Comprador cria processo
↓
Sistema gera link para fornecedor
↓
Fornecedor preenche sua parte
↓
Fornecedor envia
↓
Comprador responsável recebe de volta
↓
Comprador completa parte comercial
↓
Comprador envia para aprovação
↓
Comprador aprovador revisa e assina
↓
Processo fica aprovado para cadastro
↓
Cadastro marca como em cadastro
↓
Cadastro marca como cadastrado
↓
Sistema gera PDF final
```

### 4.2 Status do processo

Status oficiais:

```text
rascunho
aguardando_fornecedor
enviado_pelo_fornecedor
em_analise_comprador
correcao_solicitada_fornecedor
correcao_solicitada_comprador
aguardando_aprovacao
aprovado_para_cadastro
reprovado
em_cadastro
cadastrado
pdf_gerado
cancelado
```

### 4.3 Descrição dos status

#### rascunho

Processo criado pelo comprador, mas ainda não enviado ao fornecedor.

#### aguardando_fornecedor

Comprador gerou e enviou o link para o fornecedor.

#### enviado_pelo_fornecedor

Fornecedor preencheu e enviou sua parte.

#### em_analise_comprador

Comprador abriu ou está completando os dados comerciais.

#### correcao_solicitada_fornecedor

Comprador ou aprovador encontrou erro nos dados do fornecedor e devolveu o processo.

#### correcao_solicitada_comprador

Aprovador encontrou erro na parte do comprador e devolveu para ajuste.

#### aguardando_aprovacao

Comprador concluiu a parte dele e enviou para aprovação.

#### aprovado_para_cadastro

Processo aprovado e assinado. Está liberado para o setor de cadastro.

#### reprovado

Processo recusado. Deve ter motivo obrigatório.

#### em_cadastro

Setor de cadastro assumiu o processo.

#### cadastrado

Produto foi cadastrado no sistema interno da empresa.

#### pdf_gerado

PDF final foi gerado e salvo.

#### cancelado

Processo encerrado sem conclusão.

### 4.4 Transições permitidas

```text
rascunho -> aguardando_fornecedor
aguardando_fornecedor -> enviado_pelo_fornecedor
enviado_pelo_fornecedor -> em_analise_comprador
em_analise_comprador -> correcao_solicitada_fornecedor
correcao_solicitada_fornecedor -> enviado_pelo_fornecedor
em_analise_comprador -> aguardando_aprovacao
aguardando_aprovacao -> correcao_solicitada_comprador
correcao_solicitada_comprador -> em_analise_comprador
aguardando_aprovacao -> aprovado_para_cadastro
aguardando_aprovacao -> reprovado
aprovado_para_cadastro -> em_cadastro
em_cadastro -> cadastrado
cadastrado -> pdf_gerado
qualquer_status_permitido -> cancelado, se admin
```

---

## 5. Estrutura da Ficha

A ficha deve seguir a organização visual do modelo atual de Cadastro de Produto Prado.

### 5.1 Blocos principais

A ficha possui os seguintes blocos:

1. Cabeçalho
2. Cadastro de produto
3. Informações logísticas
4. Dimensões da caixa
5. Palete
6. Parte obrigatória do comprador
7. Tipo de entrega
8. Substituição
9. Mix de lojas
10. Estrutura mercadológica
11. Dados comerciais
12. Assinaturas e autorizações

---

## 6. Campos do Fornecedor

### 6.1 Dados básicos do produto

Campos:

```text
codigo_barra
descricao_produto
marca
gramagem
usa_balanca
preco_custo
referencia
cnpj
fornecedor_nome
```

### 6.2 Regras dos dados básicos

#### Código de barra

- obrigatório;
- deve aceitar somente números;
- deve permitir EAN-8, EAN-13, DUN-14 ou código interno, conforme regra da empresa;
- deve evitar duplicidade, se houver integração ou base interna no futuro.

#### Descrição do produto

- obrigatório;
- texto livre;
- deve representar a descrição original enviada pelo fornecedor.

#### Marca

- obrigatório;
- texto livre ou lista cadastrada no futuro.

#### Gramagem

- obrigatório quando aplicável;
- exemplo: `500g`, `1kg`, `2L`, `350ml`.

#### Usa balança

- obrigatório;
- valores possíveis:

```text
sim
nao
```

#### Preço de custo

- obrigatório;
- formato monetário;
- deve aceitar casas decimais.

#### Referência

- opcional no MVP;
- texto livre.

#### CNPJ

- obrigatório;
- validar formato de CNPJ;
- futuramente pode buscar cadastro do fornecedor automaticamente.

#### Fornecedor

- obrigatório;
- nome ou razão social.

### 6.3 Código da caixa e display

Campos:

```text
codigo_caixa
quantidade_na_caixa
codigo_display
quantidade_do_display
```

Regras:

- `codigo_caixa` pode ser obrigatório conforme tipo de produto;
- `quantidade_na_caixa` deve ser número inteiro;
- `codigo_display` opcional;
- `quantidade_do_display` obrigatório se `codigo_display` for preenchido.

### 6.4 Informações logísticas

Campos:

```text
altura_cm
largura_cm
comprimento_cm
cubagem_m3
peso_bruto_kg
palete
lastro
```

Regras:

- altura, largura e comprimento devem ser numéricos;
- peso bruto deve ser numérico;
- cubagem pode ser calculada automaticamente:

```text
cubagem_m3 = (altura_cm * largura_cm * comprimento_cm) / 1.000.000
```

- palete e lastro podem ser texto ou número, conforme uso da empresa.

---

## 7. Campos do Comprador

### 7.1 Descrição Prado

Campo:

```text
descricao_prado
```

Regra:

- obrigatório;
- representa a descrição padronizada que será usada internamente.

### 7.2 Tipo de entrega

Campos booleanos:

```text
entrega_cd
entrega_loja
cross_dock
```

Regra:

- pelo menos uma opção deve ser selecionada;
- no MVP, permitir múltipla seleção somente se a empresa realmente utilizar;
- caso contrário, transformar em campo único:

```text
tipo_entrega = entrega_cd | entrega_loja | cross_dock
```

### 7.3 Substituição

Campo:

```text
substituicao
```

Valores:

```text
sim
nao
```

Regra:

- obrigatório.

### 7.4 Mix de lojas

Lojas iniciais:

```text
loja_1_biguacu
loja_2_governador_celso_ramos
loja_3_canasvieiras
loja_4_sao_jose
loja_5_palhoca
loja_7_estreito
loja_8_porto_belo
loja_9_saco_dos_limoes
cd_99_centro_de_distribuicao
```

Regra:

- comprador deve selecionar em quais lojas o produto será incluído;
- pelo menos uma loja ou CD deve ser selecionado;
- no futuro, lojas devem vir de tabela dinâmica.

### 7.5 Estrutura mercadológica

Campos:

```text
departamento
categoria
subcategoria
segmento
subsegmento
```

Regras:

- departamento obrigatório;
- categoria obrigatória;
- subcategoria recomendada;
- segmento e subsegmento conforme regra interna;
- no MVP podem ser texto livre;
- em versão futura devem ser cadastros relacionados.

### 7.6 Dados comerciais

Campos:

```text
margem_lucro
preco_prado
preco_pradao
codigo_item_similar
```

Regras:

- margem de lucro obrigatória;
- preço Prado obrigatório;
- preço Pradão opcional ou obrigatório conforme regra da empresa;
- código de item similar opcional;
- valores monetários devem ser formatados em BRL;
- margem deve aceitar percentual.

---

## 8. Aprovação e Assinatura

### 8.1 Quem pode aprovar

Apenas usuários internos com:

```text
pode_aprovar = true
```

### 8.2 Tela de aprovação

O aprovador deve ver:

- dados do fornecedor;
- dados logísticos;
- dados do comprador;
- mix de lojas;
- estrutura mercadológica;
- dados comerciais;
- histórico do processo;
- anexos, se houver.

Ações disponíveis:

```text
aprovar_e_assinar
reprovar
solicitar_ajuste_ao_comprador
solicitar_correcao_ao_fornecedor
```

### 8.3 Assinatura no MVP

No MVP, a assinatura pode ser eletrônica simples.

Ao aprovar, gravar:

```text
ficha_id
usuario_id
nome_assinante
email_assinante
cargo_ou_perfil
data_hora
ip
user_agent
status = aprovado
```

### 8.4 Assinatura futura

Em versão futura, o sistema pode permitir:

- assinatura desenhada na tela;
- upload de imagem de assinatura;
- assinatura com certificado;
- dupla aprovação;
- aprovação por diretoria e comprador aprovador.

### 8.5 Autoaprovação

Regra recomendada:

```text
comprador_responsavel_id não pode ser igual a aprovador_id
```

Ou seja, quem criou/conduziu o processo não aprova o próprio processo.

Essa regra deve ser configurável futuramente.

---

## 9. Etapa de Cadastro

### 9.1 Fila de cadastro

O usuário de cadastro deve ver uma fila com processos nos status:

```text
aprovado_para_cadastro
em_cadastro
cadastrado
pdf_gerado
```

### 9.2 Ações do cadastro

Ações:

```text
assumir_cadastro
marcar_como_em_cadastro
marcar_como_cadastrado
gerar_pdf_final
baixar_pdf
```

### 9.3 Campos da etapa de cadastro

Campos:

```text
cadastro_responsavel_id
codigo_interno_produto
observacao_cadastro
cadastrado_at
pdf_gerado_at
pdf_url
```

### 9.4 Código interno do produto

No MVP, o código interno pode ser opcional.

Se a empresa quiser, pode ser obrigatório antes de gerar PDF final.

Regra opcional:

```text
Não gerar PDF final sem codigo_interno_produto
```

---

## 10. PDF Final

### 10.1 Objetivo do PDF

Gerar o documento oficial da ficha de cadastro de produto após a conclusão do fluxo.

O PDF deve ser parecido com a ficha atual, contendo:

- logo Prado;
- título "Cadastro de Produto";
- dados básicos;
- dados logísticos;
- dimensões da caixa;
- palete;
- parte do comprador;
- mix de lojas;
- estrutura mercadológica;
- dados comerciais;
- assinatura/autorização;
- data de aprovação;
- responsável pelo cadastro;
- data de cadastro;
- número do processo.

### 10.2 Prévia do PDF

Antes do cadastro final, o sistema pode permitir visualizar uma prévia.

Essa prévia deve conter marca d'água:

```text
PRÉVIA - NÃO CADASTRADO
```

### 10.3 PDF final

O PDF final deve ser gerado somente quando:

```text
status = cadastrado
```

Depois de gerar:

```text
status = pdf_gerado
```

### 10.4 Nome do arquivo

Formato sugerido:

```text
cadastro-produto-{numero_processo}-{codigo_barra}.pdf
```

Exemplo:

```text
cadastro-produto-000123-7891234567890.pdf
```

### 10.5 Armazenamento

PDFs devem ser salvos no storage.

Caminho sugerido:

```text
pdfs/cadastros/{ano}/{mes}/{numero_processo}.pdf
```

### 10.6 Rodapé do PDF

Rodapé sugerido:

```text
Ficha gerada automaticamente pelo Sistema de Cadastro de Produtos Prado.
Processo nº {numero_processo}.
Aprovado por {nome_aprovador} em {data_aprovacao}.
Cadastrado por {nome_cadastro} em {data_cadastro}.
```

---

## 11. Anexos

### 11.1 Tipos de anexos

O sistema pode aceitar:

- imagem do produto;
- ficha técnica;
- tabela nutricional;
- catálogo;
- documento complementar;
- imagem da caixa;
- imagem do display.

### 11.2 Regras

- anexos são opcionais no MVP;
- anexos devem ficar vinculados ao processo;
- fornecedor pode anexar arquivos durante sua etapa;
- comprador pode anexar arquivos durante análise;
- cadastro pode visualizar anexos;
- PDF final não precisa incorporar os anexos no MVP.

---

## 12. Telas do Sistema

### 12.1 Login

Deve permitir acesso de usuários internos.

Campos:

```text
email
senha
```

### 12.2 Dashboard

Resumo por perfil.

Para comprador:

```text
Meus processos em rascunho
Aguardando fornecedor
Recebidos do fornecedor
Em análise
Aguardando aprovação
Aprovados para cadastro
Finalizados
```

Para comprador aprovador:

```text
Meus processos
Aguardando minha aprovação
Aprovados por mim
Reprovados por mim
```

Para cadastro:

```text
Aprovados para cadastro
Em cadastro
Cadastrados hoje
PDFs gerados
```

Para admin:

```text
Total de processos
Processos por comprador
Processos por status
Tempo médio por etapa
Pendências por usuário
```

### 12.3 Meus processos

Listagem principal do comprador.

Colunas:

```text
numero_processo
descricao_produto
fornecedor
status
criado_em
atualizado_em
acao_pendente
```

Filtros:

```text
status
fornecedor
data
comprador
codigo_barra
```

### 12.4 Criar processo

Campos iniciais:

```text
fornecedor
cnpj
email_fornecedor
comprador_responsavel
observacao_interna
```

Ações:

```text
salvar_rascunho
gerar_link_fornecedor
enviar_para_fornecedor
```

### 12.5 Formulário do fornecedor

Tela externa acessada por token.

Seções:

```text
Dados do produto
Informações logísticas
Dimensões da caixa
Palete
Anexos
Revisão
```

Ações:

```text
salvar_rascunho
enviar_para_comprador
```

### 12.6 Tela do comprador

Seções:

```text
Resumo do processo
Dados enviados pelo fornecedor
Dados comerciais
Tipo de entrega
Substituição
Mix de lojas
Estrutura mercadológica
Anexos
Histórico
```

Ações:

```text
salvar
solicitar_correcao_fornecedor
enviar_para_aprovacao
cancelar_processo
```

### 12.7 Tela de aprovação

Seções:

```text
Ficha completa
Histórico
Anexos
Resumo de pendências
Assinatura
```

Ações:

```text
aprovar_e_assinar
reprovar
solicitar_ajuste
```

### 12.8 Fila de cadastro

Colunas:

```text
numero_processo
descricao_prado
codigo_barra
fornecedor
comprador_responsavel
aprovado_em
status
```

Ações:

```text
abrir
assumir
marcar_cadastrado
gerar_pdf
baixar_pdf
```

### 12.9 Visualização do processo

Tela única de consulta com todas as informações.

Deve mostrar:

- status atual;
- responsável atual;
- próximas ações;
- dados da ficha;
- histórico;
- PDF, quando existir;
- anexos.

---

## 13. Banco de Dados

### 13.1 Tabela `profiles`

Usuários internos.

```sql
id uuid primary key
nome text not null
email text not null unique
perfil text not null
pode_aprovar boolean default false
pode_cadastrar boolean default false
pode_gerenciar_usuarios boolean default false
pode_ver_todos_processos boolean default false
ativo boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

Perfis:

```text
admin
comprador
cadastro
```

### 13.2 Tabela `fornecedores`

```sql
id uuid primary key
razao_social text not null
nome_fantasia text
cnpj text
email text
telefone text
contato_nome text
ativo boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

### 13.3 Tabela `processos_cadastro`

Tabela principal.

```sql
id uuid primary key
numero_processo bigint generated always as identity
status text not null

fornecedor_id uuid references fornecedores(id)
comprador_responsavel_id uuid references profiles(id)
aprovador_id uuid references profiles(id)
cadastro_responsavel_id uuid references profiles(id)

observacao_interna text
motivo_reprovacao text
motivo_correcao text

enviado_fornecedor_at timestamptz
respondido_fornecedor_at timestamptz
enviado_aprovacao_at timestamptz
aprovado_at timestamptz
em_cadastro_at timestamptz
cadastrado_at timestamptz
pdf_gerado_at timestamptz

codigo_interno_produto text
pdf_url text

created_at timestamptz default now()
updated_at timestamptz default now()
created_by uuid references profiles(id)
updated_by uuid references profiles(id)
```

### 13.4 Tabela `dados_fornecedor_produto`

```sql
id uuid primary key
processo_id uuid references processos_cadastro(id) on delete cascade

codigo_barra text
descricao_produto text
marca text
gramagem text
usa_balanca boolean
preco_custo numeric(12,2)
referencia text
cnpj text
fornecedor_nome text

codigo_caixa text
quantidade_na_caixa integer
codigo_display text
quantidade_do_display integer

altura_cm numeric(10,2)
largura_cm numeric(10,2)
comprimento_cm numeric(10,2)
cubagem_m3 numeric(12,6)
peso_bruto_kg numeric(10,3)
palete text
lastro text

created_at timestamptz default now()
updated_at timestamptz default now()
```

### 13.5 Tabela `dados_comprador_produto`

```sql
id uuid primary key
processo_id uuid references processos_cadastro(id) on delete cascade

descricao_prado text

entrega_cd boolean default false
entrega_loja boolean default false
cross_dock boolean default false

substituicao boolean

departamento text
categoria text
subcategoria text
segmento text
subsegmento text

margem_lucro numeric(8,2)
preco_prado numeric(12,2)
preco_pradao numeric(12,2)
codigo_item_similar text

created_at timestamptz default now()
updated_at timestamptz default now()
```

### 13.6 Tabela `processo_mix_lojas`

Modelo recomendado para mix dinâmico.

```sql
id uuid primary key
processo_id uuid references processos_cadastro(id) on delete cascade
loja_codigo text not null
loja_nome text not null
selecionado boolean default true
created_at timestamptz default now()
```

Lojas iniciais:

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

### 13.7 Tabela `assinaturas`

```sql
id uuid primary key
processo_id uuid references processos_cadastro(id) on delete cascade
usuario_id uuid references profiles(id)

tipo text not null
status text not null
nome_assinante text not null
email_assinante text
cargo_ou_perfil text
observacao text

ip text
user_agent text
assinatura_imagem_url text

created_at timestamptz default now()
```

Tipos:

```text
aprovacao
cadastro
```

Status:

```text
aprovado
reprovado
correcao_solicitada
```

### 13.8 Tabela `historico_processos`

```sql
id uuid primary key
processo_id uuid references processos_cadastro(id) on delete cascade
usuario_id uuid references profiles(id)

status_anterior text
status_novo text
acao text not null
observacao text

dados_anteriores jsonb
dados_novos jsonb

created_at timestamptz default now()
```

### 13.9 Tabela `anexos`

```sql
id uuid primary key
processo_id uuid references processos_cadastro(id) on delete cascade
uploaded_by uuid references profiles(id)

nome_arquivo text not null
tipo_arquivo text
mime_type text
tamanho_bytes bigint
storage_path text not null
url text

created_at timestamptz default now()
```

### 13.10 Tabela `links_fornecedor`

```sql
id uuid primary key
processo_id uuid references processos_cadastro(id) on delete cascade

token_hash text not null
email_destino text
expira_em timestamptz
usado_em timestamptz
ativo boolean default true

created_at timestamptz default now()
```

Regra:

- nunca salvar token puro no banco;
- salvar apenas hash do token;
- link deve poder expirar;
- link pode ser invalidado quando processo for enviado.

---

## 14. Segurança e Permissões no Supabase

### 14.1 Regras gerais

Usar Supabase Auth para usuários internos.

Fornecedor externo acessa por token de link, não por conta Auth no MVP.

### 14.2 RLS - processos

Regras desejadas:

- admin vê todos;
- comprador vê processos onde `comprador_responsavel_id = auth.uid()`;
- comprador aprovador vê seus processos e processos com status `aguardando_aprovacao`;
- cadastro vê processos com status `aprovado_para_cadastro`, `em_cadastro`, `cadastrado`, `pdf_gerado`;
- fornecedor externo acessa apenas por endpoint seguro/token, não diretamente pela tabela.

### 14.3 RLS - dados do fornecedor

- comprador responsável pode ler;
- aprovador pode ler quando o processo está em aprovação;
- cadastro pode ler quando processo aprovado;
- admin pode ler;
- fornecedor pode inserir/editar apenas enquanto link está ativo e processo permite edição.

### 14.4 RLS - dados do comprador

- comprador responsável pode inserir/editar enquanto processo está em análise;
- aprovador pode ler;
- cadastro pode ler;
- admin pode ler/editar em exceção.

### 14.5 RLS - assinaturas

- somente usuário com `pode_aprovar` pode inserir assinatura de aprovação;
- cadastro pode inserir assinatura/registro de cadastro se necessário;
- todos os envolvidos internos podem ler assinaturas do processo;
- fornecedor não vê assinaturas internas no MVP.

---

## 15. Validações

### 15.1 Validações obrigatórias do fornecedor

Para enviar ao comprador, exigir:

```text
codigo_barra
descricao_produto
marca
gramagem
usa_balanca
preco_custo
cnpj
fornecedor_nome
quantidade_na_caixa, se codigo_caixa preenchido
altura_cm
largura_cm
comprimento_cm
peso_bruto_kg
```

### 15.2 Validações obrigatórias do comprador

Para enviar à aprovação, exigir:

```text
descricao_prado
tipo_entrega
substituicao
pelo menos uma loja/CD no mix
departamento
categoria
margem_lucro
preco_prado
```

### 15.3 Validações obrigatórias do aprovador

Para aprovar, exigir:

```text
processo em status aguardando_aprovacao
usuário com pode_aprovar = true
campos obrigatórios do fornecedor preenchidos
campos obrigatórios do comprador preenchidos
assinatura registrada
```

### 15.4 Validações obrigatórias do cadastro

Para gerar PDF final, exigir:

```text
status = cadastrado
aprovador_id preenchido
aprovado_at preenchido
cadastro_responsavel_id preenchido
cadastrado_at preenchido
```

Opcional:

```text
codigo_interno_produto preenchido
```

---

## 16. Notificações

### 16.1 MVP

No MVP, as notificações podem ser internas no dashboard.

Exemplos:

- processo aguardando fornecedor;
- fornecedor enviou ficha;
- comprador precisa completar;
- processo aguardando aprovação;
- processo aprovado para cadastro;
- correção solicitada.

### 16.2 Futuro

Adicionar:

- e-mail para fornecedor;
- e-mail para comprador;
- notificação por WhatsApp;
- lembrete automático de processo parado;
- alerta de vencimento do link do fornecedor.

---

## 17. Relatórios

### 17.1 Relatórios do MVP

O MVP pode ter relatórios simples:

- quantidade de processos por status;
- quantidade de processos por comprador;
- processos aguardando fornecedor;
- processos aguardando aprovação;
- processos aprovados para cadastro;
- processos finalizados no mês.

### 17.2 Relatórios futuros

- tempo médio por etapa;
- ranking de fornecedores com mais pendências;
- compradores com mais processos;
- produtos reprovados;
- gargalos do processo;
- histórico por loja;
- histórico por departamento/categoria.

---

## 18. Requisitos Técnicos

### 18.1 Stack recomendada

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
Supabase Auth
Supabase Database
Supabase Storage
React Hook Form
Zod
TanStack Query
date-fns
PDF via HTML/CSS ou React PDF
```

### 18.2 Padrão visual

O sistema deve ter visual limpo, moderno e administrativo.

Diretrizes:

- interface simples;
- cards de status;
- tabelas claras;
- botões bem definidos por ação;
- cores por status;
- evitar redesign desnecessário;
- priorizar usabilidade.

### 18.3 Geração de PDF

Recomendação para MVP:

```text
HTML/CSS -> PDF
```

Motivo:

- mais fácil reproduzir layout da ficha;
- mais flexível para campos e seções;
- fácil criar prévia;
- facilita ajustes visuais.

Alternativas futuras:

```text
React PDF
PDF template preenchível
Geração server-side com Puppeteer
```

### 18.4 Storage

Usar Supabase Storage para:

```text
anexos/
pdfs/
assinaturas/
```

---

## 19. Componentes Principais do Frontend

### 19.1 Componentes de layout

```text
AppLayout
Sidebar
Topbar
StatusBadge
PageHeader
ConfirmDialog
EmptyState
LoadingState
```

### 19.2 Componentes de processo

```text
ProcessoTable
ProcessoCard
ProcessoStatusTimeline
ProcessoHistorico
ProcessoActions
```

### 19.3 Componentes de formulário

```text
FornecedorForm
CompradorForm
MixLojasSelector
TipoEntregaSelector
EstruturaMercadologicaForm
DadosComerciaisForm
AnexosUploader
```

### 19.4 Componentes de aprovação

```text
ApprovalReview
ApprovalActions
SignatureBox
RejectionDialog
CorrectionDialog
```

### 19.5 Componentes de PDF

```text
PdfPreview
PdfDownloadButton
PdfFichaCadastroProduto
```

---

## 20. Páginas / Rotas

Rotas sugeridas:

```text
/login

/app/dashboard
/app/processos
/app/processos/novo
/app/processos/:id
/app/processos/:id/comprador
/app/processos/:id/aprovacao
/app/cadastro
/app/cadastro/:id
/app/relatorios
/app/usuarios
/app/configuracoes

/fornecedor/:token
```

### 20.1 Rotas por perfil

#### Comprador

```text
/app/dashboard
/app/processos
/app/processos/novo
/app/processos/:id
```

#### Comprador aprovador

```text
/app/dashboard
/app/processos
/app/processos/:id
/app/processos/:id/aprovacao
```

#### Cadastro

```text
/app/dashboard
/app/cadastro
/app/cadastro/:id
```

#### Admin

```text
todas as rotas internas
```

#### Fornecedor

```text
/fornecedor/:token
```

---

## 21. Auditoria

### 21.1 Eventos auditáveis

Registrar:

- login interno, se necessário;
- criação de processo;
- alteração de status;
- alteração em dados críticos;
- envio de link;
- acesso do fornecedor;
- envio do fornecedor;
- aprovação;
- reprovação;
- correção solicitada;
- cadastro concluído;
- PDF gerado.

### 21.2 Dados mínimos do histórico

Cada registro deve conter:

```text
processo_id
usuario_id
acao
status_anterior
status_novo
observacao
data_hora
```

Quando aplicável:

```text
dados_anteriores
dados_novos
ip
user_agent
```

---

## 22. Critérios de Aceite do MVP

### 22.1 Processo por comprador

- comprador consegue criar processo;
- processo fica vinculado ao comprador responsável;
- comprador vê seus próprios processos;
- outro comprador comum não vê processos que não são dele.

### 22.2 Link do fornecedor

- sistema gera link único;
- fornecedor acessa sem login interno;
- fornecedor preenche sua parte;
- fornecedor envia;
- processo muda para `enviado_pelo_fornecedor`.

### 22.3 Parte do comprador

- comprador responsável abre processo enviado;
- preenche descrição Prado;
- seleciona tipo de entrega;
- informa substituição;
- seleciona mix de lojas;
- preenche estrutura mercadológica;
- informa preços e margem;
- envia para aprovação.

### 22.4 Aprovação

- usuário com `pode_aprovar` vê processos aguardando aprovação;
- consegue aprovar e assinar;
- consegue reprovar com motivo;
- consegue solicitar ajuste;
- processo aprovado vai para `aprovado_para_cadastro`.

### 22.5 Cadastro

- usuário de cadastro vê processos aprovados;
- marca processo como em cadastro;
- marca processo como cadastrado;
- gera PDF final;
- PDF fica disponível para download.

### 22.6 PDF

- PDF contém os principais campos da ficha;
- PDF contém dados do fornecedor;
- PDF contém dados do comprador;
- PDF contém assinatura/aprovação;
- PDF contém responsável pelo cadastro;
- PDF contém data de geração;
- PDF só é final após cadastro.

### 22.7 Histórico

- toda mudança de status gera histórico;
- histórico aparece na tela do processo;
- histórico mostra usuário, ação, data e observação.

---

## 23. Fora do Escopo do MVP

Não implementar no MVP, salvo pedido explícito:

- integração com ERP;
- cadastro automático do produto no ERP;
- assinatura com certificado digital;
- workflow com múltiplos aprovadores;
- WhatsApp automático;
- reconhecimento automático de campos do PDF;
- app mobile nativo;
- importação em massa via Excel;
- OCR de ficha preenchida;
- BI avançado;
- controle fiscal completo;
- cadastro nutricional detalhado.

---

## 24. Roadmap de Sprints

### Sprint 1 - Base do sistema

Objetivo: criar a estrutura inicial.

Entregas:

- projeto React + TypeScript + Vite;
- Tailwind + shadcn/ui;
- Supabase configurado;
- autenticação;
- perfis internos;
- layout principal;
- dashboard básico;
- tabela `profiles`;
- tabela `fornecedores`;
- tabela `processos_cadastro`;
- status iniciais;
- tela de listagem de processos;
- tela de criação de processo.

### Sprint 2 - Fluxo do fornecedor

Objetivo: permitir que o comprador envie uma ficha para o fornecedor.

Entregas:

- geração de link único;
- rota pública `/fornecedor/:token`;
- formulário do fornecedor;
- validações dos campos do fornecedor;
- salvar dados do fornecedor;
- enviar para comprador;
- histórico de envio;
- status `aguardando_fornecedor` e `enviado_pelo_fornecedor`.

### Sprint 3 - Área do comprador

Objetivo: comprador completar sua parte.

Entregas:

- tela "Meus processos";
- formulário do comprador;
- seleção de tipo de entrega;
- seleção de substituição;
- seleção de mix de lojas;
- campos de estrutura mercadológica;
- campos comerciais;
- validação antes de enviar para aprovação;
- status `em_analise_comprador` e `aguardando_aprovacao`.

### Sprint 4 - Aprovação e assinatura

Objetivo: permitir aprovação por comprador aprovador.

Entregas:

- permissão `pode_aprovar`;
- fila de aprovação;
- tela de revisão;
- aprovar e assinar;
- reprovar com motivo;
- solicitar ajuste;
- histórico de aprovação;
- status `aprovado_para_cadastro`, `reprovado` e `correcao_solicitada_comprador`.

### Sprint 5 - Cadastro e PDF

Objetivo: concluir processo e gerar PDF final.

Entregas:

- fila do cadastro;
- assumir processo;
- marcar como em cadastro;
- marcar como cadastrado;
- geração de PDF;
- armazenamento do PDF;
- download do PDF;
- status `em_cadastro`, `cadastrado` e `pdf_gerado`.

### Sprint 6 - Melhorias e relatórios

Objetivo: melhorar operação e controle.

Entregas:

- filtros avançados;
- dashboard por perfil;
- relatórios simples;
- busca por código de barra;
- busca por fornecedor;
- anexos;
- melhorias de PDF;
- ajustes visuais;
- refinamento de permissões.

---

## 25. Decisões Pendentes

Antes ou durante a implementação, decidir:

1. O comprador aprovador pode aprovar o próprio processo?
2. O código interno do produto será obrigatório para gerar PDF?
3. O fornecedor poderá salvar rascunho?
4. O link do fornecedor terá expiração? Se sim, quantos dias?
5. O preço Pradão é obrigatório?
6. O código da caixa é obrigatório para todos os produtos?
7. O mix aceita múltiplas lojas sempre?
8. O PDF precisa ser idêntico ao modelo atual ou apenas visualmente parecido?
9. O sistema terá upload de imagem do produto no MVP?
10. O fornecedor receberá link por e-mail pelo sistema ou o comprador copiará o link manualmente?

---

## 26. Glossário

### Processo

Registro principal que representa a ficha de cadastro de um produto.

### Comprador responsável

Usuário interno dono do processo.

### Comprador aprovador

Comprador com permissão extra para aprovar e assinar.

### Fornecedor externo

Pessoa ou empresa que preenche a primeira parte da ficha por link público seguro.

### Cadastro

Usuário ou setor que recebe processos aprovados e cadastra o produto no sistema interno.

### PDF final

Documento oficial gerado após fornecedor, comprador, aprovador e cadastro concluírem suas etapas.

### Prévia

PDF ou visualização antes da conclusão, com marca d'água de que ainda não é documento final.

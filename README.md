# Sistema de Cadastro de Produtos Prado

Sistema web para controlar o processo de cadastro de novos produtos da rede Prado.

## Stack

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Formulários**: React Hook Form + Zod
- **Consultas**: TanStack Query
- **Ícones**: Lucide React
- **Datas**: date-fns

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais do Supabase:

```bash
cp .env.example .env
```

Edite o `.env` com:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Configurar o banco de dados

Execute os SQLs do arquivo `docs/sprints/sprint1.md` (seção 8) no Supabase para criar as tabelas iniciais:

- `profiles`
- `fornecedores`
- `processos_cadastro`
- `historico_processos`

### 4. Criar usuário de teste

No Supabase, vá em **Authentication > Users** e crie um usuário de teste.

Depois, insira um registro na tabela `profiles` com:
- `id`: o UUID do usuário criado
- `nome`: nome do usuário
- `email`: email do usuário
- `perfil`: 'comprador', 'admin' ou 'cadastro'

### 5. Iniciar o projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── components/
│   └── layout/          # Layout principal (Sidebar, Topbar, AppLayout)
├── contexts/           # Contextos React (AuthContext)
├── hooks/              # Custom hooks
├── lib/                # Utilitários (Supabase, utils)
├── pages/              # Páginas da aplicação
├── services/           # Serviços de comunicação com o Supabase
├── types/              # Tipos TypeScript
└── validations/        # Schemas Zod para validação
```

## Funcionalidades

- ✅ Login com autenticação Supabase
- ✅ Dashboard com contadores por status
- ✅ Listagem de processos
- ✅ Criação de novos processos
- ✅ Visualização de detalhes do processo
- ✅ Alteração de status (rascunho → aguardando_fornecedor → cancelado)
- ✅ Histórico de alterações
- ✅ Permissões por perfil (comprador, admin, cadastro)

## Próximos Passos (Sprint 2+)

- Formulário do fornecedor externo
- Link único para fornecedor
- Área do comprador para completar dados
- Aprovação e assinatura
- Geração de PDF
- Fila de cadastro

## Scripts Disponíveis

```bash
npm run dev      # Iniciar desenvolvimento
npm run build    # Build de produção
npm run preview  # Visualizar build
npm run lint     # Verificar lint
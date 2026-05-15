# Configuração do Vercel para Projeto Cadastro

## Causa da Tela Branca

A tela branca ocorre porque as variáveis de ambiente do Supabase não estão configuradas no Vercel. Sem elas, o app não consegue conectar ao banco de dados.

---

## Passo 1: Obter Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Abra seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** (ex: `https://xxxx.supabase.co`)
   - **anon public** key (começa com `eyJ...`)

---

## Passo 2: Configurar no Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Clique em **Settings** (aba superior)
4. No menu lateral, clique em **Environment Variables**
5. Adicione as variáveis:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` |

6. Clique **Save**

---

## Passo 3: Rebuild no Vercel

1. Vá em **Deployments** (menu lateral)
2. Encontre o deployment mais recente
3. Clique nos **3 pontos** (...) à direita
4. Selecione **Redeploy**
5. Aguarde o rebuild completar

---

## Passo 4: Configuração Local (Opcional)

Na raiz do projeto, crie um arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

> Nota: O arquivo `.env.local` não deve ser commitado no Git (já está no .gitignore)

---

## Verificação

Após o deploy, abra o console do navegador (F12) e verifique se há erros. Se aparecer:
```
Supabase credentials not configured...
```

Significa que as variáveis não foram configuradas corretamente.

---

## Estrutura de Arquivos de Ambiente

```
.env                  # Padrão (não usar para valores sensíveis)
.env.local           # Para desenvolvimento local (não commitado)
.env.production      # Para produção
```

No Vercel, as Environment Variables substituem esses arquivos.
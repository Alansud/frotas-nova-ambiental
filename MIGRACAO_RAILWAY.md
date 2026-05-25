# Migração para Railway.app - Guia Passo a Passo

## 1. Criar conta no Railway

Acesse: https://railway.app

- Clique em "Get Started"
- Crie conta com GitHub (mais fácil)
- Confirme seu email

## 2. Criar Projeto

No dashboard do Railway:
1. Clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Selecione seu repositório: `Alansud/frotas-nova-ambiental`

## 3. Adicionar PostgreSQL

No projeto:
1. Clique em **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Espere criar (status: "Available")
3. Clique no banco criado
4. Vá na aba **"Connect"**
5. Copie a **"Database URL"** (começa com `postgresql://...`)

## 4. Configurar Variáveis de Ambiente

No projeto, clique no serviço do app:
1. Vá na aba **"Variables"**
2. Adicione:
   - `DATABASE_URL` = (URL do PostgreSQL que você copiou)
   - `AUTH_SECRET` = `NovaAmbiental2024SecretKey`
   - `ADMIN_EMAIL` = `admin@novaambiental.com.br`
   - `ADMIN_PASSWORD` = `Nova@2024`
   - `AUTH_TRUST_HOST` = `true`

## 5. Configurar Build

No serviço do app:
1. Vá na aba **"Settings"**
2. Configure:
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command:** `npm start`

## 6. Deploy

O Railway faz deploy automático quando você faz push no GitHub!

## 7. Obter URL

Quando o deploy terminar, o Railway gera uma URL tipo:
`https://frotas-nova-ambiental-production.up.railway.app`

## 8. Atualizar AUTH_URL

Adicione a variável:
- `AUTH_URL` = `https://frotas-nova-ambiental-production.up.railway.app`

---

## Migração de Dados (do Render para Railway)

### Exportar dados do Render:
1. No Render, vá no PostgreSQL
2. Clique em "Connect"
3. Use o comando `pg_dump` para exportar

### Importar no Railway:
1. No Railway, vá no PostgreSQL
2. Use o comando `psql` para importar

---

## Vantagens do Railway vs Render

| Recurso | Railway | Render |
|---------|---------|--------|
| Memória RAM | 1GB | 512MB |
| CPU | Melhor | Limitada |
| Velocidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| PostgreSQL | ✅ Incluído | ✅ Incluído |
| Deploy | Automático | Automático |
| Preço | Gratuito | Gratuito |

---

## Próximos Passos

1. Crie a conta no Railway
2. Me passe a URL do projeto
3. Eu configuro o deploy automaticamente
4. Migramos os dados
5. Pronto!

**Me avise quando criar a conta!** 🚀

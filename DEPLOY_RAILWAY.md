# Deploy no Railway - Instruções

## Pré-requisitos
- Conta no Railway (gratuita): https://railway.app
- GitHub, Google ou email para login

## Passo a passo

### 1. Abra o PowerShell como Administrador
Clique direito no ícone do PowerShell → "Executar como Administrador"

### 2. Navegue até a pasta do projeto
```powershell
cd C:\Users\lenovo\Projects\frotas-nova-ambiental
```

### 3. Instale o Railway CLI (se ainda não tiver)
```powershell
npm install -g @railway/cli
```

### 4. Faça login no Railway
```powershell
railway login
```
Isso vai abrir o navegador. Faça login com sua conta.

### 5. Inicialize o projeto
```powershell
railway init
```
Escolha: **"Create new project"**
Nome: `frotas-nova-ambiental`

### 6. Adicione um banco de dados SQLite
No dashboard do Railway (no navegador):
- Clique em "New" → "Database" → "Add PostgreSQL" (ou SQLite se disponível)
- Ou use "Add Volume" para persistir o SQLite

### 7. Configure as variáveis de ambiente
No dashboard do Railway:
- Vá em "Variables"
- Adicione:
  - `DATABASE_URL` = `file:./prisma/dev.db` (ou a URL do PostgreSQL)
  - `AUTH_SECRET` = (gerar com: `openssl rand -base64 32`)
  - `AUTH_URL` = (deixe em branco, será preenchido automaticamente)
  - `ADMIN_EMAIL` = `admin@novaambiental.com.br`
  - `ADMIN_PASSWORD` = `Nova@2024`

### 8. Faça o deploy
```powershell
railway up
```

### 9. Obtenha o URL
```powershell
railway domain
```

O Railway vai gerar um URL tipo:
`https://frotas-nova-ambiental-production.up.railway.app`

### 10. Configure o AUTH_URL
No dashboard do Railway, atualize a variável:
- `AUTH_URL` = `https://frotas-nova-ambiental-production.up.railway.app`

### 11. Rode as migrations
```powershell
railway run npx prisma migrate deploy
```

### 12. Crie o admin
```powershell
railway run npx prisma db seed
```

## Pronto!
Acesse o app pelo celular em qualquer lugar usando o URL do Railway.

## Para atualizar depois
Sempre que fizer alterações locais:
```powershell
cd C:\Users\lenovo\Projects\frotas-nova-ambiental
git add .
git commit -m "descrição da mudança"
railway up
```

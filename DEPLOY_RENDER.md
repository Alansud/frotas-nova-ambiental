# Deploy no Render.com - Instruções Simples

## Passo 1: Crie conta no Render
- Acesse: https://render.com
- Clique em "Get Started for Free"
- Faça login com GitHub, Google ou email

## Passo 2: Crie um novo Web Service
1. No dashboard, clique em **"New +"** → **"Web Service"**
2. Escolha **"Build and deploy from a Git repository"**

## Passo 3: Conecte seu código
Como seu projeto está local, precisamos subir para o GitHub primeiro:

### No PowerShell (como Administrador):
```powershell
cd C:\Users\lenovo\Projects\frotas-nova-ambiental

# Inicializa git (se ainda não tiver)
git init

# Adiciona todos os arquivos
git add .

# Cria commit
git commit -m "App de frotas Nova Ambiental"
```

### Crie um repositório no GitHub:
1. Acesse: https://github.com/new
2. Nome: `frotas-nova-ambiental`
3. Deixe público
4. NÃO marque "Add a README"
5. Clique **"Create repository"**

### Volte no PowerShell e envie o código:
```powershell
# Substitua SEU-USUARIO pelo seu nome de usuário do GitHub
git remote add origin https://github.com/SEU-USUARIO/frotas-nova-ambiental.git
git branch -M main
git push -u origin main
```

## Passo 4: No Render.com
1. Volte no Render e clique em **"Connect"** no seu repositório
2. Configure:
   - **Name**: `frotas-nova-ambiental`
   - **Region**: Ohio (US East) ou São Paulo (South America)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm start`

3. Clique em **"Advanced"** e adicione as variáveis de ambiente:
   - `DATABASE_URL` = `file:./prisma/dev.db`
   - `AUTH_SECRET` = (qualquer texto longo, ex: `minha-chave-secreta-123456`)
   - `ADMIN_EMAIL` = `admin@novaambiental.com.br`
   - `ADMIN_PASSWORD` = `Nova@2024`
   - `AUTH_TRUST_HOST` = `true`

4. Clique **"Create Web Service"**

## Passo 5: Aguarde o deploy
O Render vai mostrar o log do build. Quando aparecer "Your service is live", acesse o URL!

## URL final
Vai ser algo como:
`https://frotas-nova-ambiental.onrender.com`

Pronto! Me mande o URL quando terminar!

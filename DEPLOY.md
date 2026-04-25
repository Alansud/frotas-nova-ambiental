# Deploy — Nova Ambiental Frotas no Railway.app

## Por que Railway?
O app usa SQLite com `better-sqlite3` (addon nativo C++). Railway roda contêineres Linux com
disco persistente via Volumes — zero mudança no banco de dados, sem migração para outro provider.

---

## Passo 1 — Login no Railway CLI

Abra um **novo terminal** (PowerShell ou CMD) e execute:

```powershell
# Adicionar Node.js ao PATH se necessário
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# Fazer login (abre o navegador)
C:\Users\lenovo\AppData\Roaming\npm\railway.cmd login
```

Após autenticar no navegador, o terminal mostrará: `Logged in as <seu email>`.

---

## Passo 2 — Criar projeto e fazer deploy

No mesmo terminal (dentro da pasta do projeto):

```powershell
Set-Location "C:\Users\lenovo\Projects\frotas-nova-ambiental"

# Criar novo projeto Railway
C:\Users\lenovo\AppData\Roaming\npm\railway.cmd init

# Deploy inicial (envia o código)
C:\Users\lenovo\AppData\Roaming\npm\railway.cmd up --detach
```

O Railway vai:
1. Detectar Next.js automaticamente (nixpacks)
2. Rodar `npm run build` → `prisma generate && next build`
3. Iniciar com `npm run start:prod` → `prisma migrate deploy && npm run seed && npm start`

---

## Passo 3 — Configurar variáveis de ambiente

Após o deploy, **no painel do Railway** (railway.app → seu projeto → Variables), adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `file:/data/prod.db` |
| `AUTH_SECRET` | Use: `openssl rand -base64 32` |
| `AUTH_URL` | `https://SEU-APP.up.railway.app` |
| `NEXTAUTH_URL` | `https://SEU-APP.up.railway.app` |
| `ADMIN_EMAIL` | `admin@novaambiental.com.br` |
| `ADMIN_PASSWORD` | Senha forte para o admin |
| `PORT` | `3000` |

> Para gerar AUTH_SECRET no Windows:  
> `[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`

---

## Passo 4 — Adicionar Volume (SQLite persistente)

No painel do Railway:
1. Clique em **"+ New"** → **"Volume"**
2. **Mount Path**: `/data`
3. Clique em **"Create"**

Isso garante que o banco SQLite sobreviva a redeploys.

> **Opcional — persistir fotos dos veículos:**
> Crie um segundo Volume com Mount Path: `/app/public/uploads`
> Sem isso, as fotos são perdidas em cada redeploy (banco continua ok).

---

## Passo 5 — Redeploy após configurar as variáveis

```powershell
Set-Location "C:\Users\lenovo\Projects\frotas-nova-ambiental"
C:\Users\lenovo\AppData\Roaming\npm\railway.cmd up --detach
```

Ou force um redeploy pelo painel Railway: **Deployments → Redeploy**.

---

## Passo 6 — Obter URL pública

No painel Railway: **Settings → Domains → Generate Domain**

A URL será algo como: `frotas-nova-ambiental.up.railway.app`

Atualize as variáveis `AUTH_URL` e `NEXTAUTH_URL` com essa URL real.

---

## PWA — Instalação no celular

Com o app no ar, acesse a URL no celular e:
- **Android (Chrome)**: Menu → "Adicionar à tela inicial"
- **iOS (Safari)**: Botão compartilhar → "Adicionar à tela de início"

O `manifest.json` já está configurado com:
- `start_url: "/dashboard"` ✓
- Ícones 192x192 e 512x512 ✓
- `display: "standalone"` ✓
- `theme_color: "#0056A6"` ✓

---

## Troubleshooting

### Erro: `better-sqlite3` não compila
O Railway usa Linux x64. Se o erro for de compilação nativa, adicione ao `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "nixpacks.toml"
  }
}
```
E crie `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["python3", "gcc", "gnumake"]
```

### Erro: `prisma migrate deploy` falha no primeiro boot
Verifique se o Volume está montado em `/data` ANTES do primeiro deploy.
Ordem correta: Criar Volume → Adicionar variáveis → Fazer deploy.

### Login/sessão não funciona
Verifique se `AUTH_SECRET`, `AUTH_URL` e `NEXTAUTH_URL` estão configurados.
`AUTH_URL` deve ser a URL completa sem barra final: `https://app.up.railway.app`

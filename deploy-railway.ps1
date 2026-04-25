# deploy-railway.ps1
# Execute este script em um terminal PowerShell normal (nao como servico)
# Ele vai: login, criar projeto e fazer deploy no Railway

$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
$RAILWAY = "C:\Users\lenovo\AppData\Roaming\npm\railway.cmd"
$PROJECT_DIR = "C:\Users\lenovo\Projects\frotas-nova-ambiental"

Set-Location $PROJECT_DIR

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Deploy — Nova Ambiental Frotas" -ForegroundColor Cyan
Write-Host " Railway.app (SQLite + Disco Persistente)" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Login
Write-Host "[1/3] Fazendo login no Railway..." -ForegroundColor Yellow
Write-Host "      (abrira o navegador para autenticar)" -ForegroundColor Gray
& $RAILWAY login
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Login falhou. Tente novamente." -ForegroundColor Red
    exit 1
}
Write-Host "Login concluido!" -ForegroundColor Green

# Passo 2: Criar projeto Railway
Write-Host ""
Write-Host "[2/3] Criando projeto no Railway..." -ForegroundColor Yellow
Write-Host "      (escolha um nome ou aceite o sugerido)" -ForegroundColor Gray
& $RAILWAY init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao criar projeto." -ForegroundColor Red
    exit 1
}

# Passo 3: Deploy
Write-Host ""
Write-Host "[3/3] Fazendo deploy..." -ForegroundColor Yellow
Write-Host "      (isso pode levar 3-5 minutos para compilar)" -ForegroundColor Gray
& $RAILWAY up --detach
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Deploy falhou." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Deploy enviado com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS (no painel Railway):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acesse: https://railway.app" -ForegroundColor White
Write-Host "2. Abra seu projeto -> Variables -> adicione:" -ForegroundColor White
Write-Host "   DATABASE_URL  = file:/data/prod.db" -ForegroundColor Cyan
Write-Host "   AUTH_SECRET   = (gere com o comando abaixo)" -ForegroundColor Cyan
Write-Host "   AUTH_URL      = https://SEU-APP.up.railway.app" -ForegroundColor Cyan
Write-Host "   NEXTAUTH_URL  = https://SEU-APP.up.railway.app" -ForegroundColor Cyan
Write-Host "   ADMIN_EMAIL   = admin@novaambiental.com.br" -ForegroundColor Cyan
Write-Host "   ADMIN_PASSWORD= (senha forte)" -ForegroundColor Cyan
Write-Host "   PORT          = 3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Adicione um Volume: + New -> Volume" -ForegroundColor White
Write-Host "   Mount Path: /data" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Faca redeploy apos configurar variáveis" -ForegroundColor White
Write-Host ""
Write-Host "Gerar AUTH_SECRET:" -ForegroundColor Yellow
$secret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "   AUTH_SECRET = $secret" -ForegroundColor Green
Write-Host ""
Write-Host "Ver logs em tempo real:" -ForegroundColor Yellow
Write-Host "   $RAILWAY logs" -ForegroundColor Cyan
Write-Host ""

# Abrir painel Railway no navegador
Start-Process "https://railway.app"

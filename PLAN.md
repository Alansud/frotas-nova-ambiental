# Controle de Manutenção de Frotas — Nova Ambiental

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| ORM | Prisma 7 + SQLite |
| Autenticação | NextAuth.js v5 (Credentials, JWT) |
| Upload | API Route local → `public/uploads/` |
| QR Code | `qrcode` npm → PNG via API Route |
| UI | Tailwind CSS v4 |
| Tema | Azul `#0056A6`, Verde `#00A651` (Nova Ambiental) |
| Deploy | Node.js / Docker (sem banco externo) |

---

## Estrutura de Pastas

```
frotas-nova-ambiental/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db              (gerado após migrate)
├── public/
│   └── uploads/            (fotos dos veículos)
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── veiculo/[id]/page.tsx     # Página pública via QR Code
│   │   ├── (admin)/
│   │   │   ├── layout.tsx                # Guard de sessão + navbar
│   │   │   ├── dashboard/page.tsx        # Painel principal
│   │   │   └── veiculos/
│   │   │       ├── page.tsx              # Lista de frotas
│   │   │       ├── novo/page.tsx         # Cadastro de veículo
│   │   │       └── [id]/
│   │   │           ├── page.tsx          # Detalhes + histórico
│   │   │           ├── QRCodeModal.tsx
│   │   │           ├── EditarVeiculoForm.tsx
│   │   │           └── manutencao/page.tsx
│   │   ├── login/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── veiculos/route.ts + [id]/route.ts
│   │   │   ├── manutencoes/route.ts + [id]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── qrcode/[id]/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── auth.ts
│   └── types/index.ts
├── PLAN.md
├── .env.local
└── package.json
```

---

## Schema do Banco de Dados

```prisma
model Veiculo {
  id, placa (unique), modelo, marca, ano, cor, renavam,
  chassi, fotoUrl, kmAtual, ativo, createdAt, updatedAt
  → manutencoes[], proximaRevisao?
}

model Manutencao {
  id, veiculoId, data, kmNaData, mecanico, servicos,
  observacoes, custo, createdAt
}

model ProximaRevisao {
  id, veiculoId (unique), kmPrevisto, dataPrevista,
  observacoes, updatedAt
}

model Admin {
  id, email (unique), password (bcrypt)
}
```

---

## Fases de Implementação

1. **Setup**: Next.js 16 + Prisma 7 + SQLite + NextAuth v5 + ts-node
2. **Autenticação**: NextAuth Credentials + bcrypt + guard layout admin
3. **CRUD Veículos**: API Routes + upload local + formulários
4. **Manutenções**: API Routes + timeline + atualização km automática
5. **QR Code**: API PNG colorido + modal de impressão + página pública
6. **Dashboard**: Cards de resumo + alertas de revisão vencida/próxima
7. **Polimento**: Responsividade + PLAN.md + `npm run build`

---

## Telas Principais

### Login (`/login`)
- Formulário email + senha sobre fundo gradiente azul Nova Ambiental
- Sessão JWT via NextAuth. Redireciona para `/admin/dashboard`

### Dashboard (`/admin/dashboard`)
- 4 cards: total veículos, manutenções do mês, revisões vencidas, atenção necessária
- Tabela de veículos com alertas prioritários
- Ações rápidas: novo veículo, ver frotas

### Lista de Frotas (`/admin/veiculos`)
- Grid de cards com foto, placa, modelo, km atual, badge de status
- Badge: Em dia (verde) / Atenção (amarelo) / Vencida (vermelho) / Sem previsão (cinza)

### Cadastro/Edição de Veículo
- Upload de foto com preview
- Campos: placa, modelo, marca, ano, cor, km, RENAVAM, chassi
- Seção "Próxima Revisão": km previsto + data + observações
- Modal de edição inline na página de detalhes

### Registro de Manutenção
- Campos: data, km na data, mecânico, serviços/peças (textarea), custo
- Atualiza automaticamente km do veículo se maior

### QR Code
- Modal com QR Code PNG colorido (azul Nova Ambiental)
- Página de impressão formatada: QR + placa + instruções
- `window.print()` com `@media print`

### Página Pública (`/veiculo/:id`) — acessada pelo QR Code
- Sem login. Foto, placa, modelo, km atual, badge status
- Card de próxima revisão com cor conforme urgência
- Timeline de manutenções (data, km, mecânico, serviços)

---

## Variáveis de Ambiente (`.env.local`)

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="<gerar com openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@novaambiental.com.br"
ADMIN_PASSWORD="Nova@2024"
```

---

## Como rodar

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Acesse: http://localhost:3000/login

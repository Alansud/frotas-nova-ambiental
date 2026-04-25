-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "cor" TEXT,
    "renavam" TEXT,
    "chassi" TEXT,
    "fotoUrl" TEXT,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "veiculoId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "kmNaData" INTEGER NOT NULL,
    "mecanico" TEXT NOT NULL,
    "servicos" TEXT NOT NULL,
    "observacoes" TEXT,
    "custo" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Manutencao_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProximaRevisao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "veiculoId" TEXT NOT NULL,
    "kmPrevisto" INTEGER NOT NULL,
    "dataPrevista" DATETIME,
    "observacoes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProximaRevisao_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "ProximaRevisao_veiculoId_key" ON "ProximaRevisao"("veiculoId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

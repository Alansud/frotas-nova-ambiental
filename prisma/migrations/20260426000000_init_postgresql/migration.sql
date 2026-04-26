-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL,
    "numeroFrota" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "cor" TEXT,
    "renavam" TEXT,
    "chassi" TEXT,
    "fotoUrl" TEXT,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "tipoMedicao" TEXT NOT NULL DEFAULT 'km',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "kmNaData" INTEGER NOT NULL,
    "mecanico" TEXT NOT NULL,
    "servicos" TEXT NOT NULL,
    "observacoes" TEXT,
    "custo" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProximaRevisao" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "kmPrevisto" INTEGER NOT NULL,
    "dataPrevista" TIMESTAMP(3),
    "observacoes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProximaRevisao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_numeroFrota_key" ON "Veiculo"("numeroFrota");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "ProximaRevisao_veiculoId_key" ON "ProximaRevisao"("veiculoId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProximaRevisao" ADD CONSTRAINT "ProximaRevisao_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

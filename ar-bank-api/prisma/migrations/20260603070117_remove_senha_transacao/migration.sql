-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senhaUsuario" TEXT NOT NULL,
    "saldo" DECIMAL(65,30) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "remetenteId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "dataTransacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRecebimento" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONCLUIDO',

    CONSTRAINT "transferencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

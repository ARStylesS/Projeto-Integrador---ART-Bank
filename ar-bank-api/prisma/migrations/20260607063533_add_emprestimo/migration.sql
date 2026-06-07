-- CreateTable
CREATE TABLE "emprestimos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "parcelas" INTEGER NOT NULL,
    "taxaMensal" DECIMAL(5,4) NOT NULL,
    "valorParcela" DECIMAL(10,2) NOT NULL,
    "montanteFinal" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

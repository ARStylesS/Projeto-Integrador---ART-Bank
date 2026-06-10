-- CreateTable
CREATE TABLE "cartoes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bandeira" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

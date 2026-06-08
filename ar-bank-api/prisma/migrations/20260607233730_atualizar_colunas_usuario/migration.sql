/*
  Warnings:

  - A unique constraint covering the columns `[usuario]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "celular" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "usuario" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "telefone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

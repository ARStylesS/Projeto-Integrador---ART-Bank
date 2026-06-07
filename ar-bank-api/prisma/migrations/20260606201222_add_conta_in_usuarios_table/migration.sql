/*
  Warnings:

  - A unique constraint covering the columns `[conta]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conta` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "agencia" TEXT NOT NULL DEFAULT '0001',
ADD COLUMN     "conta" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_conta_key" ON "usuarios"("conta");

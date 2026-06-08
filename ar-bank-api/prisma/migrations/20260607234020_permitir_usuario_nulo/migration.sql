-- DropIndex
DROP INDEX "usuarios_usuario_key";

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "usuario" DROP NOT NULL,
ALTER COLUMN "usuario" DROP DEFAULT;

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient() as any;

const obterModeloCartao = () => {
  if (prisma.cartao) return prisma.cartao;
  if (prisma.cartoes) return prisma.cartoes;
  if (prisma.Cartao) return prisma.Cartao;
  throw new Error('Modelo de Cartao nao encontrado no Prisma Client.');
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const { usuarioId, numero, bandeira, tipo } = req.body;

    if (!usuarioId || !numero || !bandeira || !tipo) {
      return res.status(400).json({ erro: 'Dados insuficientes para gerar o cartão.' });
    }

    const cartaoModel = obterModeloCartao();

    const contagemCartoes = await cartaoModel.count({
      where: { usuarioId: String(usuarioId) }
    });

    if (contagemCartoes >= 3) {
      return res.status(400).json({ erro: 'Limite máximo de 3 cartões virtuais atingido.' });
    }

    const novoCartao = await cartaoModel.create({
      data: {
        usuarioId: String(usuarioId),
        numero: String(numero),
        bandeira: String(bandeira),
        tipo: String(tipo),
      }
    });

    console.log(`[CARTÃO] Novo cartão ${bandeira} (${tipo}) criado para o usuário: ${usuarioId}`);
    return res.status(201).json(novoCartao);

  } catch (error) {
    console.error('Erro ao salvar cartão virtual:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao gerar cartão.' });
  }
});

router.get('/:usuarioId', async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const cartaoModel = obterModeloCartao();

    const cartoes = await cartaoModel.findMany({
      where: { usuarioId: String(usuarioId) },
      orderBy: { criadoEm: 'asc' }
    });

    return res.json(cartoes);
  } catch (error) {
    console.error('Erro ao buscar cartões virtuais:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao listar cartões.' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cartaoModel = obterModeloCartao();

    const cartaoExiste = await cartaoModel.findUnique({
      where: { id: String(id) }
    });

    if (!cartaoExiste) {
      return res.status(404).json({ erro: 'Cartão não encontrado ou já excluído.' });
    }

    await cartaoModel.delete({
      where: { id: String(id) }
    });

    console.log(`[CARTÃO] Cartão ID: ${id} removido com sucesso.`);
    return res.status(204).send();

  } catch (error) {
    console.error('Erro ao deletar cartão virtual:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao deletar cartão.' });
  }
});

export default router;
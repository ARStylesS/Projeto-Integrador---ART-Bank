import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/:usuarioId', async (req: Request, res: Response) => {
  try {
    const usuarioId = req.params.usuarioId as string; // ✅ conversão explícita

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const transferencias = await prisma.transferencia.findMany({
      where: {
        OR: [
          { remetenteId: usuarioId },
          { destinatarioId: usuarioId },
        ],
      },
      include: {
        remetente:    { select: { id: true, nome: true } },
        destinatario: { select: { id: true, nome: true } },
      },
      orderBy: { dataTransacao: 'desc' },
    });

    if (transferencias.length === 0) {
      return res.status(200).json({ mensagem: 'Nenhuma transação encontrada.', transacoes: [] });
    }

    const transacoes = transferencias.map((t) => ({
      id:              t.id,
      valor:           Number(t.valor),
      tipo:            t.remetenteId === usuarioId ? 'ENVIADO' : 'RECEBIDO',
      remetente:       t.remetente.nome,
      destinatario:    t.destinatario.nome,
      status:          t.status,
      dataTransacao:   t.dataTransacao,
      dataRecebimento: t.dataRecebimento,
    }));

    return res.status(200).json({ transacoes });
  } catch (error) {
    console.error('Erro ao buscar extrato:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
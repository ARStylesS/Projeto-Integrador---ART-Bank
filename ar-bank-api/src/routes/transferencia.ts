import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { remetenteId, destinatarioEmail, valor } = req.body;

    if (!remetenteId || !destinatarioEmail || !valor) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    const valorNumerico = Number(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({ erro: 'Valor inválido.' });
    }

    const remetente = await prisma.usuario.findUnique({
      where: { id: remetenteId as string },
    });

    if (!remetente) {
      return res.status(404).json({ erro: 'Remetente não encontrado.' });
    }

    if (Number(remetente.saldo) < valorNumerico) {
      return res.status(400).json({ erro: 'Saldo insuficiente.' });
    }

    const destinatario = await prisma.usuario.findUnique({
      where: { email: destinatarioEmail as string },
    });

    if (!destinatario) {
      return res.status(404).json({ erro: 'Destinatário não encontrado.' });
    }

    if (remetente.id === destinatario.id) {
      return res.status(400).json({ erro: 'Não é possível transferir para si mesmo.' });
    }

    const [, , transferencia] = await prisma.$transaction([
      prisma.usuario.update({
        where: { id: remetenteId },
        data: { saldo: { decrement: valorNumerico } },
      }),
      prisma.usuario.update({
        where: { id: destinatario.id },
        data: { saldo: { increment: valorNumerico } },
      }),
      prisma.transferencia.create({
        data: {
          valor:           valorNumerico,
          remetenteId:     remetente.id,
          destinatarioId:  destinatario.id,
          dataRecebimento: new Date(),
          status:          'CONCLUIDO',
        },
      }),
    ]);

    return res.status(201).json({
      mensagem: 'Transferência realizada com sucesso!',
      transferencia: {
        id:            transferencia.id,
        valor:         Number(transferencia.valor),
        destinatario:  destinatario.nome,
        dataTransacao: transferencia.dataTransacao,
        status:        transferencia.status,
      },
    });
  } catch (error) {
    console.error('Erro na transferência:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { usuarioId, valor, parcelas, taxaMensal, valorParcela, montanteFinal } = req.body;

    if (!usuarioId || !valor || !parcelas || !taxaMensal || !valorParcela || !montanteFinal) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    const valorNumerico = Number(valor);
    const parcelasNumericas = Number(parcelas);

    if (valorNumerico < 100 || valorNumerico > 50000) {
      return res.status(400).json({ erro: 'Valor deve ser entre R$ 100,00 e R$ 50.000,00.' });
    }

    if (parcelasNumericas < 2 || parcelasNumericas > 72) {
      return res.status(400).json({ erro: 'Parcelas devem ser entre 2 e 72.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: String(usuarioId) }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Cria o empréstimo e credita o valor na conta do usuário atomicamente
    const [emprestimo] = await prisma.$transaction([
      prisma.emprestimo.create({
        data: {
          usuarioId:    String(usuarioId),
          valor:        valorNumerico,
          parcelas:     parcelasNumericas,
          taxaMensal:   Number(taxaMensal),
          valorParcela: Number(valorParcela),
          montanteFinal: Number(montanteFinal),
          status:       'ATIVO',
        }
      }),
      prisma.usuario.update({
        where: { id: String(usuarioId) },
        data: { saldo: { increment: valorNumerico } }
      })
    ]);

    console.log(`[EMPRESTIMO SUCESSO] Usuário ${usuarioId} contratou R$ ${valorNumerico} em ${parcelasNumericas}x.`);

    return res.status(201).json({
      mensagem: 'Empréstimo contratado com sucesso!',
      emprestimo: {
        id:            emprestimo.id,
        valor:         Number(emprestimo.valor),
        parcelas:      emprestimo.parcelas,
        taxaMensal:    Number(emprestimo.taxaMensal),
        valorParcela:  Number(emprestimo.valorParcela),
        montanteFinal: Number(emprestimo.montanteFinal),
        status:        emprestimo.status,
        criadoEm:      emprestimo.criadoEm,
      }
    });

  } catch (error: any) {
    console.error('Erro ao contratar empréstimo:', error?.message || error);
    return res.status(500).json({ erro: 'Erro interno ao contratar empréstimo.' });
  }
});

export default router;
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: 'ID do usuário não fornecido.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: String(id) }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Busca transferências e empréstimos em paralelo
    const [transferencias, emprestimos] = await Promise.all([
      prisma.transferencia.findMany({
        where: {
          OR: [
            { remetenteId: String(id) },
            { destinatarioId: String(id) }
          ]
        },
        include: {
          remetente:    { select: { nome: true, email: true } },
          destinatario: { select: { nome: true, email: true } }
        },
        orderBy: { dataTransacao: 'desc' }
      }),
      prisma.emprestimo.findMany({
        where: { usuarioId: String(id) },
        orderBy: { criadoEm: 'desc' }
      })
    ]);

    const transacoes = transferencias.map((t) => ({
      id:           t.id,
      tipo:         t.remetenteId === String(id) ? 'ENVIADO' : 'RECEBIDO',
      descricao:    t.remetenteId === String(id)
                      ? `Transferência para ${t.destinatario.nome}`
                      : `Transferência de ${t.remetente.nome}`,
      valor:        Number(t.valor),
      remetente:    t.remetente.nome,
      destinatario: t.destinatario.nome,
      status:       t.status,
      dataTransacao: t.dataTransacao,
      // Campos exclusivos de empréstimo — nulos em transferências
      parcelas:     null,
      valorParcela: null,
    }));

    const registrosEmprestimo = emprestimos.map((e) => ({
      id:           e.id,
      tipo:         'EMPRESTIMO',
      descricao:    'Empréstimo Pessoal',
      valor:        Number(e.valor),
      remetente:    'AR-Bank',
      destinatario: usuario.nome,
      status:       e.status,
      dataTransacao: e.criadoEm,
      // Campos exclusivos de empréstimo
      parcelas:     e.parcelas,
      valorParcela: Number(e.valorParcela),
    }));

    // Junta e ordena tudo por data decrescente
    const historico = [...transacoes, ...registrosEmprestimo].sort(
      (a, b) => new Date(b.dataTransacao).getTime() - new Date(a.dataTransacao).getTime()
    );

    console.log(`[EXTRATO] ${historico.length} registros encontrados para o usuário ${id}`);
    return res.status(200).json({ transacoes: historico });

  } catch (error: any) {
    console.error('Erro ao buscar extrato:', error?.message || error);
    return res.status(500).json({ erro: 'Erro interno ao buscar extrato.' });
  }
});

export default router;
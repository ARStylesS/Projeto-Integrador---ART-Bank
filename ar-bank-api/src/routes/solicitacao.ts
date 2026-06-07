import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Gera código único: 9 números + 3 letras maiúsculas (ex: 482916753ABX)
function gerarCodigo(): string {
  const numeros = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  const letras = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return numeros + letras;
}

// ══════════════════════════════════════════════════════════════
// POST /solicitacao/gerar — Cria um bilhete de solicitação
// ══════════════════════════════════════════════════════════════
router.post('/gerar', async (req: Request, res: Response) => {
  try {
    const { usuarioId, valor } = req.body;
    const valorNumerico = Number(valor);

    if (!usuarioId || isNaN(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({ erro: 'usuarioId e valor válido são obrigatórios.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: String(usuarioId) } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    // Garante código único no banco
    let codigo = '';
    let codigoUnico = false;
    while (!codigoUnico) {
      codigo = gerarCodigo();
      const existente = await prisma.solicitacao.findUnique({ where: { codigo } });
      if (!existente) codigoUnico = true;
    }

    const agora = new Date();
    const expiradoEm = new Date(agora.getTime() + 60 * 60 * 1000); // +1 hora

    const solicitacao = await prisma.solicitacao.create({
      data: {
        codigo,
        solicitanteId: String(usuarioId),
        valor: valorNumerico,
        status: 'PENDENTE',
        expiradoEm,
      }
    });

    console.log(`[SOLICITACAO] Bilhete ${codigo} gerado por ${usuario.nome} — R$ ${valorNumerico}`);

    return res.status(201).json({
      mensagem: 'Bilhete gerado com sucesso!',
      bilhete: {
        codigo: solicitacao.codigo,
        nomeSolicitante: usuario.nome,
        valor: Number(solicitacao.valor),
        expiradoEm: solicitacao.expiradoEm,
      }
    });
  } catch (error: any) {
    console.error('Erro ao gerar solicitação:', error?.message);
    return res.status(500).json({ erro: 'Erro interno ao gerar solicitação.' });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /solicitacao/ler/:codigo — Lê e valida um bilhete
// ══════════════════════════════════════════════════════════════
router.get('/ler/:codigo', async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { codigo: String(codigo).toUpperCase() },
      include: { solicitante: { select: { nome: true } } }
    });

    if (!solicitacao) {
      return res.status(404).json({ erro: 'Bilhete não encontrado.' });
    }

    // Marca como expirado se passou da hora
    if (solicitacao.status === 'PENDENTE' && new Date() > solicitacao.expiradoEm) {
      await prisma.solicitacao.update({ where: { codigo: solicitacao.codigo }, data: { status: 'EXPIRADO' } });
      return res.status(400).json({ erro: 'Este bilhete expirou.' });
    }

    if (solicitacao.status === 'PAGO') {
      return res.status(400).json({ erro: 'Este bilhete já foi pago.' });
    }

    if (solicitacao.status === 'EXPIRADO') {
      return res.status(400).json({ erro: 'Este bilhete expirou.' });
    }

    return res.status(200).json({
      bilhete: {
        codigo: solicitacao.codigo,
        nomeSolicitante: solicitacao.solicitante.nome,
        valor: Number(solicitacao.valor),
        expiradoEm: solicitacao.expiradoEm,
      }
    });
  } catch (error: any) {
    console.error('Erro ao ler bilhete:', error?.message);
    return res.status(500).json({ erro: 'Erro interno ao ler bilhete.' });
  }
});

// ══════════════════════════════════════════════════════════════
// POST /solicitacao/pagar — Paga um bilhete e gera transferência
// ══════════════════════════════════════════════════════════════
router.post('/pagar', async (req: Request, res: Response) => {
  try {
    const { usuarioId, codigo, senha } = req.body;

    if (!usuarioId || !codigo || !senha) {
      return res.status(400).json({ erro: 'usuarioId, codigo e senha são obrigatórios.' });
    }

    // Valida pagador
    const pagador = await prisma.usuario.findUnique({ where: { id: String(usuarioId) } });
    if (!pagador) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    // Valida senha
    const senhaValida = await bcrypt.compare(String(senha), pagador.senhaUsuario);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });

    // Busca bilhete
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: { solicitante: true }
    });

    if (!solicitacao) return res.status(404).json({ erro: 'Bilhete não encontrado.' });

    // Valida status e expiração
    if (solicitacao.status === 'PAGO') {
      return res.status(400).json({ erro: 'Este bilhete já foi pago.' });
    }
    if (solicitacao.status === 'EXPIRADO' || new Date() > solicitacao.expiradoEm) {
      await prisma.solicitacao.update({ where: { codigo: solicitacao.codigo }, data: { status: 'EXPIRADO' } });
      return res.status(400).json({ erro: 'Este bilhete expirou.' });
    }

    // Impede auto-pagamento
    if (solicitacao.solicitanteId === String(usuarioId)) {
      return res.status(400).json({ erro: 'Você não pode pagar sua própria solicitação.' });
    }

    const valor = Number(solicitacao.valor);

    if (Number(pagador.saldo) < valor) {
      return res.status(400).json({ erro: 'Saldo insuficiente para pagar esta solicitação.' });
    }

    // Executa tudo atomicamente
    await prisma.$transaction([
      // Debita pagador
      prisma.usuario.update({
        where: { id: String(usuarioId) },
        data: { saldo: { decrement: valor } }
      }),
      // Credita solicitante
      prisma.usuario.update({
        where: { id: solicitacao.solicitanteId },
        data: { saldo: { increment: valor } }
      }),
      // Registra transferência
      prisma.transferencia.create({
        data: {
          valor,
          remetenteId: String(usuarioId),
          destinatarioId: solicitacao.solicitanteId,
          dataRecebimento: new Date(),
          status: 'CONCLUIDO',
        }
      }),
      // Marca bilhete como pago
      prisma.solicitacao.update({
        where: { codigo: solicitacao.codigo },
        data: { status: 'PAGO' }
      }),
    ]);

    console.log(`[SOLICITACAO PAGA] ${pagador.nome} pagou R$ ${valor} para ${solicitacao.solicitante.nome} via bilhete ${codigo}`);

    return res.status(200).json({ mensagem: 'Pagamento realizado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao pagar solicitação:', error?.message);
    return res.status(500).json({ erro: 'Erro interno ao pagar solicitação.' });
  }
});

export default router;
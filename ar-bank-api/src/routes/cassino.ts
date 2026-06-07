import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const PRECO_FICHA = 0.20;

// ─── Utilitário RNG ───────────────────────────────────────────────────────────
const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ══════════════════════════════════════════════════════════════
// COMPRAR FICHAS
// ══════════════════════════════════════════════════════════════
router.post('/comprar-fichas', async (req: Request, res: Response) => {
  try {
    const { usuarioId, quantidade } = req.body;
    const qtd = parseInt(quantidade);

    if (!usuarioId || isNaN(qtd) || qtd < 1) {
      return res.status(400).json({ erro: 'usuarioId e quantidade válida são obrigatórios.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: String(usuarioId) } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const custo = qtd * PRECO_FICHA;
    if (Number(usuario.saldo) < custo) {
      return res.status(400).json({ erro: `Saldo insuficiente. ${qtd} ficha(s) custam R$ ${custo.toFixed(2)}.` });
    }

    const atualizado = await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { saldo: { decrement: custo }, fichas: { increment: qtd } },
    });

    console.log(`[CASSINO] ${usuarioId} comprou ${qtd} ficha(s). Total: ${atualizado.fichas}`);
    return res.status(200).json({ mensagem: 'Fichas compradas!', fichas: atualizado.fichas, saldo: Number(atualizado.saldo) });
  } catch (error: any) {
    console.error('Erro ao comprar fichas:', error?.message);
    return res.status(500).json({ erro: 'Erro interno ao comprar fichas.' });
  }
});

// ══════════════════════════════════════════════════════════════
// SACAR FICHAS
// ══════════════════════════════════════════════════════════════
router.post('/sacar-fichas', async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(400).json({ erro: 'usuarioId é obrigatório.' });

    const usuario = await prisma.usuario.findUnique({ where: { id: String(usuarioId) } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (usuario.fichas === 0) return res.status(400).json({ erro: 'Nenhuma ficha para sacar.' });

    const valorSaque = usuario.fichas * PRECO_FICHA;
    const atualizado = await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { saldo: { increment: valorSaque }, fichas: 0 },
    });

    console.log(`[CASSINO] ${usuarioId} sacou ${usuario.fichas} ficha(s) = R$ ${valorSaque.toFixed(2)}`);
    return res.status(200).json({ mensagem: `R$ ${valorSaque.toFixed(2)} creditados!`, fichas: 0, saldo: Number(atualizado.saldo) });
  } catch (error: any) {
    console.error('Erro ao sacar fichas:', error?.message);
    return res.status(500).json({ erro: 'Erro interno ao sacar fichas.' });
  }
});

// ══════════════════════════════════════════════════════════════
// ROLETA
// Números 1-18 = vermelho, 19-36 = preto, 0 = verde (casa ganha)
// Cor: ganha 2x | Número exato: ganha 36x | 0: casa sempre ganha
// ══════════════════════════════════════════════════════════════
router.post('/roleta', async (req: Request, res: Response) => {
  try {
    const { usuarioId, fichasApostadas, tipoAposta, cor, numero } = req.body;
    const aposta = parseInt(fichasApostadas);

    if (!usuarioId || isNaN(aposta) || aposta < 1) {
      return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: String(usuarioId) } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (usuario.fichas < aposta) return res.status(400).json({ erro: 'Fichas insuficientes.' });

    // Sorteia número de 0 a 36
    const numeroSorteado = rng(0, 36);
    const corSorteada = numeroSorteado === 0 ? 'verde' : numeroSorteado <= 18 ? 'vermelho' : 'preto';

    let ganhou = false;
    let multiplicador = 0;

    if (numeroSorteado !== 0) {
      if (tipoAposta === 'cor' && cor === corSorteada) {
        ganhou = true; multiplicador = 2;
      } else if (tipoAposta === 'numero' && parseInt(numero) === numeroSorteado) {
        ganhou = true; multiplicador = 36;
      }
    }
    // 0 verde: casa sempre ganha — ganhou permanece false

    const fichasGanhas = ganhou ? aposta * multiplicador : 0;
    const delta = ganhou ? fichasGanhas - aposta : -aposta;

    const atualizado = await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { fichas: { increment: delta } },
    });

    console.log(`[ROLETA] ${usuarioId} apostou ${aposta} fichas. Sorteado: ${numeroSorteado}(${corSorteada}). ${ganhou ? `GANHOU ${fichasGanhas}` : 'PERDEU'}`);
    return res.status(200).json({
      ganhou, numeroSorteado, corSorteada, fichasGanhas, fichas: atualizado.fichas,
    });
  } catch (error: any) {
    console.error('Erro na roleta:', error?.message);
    return res.status(500).json({ erro: 'Erro interno na roleta.' });
  }
});

// ══════════════════════════════════════════════════════════════
// DADOS
// Dois dados de 6 faces (soma 2–12). Acertou: ganha 10x
// ══════════════════════════════════════════════════════════════
router.post('/dados', async (req: Request, res: Response) => {
  try {
    const { usuarioId, fichasApostadas, numero } = req.body;
    const aposta = parseInt(fichasApostadas);
    const numeroApostado = parseInt(numero);

    if (!usuarioId || isNaN(aposta) || aposta < 1 || isNaN(numeroApostado) || numeroApostado < 2 || numeroApostado > 12) {
      return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: String(usuarioId) } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (usuario.fichas < aposta) return res.status(400).json({ erro: 'Fichas insuficientes.' });

    const dado1 = rng(1, 6);
    const dado2 = rng(1, 6);
    const soma = dado1 + dado2;
    const ganhou = soma === numeroApostado;

    const fichasGanhas = ganhou ? aposta * 10 : 0;
    const delta = ganhou ? fichasGanhas - aposta : -aposta;

    const atualizado = await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { fichas: { increment: delta } },
    });

    console.log(`[DADOS] ${usuarioId} apostou ${aposta} fichas no ${numeroApostado}. Dados: ${dado1}+${dado2}=${soma}. ${ganhou ? `GANHOU ${fichasGanhas}` : 'PERDEU'}`);
    return res.status(200).json({ ganhou, dado1, dado2, soma, fichasGanhas, fichas: atualizado.fichas });
  } catch (error: any) {
    console.error('Erro nos dados:', error?.message);
    return res.status(500).json({ erro: 'Erro interno nos dados.' });
  }
});

// ══════════════════════════════════════════════════════════════
// RASPADINHA
// 3 números sorteados de 1–9. Os 3 iguais: ganha 9x
// ══════════════════════════════════════════════════════════════
router.post('/raspadinha', async (req: Request, res: Response) => {
  try {
    const { usuarioId, fichasApostadas } = req.body;
    const aposta = parseInt(fichasApostadas);

    if (!usuarioId || isNaN(aposta) || aposta < 1) {
      return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: String(usuarioId) } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (usuario.fichas < aposta) return res.status(400).json({ erro: 'Fichas insuficientes.' });

    // RNG sorteia 3 números independentes de 1–9
    const sorteados = [rng(1, 9), rng(1, 9), rng(1, 9)];
    const ganhou = sorteados[0] === sorteados[1] && sorteados[1] === sorteados[2];

    const fichasGanhas = ganhou ? aposta * 9 : 0;
    const delta = ganhou ? fichasGanhas - aposta : -aposta;

    const atualizado = await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { fichas: { increment: delta } },
    });

    console.log(`[RASPADINHA] ${usuarioId} apostou ${aposta} fichas. Sorteados: ${sorteados}. ${ganhou ? `GANHOU ${fichasGanhas}` : 'PERDEU'}`);
    return res.status(200).json({ ganhou, sorteados, fichasGanhas, fichas: atualizado.fichas });
  } catch (error: any) {
    console.error('Erro na raspadinha:', error?.message);
    return res.status(500).json({ erro: 'Erro interno na raspadinha.' });
  }
});

export default router;

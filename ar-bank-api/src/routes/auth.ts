import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    // Busca o usuário garantindo letras minúsculas se necessário
    const usuario = await prisma.usuario.findFirst({
      where: { 
        email: {
          equals: email.trim(),
          mode: 'insensitive' // Evita erros de digitação de maiúsculas no celular
        }
      },
    });

    // Se não achar, responde imediatamente e sai da rota
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    // Validação da senha com tratamento de erro isolado
    let senhaValida = false;
    try {
      senhaValida = await bcrypt.compare(senha, usuario.senhaUsuario);
    } catch (bcryptError) {
      console.error('Erro ao decodificar senha com bcrypt:', bcryptError);
      return res.status(500).json({ erro: 'Erro interno na validação de segurança.' });
    }

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    // Cast seguro para evitar problemas com campos numéricos/Decimal do Postgres
    const dadosBrutos = usuario as any;

    return res.status(200).json({
      mensagem: 'Login bem-sucedido!',
      usuario: {
        id: String(dadosBrutos.id),
        nome: dadosBrutos.nome,
        email: dadosBrutos.email,
        telefone: dadosBrutos.telefone,
        saldo: Number(dadosBrutos.saldo), // Converte Decimal do Postgres para Number JS
        agencia: dadosBrutos.agencia ?? '0001', 
        conta: dadosBrutos.conta,              
      },
    });

  } catch (error) {
    console.error('Erro Crítico no Fluxo de Login:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

export default router;
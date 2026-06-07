import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, email, telefone, senha } = req.body;

    // 1. Validações básicas de entrada
    if (!nome || !email || !telefone || !senha) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    // 2. Verifica se o e-mail já existe no banco de dados
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // 3. Criptografia da senha do usuário
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 4. Fluxo de geração de Conta Bancária Única
    let contaGerada = '';
    let contaJaExiste = true;

    while (contaJaExiste) {
      const numeroSeisDigitos = Math.floor(100000 + Math.random() * 900000); // Ex: 482915
      const digitoVerificador = Math.floor(Math.random() * 10); // Ex: 3
      contaGerada = `${numeroSeisDigitos}-${digitoVerificador}`; // Resultado: "482915-3"

      // O uso do "as any" força o compilador a ignorar a trava de tipo do Prisma cacheado
      const checarConta = await prisma.usuario.findUnique({
        where: { conta: contaGerada } as any
      });

      if (!checarConta) {
        contaJaExiste = false; // Conta livre encontrada
      }
    }

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email: email.toLowerCase(),
        telefone,
        senhaUsuario: senhaHash,
        saldo: 100.00,
        agencia: '0001',
        conta: contaGerada
      }
    });

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        agencia: novoUsuario.agencia ?? '0001',
        conta: novoUsuario.conta,
        saldo: Number(novoUsuario.saldo)
      }
    });

  } catch (error) {
    console.error('Erro interno detectado no fluxo de cadastro:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao realizar cadastro.' });
  }
});

export default router;
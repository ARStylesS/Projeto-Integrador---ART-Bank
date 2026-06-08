import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Ou a biblioteca de criptografia que você usa

const router = Router();
const prisma = new PrismaClient();

router.post('/cadastro', async (req: Request, res: Response) => {
  try {
    const { usuario, nome, email, celular, senha, telefone } = req.body;

    // 1. Validação de campos obrigatórios (TELEFONE DE FORA DAQUI)
    if (!usuario || !nome || !email || !celular || !senha) {
      return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    // 2. Verifica se o e-mail ou o nome de usuário já existem no banco
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { usuario: usuario.trim() }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Nome de usuário ou e-mail já cadastrado.' });
    }

    // 3. Criptografia da senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // 4. Gerador simples de número de conta único (Exemplo: 6 dígitos aleatórios)
    let numeroConta = '';
    let contaExiste = true;
    while (contaExiste) {
      numeroConta = Math.floor(100000 + Math.random() * 900000).toString();
      const checarConta = await prisma.usuario.findUnique({ where: { conta: numeroConta } });
      if (!checarConta) contaExiste = false;
    }

    // 5. Criação do usuário no banco de dados com Prisma
    const novoUsuario = await prisma.usuario.create({
      data: {
        usuario: usuario.trim(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        celular: celular.replace(/\D/g, ''), // Mantém apenas números
        senhaUsuario: senhaCriptografada,
        saldo: 0.00,
        agencia: "0001",
        conta: numeroConta,
        fichas: 0,
        // SE O TELEFONE VIER VAZIO OU EM BRANCO, SALVA COMO NULL
        telefone: telefone && telefone.trim() !== '' ? telefone.replace(/\D/g, '') : null
      }
    });

    // Retorna o usuário criado com sucesso (removendo a senha por segurança)
    const { senhaUsuario, ...usuarioSemSenha } = novoUsuario;
    return res.status(201).json({ usuario: usuarioSemSenha });

  } catch (error) {
    console.error('Erro no servidor ao cadastrar:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao realizar o cadastro.' });
  }
});

export default router;
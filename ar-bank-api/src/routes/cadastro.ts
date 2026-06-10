import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; 

const router = Router();
const prisma = new PrismaClient();

router.post('/cadastro', async (req: Request, res: Response) => {
  try {
    const { usuario, nome, email, celular, senha, telefone, genero } = req.body;


    if (!usuario || !nome || !email || !celular || !senha) {
      return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    
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


    const senhaCriptografada = await bcrypt.hash(senha, 10);

  
    let numeroConta = '';
    let contaExiste = true;
    while (contaExiste) {
      numeroConta = Math.floor(100000 + Math.random() * 900000).toString();
      const checarConta = await prisma.usuario.findUnique({ where: { conta: numeroConta } });
      if (!checarConta) contaExiste = false;
    }

    
    const novoUsuario = await prisma.usuario.create({
      data: {
        usuario: usuario.trim(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        celular: celular.replace(/\D/g, ''), 
        senhaUsuario: senhaCriptografada,
        saldo: 0.00,
        agencia: "0001",
        conta: numeroConta,
        fichas: 0,
        // MODIFICAÇÃO: Se o gênero for enviado, salva o valor (F ou M). Caso contrário, assume "M"
        genero: genero ? String(genero).trim().toUpperCase() : "M",
        telefone: telefone && telefone.trim() !== '' ? telefone.replace(/\D/g, '') : null
      }
    });

    console.log(`[API CADASTRO] Novo usuário criado: ${novoUsuario.nome} | Gênero salvo: ${novoUsuario.genero}`);

    
    const { senhaUsuario, ...usuarioSemSenha } = novoUsuario;
    return res.status(201).json({ usuario: usuarioSemSenha });

  } catch (error) {
    console.error('Erro no servidor ao cadastrar:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao realizar o cadastro.' });
  }
});

export default router;
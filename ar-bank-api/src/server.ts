import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path'; 
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import editarPerfilRoutes from './routes/dadosPerfil'; 
import authRoutes from './routes/auth';
import transferenciaRoutes from './routes/transferencia';
import extratoRoutes from './routes/extrato';
import emprestimoRoutes from './routes/emprestimo';
import cassinoRoutes from './routes/cassino';
import solicitacaoRoutes from './routes/solicitacao';
import cartaoRoutes from './routes/cartoes'; 

const app = express();

// Centralização do client com coerção de tipo flexível para evitar quebras de cache
export const prisma = new PrismaClient() as any;

const PORT = 3333;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  console.log(`[REQUISIÇÃO GLOBAL] ${req.method} | URL original: ${req.originalUrl}`);
  next();
});

app.use('/perfil', editarPerfilRoutes);
app.use('/auth', authRoutes);
app.use('/transferencia', transferenciaRoutes);
app.use('/extrato', extratoRoutes);
app.use('/emprestimo', emprestimoRoutes);
app.use('/cassino', cassinoRoutes);
app.use('/solicitacao', solicitacaoRoutes);
app.use('/cartoes', cartaoRoutes);

app.post('/cadastro', async (req: Request, res: Response) => {
  try {
    const { usuario, nome, email, telefone, celular, senha, genero } = req.body;

    if (!usuario || !nome || !email || !celular || !senha) {
      return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const emailFormatado = String(email).trim().toLowerCase();

    const emailExistente = await prisma.usuario.findUnique({
      where: { email: emailFormatado }
    });

    if (emailExistente) {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(String(senha), salt);

    const numeroConta = String(Math.floor(100000 + Math.random() * 900000)) + "-9";

    const novoUsuario = await prisma.usuario.create({
      data: {
        usuario: String(usuario).trim(),
        nome: String(nome).trim(), 
        email: emailFormatado,
        telefone: telefone ? String(telefone).trim() : '',
        celular: String(celular).trim(),
        senhaUsuario: senhaCriptografada,
        saldo: 100.00, 
        agencia: "0001",
        conta: numeroConta,
        genero: genero ? String(genero).trim() : "M"
      }
    });

    console.log(`[CADASTRO SUCESSO] ${(novoUsuario as any).nome} registrado. Conta: ${numeroConta} | Gênero: ${novoUsuario.genero}`);
    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: novoUsuario.id });

  } catch (error: any) {
    console.error('Erro crítico no Cadastro:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao cadastrar.' });
  }
});

app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const emailFormatado = String(email).trim().toLowerCase();

    const resultadoBusca = await prisma.usuario.findFirst({
      where: { 
        email: {
          equals: emailFormatado,
          mode: 'insensitive'
        }
      },
    });

    if (!resultadoBusca) {
      console.log(`[LOGIN NEGADO] E-mail não encontrado: ${emailFormatado}`);
      return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    const usuarioEncontrado = resultadoBusca as any;

    const senhaValida = await bcrypt.compare(String(senha), usuarioEncontrado.senhaUsuario);

    if (!senhaValida) {
      console.log(`[LOGIN NEGADO] Senha inválida para: ${emailFormatado}`);
      return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    console.log(`[LOGIN SUCESSO] ${usuarioEncontrado.nome} conectado.`);
    
    return res.status(200).json({
      mensagem: 'Login bem-sucedido!',
      usuario: {
        id: String(usuarioEncontrado.id),
        usuario: usuarioEncontrado.usuario,
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        telefone: usuarioEncontrado.telefone,
        celular: usuarioEncontrado.celular,
        saldo: Number(usuarioEncontrado.saldo) || 0, 
        agencia: usuarioEncontrado.agencia ?? '0001', 
        conta: usuarioEncontrado.conta,
        fotoUrl: usuarioEncontrado.fotoUrl || null 
      },
    });

  } catch (error: any) {
    console.error('Erro Crítico no Fluxo de Login:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao tentar autenticar.' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: "API AR-Bank Ativa e Integrada" });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`[SUCESSO] Servidor Express rodando na porta ${PORT}`);
  console.log(`==================================================`);
});
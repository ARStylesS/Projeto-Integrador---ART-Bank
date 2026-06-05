import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import editarPerfilRoutes from './routes/editarPerfil'; 

const app = express();
const prisma = new PrismaClient();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Rastreador de rotas ativo no terminal
app.use((req, res, next) => {
  console.log(`[REQUISIÇÃO] ${req.method} | URL: ${req.url}`);
  next();
});

// Vincula as rotas do arquivo editarPerfil.ts (/perfil/:id)
app.use('/perfil', editarPerfilRoutes);

// ==========================================
// ROTA DE CADASTRO COM CRIPTOGRAFIA (BCRYPT)
// ==========================================
app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;

    if (!nome || !email || !telefone || !senha) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios para o cadastro.' });
    }

    const emailFormatado = String(email).trim().toLowerCase();

    // Evita duplicidade de conta
    const emailExistente = await prisma.usuario.findUnique({
      where: { email: emailFormatado }
    });

    if (emailExistente) {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Criptografa a senha antes de salvar no PostgreSQL
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(String(senha), salt);

    // Gera dados bancários iniciais fictícios exigidos pelo Schema
    const numeroConta = String(Math.floor(100000 + Math.random() * 900000)) + "-9";

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: String(nome).trim(),
        email: emailFormatado,
        telefone: String(telefone).trim(),
        senhaUsuario: senhaCriptografada,
        saldo: 0.00, 
        agencia: "0001",
        conta: numeroConta
      }
    });

    console.log(`[CADASTRO SUCESSO] ${novoUsuario.nome} registrado. Conta: ${numeroConta}`);
    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: novoUsuario.id });

  } catch (error: any) {
    console.error('Erro crítico no Cadastro:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao cadastrar.' });
  }
});

// ==========================================
// ROTA DE LOGIN COMPATÍVEL COM O SEU AUTH.TS
// ==========================================
app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const emailFormatado = String(email).trim().toLowerCase();

    // Busca o usuário de forma resiliente no Postgres
    const usuario = await prisma.usuario.findFirst({
      where: { 
        email: {
          equals: emailFormatado,
          mode: 'insensitive'
        }
      },
    });

    if (!usuario) {
      console.log(`[LOGIN NEGADO] E-mail não encontrado: ${emailFormatado}`);
      return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    // Validação segura usando a mesma estratégia do seu auth.ts
    const senhaValida = await bcrypt.compare(String(senha), usuario.senhaUsuario);

    if (!senhaValida) {
      console.log(`[LOGIN NEGADO] Senha inválida para: ${emailFormatado}`);
      return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    console.log(`[LOGIN SUCESSO] ${usuario.nome} conectado.`);
    
    // Retorna exatamente a estrutura que o seu front-end precisa ler
    return res.status(200).json({
      mensagem: 'Login bem-sucedido!',
      usuario: {
        id: String(usuario.id),
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        saldo: Number(usuario.saldo) || 0, 
        agencia: (usuario as any).agencia ?? '0001', 
        conta: usuario.conta,              
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
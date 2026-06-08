import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  console.log(`[ROTEADOR PERFIL] Método: ${req.method} | Caminho: ${req.path}`);
  next();
});

const diretorioUploads = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(diretorioUploads)) {
  fs.mkdirSync(diretorioUploads, { recursive: true });
}

const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diretorioUploads);
  },
  filename: (req, file, cb) => {
    const id = req.params?.id || 'generico';
    const extensao = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-user-${id}-${Date.now()}${extensao}`);
  }
});

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const mimetypesValidos = tiposPermitidos.test(file.mimetype);
    const extensaoValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());

    if (mimetypesValidos && extensaoValida) {
      return cb(null, true);
    }
    cb(new Error('Formato inválido. Envie apenas imagens em JPEG, JPG, PNG ou WEBP.'));
  }
});

const uploadFotoMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('foto')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ erro: 'A imagem é muito grande. O limite máximo é 5MB.' });
      }
      return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ erro: err.message });
    }
    next();
  });
};

// ROTA PUT: ATUALIZAR DADOS CADASTRAIS DO PERFIL
router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  console.log("-> Iniciando execução interna da rota PUT");
  try {
    const { id } = req.params;
    const { usuario, nome, email, telefone, celular } = req.body;

    if (!usuario || !nome || !email || !celular) {
      return res.status(400).json({ erro: 'Os campos Usuário, Nome, E-mail e Celular são obrigatórios.' });
    }

    const idString = String(id);

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idString },
      data: {
        usuario: String(usuario).trim(),
        nome: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        telefone: telefone ? String(telefone).trim() : '',
        celular: String(celular).trim()
      }
    });

    console.log(`[SUCESSO PUT] Perfil ID ${idString} modificado.`);

    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso!',
      usuario: usuarioAtualizado
    });

  } catch (error: any) {
    console.error('======= ERRO INTERNO NO PUT DO PRISMA =======');
    console.error(error);
    console.error('=============================================');
    
    if (error.code === 'P2002') {
      return res.status(400).json({ erro: 'Este e-mail já está sendo utilizado por outro usuário.' });
    }

    return res.status(500).json({ 
      erro: 'Erro interno ao salvar as alterações no banco.', 
      detalhes: error.message 
    });
  }
});

// ROTA GET: RETORNAR DADOS DO PERFIL
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id: String(id) }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não localizado no sistema.' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao buscar dados do perfil:', error);
    return res.status(500).json({ erro: 'Erro interno ao carregar perfil.' });
  }
});

// ROTA POST: PERSISTE A FOTO NO BANCO DE DADOS
router.post('/:id/foto', uploadFotoMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const hostCompleto = req.get('host') || 'localhost:3333';
    const baseHost = process.env.EXPO_PUBLIC_API_URL || `http://${hostCompleto}`;
    const urlFotoPublica = `${baseHost}/uploads/${req.file.filename}`;
    const idString = String(id);

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idString },
      data: { fotoUrl: urlFotoPublica }
    });

    return res.status(200).json({
      mensagem: 'Foto de perfil atualizada com sucesso!',
      fotoUrl: urlFotoPublica,
      usuario: usuarioAtualizado
    });

  } catch (error: any) {
    console.error('======= ERRO CRÍTICO NO UP DE FOTO =======');
    return res.status(500).json({ erro: 'Erro ao gravar referência da imagem.' });
  }
});

// ROTA DELETE: EXCLUIR CONTA
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.usuario.delete({ where: { id: String(id) } });
    return res.status(200).json({ mensagem: 'Conta removida com sucesso.' });
  } catch (error) {
    return res.status(500).json({ erro: 'Não foi possível completar a exclusão.' });
  }
});

export default router;
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ==========================================
// ROTA GET: BUSCAR DADOS COMPLETOS DO PERFIL
// ==========================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Sanitização para remover eventuais dois-pontos (':') enviados pelo React Native
    const idBusca = req.params.id ? String(req.params.id).replace(':', '').trim() : '';

    if (!idBusca) {
      return res.status(400).json({ erro: 'ID do usuário não fornecido.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: idBusca },
    });

    if (!usuario) {
      console.log(`[API GET PERFIL] Usuário não encontrado para o ID: ${idBusca}`);
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Cast seguro para acessar propriedades dinâmicas ou opcionais do Schema
    const dadosBrutos = usuario as any;

    console.log(`[API GET PERFIL SUCESSO] Carregando dados bancários da conta: ${dadosBrutos.conta}`);

    // Retorna explicitamente todos os campos que o front-end precisa renderizar
    return res.status(200).json({
      id: String(dadosBrutos.id),
      nome: dadosBrutos.nome,
      email: dadosBrutos.email,
      telefone: dadosBrutos.telefone,
      saldo: Number(dadosBrutos.saldo) || 0,
      agencia: dadosBrutos.agencia ?? '0001',
      conta: dadosBrutos.conta ?? '--------'
    });

  } catch (error: any) {
    console.error('Erro crítico no GET /perfil/:id:', error?.message || error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao carregar perfil.' });
  }
});

// ==========================================
// ROTA PUT: ATUALIZAR DADOS DO PERFIL
// ==========================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const idBusca = req.params.id ? String(req.params.id).replace(':', '').trim() : '';
    const { nome, email, telefone } = req.body;

    if (!nome || !email || !telefone) {
      return res.status(400).json({ erro: 'Todos os campos devem ser preenchidos.' });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idBusca },
      data: {
        nome: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        telefone: String(telefone).trim()
      }
    });

    console.log(`[API PUT PERFIL SUCESSO] Usuário ${usuarioAtualizado.nome} atualizado.`);
    return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });

  } catch (error: any) {
    console.error('Erro crítico no PUT /perfil/:id:', error?.message || error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao atualizar perfil.' });
  }
});

// ==========================================
// ROTA DELETE: EXCLUIR CONTA DEFINITIVAMENTE
// ==========================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const idBusca = req.params.id ? String(req.params.id).replace(':', '').trim() : '';

    if (!idBusca) {
      return res.status(400).json({ erro: 'ID do usuário inválido.' });
    }

    // Executa a remoção do registro na tabela Usuario
    await prisma.usuario.delete({
      where: { id: idBusca }
    });

    console.log(`[API DELETE PERFIL SUCESSO] Conta ID ${idBusca} apagada do banco.`);
    return res.status(200).json({ mensagem: 'Sua conta foi excluída com sucesso.' });

  } catch (error: any) {
    console.error('Erro crítico no DELETE /perfil/:id:', error?.message || error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao excluir conta.' });
  }
});

export default router;
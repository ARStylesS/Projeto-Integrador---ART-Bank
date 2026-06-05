import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// =======================================================
// ROTA GET: BUSCA OS DADOS DO PERFIL (CHAMADA PELO FRONT)
// =======================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Executa uma query SQL pura para trazer TODAS as colunas existentes na tabela física,
    // ignorando eventuais desatualizações ou omissões do arquivo schema.prisma
    const dadosRaw: any[] = await prisma.$queryRaw`
      SELECT * FROM "Usuario" WHERE "id" = ${id} LIMIT 1
    `;

    if (!dadosRaw || dadosRaw.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = dadosRaw[0];

    // 2. Mapeamento explícito dos campos com fallback de segurança
    return res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      saldo: Number(usuario.saldo) || 0,
      // Captura as chaves independente de estarem em maiúsculas ou minúsculas no Postgres
      agencia: usuario.agencia || usuario.Agencia || '0001', 
      conta: usuario.conta || usuario.Conta || '--------'
    });

  } catch (error) {
    console.error('Erro crítico ao buscar perfil via QueryRaw:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor ao carregar o perfil.' });
  }
});

// =======================================================
// ROTA PUT: ATUALIZA OS DADOS DO PERFIL
// =======================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: String(id) },
      data: {
        nome: nome ? String(nome).trim() : undefined,
        email: email ? String(email).trim().toLowerCase() : undefined,
        telefone: telefone ? String(telefone).trim() : undefined,
      }
    });

    return res.status(200).json({ mensagem: 'Perfil updated com sucesso!', usuario: usuarioAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
});

export default router;
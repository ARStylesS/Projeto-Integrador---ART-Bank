import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import cadastroRoutes from './routes/cadastro';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/usuario', cadastroRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));
/*
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
*/
// Rota de teste direto no server
app.post('/teste', (_, res) => res.json({ ok: true }));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
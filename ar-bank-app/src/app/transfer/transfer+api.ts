const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    const resposta = await fetch(`${API_URL}/transferencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const dados = await resposta.json();
    return Response.json(dados, { status: resposta.status });
  } catch (error) {
    return Response.json({ erro: 'Erro ao conectar com o servidor.' }, { status: 502 });
  }
}
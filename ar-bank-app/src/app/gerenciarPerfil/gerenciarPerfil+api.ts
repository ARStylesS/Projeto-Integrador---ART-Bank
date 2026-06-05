const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '1';

    const resposta = await fetch(`${API_URL}/perfil/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const dados = await resposta.json();
    return Response.json(dados, { status: resposta.status });
  } catch (error) {
    console.error('Erro no proxy GET perfil:', error);
    return Response.json({ erro: 'Erro ao conectar ao servidor.' }, { status: 502 });
  }
}
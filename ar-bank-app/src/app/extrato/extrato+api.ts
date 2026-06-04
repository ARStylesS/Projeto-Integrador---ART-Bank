const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const usuarioId = url.searchParams.get('usuarioId');

    const resposta = await fetch(`${API_URL}/extrato/${usuarioId}`);
    const dados = await resposta.json();

    return Response.json(dados, { status: resposta.status });
  } catch (error) {
    return Response.json({ erro: 'Erro ao conectar com o servidor.' }, { status: 502 });
  }
}
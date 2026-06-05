const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

export async function PUT(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '1';
    const body = await request.json();

    const resposta = await fetch(`${API_URL}/perfil/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const dados = await resposta.json();
    return Response.json(dados, { status: resposta.status });
  } catch (error) {
    console.error('Erro no proxy PUT perfil:', error);
    return Response.json({ erro: 'Erro ao atualizar dados.' }, { status: 502 });
  }
}
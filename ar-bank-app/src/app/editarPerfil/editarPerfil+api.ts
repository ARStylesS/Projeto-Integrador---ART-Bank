const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

export async function PUT(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // Validação de segurança: se não houver ID na URL do proxy, retorna erro antes de chamar a API externa
    if (!id) {
      return Response.json({ erro: 'ID do usuário não foi fornecido.' }, { status: 400 });
    }

    const body = await request.json();

    // Faz o repasse exato para a API do Express (que já aceita usuario e celular no body)
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
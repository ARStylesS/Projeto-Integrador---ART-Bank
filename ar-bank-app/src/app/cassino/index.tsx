import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, TextInput
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { StdButton } from '@/components/StdButton';
import { FloatingOptions } from '@/components/FloatingOptions';
import { Cores } from '../../styles/global';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

type JogoAtivo = null | 'roleta' | 'dados' | 'raspadinha';

type ResultadoJogo = {
  ganhou: boolean;
  mensagem: string;
  detalhes: string;
  fichasGanhas: number;
};

export default function Loteria() {
  const router = useRouter();
  const { id, usuario } = useLocalSearchParams();

  let usuarioId = id ? String(id) : '1';
  if (!id && usuario) {
    try {
      const parsed = JSON.parse(usuario as string);
      usuarioId = parsed.id ? String(parsed.id) : '1';
    } catch { usuarioId = '1'; }
  }

  const [fichas, setFichas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [jogoAtivo, setJogoAtivo] = useState<JogoAtivo>(null);
  const [resultado, setResultado] = useState<ResultadoJogo | null>(null);

  const [qtdComprar, setQtdComprar] = useState('1');

  // Roleta
  const [apostasRoleta, setApostasRoleta] = useState<'cor' | 'numero' | null>(null);
  const [corEscolhida, setCorEscolhida] = useState<'vermelho' | 'preto' | null>(null);
  const [numeroRoleta, setNumeroRoleta] = useState('');
  const [fichasRoleta, setFichasRoleta] = useState('');

  // Dados
  const [numeroDados, setNumeroDados] = useState('');
  const [fichasDados, setFichasDados] = useState('');

  // Raspadinha
  const [campo1, setCampo1] = useState('');
  const [campo2, setCampo2] = useState('');
  const [campo3, setCampo3] = useState('');
  const [fichasRaspadinha, setFichasRaspadinha] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        try {
          const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`);
          const dados = await resposta.json();
          if (resposta.ok) {
            setFichas(Number(dados.fichas) || 0);
            setSaldo(Number(dados.saldo) || 0);
          }
        } catch (error) {
          console.error('[CASSINO] Erro ao carregar dados:', error);
        }
      }
      carregarDados();
    }, [usuarioId])
  );

  const mostrarErro = (msg: string) => {
    if (Platform.OS === 'web') alert('Erro: ' + msg);
    else Alert.alert('Erro', msg);
  };

  const handleComprarFichas = async () => {
    const qtd = parseInt(qtdComprar);
    if (isNaN(qtd) || qtd < 1) { mostrarErro('Informe uma quantidade válida.'); return; }
    const custo = qtd * 0.20;
    if (saldo < custo) { mostrarErro(`Saldo insuficiente. ${qtd} ficha(s) custam R$ ${custo.toFixed(2)}.`); return; }
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/cassino/comprar-fichas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, quantidade: qtd }),
      });
      const dados = await resposta.json();
      if (resposta.ok) { setFichas(dados.fichas); setSaldo(dados.saldo); }
      else mostrarErro(dados.erro ?? 'Erro ao comprar fichas.');
    } catch { mostrarErro('Não foi possível conectar ao servidor.'); }
    finally { setCarregando(false); }
  };

  const handleSacarFichas = async () => {
    if (fichas === 0) { mostrarErro('Você não possui fichas para sacar.'); return; }
    const valorSaque = (fichas * 0.20).toFixed(2);
    const executar = async () => {
      setCarregando(true);
      try {
        const resposta = await fetch(`${API_URL}/cassino/sacar-fichas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId }),
        });
        const dados = await resposta.json();
        if (resposta.ok) {
          setFichas(0); setSaldo(dados.saldo);
          if (Platform.OS === 'web') alert(`R$ ${valorSaque} creditados na sua conta!`);
          else Alert.alert('Sucesso', `R$ ${valorSaque} creditados na sua conta!`);
        } else mostrarErro(dados.erro ?? 'Erro ao sacar fichas.');
      } catch { mostrarErro('Não foi possível conectar ao servidor.'); }
      finally { setCarregando(false); }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Sacar ${fichas} ficha(s) por R$ ${valorSaque}?`)) executar();
    } else {
      Alert.alert('Sacar Fichas', `Sacar ${fichas} ficha(s) por R$ ${valorSaque}?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sacar', onPress: executar },
      ]);
    }
  };

  const handleJogarRoleta = async () => {
    const aposta = parseInt(fichasRoleta);
    if (isNaN(aposta) || aposta < 1) { mostrarErro('Informe a quantidade de fichas.'); return; }
    if (aposta > fichas) { mostrarErro('Fichas insuficientes.'); return; }
    if (!apostasRoleta) { mostrarErro('Escolha cor ou número.'); return; }
    if (apostasRoleta === 'cor' && !corEscolhida) { mostrarErro('Escolha uma cor.'); return; }
    if (apostasRoleta === 'numero') {
      const n = parseInt(numeroRoleta);
      if (isNaN(n) || n < 1 || n > 36) { mostrarErro('Número deve ser entre 1 e 36.'); return; }
    }
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/cassino/roleta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId, fichasApostadas: aposta, tipoAposta: apostasRoleta,
          cor: corEscolhida, numero: apostasRoleta === 'numero' ? parseInt(numeroRoleta) : null,
        }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setFichas(dados.fichas);
        setResultado({
          ganhou: dados.ganhou,
          mensagem: dados.ganhou ? '🎉 Você ganhou!' : '😔 Você perdeu!',
          detalhes: `Sorteado: ${dados.numeroSorteado} ${dados.corSorteada ? `(${dados.corSorteada})` : '(verde)'}`,
          fichasGanhas: dados.fichasGanhas,
        });
      } else mostrarErro(dados.erro ?? 'Erro ao jogar roleta.');
    } catch { mostrarErro('Não foi possível conectar ao servidor.'); }
    finally { setCarregando(false); }
  };

  const handleJogarDados = async () => {
    const aposta = parseInt(fichasDados);
    const numero = parseInt(numeroDados);
    if (isNaN(aposta) || aposta < 1) { mostrarErro('Informe a quantidade de fichas.'); return; }
    if (aposta > fichas) { mostrarErro('Fichas insuficientes.'); return; }
    if (isNaN(numero) || numero < 2 || numero > 12) { mostrarErro('Número deve ser entre 2 e 12.'); return; }
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/cassino/dados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, fichasApostadas: aposta, numero }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setFichas(dados.fichas);
        setResultado({
          ganhou: dados.ganhou,
          mensagem: dados.ganhou ? '🎉 Você ganhou!' : '😔 Você perdeu!',
          detalhes: `Dado 1: ${dados.dado1} | Dado 2: ${dados.dado2} | Soma: ${dados.soma}`,
          fichasGanhas: dados.fichasGanhas,
        });
      } else mostrarErro(dados.erro ?? 'Erro ao jogar dados.');
    } catch { mostrarErro('Não foi possível conectar ao servidor.'); }
    finally { setCarregando(false); }
  };

  const handleJogarRaspadinha = async () => {
    const aposta = parseInt(fichasRaspadinha);
    const n1 = parseInt(campo1), n2 = parseInt(campo2), n3 = parseInt(campo3);
    if (isNaN(aposta) || aposta < 1) { mostrarErro('Informe a quantidade de fichas.'); return; }
    if (aposta > fichas) { mostrarErro('Fichas insuficientes.'); return; }
    if ([n1, n2, n3].some(n => isNaN(n) || n < 1 || n > 9)) {
      mostrarErro('Cada campo deve ter um número entre 1 e 9.'); return;
    }
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/cassino/raspadinha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, fichasApostadas: aposta, numeros: [n1, n2, n3] }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setFichas(dados.fichas);
        setResultado({
          ganhou: dados.ganhou,
          mensagem: dados.ganhou ? '🎉 Você ganhou!' : '😔 Você perdeu!',
          detalhes: `Sorteados: ${dados.sorteados.join(' | ')}`,
          fichasGanhas: dados.fichasGanhas,
        });
      } else mostrarErro(dados.erro ?? 'Erro ao jogar raspadinha.');
    } catch { mostrarErro('Não foi possível conectar ao servidor.'); }
    finally { setCarregando(false); }
  };

  const fecharJogo = () => { setJogoAtivo(null); setResultado(null); };

  return (
    <View style={styles.container}>
      <AppBar title="Jogos da Sorte" usuarioId={usuarioId} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Boas-vindas */}
        {!jogoAtivo && (
          <View style={styles.cardBoasVindas}>
            <Text style={styles.emoji}>🎰</Text>
            <Text style={styles.tituloBoasVindas}>Bem-vindo aos</Text>
            <Text style={styles.tituloDestaque}>Jogos da Sorte AR Bank</Text>
            <Text style={styles.subtituloBoasVindas}>Jogue com responsabilidade e boa sorte!</Text>
          </View>
        )}

        {/* Contador de fichas */}
        <View style={styles.cardFichasTopo}>
          <Text style={styles.fichasEmoji}>🪙</Text>
          <Text style={styles.fichasNumero}>{fichas}</Text>
          <Text style={styles.fichasLabel}>ficha{fichas !== 1 ? 's' : ''}</Text>
        </View>

        {/* Menu de jogos */}
        {!jogoAtivo && (
          <>
            <Text style={styles.secaoTitulo}>Escolha seu jogo</Text>
            {[
              { id: 'roleta', titulo: 'Roleta', emoji: '🎡', descricao: 'Aposte em cor (2x) ou número (36x)' },
              { id: 'dados', titulo: 'Dados', emoji: '🎲', descricao: 'Adivinhe a soma dos dados (10x)' },
              { id: 'raspadinha', titulo: 'Raspadinha', emoji: '🎟️', descricao: 'Três iguais e você ganha (9x)' },
            ].map((jogo) => (
              <TouchableOpacity
                key={jogo.id}
                style={styles.cardJogo}
                activeOpacity={0.8}
                onPress={() => { setJogoAtivo(jogo.id as JogoAtivo); setResultado(null); }}
              >
                <Text style={styles.jogoEmoji}>{jogo.emoji}</Text>
                <View style={styles.jogoInfo}>
                  <Text style={styles.jogoTitulo}>{jogo.titulo}</Text>
                  <Text style={styles.jogoDescricao}>{jogo.descricao}</Text>
                </View>
                <Text style={styles.jogoSeta}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ROLETA */}
        {jogoAtivo === 'roleta' && (
          <View style={styles.cardJogoAtivo}>
            <Text style={styles.jogoAtivoTitulo}>🎡 Roleta</Text>
            <Text style={styles.jogoAtivoRegra}>Cor: 2x | Número: 36x | 0 verde = casa ganha</Text>

            <Text style={styles.label}>Fichas a apostar:</Text>
            <TextInput style={styles.input} value={fichasRoleta} onChangeText={setFichasRoleta} keyboardType="number-pad" placeholder="Ex: 5" />

            <Text style={styles.label}>Tipo de aposta:</Text>
            <View style={styles.rowOpcoes}>
              {(['cor', 'numero'] as const).map((tipo) => (
                <TouchableOpacity key={tipo} style={[styles.opcao, apostasRoleta === tipo && styles.opcaoSelecionada]} onPress={() => setApostasRoleta(tipo)}>
                  <Text style={[styles.opcaoTexto, apostasRoleta === tipo && styles.opcaoTextoSelecionado]}>
                    {tipo === 'cor' ? 'Cor' : 'Número'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {apostasRoleta === 'cor' && (
              <>
                <Text style={styles.label}>Escolha a cor:</Text>
                <View style={styles.rowOpcoes}>
                  <TouchableOpacity style={[styles.opcaoCor, { backgroundColor: '#c0392b' }, corEscolhida === 'vermelho' && styles.opcaoCorSelecionada]} onPress={() => setCorEscolhida('vermelho')}>
                    <Text style={styles.opcaoCorTexto}>Vermelho</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.opcaoCor, { backgroundColor: '#222' }, corEscolhida === 'preto' && styles.opcaoCorSelecionada]} onPress={() => setCorEscolhida('preto')}>
                    <Text style={styles.opcaoCorTexto}>Preto</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {apostasRoleta === 'numero' && (
              <>
                <Text style={styles.label}>Escolha um número (1–36):</Text>
                <TextInput style={styles.input} value={numeroRoleta} onChangeText={setNumeroRoleta} keyboardType="number-pad" placeholder="Ex: 17" />
              </>
            )}

            {resultado && (
              <View style={[styles.cardResultado, { borderColor: resultado.ganhou ? '#2e7d32' : '#e74c3c' }]}>
                <Text style={styles.resultadoMensagem}>{resultado.mensagem}</Text>
                <Text style={styles.resultadoDetalhes}>{resultado.detalhes}</Text>
                <Text style={[styles.resultadoFichas, { color: resultado.ganhou ? '#2e7d32' : '#e74c3c' }]}>
                  {resultado.ganhou ? `+${resultado.fichasGanhas} fichas` : `-${fichasRoleta} fichas`}
                </Text>
              </View>
            )}

            {carregando ? <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} /> : (
              <>
                <StdButton title="Jogar" onPress={handleJogarRoleta} />
                <StdButton title="Voltar ao Menu" onPress={fecharJogo} backgroundColor={Cores.branco} textColor={Cores.azulEscuro} />
              </>
            )}
          </View>
        )}

        {/* DADOS */}
        {jogoAtivo === 'dados' && (
          <View style={styles.cardJogoAtivo}>
            <Text style={styles.jogoAtivoTitulo}>🎲 Dados</Text>
            <Text style={styles.jogoAtivoRegra}>Acerte a soma dos dois dados (2–12) e ganhe 10x</Text>

            <Text style={styles.label}>Fichas a apostar:</Text>
            <TextInput style={styles.input} value={fichasDados} onChangeText={setFichasDados} keyboardType="number-pad" placeholder="Ex: 5" />

            <Text style={styles.label}>Escolha um número (2–12):</Text>
            <TextInput style={styles.input} value={numeroDados} onChangeText={setNumeroDados} keyboardType="number-pad" placeholder="Ex: 7" />

            {resultado && (
              <View style={[styles.cardResultado, { borderColor: resultado.ganhou ? '#2e7d32' : '#e74c3c' }]}>
                <Text style={styles.resultadoMensagem}>{resultado.mensagem}</Text>
                <Text style={styles.resultadoDetalhes}>{resultado.detalhes}</Text>
                <Text style={[styles.resultadoFichas, { color: resultado.ganhou ? '#2e7d32' : '#e74c3c' }]}>
                  {resultado.ganhou ? `+${resultado.fichasGanhas} fichas` : `-${fichasDados} fichas`}
                </Text>
              </View>
            )}

            {carregando ? <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} /> : (
              <>
                <StdButton title="Jogar" onPress={handleJogarDados} />
                <StdButton title="Voltar ao Menu" onPress={fecharJogo} backgroundColor={Cores.branco} textColor={Cores.azulEscuro} />
              </>
            )}
          </View>
        )}

        {/* RASPADINHA */}
        {jogoAtivo === 'raspadinha' && (
          <View style={styles.cardJogoAtivo}>
            <Text style={styles.jogoAtivoTitulo}>🎟️ Raspadinha</Text>
            <Text style={styles.jogoAtivoRegra}>3 números iguais e você ganha 9x</Text>

            <Text style={styles.label}>Fichas a apostar:</Text>
            <TextInput style={styles.input} value={fichasRaspadinha} onChangeText={setFichasRaspadinha} keyboardType="number-pad" placeholder="Ex: 5" />

            <Text style={styles.label}>Escolha 3 números (1–9):</Text>
            <View style={styles.rowCampos}>
              {[{ v: campo1, s: setCampo1 }, { v: campo2, s: setCampo2 }, { v: campo3, s: setCampo3 }].map((c, i) => (
                <TextInput key={i} style={styles.inputRaspadinha} value={c.v} onChangeText={c.s} keyboardType="number-pad" placeholder="?" maxLength={1} />
              ))}
            </View>

            {resultado && (
              <View style={[styles.cardResultado, { borderColor: resultado.ganhou ? '#2e7d32' : '#e74c3c' }]}>
                <Text style={styles.resultadoMensagem}>{resultado.mensagem}</Text>
                <Text style={styles.resultadoDetalhes}>{resultado.detalhes}</Text>
                <Text style={[styles.resultadoFichas, { color: resultado.ganhou ? '#2e7d32' : '#e74c3c' }]}>
                  {resultado.ganhou ? `+${resultado.fichasGanhas} fichas` : `-${fichasRaspadinha} fichas`}
                </Text>
              </View>
            )}

            {carregando ? <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} /> : (
              <>
                <StdButton title="Jogar" onPress={handleJogarRaspadinha} />
                <StdButton title="Voltar ao Menu" onPress={fecharJogo} backgroundColor={Cores.branco} textColor={Cores.azulEscuro} />
              </>
            )}
          </View>
        )}

        {/* Comprar / Sacar fichas */}
        {!jogoAtivo && (
          <View style={styles.cardFichasAcoes}>
            <Text style={styles.secaoTitulo}>Fichas</Text>
            <Text style={styles.fichasValor}>Valor de saque: R$ {(fichas * 0.20).toFixed(2)}</Text>

            <Text style={styles.label}>Quantidade a comprar:</Text>
            <TextInput style={styles.input} value={qtdComprar} onChangeText={setQtdComprar} keyboardType="number-pad" placeholder="Ex: 10" />
            <Text style={styles.custoLabel}>
              Custo: R$ {(isNaN(parseInt(qtdComprar)) ? 0 : parseInt(qtdComprar) * 0.20).toFixed(2)}
            </Text>

            {carregando ? <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} /> : (
              <>
                <StdButton title="Comprar Fichas" onPress={handleComprarFichas} />
                <StdButton title="Sacar Fichas" onPress={handleSacarFichas} backgroundColor={fichas > 0 ? Cores.verde : '#ccc'} textColor={Cores.branco} />
              </>
            )}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <FloatingOptions usuarioId={usuarioId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.azulFundo },
  scrollContent: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 20, width: '100%' },
  cardBoasVindas: { backgroundColor: Cores.azulEscuro, borderRadius: 16, padding: 28, alignItems: 'center', width: '100%', marginBottom: 16 },
  emoji: { fontSize: 48, marginBottom: 8 },
  tituloBoasVindas: { color: '#fff', fontSize: 16, opacity: 0.8 },
  tituloDestaque: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  subtituloBoasVindas: { color: '#fff', fontSize: 13, opacity: 0.6, marginTop: 8, textAlign: 'center' },
  cardFichasTopo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, width: '100%', marginBottom: 20, gap: 8, elevation: 2 },
  fichasEmoji: { fontSize: 28 },
  fichasNumero: { fontSize: 32, fontWeight: 'bold', color: Cores.azulEscuro },
  fichasLabel: { fontSize: 14, color: '#888', alignSelf: 'flex-end', marginBottom: 4 },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', alignSelf: 'flex-start', marginBottom: 12 },
  cardJogo: { backgroundColor: '#fff', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12, elevation: 2 },
  jogoEmoji: { fontSize: 36, marginRight: 16 },
  jogoInfo: { flex: 1 },
  jogoTitulo: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  jogoDescricao: { fontSize: 13, color: '#888', marginTop: 2 },
  jogoSeta: { fontSize: 28, color: Cores.azulClaro, fontWeight: 'bold' },
  cardJogoAtivo: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', marginBottom: 16, elevation: 2 },
  jogoAtivoTitulo: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  jogoAtivoRegra: { fontSize: 13, color: '#888', marginBottom: 20, fontStyle: 'italic' },
  label: { fontSize: 15, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 20, padding: 8, fontSize: 16 },
  rowOpcoes: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  opcao: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  opcaoSelecionada: { borderColor: Cores.azulClaro, backgroundColor: Cores.azulFundo },
  opcaoTexto: { fontSize: 15, color: '#555', fontWeight: '600' },
  opcaoTextoSelecionado: { color: Cores.azulEscuro },
  opcaoCor: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  opcaoCorSelecionada: { borderColor: '#FFD700' },
  opcaoCorTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  rowCampos: { flexDirection: 'row', gap: 16, marginBottom: 20, justifyContent: 'center' },
  inputRaspadinha: { width: 64, height: 64, borderWidth: 2, borderColor: '#ccc', borderRadius: 12, textAlign: 'center', fontSize: 28, fontWeight: 'bold', color: Cores.azulEscuro },
  cardResultado: { borderWidth: 2, borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  resultadoMensagem: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  resultadoDetalhes: { fontSize: 14, color: '#666', marginBottom: 6 },
  resultadoFichas: { fontSize: 16, fontWeight: 'bold' },
  cardFichasAcoes: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', marginTop: 8, elevation: 2 },
  fichasValor: { color: '#555', fontSize: 14, marginBottom: 16 },
  custoLabel: { fontSize: 13, color: '#888', marginBottom: 16, fontStyle: 'italic' },
});
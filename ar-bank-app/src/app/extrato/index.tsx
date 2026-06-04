import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { Calendario } from '@/components/Calendario';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

type Transacao = {
  id: string;
  valor: number;
  tipo: 'ENVIADO' | 'RECEBIDO';
  remetente: string;
  destinatario: string;
  status: string;
  dataTransacao: string;
};

export default function Extrato() {
  const router = useRouter();
  const { usuario } = useLocalSearchParams();
  const dadosUsuario = usuario ? JSON.parse(usuario as string) : null;

  const [filtroAtivo, setFiltroAtivo] = useState<'dia' | 'mes' | 'ano'>('mes');
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarExtrato = async () => {
      if (!dadosUsuario?.id) {
        setErro('Usuário não identificado.');
        setCarregando(false);
        return;
      }
      try {
        const resposta = await fetch(`${API_URL}/extrato/${dadosUsuario.id}`);
        const dados = await resposta.json();

        if (!resposta.ok) {
          setErro(dados.erro ?? 'Erro ao buscar extrato.');
          return;
        }

        setTransacoes(dados.transacoes);
      } catch {
        setErro('Não foi possível conectar ao servidor.');
      } finally {
        setCarregando(false);
      }
    };

    buscarExtrato();
  }, []);

  const transacoesFiltradas = transacoes.filter((t) => {
    const data = new Date(t.dataTransacao);
    const agora = new Date();
    if (filtroAtivo === 'dia') {
      return data.toDateString() === agora.toDateString();
    }
    if (filtroAtivo === 'mes') {
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    }
    return data.getFullYear() === agora.getFullYear();
  });

  return (
    <View style={styles.container}>
      <AppBar title="Meu Extrato" />

      <View style={styles.layoutWrapper}>
        <ScrollView
          contentContainerStyle={styles.content}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.blocoCentralizado}>

            {/* FILTROS */}
            <View style={styles.containerFiltros}>
              {(['dia', 'mes', 'ano'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.botaoFiltro, filtroAtivo === f && styles.filtroSelecionado]}
                  onPress={() => setFiltroAtivo(f)}
                >
                  <Text style={[styles.textoFiltro, filtroAtivo === f && styles.textoSelecionado]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CALENDÁRIO COM TRANSAÇÕES REAIS */}
            <View style={styles.extratoContainer}>
              {carregando ? (
                <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginTop: 40 }} />
              ) : erro ? (
                <Text style={styles.textoErro}>{erro}</Text>
              ) : (
                <Calendario transacoes={transacoesFiltradas} />
              )}
            </View>

          </View>

          <View style={styles.btnWrapper}>
            <StdButton
              title="Voltar à Tela Inicial"
              onPress={() => router.replace('/menu')}
              backgroundColor={Cores.azulClaro}
              textColor="#FFFFFF"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: Cores.azulFundo },
  layoutWrapper:     { flex: 1, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  scrollView:        { flex: 1, width: '100%' },
  content:           { alignItems: 'center', paddingTop: 32, paddingBottom: 40, width: '100%' },
  blocoCentralizado: { width: '92%', maxWidth: 950, alignItems: 'stretch' },
  containerFiltros:  {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Cores.azulClaro, paddingVertical: 10, paddingHorizontal: 40,
    borderRadius: 16, marginBottom: 24, width: '100%',
  },
  botaoFiltro:       { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 24, minWidth: 90, alignItems: 'center' },
  filtroSelecionado: { backgroundColor: '#FFFFFF', elevation: 2 },
  textoFiltro:       { color: '#FFF', fontWeight: '600', fontSize: 15 },
  textoSelecionado:  { color: Cores.azulEscuro, fontWeight: 'bold' },
  extratoContainer:  { width: '100%' },
  textoErro:         { textAlign: 'center', color: '#e74c3c', fontSize: 15, marginTop: 40 },
  btnWrapper:        { width: '92%', maxWidth: 950, marginTop: 40 },
});
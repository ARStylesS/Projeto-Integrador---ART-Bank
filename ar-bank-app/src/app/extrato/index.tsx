import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { Calendario } from '@/components/Calendario';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';
import { FloatingOptions } from '@/components/FloatingOptions';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

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
  const { usuario, id } = useLocalSearchParams();
  
  // Extrai o ID de forma dinâmica e flexível
  let usuarioId = id ? String(id) : "1";
  if (!id && usuario) {
    try {
      const parsed = JSON.parse(usuario as string);
      usuarioId = parsed.id ? String(parsed.id) : "1";
    } catch {
      usuarioId = "1";
    }
  }

  const [filtroAtivo, setFiltroAtivo] = useState<'dia' | 'mes' | 'ano'>('mes');
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarExtrato = async () => {
      if (!usuarioId) {
        setErro('Usuário não identificado.');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        const resposta = await fetch(`${API_URL}/extrato/${usuarioId}`);
        const dados = await resposta.json();

        if (!resposta.ok) {
          setErro(dados.erro ?? 'Erro ao buscar extrato.');
          setTransacoes([]);
          return;
        }

        setTransacoes(Array.isArray(dados.transacoes) ? dados.transacoes : []);
        setErro('');
      } catch (err) {
        console.error("Erro na requisição do extrato:", err);
        setErro('Não foi possível conectar ao servidor.');
        setTransacoes([]);
      } finally {
        setCarregando(false);
      }
    };

    buscarExtrato();
  }, [usuarioId]);

  const transacoesFiltradas = Array.isArray(transacoes) 
    ? transacoes.filter((t) => {
        if (!t || !t.dataTransacao) return false;
        const data = new Date(t.dataTransacao);
        const agora = new Date();
        if (filtroAtivo === 'dia') {
          return data.toDateString() === agora.toDateString();
        }
        if (filtroAtivo === 'mes') {
          return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
        }
        return data.getFullYear() === agora.getFullYear();
      })
    : [];

  // CORREÇÃO: Utiliza o histórico nativo para retornar de forma limpa e revalidar dados no Menu
  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/menu',
        params: { id: usuarioId }
      });
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title="Meu Extrato" usuarioId={usuarioId}/>

      <View style={styles.layoutWrapper}>
        <ScrollView contentContainerStyle={styles.content} style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.blocoCentralizado}>
            <View style={styles.containerFiltros}>
              {(['dia', 'mes', 'ano'] as const).map((f) => (
                <TouchableOpacity key={f} style={[styles.botaoFiltro, filtroAtivo === f && styles.filtroSelecionado]} onPress={() => setFiltroAtivo(f)}>
                  <Text style={[styles.textoFiltro, filtroAtivo === f && styles.textoSelecionado]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
        </ScrollView>
        <FloatingOptions usuarioId={usuarioId} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.azulFundo },
  layoutWrapper: { flex: 1, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  scrollView: { flex: 1, width: '100%' },
  content: { alignItems: 'center', paddingTop: 32, paddingBottom: 40, width: '100%' },
  blocoCentralizado: { width: '92%', maxWidth: 950, alignItems: 'stretch' },
  containerFiltros: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Cores.azulClaro, paddingVertical: 10, paddingHorizontal: 40, borderRadius: 16, marginBottom: 24, width: '100%' },
  botaoFiltro: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 24, minWidth: 90, alignItems: 'center' },
  filtroSelecionado: { backgroundColor: '#FFFFFF', elevation: 2 },
  textoFiltro: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  textoSelecionado: { color: Cores.azulEscuro, fontWeight: 'bold' },
  extratoContainer: { width: '100%' },
  textoErro: { textAlign: 'center', color: '#e74c3c', fontSize: 15, marginTop: 40 },
  btnWrapper: { width: '92%', maxWidth: 950, marginTop: 40 }
});
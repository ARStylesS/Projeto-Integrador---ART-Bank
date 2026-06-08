import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { Calendario } from '@/components/Calendario';
import { Cores } from '../../styles/global';
import { FloatingOptions } from '@/components/FloatingOptions';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

type Transacao = {
  id: string;
  valor: number;
  tipo: 'ENVIADO' | 'RECEBIDO' | 'EMPRESTIMO';
  descricao?: string;
  remetente: string;
  destinatario: string;
  status: string;
  dataTransacao: string;
  parcelas?: number | null;
  valorParcela?: number | null;
};

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Extrato() {
  const router = useRouter();
  const { usuario, id } = useLocalSearchParams();
  
  let usuarioId = id ? String(id) : "1";
  if (!id && usuario) {
    try {
      const parsed = JSON.parse(usuario as string);
      usuarioId = parsed.id ? String(parsed.id) : "1";
    } catch {
      usuarioId = "1";
    }
  }

  const dataAtual = new Date();
  const [anoSelecionado, setAnoSelecionado] = useState<number>(dataAtual.getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number>(dataAtual.getMonth());

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
        const dataItem = new Date(t.dataTransacao);
        return dataItem.getFullYear() === anoSelecionado && dataItem.getMonth() === mesSelecionado;
      })
    : [];

  const navegarMesAnterior = () => {
    if (mesSelecionado === 0) {
      setMesSelecionado(11);
      setAnoSelecionado((prev) => prev - 1);
    } else {
      setMesSelecionado((prev) => prev - 1);
    }
  };

  const navegarProximoMes = () => {
    if (mesSelecionado === 11) {
      setMesSelecionado(0);
      setAnoSelecionado((prev) => prev + 1);
    } else {
      setMesSelecionado((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title="Meu Extrato" usuarioId={usuarioId} />

      <View style={styles.layoutWrapper}>
        <ScrollView contentContainerStyle={styles.content} style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.blocoCentralizado}>
            
            <View style={styles.containerPaginacaoMes}>
              <TouchableOpacity style={styles.btnSeta} onPress={navegarMesAnterior}>
                <Text style={styles.textoSeta}>◀</Text>
              </TouchableOpacity>

              <View style={styles.containerTextoData}>
                <Text style={styles.textoMesVisivel}>{NOMES_MESES[mesSelecionado]}</Text>
                <Text style={styles.textoAnoVisivel}>{anoSelecionado}</Text>
              </View>

              <TouchableOpacity style={styles.btnSeta} onPress={navegarProximoMes}>
                <Text style={styles.textoSeta}>▶</Text>
              </TouchableOpacity>
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
  containerPaginacaoMes: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: Cores.azulClaro, 
    paddingVertical: 14, 
    paddingHorizontal: 30, 
    borderRadius: 16, 
    marginBottom: 24, 
    width: '100%', 
    elevation: 3 
  },
  btnSeta: { padding: 10, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  textoSeta: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  containerTextoData: { alignItems: 'center', flex: 1 },
  textoMesVisivel: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 20 },
  textoAnoVisivel: { color: '#FFFFFF', fontSize: 13, opacity: 0.8, marginTop: 2, fontWeight: '500' },
  extratoContainer: { width: '100%' },
  textoErro: { textAlign: 'center', color: '#e74c3c', fontSize: 15, marginTop: 40 }
});
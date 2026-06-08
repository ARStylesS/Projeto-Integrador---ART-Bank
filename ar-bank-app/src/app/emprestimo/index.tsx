import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';
import { FloatingOptions } from '@/components/FloatingOptions';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

type Etapa = 'formulario' | 'simulacao' | 'concluida';

type SimulacaoData = {
  valorEmprestado: number;
  parcelas: number;
  taxaMensal: number;
  valorParcela: number;
  montanteFinal: number;
};

function calcularTaxaMensal(parcelas: number): number {
  const acrescimo = Math.floor(parcelas / 12);
  return (3 + acrescimo) / 100;
}

function calcularParcela(valor: number, taxaMensal: number, parcelas: number): number {
  const i = taxaMensal;
  const n = parcelas;
  const fator = Math.pow(1 + i, n);
  return valor * (i * fator) / (fator - 1);
}

export default function Emprestimo() {
  const router = useRouter();
  const { id, usuario } = useLocalSearchParams();

  let usuarioId = id ? String(id) : '1';
  if (!id && usuario) {
    try {
      const parsed = JSON.parse(usuario as string);
      usuarioId = parsed.id ? String(parsed.id) : '1';
    } catch {
      usuarioId = '1';
    }
  }

  const [etapa, setEtapa] = useState<Etapa>('formulario');
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [simulacao, setSimulacao] = useState<SimulacaoData | null>(null);

  const mostrarErro = (msg: string) => {
    if (Platform.OS === 'web') alert('Erro: ' + msg);
    else Alert.alert('Erro', msg);
  };

  const handleSimular = async () => {
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    const parcelasNumericas = parseInt(parcelas);

    if (!valor || !parcelas || !senha) {
      mostrarErro('Preencha todos os campos.');
      return;
    }
    if (isNaN(valorNumerico) || valorNumerico < 100 || valorNumerico > 50000) {
      mostrarErro('O valor deve ser entre R$ 100,00 e R$ 50.000,00.');
      return;
    }
    if (isNaN(parcelasNumericas) || parcelasNumericas < 2 || parcelasNumericas > 72) {
      mostrarErro('A quantidade de parcelas deve ser entre 2 e 72.');
      return;
    }

    setCarregando(true);
    try {
      const respostaSenha = await fetch(`${API_URL}/auth/validar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, senha }),
      });

      const dadosSenha = await respostaSenha.json();
      if (!respostaSenha.ok) {
        mostrarErro(dadosSenha.erro ?? 'Senha incorreta.');
        return;
      }

      const taxaMensal = calcularTaxaMensal(parcelasNumericas);
      const valorParcela = calcularParcela(valorNumerico, taxaMensal, parcelasNumericas);
      const montanteFinal = valorParcela * parcelasNumericas;

      setSimulacao({
        valorEmprestado: valorNumerico,
        parcelas: parcelasNumericas,
        taxaMensal,
        valorParcela,
        montanteFinal,
      });

      setEtapa('simulacao');
    } catch {
      mostrarErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmar = async () => {
    if (!simulacao) return;
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/emprestimo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId,
          valor: simulacao.valorEmprestado,
          parcelas: simulacao.parcelas,
          taxaMensal: simulacao.taxaMensal,
          valorParcela: simulacao.valorParcela,
          montanteFinal: simulacao.montanteFinal,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarErro(dados.erro ?? 'Erro ao contratar empréstimo.');
        setEtapa('formulario');
        return;
      }

      setEtapa('concluida');
    } catch {
      mostrarErro('Não foi possível conectar ao servidor.');
      setEtapa('formulario');
    } finally {
      setCarregando(false);
    }
  };

  if (etapa === 'formulario') {
    return (
      <View style={styles.container}>
        <AppBar title="Empréstimo Pessoal" usuarioId={usuarioId} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.header}>Simule seu empréstimo</Text>

            <Text style={styles.label}>Valor desejado (R$ 100 – R$ 50.000):</Text>
            <TextInput
              style={styles.input}
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
              placeholder="Ex: 5000,00"
            />

            <Text style={styles.label}>Número de parcelas (2 – 72 meses):</Text>
            <TextInput
              style={styles.input}
              value={parcelas}
              onChangeText={setParcelas}
              keyboardType="number-pad"
              placeholder="Ex: 12"
            />

            <Text style={styles.label}>Sua senha:</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholder="••••••"
            />

            <Text style={styles.infoTaxa}>
              💡 Taxa base: 3% a.m. +1% a cada 12 meses contratados.
            </Text>

            {carregando ? (
              <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <StdButton title="Simular Empréstimo" onPress={handleSimular} />
                <StdButton
                  title="Cancelar"
                  onPress={() => router.replace({ pathname: '/menu', params: { id: usuarioId } })}
                  backgroundColor={Cores.branco}
                  textColor={Cores.azulEscuro}
                />
              </>
            )}
          </View>
        </ScrollView>
        <FloatingOptions usuarioId={usuarioId} />
      </View>
    );
  }

  if (etapa === 'simulacao' && simulacao) {
    return (
      <View style={styles.container}>
        <AppBar title="Empréstimo Pessoal" usuarioId={usuarioId} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.header}>Resumo da Simulação</Text>

            <Text style={styles.label}>Valor emprestado:</Text>
            <Text style={styles.info}>R$ {simulacao.valorEmprestado.toFixed(2)}</Text>

            <Text style={styles.label}>Parcelas:</Text>
            <Text style={styles.info}>{simulacao.parcelas}x mensais</Text>

            <Text style={styles.label}>Taxa de juros:</Text>
            <Text style={styles.info}>{(simulacao.taxaMensal * 100).toFixed(0)}% ao mês</Text>

            <Text style={styles.label}>Valor de cada parcela:</Text>
            <Text style={styles.info}>R$ {simulacao.valorParcela.toFixed(2)}</Text>

            <Text style={styles.label}>Montante total a pagar:</Text>
            <Text style={[styles.info, { color: '#e53935' }]}>
              R$ {simulacao.montanteFinal.toFixed(2)}
            </Text>

            {carregando ? (
              <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <StdButton title="Contratar Empréstimo" onPress={handleConfirmar} />
                <StdButton
                  title="Refazer Simulação"
                  onPress={() => setEtapa('formulario')}
                  backgroundColor={Cores.branco}
                  textColor={Cores.azulEscuro}
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.containerConcluida}>
      <AppBar title="Empréstimo Pessoal" usuarioId={usuarioId} />
      <View style={styles.cardConcluida}>
        <Text style={styles.iconeSucesso}>✓</Text>
        <Text style={styles.header}>Empréstimo Contratado!</Text>
        <Text style={styles.subTexto}>
          R$ {simulacao?.valorEmprestado.toFixed(2)} foram creditados na sua conta em{' '}
          {simulacao?.parcelas}x de R$ {simulacao?.valorParcela.toFixed(2)}.
        </Text>
        <StdButton
          title="OK"
          onPress={() => router.replace({ pathname: '/menu', params: { id: usuarioId } })}
          backgroundColor={Cores.verde}
          textColor={Cores.branco}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: Cores.azulFundo },
  scrollContent: { paddingBottom: 40, width: '100%', alignItems: 'center', paddingVertical: 20, flexGrow: 1 },
  form: { padding: 24, backgroundColor: '#FFFFFF', borderRadius: 12, width: '80%' },
  header: { fontWeight: 'bold', fontSize: 24, marginBottom: 32, color: '#333' },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#555' },
  input: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 32, padding: 8, fontSize: 16 },
  infoTaxa: { fontSize: 13, color: '#888', marginBottom: 24, fontStyle: 'italic' },
  info: { fontSize: 22, fontWeight: 'bold', color: Cores.azulEscuro, marginBottom: 24 },
  containerConcluida: { flex: 1, backgroundColor: Cores.azulFundo },
  cardConcluida: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconeSucesso: { fontSize: 64, color: Cores.verde, marginBottom: 16 },
  subTexto: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 32 },
});
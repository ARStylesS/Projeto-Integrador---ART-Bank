import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';
import { AppBar } from '@/components/AppBar';
import bcrypt from 'bcryptjs';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

type Etapa = 'formulario' | 'confirmacao' | 'concluida';

export default function Transfer() {
  const router = useRouter();
  const { usuario } = useLocalSearchParams();
  const dadosUsuario = usuario ? JSON.parse(usuario as string) : null;

  const [etapa, setEtapa] = useState<Etapa>('formulario');
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [valor, setValor] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const mostrarErro = (msg: string) => {
    if (Platform.OS === 'web') {
      alert('Erro: ' + msg);
    } else {
      Alert.alert('Erro', msg);
    }
  };

  // ETAPA 1 → 2: valida campos e senha antes de mostrar confirmação
  const handleContinuar = async () => {
    if (!emailDestinatario || !valor || !senha) {
      mostrarErro('Preencha todos os campos.');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      mostrarErro('Informe um valor válido.');
      return;
    }

    if (!dadosUsuario?.id) {
      mostrarErro('Sessão expirada. Faça login novamente.');
      router.replace('/login');
      return;
    }

    setCarregando(true);
    try {
      // Valida senha do usuário logado
      const respostaSenha = await fetch(`${API_URL}/auth/validar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: dadosUsuario.id, senha }),
      });

      const dadosSenha = await respostaSenha.json();
      if (!respostaSenha.ok) {
        mostrarErro(dadosSenha.erro ?? 'Senha incorreta.');
        return;
      }

      setEtapa('confirmacao');
    } catch {
      mostrarErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2 → 3: executa a transferência
  const handleConfirmar = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/transferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remetenteId: dadosUsuario.id,
          destinatarioEmail: emailDestinatario,
          valor: parseFloat(valor.replace(',', '.')),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarErro(dados.erro ?? 'Erro ao realizar transferência.');
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

  // ─── ETAPA 1: Formulário ───────────────────────────────────────────────────
  if (etapa === 'formulario') {
    return (
      <View style={styles.container}>
        <AppBar title="Fazer Transferência" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.header}>Para quem deseja transferir?</Text>

            <Text style={styles.label}>Email do destinatário:</Text>
            <TextInput
              style={styles.input}
              value={emailDestinatario}
              onChangeText={setEmailDestinatario}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@exemplo.com"
            />

            <Text style={styles.label}>Valor a transferir:</Text>
            <TextInput
              style={styles.input}
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
              placeholder="0,00"
            />

            <Text style={styles.label}>Sua senha:</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholder="••••••"
            />

            {carregando ? (
              <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <StdButton title="Continuar" onPress={handleContinuar} />
                <StdButton
                  title="Cancelar"
                  onPress={() => router.replace('/menu')}
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

  // ─── ETAPA 2: Confirmação ─────────────────────────────────────────────────
  if (etapa === 'confirmacao') {
    return (
      <View style={styles.container}>
        <AppBar title="Fazer Transferência" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.header}>Confirme as informações</Text>

            <Text style={styles.label}>Destinatário:</Text>
            <Text style={styles.info}>{emailDestinatario}</Text>

            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.info}>
              R$ {parseFloat(valor.replace(',', '.')).toFixed(2)}
            </Text>

            <Text style={styles.label}>Remetente:</Text>
            <Text style={styles.info}>{dadosUsuario?.nome ?? 'Você'}</Text>

            {carregando ? (
              <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <StdButton title="Confirmar Transferência" onPress={handleConfirmar} />
                <StdButton
                  title="Corrigir Informações"
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

  // ─── ETAPA 3: Concluída ───────────────────────────────────────────────────
  return (
    <View style={styles.containerConcluida}>
      <AppBar title="Fazer Transferência" />
      <View style={styles.cardConcluida}>
        <Text style={styles.iconeSucesso}>✓</Text>
        <Text style={styles.header}>Transferência Concluída!</Text>
        <Text style={styles.subTexto}>
          R$ {parseFloat(valor.replace(',', '.')).toFixed(2)} enviados para {emailDestinatario}.
        </Text>
        <StdButton
          title="OK"
          onPress={() => router.replace('/menu')}
          backgroundColor={Cores.verde}
          textColor={Cores.branco}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Cores.azulFundo,
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    flexGrow: 1,
  },
  form: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 32,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 32,
    padding: 8,
  },
  info: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Cores.azulEscuro,
    marginBottom: 24,
  },
  containerConcluida: {
    flex: 1,
    backgroundColor: Cores.azulFundo,
  },
  cardConcluida: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconeSucesso: {
    fontSize: 64,
    color: Cores.verde,
    marginBottom: 16,
  },
  subTexto: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
});
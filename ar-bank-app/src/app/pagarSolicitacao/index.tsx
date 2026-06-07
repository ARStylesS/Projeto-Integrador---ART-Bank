import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

type Etapa = 'formulario' | 'confirmacao' | 'concluida';

type DadosBilhete = {
  codigo: string;
  nomeSolicitante: string;
  valor: number;
  expiradoEm: string;
};

export default function PagarSolicitacao() {
  const router = useRouter();
  const { id, usuario } = useLocalSearchParams();

  let usuarioId = id ? String(id) : '1';
  if (!id && usuario) {
    try {
      const parsed = JSON.parse(usuario as string);
      usuarioId = parsed.id ? String(parsed.id) : '1';
    } catch { usuarioId = '1'; }
  }

  const [etapa, setEtapa] = useState<Etapa>('formulario');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [dadosBilhete, setDadosBilhete] = useState<DadosBilhete | null>(null);

  const mostrarErro = (msg: string) => {
    if (Platform.OS === 'web') alert('Erro: ' + msg);
    else Alert.alert('Erro', msg);
  };

  // ETAPA 1 → 2: lê o bilhete e valida a senha
  const handleLerBilhete = async () => {
    if (!codigo.trim()) { mostrarErro('Informe o código do bilhete.'); return; }
    if (!senha) { mostrarErro('Informe sua senha.'); return; }

    setCarregando(true);
    try {
      // Valida senha
      const respostaSenha = await fetch(`${API_URL}/auth/validar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, senha }),
      });
      const dadosSenha = await respostaSenha.json();
      if (!respostaSenha.ok) { mostrarErro(dadosSenha.erro ?? 'Senha incorreta.'); return; }

      // Lê o bilhete
      const respostaBilhete = await fetch(`${API_URL}/solicitacao/ler/${codigo.trim().toUpperCase()}`);
      const dados = await respostaBilhete.json();
      if (!respostaBilhete.ok) { mostrarErro(dados.erro ?? 'Bilhete inválido.'); return; }

      setDadosBilhete(dados.bilhete);
      setEtapa('confirmacao');
    } catch {
      mostrarErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2 → 3: confirma e executa o pagamento
  const handleConfirmar = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/solicitacao/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, codigo: codigo.trim().toUpperCase(), senha }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setEtapa('concluida');
      } else {
        mostrarErro(dados.erro ?? 'Erro ao pagar solicitação.');
        setEtapa('formulario');
      }
    } catch {
      mostrarErro('Não foi possível conectar ao servidor.');
      setEtapa('formulario');
    } finally {
      setCarregando(false);
    }
  };

  // ─── ETAPA 1: Formulário ────────────────────────────────────────────────────
  if (etapa === 'formulario') {
    return (
      <View style={styles.container}>
        <AppBar title="Pagar Solicitação" usuarioId={usuarioId} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.header}>Pagar Solicitação</Text>

            <Text style={styles.label}>Código do bilhete:</Text>
            <TextInput
              style={styles.input}
              value={codigo}
              onChangeText={setCodigo}
              autoCapitalize="characters"
              placeholder="Ex: 123456789ABC"
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
                <StdButton title="Verificar Bilhete" onPress={handleLerBilhete} />
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
      </View>
    );
  }

  // ─── ETAPA 2: Confirmação ───────────────────────────────────────────────────
  if (etapa === 'confirmacao') {
    return (
      <View style={styles.container}>
        <AppBar title="Pagar Solicitação" usuarioId={usuarioId} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.header}>Confirme o Pagamento</Text>

            <Text style={styles.label}>Solicitante:</Text>
            <Text style={styles.info}>{dadosBilhete?.nomeSolicitante}</Text>

            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.info}>R$ {dadosBilhete?.valor.toFixed(2)}</Text>

            <Text style={styles.label}>Código:</Text>
            <Text style={styles.infoCodigo}>{dadosBilhete?.codigo}</Text>

            <Text style={styles.label}>Expira em:</Text>
            <Text style={styles.infoExpira}>
              {dadosBilhete ? new Date(dadosBilhete.expiradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>

            {carregando ? (
              <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <StdButton title="Confirmar Pagamento" onPress={handleConfirmar} />
                <StdButton
                  title="Corrigir Código"
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

  // ─── ETAPA 3: Concluída ─────────────────────────────────────────────────────
  return (
    <View style={styles.containerConcluida}>
      <AppBar title="Pagar Solicitação" usuarioId={usuarioId} />
      <View style={styles.cardConcluida}>
        <Text style={styles.iconeSucesso}>✓</Text>
        <Text style={styles.header}>Pagamento Realizado!</Text>
        <Text style={styles.subTexto}>
          R$ {dadosBilhete?.valor.toFixed(2)} enviados para {dadosBilhete?.nomeSolicitante}.
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
  info: { fontSize: 22, fontWeight: 'bold', color: Cores.azulEscuro, marginBottom: 24 },
  infoCodigo: { fontSize: 20, fontWeight: 'bold', color: Cores.azulEscuro, letterSpacing: 3, marginBottom: 24 },
  infoExpira: { fontSize: 16, color: '#e74c3c', fontWeight: '600', marginBottom: 24 },
  containerConcluida: { flex: 1, backgroundColor: Cores.azulFundo },
  cardConcluida: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconeSucesso: { fontSize: 64, color: Cores.verde, marginBottom: 16 },
  subTexto: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 32 },
});

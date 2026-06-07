import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

type Etapa = 'formulario' | 'bilhete';

type Bilhete = {
  codigo: string;
  nomeSolicitante: string;
  valor: number;
  expiradoEm: string;
};

export default function GerarSolicitacao() {
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
  const [valor, setValor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [bilhete, setBilhete] = useState<Bilhete | null>(null);

  const mostrarErro = (msg: string) => {
    if (Platform.OS === 'web') alert('Erro: ' + msg);
    else Alert.alert('Erro', msg);
  };

  const handleGerar = async () => {
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      mostrarErro('Informe um valor válido.'); return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/solicitacao/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, valor: valorNumerico }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setBilhete(dados.bilhete);
        setEtapa('bilhete');
      } else {
        mostrarErro(dados.erro ?? 'Erro ao gerar solicitação.');
      }
    } catch {
      mostrarErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // ─── ETAPA 1: Formulário ────────────────────────────────────────────────────
  if (etapa === 'formulario') {
    return (
      <View style={styles.container}>
        <AppBar title="Gerar Solicitação" usuarioId={usuarioId} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.header}>Solicitar Transferência</Text>

            <Text style={styles.label}>Valor solicitado:</Text>
            <TextInput
              style={styles.input}
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
              placeholder="0,00"
            />

            <Text style={styles.infoTexto}>
              💡 Será gerado um bilhete único válido por 1 hora.
            </Text>

            {carregando ? (
              <ActivityIndicator size="large" color={Cores.azulClaro} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <StdButton title="Gerar Bilhete" onPress={handleGerar} />
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

  // ─── ETAPA 2: Bilhete gerado ────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <AppBar title="Gerar Solicitação" usuarioId={usuarioId} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.header}>Bilhete Gerado! 🎫</Text>

          <Text style={styles.infoTexto}>
            Compartilhe o código abaixo com quem deve realizar o pagamento.
          </Text>

          <View style={styles.cardBilhete}>
            <Text style={styles.bilheteTitulo}>Solicitante</Text>
            <Text style={styles.bilheteValor}>{bilhete?.nomeSolicitante}</Text>

            <Text style={styles.bilheteTitulo}>Valor</Text>
            <Text style={styles.bilheteValor}>R$ {bilhete?.valor.toFixed(2)}</Text>

            <Text style={styles.bilheteTitulo}>Código do Bilhete</Text>
            <Text style={styles.bilheteCodigo}>{bilhete?.codigo}</Text>

            <Text style={styles.bilheteTitulo}>Expira em</Text>
            <Text style={styles.bilheteExpira}>
              {bilhete ? new Date(bilhete.expiradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>

          <StdButton
            title="Voltar ao Menu"
            onPress={() => router.replace({ pathname: '/menu', params: { id: usuarioId } })}
          />
          <StdButton
            title="Gerar Outro Bilhete"
            onPress={() => { setBilhete(null); setValor(''); setEtapa('formulario'); }}
            backgroundColor={Cores.branco}
            textColor={Cores.azulEscuro}
          />
        </View>
      </ScrollView>
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
  infoTexto: { fontSize: 13, color: '#888', marginBottom: 24, fontStyle: 'italic' },
  cardBilhete: {
    backgroundColor: Cores.azulFundo,
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Cores.azulClaro,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  bilheteTitulo: { fontSize: 12, color: '#888', fontWeight: '600', marginTop: 12, textTransform: 'uppercase' },
  bilheteValor: { fontSize: 18, fontWeight: 'bold', color: Cores.azulEscuro, marginTop: 4 },
  bilheteCodigo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Cores.azulEscuro,
    letterSpacing: 4,
    marginTop: 4,
    textAlign: 'center',
  },
  bilheteExpira: { fontSize: 14, color: '#e74c3c', fontWeight: '600', marginTop: 4 },
});

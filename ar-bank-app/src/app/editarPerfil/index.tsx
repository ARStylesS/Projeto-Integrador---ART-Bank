import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';
import { AppBar } from '@/components/AppBar';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 
  (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

export default function EditarPerfil() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  let usuarioId = "1";
  if (params.id) {
    usuarioId = String(params.id);
  } else if (params.usuario) {
    try {
      const parsed = JSON.parse(params.usuario as string);
      usuarioId = parsed.id ? String(parsed.id) : "1";
    } catch {
      usuarioId = "1";
    }
  }

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [username, setUsername] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`);
        const dados = await resposta.json();
        
        if (resposta.ok) {
          setUsername(dados.usuario || ''); 
          setNome(dados.nome || dados.name || ''); 
          setEmail(dados.email || '');
          setTelefone(dados.telefone || '');
          setCelular(dados.celular || ''); 
        } else {
          const msgErro = dados.erro || 'Erro ao carregar dados.';
          if (Platform.OS === 'web') alert(msgErro);
          else Alert.alert('Erro', msgErro);
        }
      } catch (error) {
        console.error("[FETCH ERROR] Falha ao carregar dados do perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarPerfil();
  }, [usuarioId]);

  const handleSalvar = async () => {
    if (salvando) return;

    if (!username.trim() || !nome.trim() || !email.trim() || !celular.trim()) {
      const msgValidacao = 'Os campos Usuário, Nome, E-mail e Celular são obrigatórios.';
      if (Platform.OS === 'web') alert(msgValidacao);
      else Alert.alert('Aviso', msgValidacao);
      return;
    }

    setSalvando(true);
    try {
      const telefoneLimpo = telefone ? telefone.replace(/\D/g, '') : "";
      const celularLimpo = celular ? celular.replace(/\D/g, '') : "";

      console.log(`[HTTP PUT] Transmitindo dados para: ${API_URL}/perfil/${usuarioId}`);

      const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          usuario: username.trim(),
          nome: nome.trim(), 
          email: email.trim().toLowerCase(), 
          telefone: telefoneLimpo, 
          celular: celularLimpo   
        }),
      });

      const textoResposta = await resposta.text();
      let dados: any = {};
      
      try {
        dados = JSON.parse(textoResposta);
      } catch (e) {
        console.warn("[JSON PARSE] Servidor não devolveu JSON nativo estruturado:", textoResposta);
      }

      if (resposta.ok) {
        if (Platform.OS === 'web') alert('Perfil atualizado com sucesso!');
        else Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        
        router.replace({
          pathname: '/dadosPerfil',
          params: { id: usuarioId }
        });
      } else {
        const msgErro = dados.erro || 'Ocorreu um erro interno no servidor.';
        if (Platform.OS === 'web') alert(msgErro);
        else Alert.alert('Erro ao Salvar', msgErro);
      }

    } catch (error: any) {
      console.error("[PUT FATAL ERROR] Falha na requisição:", error);
      if (Platform.OS === 'web') {
        alert('Não foi possível salvar as alterações. Verifique o terminal do servidor.');
      } else {
        Alert.alert('Erro de Conexão', 'O servidor recebeu a requisição mas houve uma quebra no retorno. Olhe o terminal do seu Back-end.');
      }
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar title="Editar Perfil" usuarioId={usuarioId} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.header}>Editar Informações</Text>
          
          <Text style={styles.label}>Nome de Usuário:</Text>
          <TextInput 
            style={styles.input} 
            value={username} 
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Nome de usuário"
          />

          <Text style={styles.label}>Nome Completo:</Text>
          <TextInput 
            style={styles.input} 
            value={nome} 
            onChangeText={setNome}
            placeholder="Digite seu nome completo"
          />

          <Text style={styles.label}>E-mail:</Text>
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Digite seu e-mail"
          />
  
          <Text style={styles.label}>Telefone Fixo (Opcional):</Text>
          <TextInput 
            style={styles.input} 
            value={telefone} 
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="(DDD) 4444-4444"
          />

          <Text style={styles.label}>Telefone Celular:</Text>
          <TextInput 
            style={styles.input} 
            value={celular} 
            onChangeText={setCelular}
            keyboardType="phone-pad"
            placeholder="(DDD) 99999-9999"
          />
  
          <StdButton 
            title={salvando ? "Salvando..." : "Salvar Alterações"} 
            onPress={handleSalvar}
            style={styles.button}
          />

          <StdButton 
            title="Cancelar" 
            onPress={() => router.replace({
              pathname: '/dadosPerfil',
              params: { id: usuarioId }
            })}
            backgroundColor={Cores.branco}
            textColor={Cores.azulEscuro}
            style={styles.button2}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", flexDirection: "column", backgroundColor: Cores.azulEscuro },
  scrollContent: { paddingBottom: 40, width: '100%', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 40, flexGrow: 1 },
  form: { padding: 24, backgroundColor: "#FFFFFF", borderRadius: 12, width: '100%' },
  header: { fontWeight: 'bold', fontSize: 24, marginBottom: 32 },
  label: { fontSize: 14, marginBottom: 6, color: '#666', fontWeight: '500' },
  button: { marginTop: 32 }, 
  button2: { marginTop: 16, borderWidth: 1, borderColor: Cores.azulEscuro, borderRadius: 10 },
  input: { 
    width: '100%', 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    marginBottom: 20, 
    color: '#222',
    backgroundColor: '#f9f9f9'
  },
});
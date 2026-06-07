import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 
  (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

export default function EditarPerfil() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extração consistente do ID do usuário ativo
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
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`);
        const dados = await resposta.json();
        
        if (resposta.ok) {
          setNome(dados.nome || '');
          setEmail(dados.email || '');
          // Aceita tanto 'telefone' quanto 'telefoneUsuario' vindo da API
          setTelefone(dados.telefone || dados.telefoneUsuario || '');
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

    if (!nome || !email || !telefone) {
      const msgValidacao = 'Todos os campos devem ser preenchidos.';
      if (Platform.OS === 'web') alert(msgValidacao);
      else Alert.alert('Aviso', msgValidacao);
      return;
    }

    setSalvando(true);
    try {
      const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Envia o payload garantindo os dois mapeamentos possíveis do modelo
        body: JSON.stringify({ 
          nome, 
          email, 
          telefone,
          telefoneUsuario: telefone 
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        if (Platform.OS === 'web') alert('Perfil atualizado com sucesso!');
        else Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        
        router.replace({
          pathname: '/menu',
          params: { id: usuarioId }
        });
      } else {
        const msgErro = dados.erro || 'Erro ao salvar alterações.';
        if (Platform.OS === 'web') alert(msgErro);
        else Alert.alert('Erro', msgErro);
      }
    } catch (error) {
      console.error("[PUT ERROR] Erro na requisição de atualização:", error);
      if (Platform.OS === 'web') alert('Erro de rede ao conectar com o servidor.');
      else Alert.alert('Erro', 'Erro de rede ao conectar com o servidor.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Cores.azulEscuro} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.header}>Editar Informações</Text>
          
          <Text style={styles.label}>Nome Completo:</Text>
          <TextInput 
            style={styles.input} 
            value={nome} 
            onChangeText={setNome}
            placeholder="Digite seu nome"
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
  
          <Text style={styles.label}>Telefone:</Text>
          <TextInput 
            style={styles.input} 
            value={telefone} 
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="Digite seu telefone"
          />
  
          <StdButton 
            title={salvando ? "Salvando..." : "Salvar Alterações"} 
            onPress={handleSalvar}
          style={styles.button}/>

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
  container: { flex: 1, width: "100%", flexDirection: "column", backgroundColor: Cores.azulEscuro, padding: 20 },
  scrollContent: { paddingBottom: 110, width: '100%', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 40, flexGrow: 1 },
  form: { padding: 24, backgroundColor: "#FFFFFF", borderRadius: 12, width: '100%' },
  header: { fontWeight: 'bold', fontSize: 24, marginBottom: 32 },
  label: { fontSize: 14, marginBottom: 6, color: '#666', fontWeight: '500' },
  button: { marginTop: 64 },
  button2: { marginTop: 16},
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
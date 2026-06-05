import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 
  (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

export default function SignInForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmar, setSenhaConfirmar] = useState('');

  const handleCadastro = async () => {
    if (!username || !email || !telefone || !senha || !senhaConfirmar) {
      if (Platform.OS === 'web') alert('Erro: Por favor, preencha todos os campos.');
      else Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== senhaConfirmar) {
      if (Platform.OS === 'web') alert('Erro: As senhas não coincidem.');
      else Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      const resposta = await fetch(`${API_BASE}/cadastro`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          nome: username, 
          email: email.trim().toLowerCase(), 
          telefone, 
          senha 
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        if (Platform.OS === 'web') alert('Erro: ' + (dados.erro || 'Falha no cadastro'));
        else Alert.alert('Erro', dados.erro || 'Falha no cadastro');
        return;
      }
      
      // 保存 - Salva os dados gerados pela API no localStorage
      if (dados.usuario) {
        localStorage.setItem('@ARBank:user', JSON.stringify(dados.usuario));
      }

      if (Platform.OS === 'web') alert('Sucesso: Cadastro feito com sucesso!');
      else Alert.alert('Sucesso', 'Cadastro feito com sucesso!');
      
      router.replace({
        pathname: '/login',
        params: { emailPrePreenchido: email }
      });
    } catch (error) {
      console.error("Erro detalhado no fetch do cadastro:", error);
      if (Platform.OS === 'web') alert('Erro: Não foi possível conectar ao servidor.');
      else Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  const gotoLoginFailed = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
        <View style={styles.form}>
          <Text style={styles.header}>Insira seus dados</Text>
          
          <Text style={styles.text}>Seu nome:</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />
          
          <Text style={styles.text}>Seu e-mail:</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          
          <Text style={styles.text}>Seu telefone:</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
          
          <Text style={styles.text}>Sua senha:</Text>
          <TextInput style={styles.input} secureTextEntry={true} value={senha} onChangeText={setSenha} />
          
          <Text style={styles.text}>Confirme sua senha:</Text>
          <TextInput style={styles.input} secureTextEntry={true} value={senhaConfirmar} onChangeText={setSenhaConfirmar} />

          <StdButton title="Cadastrar" onPress={handleCadastro} />
          <StdButton title="Cancelar" onPress={gotoLoginFailed} backgroundColor={Cores.branco} textColor={Cores.azulEscuro} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", flexDirection: "column", backgroundColor: Cores.azulClaro, padding: 20 },
  scrollContent: { paddingBottom: 40, width: '100%', alignItems: 'center', paddingVertical: 20, flexGrow: 1 },
  form: { padding: 24, backgroundColor: "#FFFFFF", borderRadius: 12, width: '100%' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 32, color: '#333' },
  text: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#555' },
  input: { width: "100%", borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 32, padding: 8 },
  logo: { width: 100, height: 100, marginBottom: 40, marginTop: 20 },
});
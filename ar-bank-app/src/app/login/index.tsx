import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';


const IP_COMPUTADOR = 'localhost'; 

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 
  (Platform.OS === 'web' ? `http://${IP_COMPUTADOR}:3333` : 'http://10.0.2.2:3333');

export default function LoginForm() {
  const router = useRouter();
  const [email, setemail] = useState('');
  const [senha, setSenha] = useState('');

  const gotoCadastro = () => {
    router.push('/cadastro'); 
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      const msgValidacao = 'Preencha todos os campos';
      if (Platform.OS === 'web') alert(msgValidacao);
      else Alert.alert('Erro', msgValidacao);
      return;
    }

    try {
      
      const urlFinal = `${API_URL}/auth/login`;

      console.log(`[HTTP] Conectando em: ${urlFinal}`);

      const resposta = await fetch(urlFinal, {   
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      const textoBruto = await resposta.text();
      let dados;

      try {
        dados = JSON.parse(textoBruto);
      } catch {
        throw new Error(`O endpoint respondeu em formato inválido (HTML). Verifique o console do backend.`);
      }

      if (!resposta.ok) {
        const msgErro = dados.erro || 'E-mail ou senha incorretos.';
        if (Platform.OS === 'web') alert(msgErro);
        else Alert.alert('Erro', msgErro);
        return;
      }

      const usuarioValido = dados.usuario || (Array.isArray(dados) ? dados[0] : dados);

      if (!usuarioValido || (!usuarioValido.id && !usuarioValido._id)) {
        throw new Error('A resposta de login foi bem-sucedida, mas faltam dados do usuário.');
      }

      const idFinal = String(usuarioValido.id || usuarioValido._id);

      if (Platform.OS === 'web') {
        localStorage.setItem('@ARBank:user', JSON.stringify(usuarioValido));
      }

      router.replace({ 
        pathname: '/menu', 
        params: { id: idFinal, usuario: JSON.stringify(usuarioValido) } 
      });

    } catch (error: any) {
      console.error("Erro detalhado no fluxo de login:", error);
      
      const msgFalha = `Falha ao conectar: ${error.message}`;
        
      if (Platform.OS === 'web') alert(msgFalha);
      else Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/logo.png')} 
        style={styles.logo} 
      />
      
      <View style={styles.form}>
        <Text style={styles.header}>Olá!</Text>
        <Text style={styles.text}>Insira seu email e senha!</Text>
        
        <TextInput 
          style={styles.input}
          placeholder="Seu email aqui"
          value={email}
          onChangeText={setemail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput 
          style={styles.input}
          placeholder="Sua senha aqui"
          secureTextEntry={true}
          value={senha}
          onChangeText={setSenha}
          autoCapitalize="none"
        />
        
        <StdButton title="Entrar" onPress={handleLogin} />
        
        <StdButton 
          title="Cadastrar nova conta" 
          onPress={gotoCadastro} 
          backgroundColor={Cores.verde}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: Cores.azulClaro },
  form: { width: "80%", padding: 24, backgroundColor: "#FFFFFF", borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  header:{ fontFamily: "sans-serif", fontWeight: 'bold', fontSize: 32, marginBottom: 8 },
  text: { fontFamily: "sans-serif", fontSize: 16, color: '#666', marginBottom: 32 },
  input: { width: "100%", borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 32, padding: 8, fontSize: 16, color: '#333' },
  logo: { width: 150, height: 150, marginBottom: 40 },
});
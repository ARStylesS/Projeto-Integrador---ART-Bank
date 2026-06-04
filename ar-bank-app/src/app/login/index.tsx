import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

export default function LoginForm() {
  const router = useRouter();
  const [email, setemail] = useState('');
  const [senha, setSenha] = useState('');

  const gotoCadastro = () => {
    router.push('/cadastro'); 
  };

  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

const handleLogin = async () => {
  try {
    const resposta = await fetch(`${API_URL}/auth/login`, {  // ✅ direto no Express
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      const mensagem = dados.erro ?? 'Usuário ou senha incorretos.';
      if (Platform.OS === 'web') {
        alert('Erro: ' + mensagem);
      } else {
        Alert.alert('Erro', mensagem);
      }
      return;
    }

    router.push({ pathname: '/menu', params: { usuario: JSON.stringify(dados.usuario) } });

  } catch (error) {
    if (Platform.OS === 'web') {
      alert('Erro: Não foi possível conectar ao servidor.');
    } else {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
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
        />
        
        <TextInput 
          style={styles.input}
          placeholder="Sua senha aqui"
          secureTextEntry={true}
          value={senha}
          onChangeText={setSenha}
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
  container: { 
    flex: 1, 
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // Centraliza o formulário na tela
    backgroundColor: Cores.azulClaro,
  },
  form: { 
    width: "80%", // Aumentei um pouco para ficar melhor em telas menores
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000", // Adiciona uma sombrinha de leve no card
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header:{
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    fontFamily: "sans-serif",
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: { 
    width: "100%",
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc',
    marginBottom: 32, 
    padding: 8, 
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
});
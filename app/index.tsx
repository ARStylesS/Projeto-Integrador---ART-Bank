import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../src/styles/global';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');

  const gotoMenu = () => {
    Alert.alert("Login feito com sucesso!")
    router.push('/menu'); 
  };

  const gotoCadastro = () => {
    router.push('/cadastro'); 
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo} 
      />
      <View style={styles.form}>
        <Text style={styles.header}> Olá!</Text>
        <Text style={styles.text}>   Insira seu usuário e senha!</Text>
        <TextInput 
          style={styles.input}
          placeholder="Seu nome de usuario aqui"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput 
          style={styles.input}
          placeholder="Sua senha aqui"
          secureTextEntry={true}
          value={senha}
          onChangeText={setSenha}
        />
        <StdButton title="Entrar" onPress={gotoMenu}/>
        <StdButton title="Cadastrar nova conta" onPress={gotoCadastro} backgroundColor={Cores.verde}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: Cores.azulClaro,
  },
  form: { 
    width: "70%",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  header:{
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 32,
  },
  input: { 
    width: "100%",
    borderBottomWidth: 1, 
    marginBottom: 32, 
    padding: 8, 
    alignItems: "center"
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
    marginTop: 80,
  },
});
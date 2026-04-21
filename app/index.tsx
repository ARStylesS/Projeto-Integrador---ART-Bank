import React, { useState } from 'react';
import { View, Image, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = () => {
    Alert.alert("Login feito com sucesso", `Bem-vindo, seuNome`);
  };

  return (
    <View style={styles.container}>
      <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo} 
        />
      <View style={styles.form}>
        <TextInput 
          style={styles.input}
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput 
          style={styles.input}
          placeholder="Digite sua senha"
          secureTextEntry={true}
          value={senha}
          onChangeText={setSenha}
        />
        <Button title="Entrar" onPress={handleSubmit}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: "column",
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#6599E5",
  },
  form: { 
    width: "70%",
    padding: 24,
    backgroundColor: "#FFFFFF"
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
    marginBottom: 64,
  }
});
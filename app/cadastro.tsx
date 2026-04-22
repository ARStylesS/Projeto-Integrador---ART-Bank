import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../src/styles/global';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');

  const gotoLogin = () => {
    Alert.alert("Cadastro feito com sucesso!")
    router.replace('/'); 
  };
  const gotoLoginFailed = () => {
    Alert.alert("Cadastro cancelado.")
    router.replace('/'); 
  };

  return (
    <View style={styles.container}>
    
        <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        >
            <Image 
                source={require('../assets/images/logo.png')} 
                style={styles.logo} 
            />
            <View style={styles.form}>
                <Text style={styles.header}> Insira seus dados</Text>
                <Text style={styles.text}>Seu usuário:</Text>
                <TextInput 
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                />
                <Text style={styles.text}>Seu email:</Text>
                <TextInput 
                style={styles.input}
                secureTextEntry={true}
                value={senha}
                onChangeText={setSenha}
                />
                <Text style={styles.text}>Seu telefone:</Text>
                <TextInput 
                style={styles.input}
                secureTextEntry={true}
                value={senha}
                onChangeText={setSenha}
                />
                <Text style={styles.text}>Sua senha:</Text>
                <TextInput 
                style={styles.input}
                secureTextEntry={true}
                value={senha}
                onChangeText={setSenha}
                />
                <Text style={styles.text}>Confirme sua senha:</Text>
                <TextInput 
                style={styles.input}
                secureTextEntry={true}
                value={senha}
                onChangeText={setSenha}
                />

                <StdButton title="Cadastrar" onPress={gotoLogin}/>
                <StdButton title="Cancelar" 
                    onPress={gotoLoginFailed} 
                    backgroundColor={Cores.branco}
                    textColor={Cores.azulEscuro}
                />
            </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: "100%",
    flexDirection: "column",
    backgroundColor: Cores.azulClaro,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',      // Garante que o conteúdo ocupe a largura total
    alignItems: 'center', // Alinha os itens no centro horizontalmente
    paddingVertical: 20,
    flexGrow: 1,
  },
  form: { 
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: '100%',
  },
  header:{
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 32,
  },
  text: {
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  input: { 
    width: "100%",
    borderBottomWidth: 1, 
    marginBottom: 32, 
    padding: 8, 
    alignItems: "center"
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
    marginTop: 20,
  },
});
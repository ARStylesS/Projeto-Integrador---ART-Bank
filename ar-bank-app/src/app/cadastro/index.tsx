import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

export default function SignInForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmar, setSenhaConfirmar] = useState('');

  const handleCadastro = async () => {
    if (!username || !email || !telefone || !senha || !senhaConfirmar) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== senhaConfirmar) {
      if (Platform.OS === 'web'){
        alert('Erro: As senhas não coincidem.');
      } else {
        Alert.alert('Erro', 'As senhas não coincidem.');
      }
      return;
    }

    try {
      const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

      const resposta = await fetch(`${API_BASE}/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: username, email, telefone, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        if (Platform.OS === 'web'){
          alert('Erro: ' + dados.erro);
        }else{
          Alert.alert('Erro', dados.erro);
        }
        return;
      }
      
      if (Platform.OS === 'web'){
        alert('Sucesso: Cadastro feito com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Cadastro feito com sucesso!');
      }
      
      router.replace('/login');
    } catch (error) {
      if (Platform.OS === 'web'){
        alert('Erro: Não foi possível conectar ao servidor.');
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
      
    }
  };

  const gotoLoginFailed = () => {
    if (Platform.OS === 'web'){
      alert('Cadastro cancelado.');
    } else {
      Alert.alert('Cadastro cancelado.');
    }
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
        />
        <View style={styles.form}>
          <Text style={styles.header}> Insira seus dados</Text>
          <Text style={styles.text}>Seu nome:</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />
          <Text style={styles.text}>Seu email:</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} />
          <Text style={styles.text}>Seu telefone:</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} />
          <Text style={styles.text}>Sua senha:</Text>
          <TextInput style={styles.input} secureTextEntry={true} value={senha} onChangeText={setSenha} />
          <Text style={styles.text}>Confirme sua senha:</Text>
          <TextInput style={styles.input} secureTextEntry={true} value={senhaConfirmar} onChangeText={setSenhaConfirmar} />

          <StdButton title="Cadastrar" onPress={handleCadastro} />
          <StdButton
            title="Cancelar"
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
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    flexGrow: 1,
  },
  form: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: '100%',
  },
  header: {
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
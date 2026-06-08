import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 
  (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

export default function SignInForm() {
  const router = useRouter();
  const [nomeUsuarioCadastro, setNomeUsuarioCadastro] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmar, setSenhaConfirmar] = useState('');

  // Função auxiliar para exibir os alertas de forma multiplataforma
  const exibirAlerta = (titulo: string, mensagem: string) => {
    if (Platform.OS === 'web') {
      alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleCadastro = async () => {
    // 1. Validação detalhada campo por campo (O telefone NÃO está aqui, tornando-o 100% opcional)
    if (!nomeUsuarioCadastro.trim()) {
      exibirAlerta('Erro', 'O campo Nome de usuário é obrigatório.');
      return;
    }
    if (!username.trim()) {
      exibirAlerta('Erro', 'O campo Nome completo é obrigatório.');
      return;
    }
    if (!email.trim()) {
      exibirAlerta('Erro', 'O campo E-mail é obrigatório.');
      return;
    }
    if (!celular.trim()) {
      exibirAlerta('Erro', 'O campo Telefone-celular é obrigatório.');
      return;
    }
    if (!senha) {
      exibirAlerta('Erro', 'O campo Senha é obrigatório.');
      return;
    }
    if (!senhaConfirmar) {
      exibirAlerta('Erro', 'O campo Confirme sua senha é obrigatório.');
      return;
    }

    // 2. Validação das Senhas
    if (senha !== senhaConfirmar) {
      exibirAlerta('Erro', 'As senhas não coincidem.');
      return;
    }

    // 3. Validação do formato do Celular (Obrigatório)
    const celularNumeros = celular.replace(/\D/g, '');
    if (celularNumeros.length < 11) {
      exibirAlerta('Erro no Celular', 'Você deve inserir o DDD (2 dígitos) seguido do número do celular completo (9 dígitos). Exemplo: 11999999999');
      return;
    }

    // 4. Validação do formato do Telefone Fixo (Só valida se houver texto digitado)
    if (telefone && telefone.trim().length > 0) {
      const telefoneNumeros = telefone.replace(/\D/g, '');
      if (telefoneNumeros.length < 10) {
        exibirAlerta('Erro no Telefone Fixo', 'Você deve inserir o DDD (2 dígitos) seguido do número fixo completo (8 dígitos). Exemplo: 1144444444');
        return;
      }
    }

    try {
      const resposta = await fetch(`${API_BASE}/cadastro`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          usuario: nomeUsuarioCadastro,
          nome: username, 
          email: email.trim().toLowerCase(), 
          telefone: telefone ? telefone.replace(/\D/g, '') : '', 
          celular: celular.replace(/\D/g, ''),   
          senha 
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        exibirAlerta('Erro', dados.erro || 'Falha no cadastro');
        return;
      }
      
      if (dados.usuario) {
        if (Platform.OS === 'web') {
          localStorage.setItem('@ARBank:user', JSON.stringify(dados.usuario));
        }
      }

      exibirAlerta('Sucesso', 'Cadastro feito com sucesso!');
      
      router.replace({
        pathname: '/login',
        params: { emailPrePreenchido: email }
      });
    } catch (error) {
      console.error("Erro detalhado no fetch do cadastro:", error);
      exibirAlerta('Erro', 'Não foi possível conectar ao servidor.');
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
          
          <Text style={styles.text}>Seu nome de usuário</Text>
          <TextInput style={styles.input} value={nomeUsuarioCadastro} onChangeText={setNomeUsuarioCadastro} placeholder="Nome de usuário"/>
      
          <Text style={styles.text}>Seu nome completo</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Nome completo"/>
          
          <Text style={styles.text}>Seu e-mail</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder = "usuario@gmail.com"/>
          
          <Text style={styles.text}>Seu telefone-fixo (Opcional):</Text>
          <TextInput 
            style={styles.input} 
            value={telefone} 
            onChangeText={setTelefone} 
            keyboardType="phone-pad" 
            maxLength={14} 
            placeholder="DDD + Número (ex: 1144444444)" 
          />

          <Text style={styles.text}>Seu telefone-celular</Text>
          <TextInput 
            style={styles.input} 
            value={celular} 
            onChangeText={setCelular} 
            keyboardType="phone-pad" 
            maxLength={15}
            placeholder="DDD + Número (ex: 11999999999)" 
          />
          
          <Text style={styles.text}>Sua senha</Text>
          <TextInput style={styles.input} secureTextEntry={true} value={senha} onChangeText={setSenha} placeholder="Digite a senha"/>
          
          <Text style={styles.text}>Confirme sua senha</Text>
          <TextInput style={styles.input} secureTextEntry={true} value={senhaConfirmar} onChangeText={setSenhaConfirmar} placeholder="Digite a senha novamente"/>

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
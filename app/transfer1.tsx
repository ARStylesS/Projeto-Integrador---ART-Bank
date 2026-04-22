import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../src/styles/global';
import { AppBar } from '@/components/AppBar';

export default function Transfer1() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmar, setSenhaConfirmar] = useState('');

  const gotoTransfer2 = () => {
    router.replace('/transfer2'); 
  };
  const TransferFailed = () => {
    Alert.alert("Transferência cancelada.")
    router.replace('/menu'); 
  };

  return (
    <View style={styles.container}>
        <AppBar title="Fazer Transferência"/>
        <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        >
            
            <View style={styles.form}>
                <Text style={styles.header}>Para quem fazer uma transferência, Username?</Text>
                <Text style={styles.text}>Usuário, email ou telefone do recebedor:</Text>
                <TextInput 
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                />
                <Text style={styles.text}>Valor a ser transferido:</Text>
                <TextInput 
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                />
                <Text style={styles.text}>Seu senha de transação:</Text>
                <TextInput 
                style={styles.input}
                secureTextEntry={true}
                value={senhaConfirmar}
                onChangeText={setSenhaConfirmar}
                />

                <StdButton title="Continuar Transferência" onPress={gotoTransfer2}/>
                <StdButton title="Cancelar" 
                    onPress={TransferFailed} 
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
    backgroundColor: Cores.azulFundo,
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
    width: '80%',
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
import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../src/styles/global';
import { AppBar } from '@/components/AppBar';

export default function Transfer2() {
  const router = useRouter();

  const gotoTransfer3 = () => {
    router.replace('/transfer3'); 
  };
  const correctTransfer = () => {
    router.replace('/transfer1'); 
  };

  return (
    <View style={styles.container}>
        <AppBar title="Fazer Transferência"/>
        <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        >
            
            <View style={styles.form}>
                <Text style={styles.header}>Confirme as informações</Text>
                <Text style={styles.text}>Usuário, email ou telefone do recebedor:</Text>
                <Text style={styles.info}>Uma chave qualquer</Text>

                <Text style={styles.text}>Valor a ser transferido:</Text>
                <Text style={styles.info}>R$ 200</Text>

                <StdButton title="Confirmar Transferência" onPress={gotoTransfer3}/>
                <StdButton title="Corrigir Informações" 
                    onPress={correctTransfer} 
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
  info:{
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
    marginTop: 20,
  },
});
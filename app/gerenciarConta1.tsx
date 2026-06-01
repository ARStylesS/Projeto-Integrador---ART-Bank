import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../src/styles/global';
import { FloatingOptions } from '@/components/FloatingOptions';

export default function SignInForm() {
  const router = useRouter();
  const gotoConta2 = () => {
    router.replace('/conta2'); 
  };
  

  return (
    <View style={styles.container}>
    
        <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.form}>
                <Text style={styles.header}>Confirme as informações</Text>
                    <Text style={styles.text}>Usuário:</Text>
                    <Text style={styles.info}>Username</Text>

                    <Text style={styles.text}>Email:</Text>
                    <Text style={styles.info}>email@exemplo.net</Text>
            
                    <Text style={styles.text}>Telefone:</Text>
                    <Text style={styles.info}>telefone</Text>
            
                    <StdButton title="Alterar Dados" onPress={gotoConta2}/>
                    
                    
            </View>

        </ScrollView>
        <FloatingOptions/>
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
  info: { 
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 24,
  },
});
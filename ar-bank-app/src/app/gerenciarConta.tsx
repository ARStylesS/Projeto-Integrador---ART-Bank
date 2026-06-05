import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../styles/global';
import { FloatingOptions } from '@/components/FloatingOptions';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

export default function GerenciarConta() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Captura o ID de forma estrita
  const obterIdOriginal = (): string => {
    if (params.id && params.id !== "1") {
      return String(params.id);
    }
    if (params.usuario) {
      try {
        const parsed = JSON.parse(params.usuario as string);
        if (parsed.id) return String(parsed.id);
      } catch {
        // Ignora falha de parse
      }
    }
    return "1";
  };

  const usuarioId = obterIdOriginal();

  const [nome, setNome] = useState('Carregando...');
  const [email, setEmail] = useState('Carregando...');
  const [telefone, setTelefone] = useState('Carregando...');

  useFocusEffect(
    useCallback(() => {
      if (usuarioId === "1") return;

      async function carregarDados() {
        try {
          const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`);
          const dados = await resposta.json();
          if (resposta.ok) {
            setNome(dados.nome);
            setEmail(dados.email);
            setTelefone(dados.telefone || 'Não informado');
          }
        } catch (error) {
          console.error("Erro ao buscar dados em GerenciarConta:", error);
        }
      }
      carregarDados();
    }, [usuarioId])
  );

  // CORREÇÃO DA NAVEGAÇÃO: Mudança para push garantindo o envio do parâmetro envelopado
  const gotoPerfil = () => {
    router.push({
      pathname: '/gerenciarPerfil',
      params: { id: usuarioId, usuario: JSON.stringify({ id: usuarioId, nome, email, telefone }) }
    });
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
          <Text style={styles.info}>{nome}</Text>

          <Text style={styles.text}>Email:</Text>
          <Text style={styles.info}>{email}</Text>
  
          <Text style={styles.text}>Telefone:</Text>
          <Text style={styles.info}>{telefone}</Text>
  
          <StdButton title="Alterar Dados" onPress={gotoPerfil}/>
        </View>
      </ScrollView>
      
      <FloatingOptions usuarioId={usuarioId} />
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
    paddingBottom: 110, 
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
  header:{
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 32,
    color: '#333'
  },
  text: {
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#666'
  },
  info: { 
    fontFamily: "sans-serif",
    fontWeight: 'normal',
    fontSize: 20,
    marginBottom: 24,
    color: '#111'
  },
});
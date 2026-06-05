import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { MenuButton } from '@/components/MenuButton';
import { FloatingOptions } from '@/components/FloatingOptions'; 
import { Cores } from '../../styles/global';
import { AppBar } from '@/components/AppBar';
import Olhoabrirfechar from '@/components/Olhoabrirfechar';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

export default function Menu() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  
  let usuarioId = "1";
  if (params.id) {
    usuarioId = String(params.id);
  } else if (params.usuario) {
    try {
      const parsed = JSON.parse(params.usuario as string);
      usuarioId = parsed.id ? String(parsed.id) : "1";
    } catch {
      usuarioId = "1";
    }
  }

  const [visivel, setVisivel] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [saldo, setSaldo] = useState('R$ 0,00');

  useFocusEffect(
    useCallback(() => {
      async function sincronizarDadosBanco() {
        try {
          const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`);
          const dados = await resposta.json();
          if (resposta.ok) {
            setNomeUsuario(dados.nome);
            setSaldo(`R$ ${Number(dados.saldo).toFixed(2)}`);
          }
        } catch (error) {
          console.error("Erro ao sincronizar dados no menu:", error);
        }
      }

      sincronizarDadosBanco();
    }, [usuarioId])
  );

  const gotoTransf = () => {
    router.push({
      pathname: '/transfer',
      params: { id: usuarioId },
    });
  };

  return (
    <View style={styles.container}>
      <AppBar title={`Bem-vindo, ${nomeUsuario || "Usuário"}!`}/>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.cardSaldo} onPress={() => setVisivel(!visivel)} activeOpacity={0.8}>
          <Text style={styles.labelEsquerda}>Consultar Saldo</Text>
          <View style={styles.containerDireita}>
            <Olhoabrirfechar visivel={visivel} />
            <Text style={styles.valorSaldo}>
              {visivel ? saldo : "*********"}
            </Text>
          </View>
        </TouchableOpacity>

        <MenuButton title="Fazer Transferência" onPress={gotoTransf} imageSource={require('../../../assets/images/iconTransfer.png')} />
        <MenuButton title="Pedir Solicitação" onPress={gotoTransf} imageSource={require('../../../assets/images/iconSolicite.png')} />
        <MenuButton title="Pagar Solicitação" onPress={gotoTransf} imageSource={require('../../../assets/images/iconPaySolicite.png')} />
      </ScrollView>

      {/* Certifique-se de que o componente FloatingOptions consiga usar esse ID internamente para abrir a rota /gerenciarPerfil */}
      <FloatingOptions usuarioId={usuarioId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "column", alignItems: "center", backgroundColor: Cores.azulFundo },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { alignItems: 'center', paddingBottom: 100, paddingTop: 20 },
  cardSaldo: { backgroundColor: Cores.azulClaro, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 12, marginHorizontal: 20, marginBottom: 30, width: 400 },
  labelEsquerda: { color: '#FFF', fontSize: 16, fontWeight: '600', opacity: 0.9 },
  containerDireita: { flexDirection: 'row', alignItems: 'center', minWidth: 100 },
  valorSaldo: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
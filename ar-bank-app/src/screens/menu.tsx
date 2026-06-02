import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MenuButton } from '@/components/MenuButton';
import { FloatingOptions } from '@/components/FloatingOptions'; 
import { Cores } from '../../src/styles/global';
import { AppBar } from '@/components/AppBar';
import Olhoabrirfechar from '@/components/Olhoabrirfechar';

export default function Menu() {
  const router = useRouter();
  const [visivel, setVisivel] = useState(false);
  
  // O saldo simulado continua ativo aqui
  const saldoSimulado = "R$ 1.250,50";

  // Estado do nome do usuário inicia limpo para a futura API
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    async function carregarDadosUsuario() {
      try {
        // ─── SUA INTEGRAÇÃO DE API ENTRA AQUI ───
        // const response = await api.get('/user/profile');
        // setNomeUsuario(response.data.nome);
        // ─────────────────────────────────────────
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }

    carregarDadosUsuario();
  }, []);

  const gotoTransf = () => {
    router.push('/transfer1'); 
  };

  return (
    <View style={styles.container}>
      {/* Exibe "Bem-vindo, Usuário!" por padrão. Se a API carregar o nome, atualiza sozinho */}
      <AppBar title={`Bem-vindo, ${nomeUsuario || "Usuário"}!`}/>

      {/* Card de Saldo */}
      <TouchableOpacity 
        style={styles.cardSaldo} 
        onPress={() => setVisivel(!visivel)}
        activeOpacity={0.8}
      >
        <Text style={styles.labelEsquerda}>Consultar Saldo</Text>
        
        <View style={styles.containerDireita}>
          <Olhoabrirfechar visivel={visivel} />
          
          <Text style={styles.valorSaldo}>
            {visivel ? saldoSimulado : "*********"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Botões Principais do Menu */}
      <MenuButton
        title="Fazer Transferência"
        onPress={gotoTransf}
        imageSource={require('../assets/images/iconTransfer.png')} 
      />
      <MenuButton
        title="Pedir Solicitação"
        onPress={gotoTransf}
        imageSource={require('../assets/images/iconSolicite.png')} 
      />
      <MenuButton
        title="Pagar Solicitação"
        onPress={gotoTransf}
        imageSource={require('../assets/images/iconPaySolicite.png')} 
      />

      <FloatingOptions />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: Cores.azulFundo, // Fundo alterado para criar contraste com o card de saldo
  },
  cardSaldo: {
    backgroundColor: Cores.azulClaro, // Mantido claro para contrastar com o fundo
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 48,
    width: 300
  },
  labelEsquerda: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  containerDireita: {
    flexDirection: 'row', 
    alignItems: 'center',
    minWidth: 100,
  },
  valorSaldo: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
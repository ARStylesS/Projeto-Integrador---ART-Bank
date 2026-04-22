import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MenuButton } from '@/components/MenuButton';
import { FloatingOptions } from '@/components/FloatingOptions';
import { Cores } from '../src/styles/global';
import { AppBar } from '@/components/AppBar';

export default function Menu() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');

  const gotoTransf = () => {
    router.push('/transfer1'); 
  };

  const gotoCadastro = () => {
    router.push('/cadastro'); 
  };

  const showSaldo = () => {

  };
  const [visivel, setVisivel] = useState(false);
  const saldoSimulado = "R$ 1.250,50";
  

  return (
    <View style={styles.container}>

        <AppBar title="Bem-vindo, Username!"/>
        <TouchableOpacity 
            style={styles.cardSaldo} 
            onPress={() => setVisivel(!visivel)}
            activeOpacity={0.7}
        >
            <Text style={styles.labelEsquerda}>Consultar Saldo</Text>
            <View style={styles.containerDireita}>
                <Text style={styles.valorSaldo}>
                 {visivel ? saldoSimulado : "••••••"}
                </Text>
            </View>
        </TouchableOpacity>

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

        <FloatingOptions/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: Cores.azulFundo,
  },
  logo: {
    width: 250,
    height: 250,
  },
  cardSaldo: {
    backgroundColor: Cores.azulClaro, 
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
    minWidth: 100,                      // Garante que o texto não "pule" ao revelar
    alignItems: 'flex-end',
  },
  valorSaldo: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
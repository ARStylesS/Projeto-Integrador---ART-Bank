import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MenuButton } from '@/components/MenuButton';
import { FloatingOptions } from '@/components/FloatingOptions'; 
import { Cores } from '../../styles/global';
import { AppBar } from '@/components/AppBar';
import Olhoabrirfechar from '@/components/Olhoabrirfechar';

export default function Menu() {
  const router = useRouter(); 
  const { usuario } = useLocalSearchParams();

  const dadosUsuario = usuario ? JSON.parse(usuario as string) : null;

  const [visivel, setVisivel] = useState(false);
  const [nomeUsuario] = useState(dadosUsuario?.nome || '');
  const [saldo] = useState(
    dadosUsuario?.saldo ? `R$ ${Number(dadosUsuario.saldo).toFixed(2)}` : 'R$ 0,00'
  );

  const gotoTransf = () => {
  router.push({
    pathname: '/transfer',
    params: { usuario: JSON.stringify(dadosUsuario) },
  });
};

  return (
    <View style={styles.container}>
      <AppBar title={`Bem-vindo, ${nomeUsuario || "Usuário"}!`}/>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.cardSaldo} 
          onPress={() => setVisivel(!visivel)}
          activeOpacity={0.8}
        >
          <Text style={styles.labelEsquerda}>Consultar Saldo</Text>
          
          <View style={styles.containerDireita}>
            <Olhoabrirfechar visivel={visivel} />
            <Text style={styles.valorSaldo}>
              {visivel ? saldo : "*********"}
            </Text>
          </View>
        </TouchableOpacity>

        <MenuButton
          title="Fazer Transferência"
          onPress={gotoTransf}
          imageSource={require('../../../assets/images/iconTransfer.png')} 
        />
        <MenuButton
          title="Pedir Solicitação"
          onPress={gotoTransf}
          imageSource={require('../../../assets/images/iconSolicite.png')} 
        />
        <MenuButton
          title="Pagar Solicitação"
          onPress={gotoTransf}
          imageSource={require('../../../assets/images/iconPaySolicite.png')} 
        />
      </ScrollView>

      {/* FloatingOptions fora do ScrollView para ficar fixo na tela */}
      <FloatingOptions />
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
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 100, // espaço para o FloatingOptions não sobrepor o último item
    paddingTop: 20,
  },
  cardSaldo: {
    backgroundColor: Cores.azulClaro,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
    width: 400,
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
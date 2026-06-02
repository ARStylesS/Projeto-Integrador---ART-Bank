import React from 'react';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Cores } from '../styles/global';

interface AppBarProps {
  title: string;
}

export function AppBar({ title }: AppBarProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo do Banco */}
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título Dinâmico (Ex: Bem-vindo, Usuário!) */}
        <Text style={styles.titulo}>{title}</Text>

        {/* Botão do Perfil que agora leva direto para a nova tela unificada */}
        <TouchableOpacity 
          onPress={() => router.push('/gerenciarPerfil')} // Atualizado para a nova tela!
          style={styles.botaoConta}
        >
          <Image 
            source={require('../../assets/images/iconProfile.png')} 
            style={styles.iconConta}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Cores.azulClaro,
    width: "100%",
    marginBottom: 32,
    paddingTop: Constants.statusBarHeight, 
  },
  content: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Cores.branco,
    flex: 1,
    textAlign: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  botaoConta: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconConta: {
    width: 50, 
    height: 50,
  }
});
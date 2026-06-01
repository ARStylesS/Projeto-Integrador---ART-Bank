import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cores } from '../styles/global';

export function FloatingOptions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botão 1: Casa*/}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco  }]} 
        onPress={() => router.replace('/menu')}
      >
        <Image source={require('../../assets/images/iconhome.png')} 
        style={styles.img}/>
      </TouchableOpacity>

      {/* Botão 2: Extrato */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco }]} 
        onPress={() => router.push('/extrato1')}
      >
        <Image source={require('../../assets/images/iconExtrato.png')} 
        style={styles.img}/>
      </TouchableOpacity>

      {/* Botão 3: Emprestimo */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco  }]} 
        onPress={() => router.push('/emprestimo1')}
      >
        <Image source={require('../../assets/images/iconLoan.png')} 
        style={styles.img}/>
      </TouchableOpacity>

      {/* Botão 4: Loteria */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco  }]} 
        onPress={() => router.push('/loteria1')}
      >
        <Image source={require('../../assets/images/iconLottery.png')} 
        style={styles.img}/>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 64, // Distância do fundo da tela
    gap: 20,    // Espaçamento entre as bolinhas (apenas em versões recentes do RN)
    backgroundColor: Cores.azulClaro,
    flexDirection: 'row',
    padding: 24,
    borderRadius: 64
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,        // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 10,    // Margem caso o 'gap' não funcione na sua versão
  },
  img: {
    width: 50,
    height: 50,
  }
});
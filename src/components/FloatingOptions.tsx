import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Cores } from '../styles/global'; 

export function FloatingOptions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botão 1: Casa */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco }]} 
        onPress={() => router.replace('/menu')}
      >
        <Image 
          source={require('../../assets/images/iconhome.png')} 
          style={styles.img}
        />
      </TouchableOpacity>

      {/* Botão 2: Extrato (Atualizado para a rota limpa /extrato) */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco }]} 
        onPress={() => router.push('/extrato')} // Alterado de '/extrato1' para '/extrato'
      >
        <Image 
          source={require('../../assets/images/iconExtrato.png')} 
          style={styles.img}
        />
      </TouchableOpacity>

      {/* Botão 3: Emprestimo */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco }]} 
        onPress={() => router.push('/emprestimo1')}
      >
        <Image 
          source={require('../../assets/images/iconLoan.png')} 
          style={styles.img}
        />
      </TouchableOpacity>

      {/* Botão 4: Loteria */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Cores.branco }]} 
        onPress={() => router.push('/loteria1')}
      >
        <Image 
          source={require('../../assets/images/iconLottery.png')} 
          style={styles.img}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 64, 
    gap: 20,    
    backgroundColor: Cores.azulClaro,
    flexDirection: 'row',
    padding: 24,
    borderRadius: 64,
    alignSelf: 'center', // Garante que a barra flutuante fique centralizada na tela
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,        
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 10,    
  },
  img: {
    width: 50,
    height: 50,
  }
});
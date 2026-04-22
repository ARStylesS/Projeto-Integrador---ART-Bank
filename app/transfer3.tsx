import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../src/styles/global';
import { AppBar } from '@/components/AppBar';

export default function Transfer2() {
  const router = useRouter();
  const completeTransfer = () => {
    router.replace('/menu'); 
  };
  

  return (
    <View style={styles.main}>
        <AppBar title="Fazer Transferência"/>
            <View style={styles.container}>
                <Text style={styles.header}>Transferência Concluída</Text>

                <StdButton title="OK" 
                    onPress={completeTransfer} 
                    backgroundColor={Cores.verde}
                    textColor={Cores.branco}
                /> 
            </View>
    </View>
  );
}

const styles = StyleSheet.create({
    main:{
        flex: 1,
        backgroundColor: Cores.azulFundo,
        flexDirection: "column",
        
    },
  container: { 
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: '80%',
    alignContent: "center",
    justifyContent: "center",
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
});
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Cores } from '../styles/global';

interface StdButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string; // Cor de fundo opcional
  textColor?: string;       // Cor do texto opcional
  style?: StyleProp<ViewStyle>; // Para outras customizações de layout
}

export function StdButton({ 
  title, 
  onPress, 
  backgroundColor, 
  textColor, 
  style 
}: StdButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.btn, 
        backgroundColor ? { backgroundColor } : null, 
        style
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text, 
          textColor ? { color: textColor } : null
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { 
    backgroundColor: Cores.azulEscuro, // Cor padrão se não informar nada
    padding: 15, 
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  text: { 
    color: '#fff', // Cor padrão (branco)
    fontWeight: 'bold',
    fontSize: 16,
  }
});
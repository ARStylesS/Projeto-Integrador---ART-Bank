import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image, ImageSourcePropType } from 'react-native';
import { Cores } from '../styles/global';

interface MenuButtonProps {
  title: string;
  onPress: () => void;
  imageSource?: ImageSourcePropType; // Prop para sua imagem da pasta assets
  backgroundColor?: string;
  textColor?: string;
}

export function MenuButton({ title, onPress, imageSource, backgroundColor, textColor }: MenuButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.btn, backgroundColor ? { backgroundColor } : null]}
    >
      <View style={styles.content}>
        {/* Renderiza a imagem apenas se ela for passada por prop */}
        {imageSource && (
          <Image 
            source={imageSource} 
            style={styles.iconImage} 
          />
        )}
        
        <Text style={[styles.text, textColor ? { color: textColor } : null]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { 
    backgroundColor: Cores.azulClaro,
    padding: 15, 
    borderRadius: 48,
    marginVertical: 5,
    width: 300,
    marginBottom: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconImage: {
    width: 48,
    height: 48,
    marginLeft: 16,
    marginRight: 10,
    resizeMode: 'contain',
  },
  text: { 
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 24,
  }
});
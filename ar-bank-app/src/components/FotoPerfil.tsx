import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Cores } from '../styles/global';

interface FotoPerfilProps {
  fotoInicial?: string | null;
  onImagemSelecionada?: (uri: string) => void;
}

export function FotoPerfil({ fotoInicial, onImagemSelecionada }: FotoPerfilProps) {
  const [imagemUri, setImagemUri] = useState<string | null>(fotoInicial ?? null);

  const selecionarFoto = async () => {
    // 1. Solicita permissão de acesso à galeria de fotos (exigido no Mobile)
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para alterar a imagem de perfil.');
        return;
      }
    }

    // 2. Abre a janela do sistema para seleção do arquivo
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Apenas fotos
      allowsEditing: true, // Abre o cortador nativo do sistema
      aspect: [1, 1], // Força proporção quadrada perfeita para avatar
      quality: 0.7, // Compacta levemente para economizar banda do banco de dados
    });

    // 3. Trata o retorno do arquivo selecionado
    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      const uriSelecionada = resultado.assets[0].uri;
      setImagemUri(uriSelecionada);
      
      if (onImagemSelecionada) {
        onImagemSelecionada(uriSelecionada);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={selecionarFoto} activeOpacity={0.8} style={styles.avatarWrapper}>
        {imagemUri ? (
          <Image source={{ uri: imagemUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetra}>📷</Text>
          </View>
        )}
        <View style={styles.badgeEditar}>
          <Text style={styles.textoBadge}>+</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0f0f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    backgroundColor: Cores.azulClaro ?? '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: {
    fontSize: 32,
  },
  badgeEditar: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#2ecc71',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textoBadge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
  },
});
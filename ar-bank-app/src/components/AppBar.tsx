import React, { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useSegments, useFocusEffect } from 'expo-router';
import { Cores } from '../styles/global';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

interface AppBarProps {
  title: string;
  usuarioId: string;
  fotoUrl?: string | null;
}

export function AppBar({ title, usuarioId, fotoUrl }: AppBarProps) {
  const router = useRouter();
  const segments = useSegments();
  
  // Estado local para gerenciar a foto reativa dentro da AppBar
  const [fotoAtual, setFotoAtual] = useState<string | null>(fotoUrl || null);

  // Oculta a foto de perfil e a logo nas telas especificadas
  const esconderPerfil = 
    segments.includes('dadosPerfil') || 
    segments.includes('editarPerfil') || 
    segments.includes('emprestimo') || 
    segments.includes('extrato') ||
    segments.includes('cassino');

  // Sincroniza a foto local imediatamente se a propriedade pai mudar
  useEffect(() => {
    if (fotoUrl) {
      setFotoAtual(fotoUrl);
    }
  }, [fotoUrl]);

  // Executa a busca de dados atualizados do perfil sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (esconderPerfil || !usuarioId) return;

      let ativo = true;

      async function buscarFotoAtualizada() {
        try {
          const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`);
          if (resposta.ok) {
            const dados = await resposta.json();
            if (ativo && dados.fotoUrl) {
              setFotoAtual(dados.fotoUrl);
            }
          }
        } catch (err) {
          console.log("[AppBar] Erro silencioso ao atualizar foto de fundo:", err);
        }
      }

      buscarFotoAtualizada();

      return () => {
        ativo = false;
      };
    }, [usuarioId, esconderPerfil])
  );

  // Evita problemas de cache anexando um parâmetro de tempo à URI da imagem
  const obterSourceImagem = () => {
    if (fotoAtual) {
      if (fotoAtual.startsWith('file://') || fotoAtual.startsWith('data:')) {
        return { uri: fotoAtual };
      }
      return { uri: `${fotoAtual}?t=${new Date().getMinutes()}` };
    }
    return require('../../assets/images/iconProfile.png');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {/* MODIFICAÇÃO AQUI: A logo só aparece se NÃO for para esconder */}
        {!esconderPerfil ? (
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        ) : (
          /* Mantém um espaçador equivalente para o título continuar centralizado */
          <View style={styles.espacadorInvisivelLogo} />
        )}
        
        <Text style={styles.titulo}>{title}</Text>
        
        {!esconderPerfil ? (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/dadosPerfil',
              params: { id: usuarioId }
            })}
            style={styles.botaoConta}
            activeOpacity={0.7}
          >
            <Image 
              source={obterSourceImagem()} 
              style={styles.iconConta} 
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.espacadorInvisivel} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Cores.azulEscuro,
    width: "100%",
    marginBottom: 16,
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
    width: 45, 
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#ccc',
  },
  espacadorInvisivel: {
    width: 60,
    height: 50,
  },
  /* Novo estilo para manter o equilíbrio visual do título centralizado */
  espacadorInvisivelLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
  }
});
import React, { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useSegments, useFocusEffect, usePathname } from 'expo-router';
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
  const pathname = usePathname(); 
  
  const [fotoAtual, setFotoAtual] = useState<string | null>(fotoUrl || null);

 
  const esconderPerfil = 
    segments.includes('dadosPerfil') || 
    segments.includes('editarPerfil') || 
    segments.includes('emprestimo') || 
    segments.includes('extrato') ||
    segments.includes('cassino');

  
  const estaNoMenu = pathname === '/' || pathname === '/menu' || pathname.includes('menu');


  useEffect(() => {
    setFotoAtual(fotoUrl || null);
  }, [fotoUrl]);

  
  useFocusEffect(
    useCallback(() => {
      if (esconderPerfil || !usuarioId || estaNoMenu) return;

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
    }, [usuarioId, esconderPerfil, estaNoMenu])
  );

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
        
        {!esconderPerfil ? (
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        ) : (
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
  espacadorInvisivelLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
  }
});
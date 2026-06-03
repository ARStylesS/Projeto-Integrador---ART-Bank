import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { Calendario } from '@/components/Calendario';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';

export default function Extrato() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const isWebDesktop = width > 768;
  const [filtroAtivo, setFiltroAtivo] = useState<'dia' | 'mes' | 'ano'>('mes');

  const handleVoltar = () => {
    router.replace('/menu');
  };

  return (
    <View style={styles.container}>
      <AppBar title="Meu Extrato" />

      <View style={styles.layoutWrapper}>
        <ScrollView 
          contentContainerStyle={styles.content}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          
          {/* BLOCO CENTRALIZADO - Alinha perfeitamente o filtro e o histórico */}
          <View style={styles.blocoCentralizado}>
            
            {/* BARRA DE FILTROS */}
            <View style={styles.containerFiltros}>
              <TouchableOpacity 
                style={[styles.botaoFiltro, filtroAtivo === 'dia' && styles.filtroSelecionado]}
                onPress={() => setFiltroAtivo('dia')}
              >
                <Text style={[styles.textoFiltro, filtroAtivo === 'dia' && styles.textoSelecionado]}>Dia</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.botaoFiltro, filtroAtivo === 'mes' && styles.filtroSelecionado]}
                onPress={() => setFiltroAtivo('mes')}
              >
                <Text style={[styles.textoFiltro, filtroAtivo === 'mes' && styles.textoSelecionado]}>Mês</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.botaoFiltro, filtroAtivo === 'ano' && styles.filtroSelecionado]}
                onPress={() => setFiltroAtivo('ano')}
              >
                <Text style={[styles.textoFiltro, filtroAtivo === 'ano' && styles.textoSelecionado]}>Ano</Text>
              </TouchableOpacity>
            </View>

            {/* CONTAINER DO HISTÓRICO (CALENDÁRIO) */}
            <View style={styles.extratoContainer}>
              <Calendario />
            </View>

          </View>

          {/* BOTÃO VOLTAR - Agora esticado no tamanho da página e azul conforme a imagem */}
          <View style={styles.btnWrapper}>
            <StdButton 
              title="Voltar à Tela Inicial" 
              onPress={handleVoltar} 
              backgroundColor={Cores.azulClaro || '#2b62d9'} // Altere para a sua cor azul exata
              textColor="#FFFFFF"
            />
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Cores.azulFundo,
  },
  layoutWrapper: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center', 
    paddingTop: 32,
    paddingBottom: 40,
    width: '100%',
  },
  blocoCentralizado: {
    width: '92%',
    maxWidth: 950,        // Tamanho ideal expandido e centralizado na viewport
    alignItems: 'stretch', 
  },
  containerFiltros: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: Cores.azulClaro || '#2b62d9',
    paddingVertical: 10,
    paddingHorizontal: 40, 
    borderRadius: 16,     
    marginBottom: 24,
    width: '100%',        
  },
  botaoFiltro: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
    minWidth: 90,
    alignItems: 'center',
  },
  filtroSelecionado: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textoFiltro: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  textoSelecionado: {
    color: Cores.azulEscuro || '#000',
    fontWeight: 'bold',
  },
  extratoContainer: {
    width: '100%', 
  },
  btnWrapper: {
    width: '92%',        // Acompanha o tamanho total da página alinhado com o bloco
    maxWidth: 950,       // Mesmo tamanho do bloco de atividades para não sobrar
    marginTop: 40,
  }
});
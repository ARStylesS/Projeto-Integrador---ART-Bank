import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../src/styles/global';
import { Ionicons } from '@expo/vector-icons';

export default function GerenciarPerfil() {
  const router = useRouter();

  // Estados preparados para receber os dados vindos da API futura
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');

  // Estado para controlar a abertura do Bottom Sheet (Estilo Nubank)
  const [menuConfigVisivel, setMenuConfigVisivel] = useState(false);

  const gotoMenu = () => {
    router.replace('/menu');
  };

  const handleSair = () => {
    router.replace('/'); 
  };

  const handleExcluirConta = () => {
    alert('Ação para deletar conta via API');
  };

  const handleAlterarFoto = () => {
    alert('Ação para upload de foto via API');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Bloco do Perfil do Usuário */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            
            {/* Foto de Perfil com botão para alterar */}
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../assets/images/iconProfile.png')} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.editPhotoBadge} onPress={handleAlterarFoto}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Informações textuais preparadas para a API */}
            <View style={styles.infoContainer}>
              <Text style={styles.userName}>{nome || "Carregando nome..."}</Text>
              <Text style={styles.userSubtext}>{email || "E-mail não informado"}</Text>
              <Text style={styles.userSubtext}>{telefone || "Telefone não informado"}</Text>
            </View>

            {/* Engrenagem que abre o menu flutuante de baixo igual Nubank */}
            <TouchableOpacity 
              style={styles.configButton} 
              onPress={() => setMenuConfigVisivel(true)}
            >
              <Ionicons name="settings-outline" size={26} color={Cores.azulEscuro} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco de Informações Bancárias e Opções */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Dados Bancários</Text>
          <View style={styles.boxInfo}>
            <Text style={styles.text}>Agência: <Text style={styles.infoText}>{agencia || "----"}</Text></Text>
            <Text style={styles.text}>Conta Corrente: <Text style={styles.infoText}>{conta || "--------- "}</Text></Text>
          </View>

          <Text style={styles.sectionTitle}>Meus Cartões</Text>
          <View style={styles.cardItem}>
            <Ionicons name="card-outline" size={20} color="#555" style={{ marginRight: 8 }} />
            <Text style={styles.subtext}>Cartão de Débito Visa</Text>
          </View>
          <View style={styles.cardItem}>
            <Ionicons name="card-outline" size={20} color="#555" style={{ marginRight: 8 }} />
            <Text style={styles.subtext}>Cartão de Crédito MasterCard</Text>
          </View>

          <View style={styles.divider} />

          <StdButton 
            title="Voltar à Tela Inicial" 
            onPress={gotoMenu} 
            backgroundColor={Cores.azulClaro}
          />

          <StdButton 
            title="Sair do Aplicativo" 
            onPress={handleSair} 
            backgroundColor="#9e9e9e"
          />

          <StdButton 
            title="Excluir a Conta" 
            onPress={handleExcluirConta} 
            backgroundColor="#e53935" 
          />
        </View>
      </ScrollView>

      {/* BOTTOM SHEET FLUTUANTE DE VERDADE (ESTILO NUBANK) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuConfigVisivel}
        statusBarTranslucent={true} // Faz o fundo escuro cobrir até a barra de status lá no topo
        onRequestClose={() => setMenuConfigVisivel(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuConfigVisivel(false)}>
          <View style={styles.sheetOverlay}>
            
            <TouchableWithoutFeedback>
              {/* O segredo da flutuação está nas bordas completas e margens deste container */}
              <View style={styles.sheetContent}>
                
                {/* Linha de arrastar visual */}
                <View style={styles.sheetIndicator} />

                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Configurações</Text>
                  <TouchableOpacity onPress={() => setMenuConfigVisivel(false)}>
                    <Ionicons name="close-circle" size={24} color="#ccc" />
                  </TouchableOpacity>
                </View>

                {/* Opções Flutuantes */}
                <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuConfigVisivel(false); alert('Editar Perfil'); }}>
                  <View style={styles.iconBackground}>
                    <Ionicons name="person-outline" size={20} color={Cores.azulEscuro} />
                  </View>
                  <Text style={styles.sheetOptionText}>Editar dados do perfil</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuConfigVisivel(false); alert('Segurança'); }}>
                  <View style={styles.iconBackground}>
                    <Ionicons name="shield-half-outline" size={20} color={Cores.azulEscuro} />
                  </View>
                  <Text style={styles.sheetOptionText}>Segurança e Senhas</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuConfigVisivel(false); alert('Notificações'); }}>
                  <View style={styles.iconBackground}>
                    <Ionicons name="notifications-outline" size={20} color={Cores.azulEscuro} />
                  </View>
                  <Text style={styles.sheetOptionText}>Configurar Notificações</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuConfigVisivel(false); alert('Ajuda'); }}>
                  <View style={styles.iconBackground}>
                    <Ionicons name="help-circle-outline" size={20} color={Cores.azulEscuro} />
                  </View>
                  <Text style={styles.sheetOptionText}>Me ajuda / Suporte</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: "100%",
    backgroundColor: Cores.azulClaro,
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',      
    alignItems: 'center', 
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
  },
  editPhotoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Cores.azulEscuro,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
    justifyContent: 'center',
  },
  userName: {
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  userSubtext: {
    fontFamily: "sans-serif",
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  configButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  form: { 
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: '100%',
  },
  boxInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 8,
  },
  text: {
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  infoText: {
    fontWeight: 'normal',
    color: '#000',
  },
  sectionTitle: {
    fontFamily: "sans-serif",
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
    color: '#333',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  
  /* ─── INTERFACE DO BOTTOM SHEET FLUTUANTE REESTRUTURADA ─── */
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Escurece o fundo
    justifyContent: 'flex-end',            // Alinha o menu na base da tela
  },
  sheetContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,                      // Arredonda todas as pontas para criar o efeito flutuante descolado
    marginHorizontal: 16,                  // Afasta das laterais da tela
    marginBottom: 24,                      // Afasta da base da tela, dando o efeito de "flutuação" no ar
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    minHeight: 380,
    
    // Sombras estruturadas para dar profundidade de elevação
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  sheetIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7f7f7',
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sheetOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
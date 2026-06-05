import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

export default function GerenciarPerfil() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const obterUsuarioId = (): string => {
    console.log("[DEBUG] Parâmetros brutos recebidos na rota Perfil:", params);

    if (params.id) {
      return String(params.id);
    }
    
    if (params.usuario) {
      try {
        const strUsuario = typeof params.usuario === 'string' ? params.usuario : String(params.usuario);
        const limpaString = strUsuario.startsWith('"') && strUsuario.endsWith('"') ? JSON.parse(strUsuario) : strUsuario;
        const parsed = typeof limpaString === 'object' ? limpaString : JSON.parse(limpaString);
        
        if (parsed && parsed.id) {
          return String(parsed.id);
        }
      } catch (e) {
        console.warn("[DEBUG] Erro ao fazer o parse do parâmetro 'usuario':", e);
      }
    }
    
    return "1"; 
  };

  const usuarioId = obterUsuarioId();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [agencia, setAgencia] = useState('0001');
  const [conta, setConta] = useState('--------');
  const [saldo, setSaldo] = useState(0);

  const [menuConfigVisivel, setMenuConfigVisivel] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function carregarDadosPerfil() {
        const urlFinal = `${API_URL}/perfil/${usuarioId}`;
        console.log(`[HTTP GET] Efetuando requisição para: ${urlFinal}`);

        try {
          const resposta = await fetch(urlFinal);
          const dados = await resposta.json();

          if (resposta.ok) {
            console.log("[API SUCCESS] Corpo completo retornado pela API:", dados);
            
            setNome(dados.nome || "Sem Nome");
            setEmail(dados.email || "Sem E-mail");
            setTelefone(dados.telefone || dados.telefoneUsuario || "Sem Telefone");
            setSaldo(Number(dados.saldo) || 0);
            
            // Tratamento flexível caso agência/conta venham aninhados ou com nomes diferentes na API
            const agenciaDetectada = dados.agencia || dados.agenciaUsuario || (dados.contaBancaria && dados.contaBancaria.agencia) || "0001";
            const contaDetectada = dados.conta || dados.numeroConta || dados.contaUsuario || (dados.contaBancaria && dados.contaBancaria.numeroConta) || "--------";

            setAgencia(String(agenciaDetectada));
            setConta(String(contaDetectada));

          } else {
            console.warn("[API ERROR] Resposta de erro do servidor:", dados.erro);
          }
        } catch (error) {
          console.error("[NET ERROR] Falha de rede ao conectar à API:", error);
        }
      }
      
      carregarDadosPerfil();
    }, [usuarioId])
  );

  const gotoMenu = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      const usuarioPayload = {
        id: usuarioId,
        nome: nome,
        email: email,
        telefone: telefone,
        agencia: agencia,
        conta: conta,
        saldo: saldo
      };

      router.replace({
        pathname: '/menu',
        params: { id: usuarioId, usuario: JSON.stringify(usuarioPayload) }
      });
    }
  };

  const handleSair = () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('@ARBank:user');
    }
    setNome('');
    setEmail('');
    setTelefone('');
    setAgencia('0001');
    setConta('--------');
    setSaldo(0);
    router.replace('/'); 
  };

  const handleExcluirConta = () => {
    const executarExclusao = async () => {
      try {
        console.log(`[HTTP DELETE] Iniciando requisição para: ${API_URL}/perfil/${usuarioId}`);
        
        const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          if (Platform.OS === 'web') {
            alert('Sua conta foi excluída com sucesso.');
            localStorage.removeItem('@ARBank:user');
          } else {
            Alert.alert('Sucesso', 'Sua conta foi excluída com sucesso.');
          }
          
          setNome('');
          setEmail('');
          setTelefone('');
          setAgencia('0001');
          setConta('--------');
          setSaldo(0);
          
          router.replace('/');
        } else {
          const erroServidor = dados.erro || 'Não foi possível completar a exclusão.';
          if (Platform.OS === 'web') alert(`Erro: ${erroServidor}`);
          else Alert.alert('Erro', erroServidor);
        }
      } catch (error) {
        console.error('[NET ERROR] Falha crítica ao disparar requisição DELETE:', error);
        if (Platform.OS === 'web') {
          alert('Erro de rede ao conectar com o servidor. Verifique se o backend está online.');
        } else {
          Alert.alert('Erro de Rede', 'Não foi possível estabelecer contato com o servidor local.');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm("Tem certeza absoluta que deseja excluir sua conta? Esta ação não pode ser desfeita.");
      if (confirmou) executarExclusao();
    } else {
      Alert.alert(
        'Excluir Conta',
        'Tem certeza absoluta que deseja excluir sua conta? Esta ação é permanente e todos os seus dados serão apagados.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: executarExclusao },
        ]
      );
    }
  };

  const handleAlterarFoto = () => {
    if (Platform.OS === 'web') alert('Ação para upload de foto via API');
    else Alert.alert('Ação para upload de foto via API');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={require('../../../assets/images/iconProfile.png')} style={styles.avatar} />
              <TouchableOpacity style={styles.editPhotoBadge} onPress={handleAlterarFoto}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.userName}>{nome || "Carregando nome..."}</Text>
              <Text style={styles.userSubtext}>{email || "E-mail não informado"}</Text>
              <Text style={styles.userSubtext}>{telefone || "Telefone não informado"}</Text>
            </View>

            <TouchableOpacity style={styles.configButton} onPress={() => setMenuConfigVisivel(true)}>
              <Ionicons name="settings-outline" size={26} color={Cores.azulEscuro} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Dados Bancários</Text>
          <View style={styles.boxInfo}>
            <Text style={styles.text}>Agência: <Text style={styles.infoText}>{agencia}</Text></Text>
            <Text style={styles.text}>Conta Corrente: <Text style={styles.infoText}>{conta}</Text></Text>
            <Text style={styles.text}>Saldo Disponível: <Text style={[styles.infoText, { fontWeight: 'bold', color: Cores.verde }]}>R$ {saldo.toFixed(2)}</Text></Text>
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

          <StdButton title="Voltar à Tela Inicial" onPress={gotoMenu} backgroundColor={Cores.azulClaro} />
          <StdButton title="Sair do Aplicativo" onPress={handleSair} backgroundColor="#9e9e9e" />
          <StdButton title="Excluir a Conta" onPress={handleExcluirConta} backgroundColor="#e53935" />
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={menuConfigVisivel} statusBarTranslucent={true} onRequestClose={() => setMenuConfigVisivel(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuConfigVisivel(false)}>
          <View style={styles.sheetOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheetContent}>
                <View style={styles.sheetIndicator} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Configurações</Text>
                  <TouchableOpacity onPress={() => setMenuConfigVisivel(false)}>
                    <Ionicons name="close-circle" size={24} color="#ccc" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuConfigVisivel(false); router.push({ pathname: '/editarPerfil', params: { id: usuarioId } }); }}>
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
  container: { flex: 1, width: "100%", backgroundColor: Cores.azulClaro },
  scrollContent: { paddingBottom: 40, width: '100%', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20, flexGrow: 1 },
  profileCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 20, width: '100%', marginBottom: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#f0f0f0' },
  editPhotoBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Cores.azulEscuro, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  infoContainer: { flex: 1, marginLeft: 16, marginRight: 8, justifyContent: 'center' },
  userName: { fontWeight: 'bold', fontSize: 18, color: '#333', marginBottom: 4 },
  userSubtext: { fontSize: 13, color: '#666', marginBottom: 2 },
  configButton: { padding: 4, alignSelf: 'flex-start' },
  form: { padding: 24, backgroundColor: "#FFFFFF", borderRadius: 12, width: '100%' },
  boxInfo: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 20, marginTop: 8 },
  text: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#555' },
  infoText: { fontWeight: 'normal', color: '#000' },
  sectionTitle: { fontWeight: 'bold', fontSize: 18, marginTop: 10, color: '#333' },
  cardItem: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  subtext: { fontSize: 14, color: '#666' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  sheetContent: { backgroundColor: '#FFF', borderRadius: 24, marginHorizontal: 16, marginBottom: 24, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, minHeight: 380, elevation: 8 },
  sheetIndicator: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f7f7f7' },
  iconBackground: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f5ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  sheetOptionText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#333' }
});
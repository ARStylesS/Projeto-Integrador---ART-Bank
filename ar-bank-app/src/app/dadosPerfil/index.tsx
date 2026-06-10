import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StdButton } from '@/components/StdButton';
import { Cores } from '../../styles/global';
import { Ionicons } from '@expo/vector-icons';
import { AppBar } from '@/components/AppBar';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'web' ? 'http://localhost:3333' : 'http://10.0.2.2:3333');

interface CartaoVirtual {
  id: string;
  numero: string;
  bandeira: string;
  tipo: 'Débito' | 'Crédito' | 'Débito / Crédito';
}

const formatarCelular = (text: string) => {
  const nums = text.replace(/\D/g, ''); 
  if (nums.length <= 2) return nums;
  if (nums.length <= 7) return `(${nums.substring(0, 2)}) ${nums.substring(2)}`;
  return `(${nums.substring(0, 2)}) ${nums.substring(2, 7)}-${nums.substring(7, 11)}`;
};

const formatarTelefoneFixo = (text: string) => {
  const nums = text.replace(/\D/g, ''); 
  if (nums.length <= 2) return nums;
  if (nums.length <= 6) return `(${nums.substring(0, 2)}) ${nums.substring(2)}`;
  return `(${nums.substring(0, 2)}) ${nums.substring(2, 6)}-${nums.substring(6, 10)}`;
};

export default function DadosPerfil() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const usuarioId = useMemo((): string => {
    if (params.id) return String(params.id);
    if (params.usuario) {
      try {
        const strUsuario = typeof params.usuario === 'string' ? params.usuario : String(params.usuario);
        const limpaString = strUsuario.startsWith('"') && strUsuario.endsWith('"') ? JSON.parse(strUsuario) : strUsuario;
        const parsed = typeof limpaString === 'object' ? limpaString : JSON.parse(limpaString);
        if (parsed && parsed.id) return String(parsed.id);
      } catch (e) {
        console.warn("[DEBUG] Erro ao fazer o parse do parâmetro 'usuario':", e);
      }
    }
    return "1"; 
  }, [params.id, params.usuario]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [telefone, setTelefone] = useState('');
  const [agencia, setAgencia] = useState('0001');
  const [conta, setConta] = useState('--------');
  const [saldo, setSaldo] = useState(0);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoDoBanco, setFotoDoBanco] = useState<string | null>(null);
  const [cartoesVirtuais, setCartoesVirtuais] = useState<CartaoVirtual[]>([]);
  const [tipoCartaoSelecionado, setTipoCartaoSelecionado] = useState<'Débito' | 'Crédito' | 'Débito / Crédito'>('Débito');

  useFocusEffect(
    useCallback(() => {
      async function carregarDadosPerfil() {
        const urlFinal = `${API_URL}/perfil/${usuarioId}`;
        try {
          const resposta = await fetch(urlFinal);
          const dados = await resposta.json();
          if (resposta.ok) {
            setNome(dados.nome || "Sem Nome");
            setEmail("Email cadastrado: " + (dados.email || "Sem E-mail"));
            
            const telBruto = dados.telefone || dados.telefoneUsuario || "";
            const celBruto = dados.celular || "";

            setTelefone("Telefone-Fixo: " + (telBruto ? formatarTelefoneFixo(telBruto) : "Sem Telefone"));
            setCelular("Celular: " + (celBruto ? formatarCelular(celBruto) : "Sem Celular"));
            
            setSaldo(Number(dados.saldo) || 0);
            setFotoPerfil(dados.fotoUrl || null);
            setFotoDoBanco(dados.fotoUrl || null);
            const agenciaDetectada = dados.agencia || dados.agenciaUsuario || (dados.contaBancaria && dados.contaBancaria.agencia) || "0001";
            const contaDetectada = dados.conta || dados.numeroConta || dados.contaUsuario || (dados.contaBancaria && dados.contaBancaria.numeroConta) || "--------";
            setAgencia(String(agenciaDetectada));
            setConta(String(contaDetectada));

            if (dados.cartoes && Array.isArray(dados.cartoes)) {
              setCartoesVirtuais(dados.cartoes);
            } else {
              try {
                const resCartoes = await fetch(`${API_URL}/cartoes/${usuarioId}`);
                if (resCartoes.ok) {
                  const listaCartoes = await resCartoes.json();
                  setCartoesVirtuais(listaCartoes);
                }
              } catch (err) {
                console.log("Rota alternativa de cartões não configurada ou indisponível.");
              }
            }
          }
        } catch (error) {
          console.error("[NET ERROR] Falha de rede ao conectar à API:", error);
        }
      }
      carregarDadosPerfil();
    }, [usuarioId])
  );

  const imagemPerfilCentral = useMemo(() => {
    if (fotoPerfil) {
      if (fotoPerfil.startsWith('file://') || fotoPerfil.startsWith('data:')) {
        return { uri: fotoPerfil };
      }
      return { uri: `${fotoPerfil}?t=${new Date().getTime()}` };
    }
    return require('../../../assets/images/iconProfile.png');
  }, [fotoPerfil]);

  const handleAdicionarCartaoVirtual = async () => {
    if (cartoesVirtuais.length >= 3) {
      if (Platform.OS === 'web') alert('Você atingiu o limite máximo de 3 cartões virtuais ativos.');
      else Alert.alert('Limite Atingido', 'Você atingiu o limite máximo de 3 cartões virtuais ativos.');
      return;
    }

    const quatroUltimosDigitos = Math.floor(1000 + Math.random() * 9000).toString();
    const numeroGerado = `•••• •••• •••• ${quatroUltimosDigitos}`;
    const bandeiraGerada = Math.random() > 0.5 ? 'Visa' : 'MasterCard';

    try {
      const resposta = await fetch(`${API_URL}/cartoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: usuarioId,
          numero: numeroGerado,
          bandeira: bandeiraGerada,
          tipo: tipoCartaoSelecionado,
        }),
      });

      const dadosNovoCartao = await resposta.json();

      if (resposta.ok) {
        setCartoesVirtuais([...cartoesVirtuais, dadosNovoCartao]);
        if (Platform.OS === 'web') alert(`Cartão Virtual ${dadosNovoCartao.bandeira} (${dadosNovoCartao.tipo}) criado com sucesso!`);
        else Alert.alert('Sucesso', `Cartão Virtual ${dadosNovoCartao.bandeira} (${dadosNovoCartao.tipo}) gerado e salvo no banco!`);
      } else {
        throw new Error(dadosNovoCartao.erro || 'Falha ao registrar cartão no servidor');
      }
    } catch (error) {
      console.error("[API ERROR] Não foi possível salvar o cartão:", error);
      if (Platform.OS === 'web') alert('Erro ao salvar o cartão no banco de dados.');
      else Alert.alert('Erro', 'Não foi possível registrar o cartão no banco.');
    }
  };

  const handleExcluirCartaoVirtual = async (id: string) => {
    try {
      const resposta = await fetch(`${API_URL}/cartoes/${id}`, {
        method: 'DELETE',
      });

      if (resposta.ok) {
        setCartoesVirtuais(cartoesVirtuais.filter(cartao => cartao.id !== id));
      } else {
        throw new Error('Não foi possível remover o cartão do servidor.');
      }
    } catch (error) {
      console.error("[API ERROR] Erro ao deletar o cartão:", error);
      if (Platform.OS === 'web') alert('Erro ao excluir o cartão no servidor.');
      else Alert.alert('Erro', 'Não foi possível deletar o cartão.');
    }
  };

  const gotoMenu = () => {
    router.replace({ pathname: '/menu', params: { id: usuarioId } });
  };

  const handleSair = () => {
    if (Platform.OS === 'web') localStorage.removeItem('@ARBank:user');
    setNome(''); setEmail(''); setTelefone(''); setCelular('');
    setAgencia('0001'); setConta('--------'); setSaldo(0);
    setFotoPerfil(null); setFotoDoBanco(null); setCartoesVirtuais([]);
    router.replace('/'); 
  };

  const handleEditarPerfil = () => {
    router.push({ pathname: '/editarPerfil', params: { id: usuarioId } });
  };

  const handleExcluirConta = () => {
    const ejecutarExclusao = async () => {
      try {
        const resposta = await fetch(`${API_URL}/perfil/${usuarioId}`, { method: 'DELETE' });
        if (resposta.ok) {
          if (Platform.OS === 'web') {
            alert('Sua conta foi excluída com sucesso.');
            localStorage.removeItem('@ARBank:user');
          } else Alert.alert('Sucesso', 'Sua conta foi excluída com sucesso.');
          router.replace('/');
        }
      } catch (error) {
        console.error('[NET ERROR]', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Tem certeza absoluta que deseja excluir sua conta?")) ejecutarExclusao();
    } else {
      Alert.alert('Excluir Conta', 'Tem certeza permanente?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: ejecutarExclusao },
      ]);
    }
  };

  const enviarFotoParaServidor = async (uriSelecionada: string) => {
    const formData = new FormData();
    try {
      if (Platform.OS === 'web') {
        const respostaImg = await fetch(uriSelecionada);
        const blob = await respostaImg.blob();
        formData.append('foto', new File([blob], `avatar.jpeg`, { type: blob.type }));
      } else {
        formData.append('foto', {
          uri: Platform.OS === 'android' ? uriSelecionada : uriSelecionada.replace('file://', ''),
          name: 'avatar.jpg',
          type: 'image/jpeg',
         } as any);
      }
      const resposta = await fetch(`${API_URL}/perfil/${usuarioId}/foto`, { method: 'POST', body: formData });
      const dados = await resposta.json();
      if (resposta.ok) {
        setFotoPerfil(dados.fotoUrl);
        setFotoDoBanco(dados.fotoUrl);
      }
    } catch (erro) { console.error(erro); }
  };

  const handleAlterarFoto = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!resultado.canceled && resultado.assets.length > 0) {
      const uriSelecionada = resultado.assets[0].uri;
      enviarFotoParaServidor(uriSelecionada);
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title="Dados do Perfil" usuarioId={usuarioId} fotoUrl={fotoPerfil} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={imagemPerfilCentral} style={styles.avatar} resizeMode="cover" />
              <TouchableOpacity style={styles.editPhotoBadge} onPress={handleAlterarFoto}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.userName}>{nome || "Carregando nome..."}</Text>
              <Text style={styles.userSubtext}>{email || "E-mail não informado"}</Text>
              <Text style={styles.userSubtext}>{telefone || "Telefone não informado"}</Text>
              <Text style={styles.userSubtext}>{celular || "Celular não informado"}</Text>
            </View>

            <TouchableOpacity style={styles.configButton} onPress={handleEditarPerfil}>
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
          
          {cartoesVirtuais.map((cartao) => (
            <View key={cartao.id} style={[styles.cardItem, styles.virtualCardItem]}>
              <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="phone-portrait-outline" size={20} color={Cores.azulClaro} style={{ marginRight: 8 }} />
                  <Text style={[styles.subtext, { color: Cores.azulEscuro, fontWeight: '700' }]}>
                    Virtual {cartao.bandeira}
                  </Text>
                </View>
                <Text style={[styles.subtext, { color: '#555', marginLeft: 28, fontSize: 13 }]}>
                  {cartao.numero}
                </Text>
                <Text style={[styles.tagTipoCartao, { 
                  backgroundColor: cartao.tipo === 'Débito' ? '#e8f5e9' : cartao.tipo === 'Crédito' ? '#fff3e0' : '#f3e5f5', 
                  color: cartao.tipo === 'Débito' ? '#2e7d32' : cartao.tipo === 'Crédito' ? '#ef6c00' : '#6a1b9a' 
                }]}>
                  {cartao.tipo}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleExcluirCartaoVirtual(cartao.id)}>
                <Ionicons name="trash-outline" size={18} color="#e53935" />
              </TouchableOpacity>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 20, color: '#666' }]}>Opções para o novo cartão:</Text>
          <View style={styles.seletorTipoContainer}>
            {(['Débito', 'Crédito', 'Débito / Crédito'] as const).map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.opcaoTipoBotao, tipoCartaoSelecionado === tipo && styles.opcaoTipoBotaoAtivo]}
                onPress={() => setTipoCartaoSelecionado(tipo)}
              >
                <Text style={[styles.opcaoTipoTexto, tipoCartaoSelecionado === tipo && styles.opcaoTipoTextoAtivo]}>
                  {tipo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.btnAddVirtualCard} 
            onPress={handleAdicionarCartaoVirtual}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={Cores.azulClaro} style={{ marginRight: 6 }} />
            <Text style={styles.btnAddVirtualCardText}>Gerar Cartão Virtual ({tipoCartaoSelecionado})</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <StdButton title="Voltar ao Menu" onPress={gotoMenu} backgroundColor={Cores.azulClaro} />
          <StdButton title="Sair da Conta" onPress={handleSair} backgroundColor="#9e9e9e" />
          <StdButton title="Excluir a Conta" onPress={handleExcluirConta} backgroundColor="#e53935" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", backgroundColor: Cores.azulEscuro },
  scrollContent: { paddingBottom: 40, width: '100%', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 40, flexGrow: 1 },
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
  cardItem: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  subtext: { fontSize: 14, color: '#666' },
  virtualCardItem: { 
    justifyContent: 'space-between', 
    backgroundColor: '#e3f2fd', 
    padding: 12, 
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  tagTipoCartao: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    marginLeft: 28
  },
  seletorTipoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 6
  },
  opcaoTipoBotao: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fefefe'
  },
  opcaoTipoBotaoAtivo: {
    borderColor: Cores.azulClaro,
    backgroundColor: '#e3f2fd'
  },
  opcaoTipoTexto: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600'
  },
  opcaoTipoTextoAtivo: {
    color: Cores.azulEscuro,
    fontWeight: '700'
  },
  btnAddVirtualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Cores.azulClaro,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    backgroundColor: '#fafafa',
  },
  btnAddVirtualCardText: {
    color: Cores.azulClaro,
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
});
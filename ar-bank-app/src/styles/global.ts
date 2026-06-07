import { StyleSheet } from 'react-native';

// Centralizamos as cores para mudar o tema do banco em um só lugar
export const Cores = {
    azulEscuro: '#071d9e',
    azulClaro: '#2864E5',
    azulFundo: '#bed1ff',

    amarelo: '#F6A40B',
    amareloFundo: '#FFEE8D',
    laranja: '#FF9500',
    laranjaFundo: '#fff8ef',
    verde: '#1D9437',
    verdeFundo: '#cff8cf',

    branco: '#ffffff',
    cinza: '#f4f4f4',
    texto: '#333333',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Cores.branco,
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: Cores.azulClaro,
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
  },
});
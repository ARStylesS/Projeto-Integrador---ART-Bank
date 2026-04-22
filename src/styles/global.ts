import { StyleSheet } from 'react-native';

// Centralizamos as cores para mudar o tema do banco em um só lugar
export const Cores = {
    azulEscuro: '#2920AA',
    azulClaro: '#2864E5',
    azulFundo: '#D3E1FF',

    rosa: '#FF1083',
    rosaFundo: '#FFD5DB',
    teal: '#34A89A',
    tealFundo: '#D5F8E9',

    amarelo: '#F6A40B',
    amareloFundo: '#FFEE8D',
    laranja: '#FF9500',
    laranjaFundo: '#FFEBCC',
    verde: '#1D9437',
    verdeFundo: '#C9EEC6',
    roxo: '#B918C2',
    roxoFundo: '#ecb8e8',

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
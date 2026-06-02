import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Cores } from '../styles/global'; 

interface Transacao {
  id: string;
  descricao: string;
  valor: string;
  data: string; 
  horario: string;
  tipo: 'entrada' | 'saida';
}

export function Calendario() {
  const transacoesMock: Transacao[] = [
    { id: '1', descricao: 'Transferência Enviada', valor: 'R$ 200,00', data: 'Hoje', horario: '14:32', tipo: 'saida' },
    { id: '2', descricao: 'Pix Recebido', valor: 'R$ 1.250,50', data: 'Ontem', horario: '09:15', tipo: 'entrada' },
    { id: '3', descricao: 'Pagar Solicitação', valor: 'R$ 50,00', data: '28 Mai', horario: '19:01', tipo: 'saida' },
    { id: '4', descricao: 'Recarga de Celular', valor: 'R$ 30,00', data: '25 Mai', horario: '11:20', tipo: 'saida' },
  ];

  return (
    <View style={styles.cardExtrato}>
      <Text style={styles.tituloSecao}>Histórico de Atividades</Text>

      <View>
        {transacoesMock.map((item) => (
          <View key={item.id} style={styles.itemTransacao}>
            
            {/* Esquerda: Data e Hora */}
            <View style={styles.containerData}>
              <Text style={styles.txtData}>{item.data}</Text>
              <Text style={styles.txtHorario}>{item.horario}</Text>
            </View>

            {/* Direita: Descrição e Valor */}
            <View style={styles.containerInfo}>
              <Text style={styles.txtDescricao}>{item.descricao}</Text>
              <Text style={[styles.txtValor, { color: item.tipo === 'entrada' ? '#2e7d32' : '#333' }]}>
                {item.tipo === 'entrada' ? `+ ${item.valor}` : `- ${item.valor}`}
              </Text>
            </View>

          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardExtrato: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24, 
    width: '100%', // Adota o tamanho total do container pai alinhando as pontas
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, 
    shadowRadius: 6,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  itemTransacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, 
    borderBottomWidth: 1,
    borderBottomColor: '#fcfcfc',
  },
  containerData: {
    minWidth: 75, 
    marginRight: 16,
  },
  txtData: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  txtHorario: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  containerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txtDescricao: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  txtValor: {
    fontSize: 16,
    fontWeight: '700',
  },
});
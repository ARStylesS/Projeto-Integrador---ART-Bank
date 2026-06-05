import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Transacao {
  id: string;
  valor: number;
  tipo: 'ENVIADO' | 'RECEBIDO';
  remetente: string;
  destinatario: string;
  status: string;
  dataTransacao: string;
}

interface CalendarioProps {
  transacoes: Transacao[];
}

export function Calendario({ transacoes }: CalendarioProps) {
  // Garantia absoluta de que "transacoes" é um array antes de executar qualquer lógica
  const listaTransacoes = Array.isArray(transacoes) ? transacoes : [];

  return (
    <View style={styles.cardExtrato}>
      <Text style={styles.tituloSecao}>Histórico de Atividades</Text>

      {listaTransacoes.length === 0 ? (
        <Text style={styles.textoVazio}>Nenhuma transação encontrada neste período.</Text>
      ) : (
        listaTransacoes.map((item) => {
          // Validação individual do item para evitar crash caso a transação venha incompleta do banco
          if (!item || !item.dataTransacao) return null;

          const data = new Date(item.dataTransacao);
          const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
          const horario = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          
          const descricao = item.tipo === 'RECEBIDO'
            ? `Recebido de ${item.remetente || 'Usuário'}`
            : `Enviado para ${item.destinatario || 'Usuário'}`;

          const valorValido = typeof item.valor === 'number' ? item.valor : 0;

          return (
            <View key={item.id} style={styles.itemTransacao}>
              <View style={styles.containerData}>
                <Text style={styles.txtData}>{dataFormatada}</Text>
                <Text style={styles.txtHorario}>{horario}</Text>
              </View>
              <View style={styles.containerInfo}>
                <Text style={styles.txtDescricao}>{descricao}</Text>
                <Text style={[styles.txtValor, { color: item.tipo === 'RECEBIDO' ? '#2e7d32' : '#e74c3c' }]}>
                  {item.tipo === 'RECEBIDO' ? '+' : '-'} R$ {valorValido.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardExtrato: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
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
  textoVazio: {
    textAlign: 'center',
    color: '#888',
    fontSize: 15,
    paddingVertical: 32,
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
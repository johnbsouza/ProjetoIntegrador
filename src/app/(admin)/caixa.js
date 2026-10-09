import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CaixaEstoqueScreen() {
  const movimentacoes = [
    { id: 1, tipo: 'Entrada', descricao: 'Serviço - Alongamento em Gel', valor: '+ R$ 150,00', hora: '10:30' },
    { id: 2, tipo: 'Entrada', descricao: 'Serviço - Spa dos Pés', valor: '+ R$ 85,00', hora: '09:15' },
    { id: 3, tipo: 'Saída', descricao: 'Compra de Esmaltes Nude', valor: '- R$ 120,00', hora: 'Ontem' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.saldoCard}>
          <Text style={styles.saldoTitle}>Saldo em Caixa</Text>
          <Text style={styles.saldoValue}>R$ 3.450,00</Text>
        </View>

        <Text style={styles.sectionTitle}>Movimentações Recentes</Text>

        {movimentacoes.map((item) => {
          const isEntrada = item.tipo === 'Entrada';
          return (
            <View key={item.id} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: isEntrada ? '#434643' : '#FF4C4C' }]}>
                <Ionicons name={isEntrada ? 'arrow-down' : 'arrow-up'} size={18} color="#FFFFFF" />
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.descText}>{item.descricao}</Text>
                <Text style={styles.horaText}>{item.hora}</Text>
              </View>
              <Text style={[styles.valorText, { color: isEntrada ? '#FF98B9' : '#FF4C4C' }]}>{item.valor}</Text>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  saldoCard: { backgroundColor: '#595959', borderRadius: 15, padding: 25, borderWidth: 1, borderColor: '#6B6E6B', marginBottom: 25, alignItems: 'center' },
  saldoTitle: { fontSize: 14, color: '#D1D1D1', marginBottom: 8, fontWeight: 'bold' },
  saldoValue: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#595959', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#6B6E6B' },
  iconBox: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoBox: { flex: 1 },
  descText: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  horaText: { fontSize: 12, color: '#D1D1D1' },
  valorText: { fontSize: 15, fontWeight: 'bold' },
});
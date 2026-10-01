import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TelaGanhos() {
  const extrato = [
    { id: 1, servico: 'Spa dos Pés', cliente: 'Mariana Alves', data: 'Hoje', valor: '+ R$ 42,50' },
    { id: 2, servico: 'Alongamento em Gel', cliente: 'Sofia Costa', data: 'Hoje', valor: '+ R$ 75,00' },
    { id: 3, servico: 'Manicure Clássica', cliente: 'Carla Silva', data: 'Ontem', valor: '+ R$ 22,50' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Ganhos 💰</Text>
        <Text style={styles.subtitle}>Acompanhe suas comissões</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Card de Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Saldo Disponível (Mês)</Text>
          <Text style={styles.balanceValue}>R$ 1.845,00</Text>
          <View style={styles.balanceDivider} />
          <Text style={styles.balanceDesc}>Próximo repasse: Sexta-feira, 05/10</Text>
        </View>

        {/* Histórico */}
        <Text style={styles.sectionTitle}>Histórico Recente</Text>
        {extrato.map(item => (
          <View key={item.id} style={styles.transactionCard}>
            <View style={styles.iconBox}>
              <Ionicons name="cash-outline" size={24} color="#E4A0B7" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.serviceName}>{item.servico}</Text>
              <Text style={styles.clientName}>{item.cliente} • {item.data}</Text>
            </View>
            <Text style={styles.transactionValue}>{item.valor}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  header: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E4A0B7' },
  subtitle: { fontSize: 14, color: '#A3B19B', marginTop: 4 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  balanceCard: { backgroundColor: '#E4A0B7', borderRadius: 15, padding: 25, marginBottom: 30 },
  balanceTitle: { fontSize: 14, color: '#1A2418', opacity: 0.8 },
  balanceValue: { fontSize: 38, fontWeight: 'bold', color: '#1A2418', marginVertical: 10 },
  balanceDivider: { height: 1, backgroundColor: 'rgba(26, 36, 24, 0.1)', my: 10 },
  balanceDesc: { fontSize: 13, color: '#1A2418', marginTop: 10, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2C1B', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#3A4E36' },
  iconBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#2C3D29', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  transactionInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  clientName: { fontSize: 12, color: '#A3B19B' },
  transactionValue: { fontSize: 16, fontWeight: 'bold', color: '#E4A0B7' },
});
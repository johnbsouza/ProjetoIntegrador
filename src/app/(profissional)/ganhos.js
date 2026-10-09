import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GanhosProfissionalScreen() {
  const historico = [
    { id: 1, servico: 'Spa dos Pés', cliente: 'Mariana Alves', data: 'Hoje', valor: '+ R$ 42,50' },
    { id: 2, servico: 'Alongamento em Gel', cliente: 'Sofia Costa', data: 'Hoje', valor: '+ R$ 75,00' },
    { id: 3, servico: 'Manicure Clássica', cliente: 'Carla Silva', data: 'Ontem', valor: '+ R$ 22,50' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Comissões</Text>
        <Text style={styles.subtitle}>Acompanhe seus ganhos e repasses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardGanhos}>
          <Text style={styles.cardGanhosTitle}>Saldo Disponível (Mês)</Text>
          <Text style={styles.cardGanhosValue}>R$ 1.845,00</Text>
          <View style={styles.divider} />
          <Text style={styles.cardGanhosSub}>Próximo repasse: Sexta-feira, 05/10</Text>
        </View>

        <Text style={styles.sectionTitle}>Histórico Recente</Text>

        {historico.map((item) => (
          <View key={item.id} style={styles.historicoCard}>
            <View style={styles.iconBox}>
              <Ionicons name="wallet-outline" size={20} color="#FF98B9" />
            </View>
            <View style={styles.historicoInfo}>
              <Text style={styles.servicoNome}>{item.servico}</Text>
              <Text style={styles.clienteNome}>{item.cliente} • {item.data}</Text>
            </View>
            <Text style={styles.valorText}>{item.valor}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF98B9' },
  subtitle: { fontSize: 14, color: '#D1D1D1', marginTop: 4 },
  content: { padding: 20 },
  cardGanhos: { backgroundColor: '#595959', borderRadius: 15, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#6B6E6B' },
  cardGanhosTitle: { color: '#D1D1D1', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  cardGanhosValue: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#6B6E6B', marginBottom: 12 },
  cardGanhosSub: { color: '#FF98B9', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  historicoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#595959', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#6B6E6B' },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#434643', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historicoInfo: { flex: 1 },
  servicoNome: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 3 },
  clienteNome: { fontSize: 12, color: '#D1D1D1' },
  valorText: { fontSize: 15, fontWeight: 'bold', color: '#FF98B9' },
});
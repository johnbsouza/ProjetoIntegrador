import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminAgendaScreen() {
  const agendamentos = [
    { id: 1, cliente: 'Mariana Alves', servico: 'Spa dos Pés', profissional: 'Ana Silva', horario: '09:00', status: 'Confirmado' },
    { id: 2, cliente: 'Sofia Costa', servico: 'Alongamento em Gel', profissional: 'Carla Dias', horario: '11:00', status: 'Em andamento' },
    { id: 3, cliente: 'Beatriz Lima', servico: 'Manicure Clássica', profissional: 'Ana Silva', horario: '14:30', status: 'Pendente' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Agenda de Hoje</Text>

        {agendamentos.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.horarioText}>{item.horario}</Text>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Text style={styles.clienteText}>{item.cliente}</Text>
            <Text style={styles.detalheText}>{item.servico} • <Text style={{ color: '#FF98B9' }}>{item.profissional}</Text></Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  card: { backgroundColor: '#595959', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#6B6E6B' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  horarioText: { fontSize: 16, fontWeight: 'bold', color: '#FF98B9' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#D1D1D1', backgroundColor: '#434643', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  clienteText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  detalheText: { fontSize: 13, color: '#D1D1D1' },
});
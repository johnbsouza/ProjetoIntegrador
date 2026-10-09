import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PainelProfissionalScreen() {
  const router = useRouter();
  const atendimentos = [
    { id: 1, cliente: 'Mariana Alves', servico: 'Spa dos Pés', horario: '09:00', status: 'Concluído', icon: 'checkmark-circle' },
    { id: 2, cliente: 'Sofia Costa', servico: 'Alongamento em Gel', horario: '11:00', status: 'Em andamento', icon: 'sync-circle' },
    { id: 3, cliente: 'Beatriz Lima', servico: 'Manicure Clássica', horario: '14:30', status: 'Pendente', icon: 'time' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Profissional ✨</Text>
          <Text style={styles.subtitle}>Sua agenda de hoje</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => router.replace('/')}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF4C4C" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.commissionCard}>
          <Text style={styles.commissionTitle}>Comissões de Hoje</Text>
          <Text style={styles.commissionValue}>R$ 185,00</Text>
          <View style={styles.commissionStats}>
            <Text style={styles.statText}>3 Atendimentos</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>100% de ocupação</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Atendimentos do Dia</Text>
        
        {atendimentos.map((agendamento) => {
          let statusColor = '#FFC107'; 
          if (agendamento.status === 'Concluído') statusColor = '#FF98B9';
          if (agendamento.status === 'Em andamento') statusColor = '#A3B19B';

          return (
            <View key={agendamento.id} style={styles.appointmentCard}>
              <View style={[styles.timelineLine, { backgroundColor: statusColor }]} />
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.timeText}>{agendamento.horario}</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons name={agendamento.icon} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{agendamento.status}</Text>
                  </View>
                </View>
                <Text style={styles.clientName}>{agendamento.cliente}</Text>
                <Text style={styles.serviceName}>{agendamento.servico}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#FF98B9' },
  subtitle: { fontSize: 14, color: '#D1D1D1', marginTop: 4 },
  logoutButton: { padding: 10, backgroundColor: 'rgba(255, 76, 76, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: '#FF4C4C', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  commissionCard: { backgroundColor: '#595959', borderRadius: 15, padding: 25, borderWidth: 1, borderColor: '#6B6E6B', marginBottom: 30, alignItems: 'center' },
  commissionTitle: { fontSize: 16, color: '#D1D1D1', marginBottom: 10 },
  commissionValue: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  commissionStats: { flexDirection: 'row', gap: 10, backgroundColor: '#434643', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#6B6E6B' },
  statText: { color: '#FF98B9', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  appointmentCard: { flexDirection: 'row', backgroundColor: '#595959', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#6B6E6B', overflow: 'hidden' },
  timelineLine: { width: 6 },
  appointmentContent: { flex: 1, padding: 15 },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#434643', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  serviceName: { fontSize: 14, color: '#D1D1D1' },
});
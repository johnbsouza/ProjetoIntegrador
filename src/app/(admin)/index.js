import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.faturamentoCard}>
          <Text style={styles.faturamentoTitle}>Faturamento do Dia</Text>
          <Text style={styles.faturamentoValue}>R$ 1.240,00</Text>
          <View style={styles.faturamentoStats}>
            <View style={styles.statBadge}>
              <Ionicons name="people" size={14} color="#FF98B9" />
              <Text style={styles.statText}>12 Atendimentos</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="sparkles" size={14} color="#FF98B9" />
              <Text style={styles.statText}>4 Profissionais Ativas</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/novo-profissional')}
          >
            <Ionicons name="person-add-outline" size={20} color="#434643" />
            <Text style={styles.actionButtonText}>Profissional</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/novo-servico')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#434643" />
            <Text style={styles.actionButtonText}>Serviço</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Gestão Completa</Text>

        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => router.push('/(admin)/relatorios')}
        >
          <View style={styles.menuIconBox}>
            <Ionicons name="bar-chart-outline" size={22} color="#FF98B9" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>Relatórios Financeiros</Text>
            <Text style={styles.menuSub}>Acompanhe o desempenho do seu negócio</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D1D1" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  faturamentoCard: { backgroundColor: '#595959', borderRadius: 15, padding: 25, borderWidth: 1, borderColor: '#6B6E6B', marginBottom: 25, alignItems: 'center' },
  faturamentoTitle: { fontSize: 14, color: '#D1D1D1', marginBottom: 8, fontWeight: 'bold' },
  faturamentoValue: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  faturamentoStats: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#434643', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#6B6E6B' },
  statText: { color: '#FF98B9', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  actionsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  actionButton: { flex: 1, backgroundColor: '#FF98B9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 12, gap: 8 },
  actionButtonText: { color: '#434643', fontSize: 15, fontWeight: 'bold' },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#595959', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#6B6E6B', marginBottom: 12 },
  menuIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#434643', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  menuSub: { fontSize: 12, color: '#D1D1D1' },
});
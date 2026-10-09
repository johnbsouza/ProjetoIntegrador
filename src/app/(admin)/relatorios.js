import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RelatoriosScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Faturamento do Mês</Text>
          <Text style={styles.summaryValue}>R$ 28.450,00</Text>
          <Text style={styles.summarySub}>+12% comparado ao mês anterior</Text>
        </View>

        <Text style={styles.sectionTitle}>Desempenho por Categoria</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles-outline" size={20} color="#FF98B9" />
            <Text style={styles.cardTitle}>Manicure & Unhas</Text>
          </View>
          <Text style={styles.cardValue}>R$ 16.200,00</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flower-outline" size={20} color="#FF98B9" />
            <Text style={styles.cardTitle}>Spa & Tratamentos</Text>
          </View>
          <Text style={styles.cardValue}>R$ 12.250,00</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  summaryCard: { backgroundColor: '#595959', borderRadius: 15, padding: 25, borderWidth: 1, borderColor: '#6B6E6B', marginBottom: 25, alignItems: 'center' },
  summaryTitle: { fontSize: 14, color: '#D1D1D1', marginBottom: 8, fontWeight: 'bold' },
  summaryValue: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  summarySub: { fontSize: 12, color: '#FF98B9', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  card: { backgroundColor: '#595959', borderRadius: 12, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#6B6E6B' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#FF98B9' },
});
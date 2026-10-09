import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CatalogoServicosScreen() {
  const router = useRouter();
  const servicos = [
    { id: 1, nome: 'Manicure Clássica', tempo: '45 min', preco: 'R$ 45,00' },
    { id: 2, nome: 'Spa dos Pés', tempo: '60 min', preco: 'R$ 85,00' },
    { id: 3, nome: 'Alongamento em Gel', tempo: '120 min', preco: 'R$ 150,00' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(admin)/novo-servico')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#434643" />
          <Text style={styles.addButtonText}>Adicionar Novo Serviço</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>

        {servicos.map((serv) => (
          <View key={serv.id} style={styles.card}>
            <View style={styles.infoBox}>
              <Text style={styles.nomeText}>{serv.nome}</Text>
              <Text style={styles.tempoText}><Ionicons name="time-outline" size={12} /> {serv.tempo}</Text>
            </View>
            <Text style={styles.precoText}>{serv.preco}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  addButton: { backgroundColor: '#FF98B9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, marginBottom: 25 },
  addButtonText: { color: '#434643', fontSize: 15, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#595959', padding: 18, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#6B6E6B' },
  infoBox: { flex: 1 },
  nomeText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  tempoText: { fontSize: 13, color: '#D1D1D1' },
  precoText: { fontSize: 16, fontWeight: 'bold', color: '#FF98B9' },
});
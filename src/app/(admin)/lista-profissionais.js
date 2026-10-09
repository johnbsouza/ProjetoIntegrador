import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListaProfissionaisScreen() {
  const router = useRouter();
  const equipe = [
    { id: 1, nome: 'Ana Silva', cargo: 'Manicure & Nail Designer', status: 'Ativa' },
    { id: 2, nome: 'Carla Dias', cargo: 'Pedicure & Spa dos Pés', status: 'Ativa' },
    { id: 3, nome: 'Juliana Souza', cargo: 'Especialista em Gel', status: 'Em atendimento' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(admin)/novo-profissional')}
        >
          <Ionicons name="person-add-outline" size={20} color="#434643" />
          <Text style={styles.addButtonText}>Adicionar Nova Profissional</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Colaboradoras Cadastradas</Text>

        {equipe.map((prof) => (
          <View key={prof.id} style={styles.card}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{prof.nome[0]}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.nomeText}>{prof.nome}</Text>
              <Text style={styles.cargoText}>{prof.cargo}</Text>
            </View>
            <Text style={styles.statusBadge}>{prof.status}</Text>
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#595959', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#6B6E6B' },
  avatarBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#434643', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#FF98B9' },
  infoBox: { flex: 1 },
  nomeText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  cargoText: { fontSize: 13, color: '#D1D1D1' },
  statusBadge: { fontSize: 11, fontWeight: 'bold', color: '#FF98B9', backgroundColor: '#434643', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});

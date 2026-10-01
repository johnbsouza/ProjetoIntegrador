import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteHomeScreen() {
  const router = useRouter(); // <-- Roteador adicionado

  const categorias = [
    { id: 1, nome: 'Unhas', icon: 'color-palette-outline' },
    { id: 2, nome: 'Spa', icon: 'leaf-outline' },
    { id: 3, nome: 'Massagem', icon: 'body-outline' },
    { id: 4, nome: 'Cílios', icon: 'eye-outline' },
  ];

  const servicosDestaque = [
    { id: 1, nome: 'Spa dos Pés Completo', preco: 'R$ 85,00', duracao: '60 min' },
    { id: 2, nome: 'Alongamento em Gel', preco: 'R$ 150,00', duracao: '120 min' },
    { id: 3, nome: 'Manicure Clássica', preco: 'R$ 45,00', duracao: '45 min' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Joana ✨</Text>
          <Text style={styles.subtitle}>O que vamos fazer hoje?</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={24} color="#FF4C4C" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {categorias.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <Ionicons name={cat.icon} size={28} color="#E4A0B7" />
              <Text style={styles.categoryText}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Mais Pedidos</Text>
        {servicosDestaque.map(servico => (
          <View key={servico.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{servico.nome}</Text>
              <Text style={styles.serviceDetails}>
                <Ionicons name="time-outline" size={14} color="#A3B19B" /> {servico.duracao}
              </Text>
            </View>
            <View style={styles.serviceAction}>
              <Text style={styles.servicePrice}>{servico.preco}</Text>
              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#E4A0B7' },
  subtitle: { fontSize: 14, color: '#A3B19B', marginTop: 4 },
  logoutButton: { padding: 10, backgroundColor: 'rgba(255, 76, 76, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: '#FF4C4C' },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
  categoriesRow: { paddingHorizontal: 20, marginBottom: 25 },
  categoryCard: { backgroundColor: '#1E2C1B', padding: 15, borderRadius: 15, alignItems: 'center', marginRight: 15, width: 85, borderWidth: 1, borderColor: '#3A4E36' },
  categoryText: { color: '#FFF', fontSize: 13, marginTop: 8, fontWeight: '500' },
  serviceCard: { backgroundColor: '#1E2C1B', flexDirection: 'row', justifyContent: 'space-between', padding: 18, marginHorizontal: 20, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3A4E36' },
  serviceInfo: { flex: 1, justifyContent: 'center' },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 6 },
  serviceDetails: { fontSize: 13, color: '#A3B19B' },
  serviceAction: { alignItems: 'flex-end', justifyContent: 'space-between' },
  servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#E4A0B7', marginBottom: 10 },
  bookButton: { backgroundColor: '#E4A0B7', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  bookButtonText: { color: '#1A2418', fontWeight: 'bold', fontSize: 13 },
});
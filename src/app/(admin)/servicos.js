import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminServicosScreen() {
  const servicos = [
    { id: 1, nome: 'Spa dos Pés Completo', categoria: 'Spa', preco: 'R$ 85,00', tempo: '60 min' },
    { id: 2, nome: 'Alongamento em Gel', categoria: 'Unhas', preco: 'R$ 150,00', tempo: '120 min' },
    { id: 3, nome: 'Manicure Clássica', categoria: 'Unhas', preco: 'R$ 45,00', tempo: '45 min' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#1A2418" />
          <Text style={styles.addButtonText}>Adicionar Novo Serviço</Text>
        </TouchableOpacity>

        {servicos.map(item => (
          <View key={item.id} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.categoria}</Text>
              </View>
              <TouchableOpacity style={styles.editIcon}>
                <Ionicons name="pencil" size={18} color="#A3B19B" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.serviceName}>{item.nome}</Text>
            
            <View style={styles.serviceFooter}>
              <Text style={styles.priceText}>{item.preco}</Text>
              <View style={styles.timeBox}>
                <Ionicons name="time-outline" size={16} color="#A3B19B" />
                <Text style={styles.timeText}>{item.tempo}</Text>
              </View>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  addButton: { flexDirection: 'row', backgroundColor: '#E4A0B7', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  addButtonText: { color: '#1A2418', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  serviceCard: { backgroundColor: '#1E2C1B', padding: 20, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3A4E36' },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryBadge: { backgroundColor: '#2C3D29', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  categoryText: { color: '#E4A0B7', fontSize: 12, fontWeight: 'bold' },
  editIcon: { padding: 5 },
  serviceName: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2C3D29', paddingTop: 15 },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#E4A0B7' },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { color: '#A3B19B', fontSize: 14 },
});
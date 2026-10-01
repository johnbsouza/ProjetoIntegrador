import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteExplorarScreen() {
  const router = useRouter();
  const [busca, setBusca] = useState('');

  const listaServicos = [
    { id: 1, nome: 'Spa dos Pés Completo', categoria: 'Spa', preco: 'R$ 85,00', duracao: '60 min', icone: 'leaf-outline' },
    { id: 2, nome: 'Alongamento em Gel', categoria: 'Unhas', preco: 'R$ 150,00', duracao: '120 min', icone: 'color-palette-outline' },
    { id: 3, nome: 'Manicure Clássica', categoria: 'Unhas', preco: 'R$ 45,00', duracao: '45 min', icone: 'hand-left-outline' },
    { id: 4, nome: 'Massagem Relaxante', categoria: 'Massagem', preco: 'R$ 120,00', duracao: '50 min', icone: 'body-outline' },
    { id: 5, nome: 'Design de Cílios', categoria: 'Cílios', preco: 'R$ 110,00', duracao: '90 min', icone: 'eye-outline' },
  ];

  const servicosFiltrados = listaServicos.filter(s => 
    s.nome.toLowerCase().includes(busca.toLowerCase()) || 
    s.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar Serviços 🔍</Text>
        <Text style={styles.subtitle}>Encontre o cuidado ideal para si</Text>
      </View>

      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#A3B19B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome ou categoria..."
          placeholderTextColor="#8C9C88"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {servicosFiltrados.map(servico => (
          <View key={servico.id} style={styles.serviceCard}>
            <View style={styles.iconBox}>
              <Ionicons name={servico.icone} size={26} color="#E4A0B7" />
            </View>
            <View style={styles.serviceInfo}>
              <View style={styles.badgeCat}>
                <Text style={styles.badgeCatText}>{servico.categoria}</Text>
              </View>
              <Text style={styles.serviceName}>{servico.nome}</Text>
              <Text style={styles.serviceDetails}>
                <Ionicons name="time-outline" size={13} color="#A3B19B" /> {servico.duracao} • <Text style={{ color: '#E4A0B7', fontWeight: 'bold' }}>{servico.preco}</Text>
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => router.push('/(cliente)/agendar')}
            >
              <Text style={styles.bookButtonText}>Agendar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E4A0B7' },
  subtitle: { fontSize: 13, color: '#A3B19B', marginTop: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2C1B', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#3A4E36' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 48, color: '#FFF', fontSize: 15 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2C1B', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#3A4E36' },
  iconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#2C3D29', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  serviceInfo: { flex: 1 },
  badgeCat: { alignSelf: 'flex-start', backgroundColor: '#2C3D29', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 4 },
  badgeCatText: { color: '#E4A0B7', fontSize: 10, fontWeight: 'bold' },
  serviceName: { fontSize: 15, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  serviceDetails: { fontSize: 13, color: '#A3B19B' },
  bookButton: { backgroundColor: '#E4A0B7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  bookButtonText: { color: '#1A2418', fontWeight: 'bold', fontSize: 12 }
});
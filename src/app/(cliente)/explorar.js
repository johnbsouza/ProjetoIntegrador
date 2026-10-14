import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteExplorarScreen() {
  const router = useRouter();

  const categorias = [
    { id: '1', nome: 'Manicure', icon: 'color-wand-outline' },
    { id: '2', nome: 'Spa', icon: 'leaf-outline' },
    { id: '3', nome: 'Alongamento', icon: 'hand-left-outline' },
  ];

  const servicos = [
    { id: '101', nome: 'Spa dos Pés', preco: 'R$ 60', tempo: '45 min', categoria: 'Spa', emAlta: true },
    { id: '102', nome: 'Manicure Clássica', preco: 'R$ 45', tempo: '30 min', categoria: 'Manicure', emAlta: true },
    { id: '103', nome: 'Alongamento em Gel', preco: 'R$ 150', tempo: '120 min', categoria: 'Alongamento', emAlta: false },
    { id: '104', nome: 'Esmaltação em Gel', preco: 'R$ 80', tempo: '60 min', categoria: 'Manicure', emAlta: false },
    { id: '105', nome: 'Spa Mãos e Pés', preco: 'R$ 110', tempo: '90 min', categoria: 'Spa', emAlta: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#434643" />
      
      {/* HEADER FIXO */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FF98B9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nossos Serviços</Text>
        <View style={{ width: 42 }} /> {/* Espaçador para alinhar o título ao centro */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TEXTO DE INTRODUÇÃO */}
        <Text style={styles.greeting}>O que deseja fazer hoje?</Text>
        <Text style={styles.subtitle}>Escolha o tratamento ideal para o seu momento.</Text>

        {/* CATEGORIAS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriasContainer}
        >
          {categorias.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoriaCard} activeOpacity={0.8}>
              <View style={styles.categoriaIconBox}>
                <Ionicons name={cat.icon} size={20} color="#434643" />
              </View>
              <Text style={styles.categoriaNome}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Serviços em Alta</Text>
          <Ionicons name="flame" size={18} color="#FF98B9" />
        </View>

        {servicos.filter(s => s.emAlta).map(servico => (
          <TouchableOpacity 
            key={servico.id} 
            style={styles.servicoCard}
            onPress={() => router.push('/(cliente)/agenda')}
            activeOpacity={0.8}
          >
            <View style={styles.servicoInfo}>
              <Text style={styles.servicoCategoria}>{servico.categoria}</Text>
              <Text style={styles.servicoNome}>{servico.nome}</Text>
              <View style={styles.servicoDetalhesRow}>
                <Ionicons name="time-outline" size={14} color="#D1D1D1" />
                <Text style={styles.servicoDetalhesText}>{servico.tempo}</Text>
              </View>
            </View>
            
            <View style={styles.servicoRight}>
              <Text style={styles.servicoPreco}>{servico.preco}</Text>
              <View style={styles.agendarBtn}>
                <Text style={styles.agendarBtnText}>Agendar</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* LISTA DE TODOS OS SERVIÇOS */}
        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 15 }]}>Todos os Serviços</Text>

        {servicos.filter(s => !s.emAlta).map(servico => (
          <TouchableOpacity 
            key={servico.id} 
            style={styles.servicoCard}
            onPress={() => router.push('/(cliente)/agenda')}
            activeOpacity={0.8}
          >
            <View style={styles.servicoInfo}>
              <Text style={styles.servicoCategoria}>{servico.categoria}</Text>
              <Text style={styles.servicoNome}>{servico.nome}</Text>
              <View style={styles.servicoDetalhesRow}>
                <Ionicons name="time-outline" size={14} color="#D1D1D1" />
                <Text style={styles.servicoDetalhesText}>{servico.tempo}</Text>
              </View>
            </View>
            
            <View style={styles.servicoRight}>
              <Text style={styles.servicoPreco}>{servico.preco}</Text>
              <View style={styles.agendarBtnSecondary}>
                <Text style={styles.agendarBtnTextSecondary}>Agendar</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#434643' 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backButton: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: 'rgba(89, 89, 89, 0.45)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(107, 110, 107, 0.5)' 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 40,
  },
  greeting: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FF98B9', 
    letterSpacing: 0.5,
    marginTop: 15,
  },
  subtitle: { 
    fontSize: 14, 
    color: 'rgba(209, 209, 209, 0.8)', 
    marginTop: 6,
    marginBottom: 25,
    lineHeight: 20,
  },
  categoriasContainer: {
    paddingBottom: 30,
    gap: 12,
  },
  categoriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(89, 89, 89, 0.45)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoriaIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF98B9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoriaNome: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    letterSpacing: 0.5
  },
  servicoCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    backgroundColor: 'rgba(89, 89, 89, 0.45)', 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  servicoInfo: {
    flex: 1,
  },
  servicoCategoria: {
    fontSize: 11,
    color: 'rgba(209, 209, 209, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  servicoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  servicoDetalhesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servicoDetalhesText: {
    fontSize: 13,
    color: '#D1D1D1',
  },
  servicoRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  servicoPreco: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF98B9',
  },
  agendarBtn: {
    backgroundColor: '#FF98B9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  agendarBtnText: {
    color: '#434643',
    fontSize: 13,
    fontWeight: 'bold',
  },
  agendarBtnSecondary: {
    backgroundColor: 'rgba(89, 89, 89, 0.8)',
    borderWidth: 1,
    borderColor: '#FF98B9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  agendarBtnTextSecondary: {
    color: '#FF98B9',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
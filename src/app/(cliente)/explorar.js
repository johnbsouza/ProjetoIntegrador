import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExplorarScreen() {
  const servicos = [
    { id: 1, nome: 'Manicure Clássica', tempo: '45 min', preco: 'R$ 45,00' },
    { id: 2, nome: 'Spa dos Pés', tempo: '60 min', preco: 'R$ 85,00' },
    { id: 3, nome: 'Alongamento em Gel', tempo: '120 min', preco: 'R$ 150,00' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Catálogo de Serviços</Text>
        <Text style={styles.subtitle}>Escolha o seu procedimento favorito</Text>

        {servicos.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.infoBox}>
              <Text style={styles.servicoNome}>{item.nome}</Text>
              <Text style={styles.servicoDetalhe}><Ionicons name="time-outline" size={12} /> {item.tempo}</Text>
            </View>
            <View style={styles.rightBox}>
              <Text style={styles.precoText}>{item.preco}</Text>
              <TouchableOpacity style={styles.agendarBtn}>
                <Text style={styles.agendarBtnText}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF98B9', marginBottom: 4, paddingTop: 10 },
  subtitle: { fontSize: 14, color: '#D1D1D1', marginBottom: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#595959', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#6B6E6B' },
  infoBox: { flex: 1 },
  servicoNome: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  servicoDetalhe: { fontSize: 13, color: '#D1D1D1' },
  rightBox: { alignItems: 'flex-end' },
  precoText: { fontSize: 16, fontWeight: 'bold', color: '#FF98B9', marginBottom: 8 },
  agendarBtn: { backgroundColor: '#FF98B9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  agendarBtnText: { color: '#434643', fontSize: 12, fontWeight: 'bold' },
});
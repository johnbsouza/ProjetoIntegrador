import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AgendaProfissional() {
  const router = useRouter();

  // Dados fictícios para preparação da UI (posteriormente virão do Firebase)
  const agendamentosHoje = [
    { id: '1', hora: '10:00', cliente: 'Mariana Costa', servico: 'Mão + Pé', status: 'pendente' },
    { id: '2', hora: '14:30', cliente: 'Ana Silva', servico: 'Esmaltação em Gel', status: 'confirmado' },
    { id: '3', hora: '16:00', cliente: 'Beatriz Lima', servico: 'Sobrancelha com Henna', status: 'concluido' },
  ];

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={styles.tituloTopo}>Minha Agenda</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.dataHoje}>Hoje, 23 de Outubro</Text>

          {agendamentosHoje.map((item) => (
            <View key={item.id} style={[styles.card, item.status === 'concluido' && { opacity: 0.6 }]}>
              <View style={styles.horaBox}>
                <Text style={styles.horaTexto}>{item.hora}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.clienteTexto}>{item.cliente}</Text>
                <Text style={styles.servicoTexto}>{item.servico}</Text>
              </View>
              <TouchableOpacity style={styles.btnAcao}>
                <Ionicons 
                  name={item.status === 'concluido' ? 'checkmark-done-circle' : 'time-outline'} 
                  size={26} 
                  color={item.status === 'concluido' ? '#88D693' : '#FF98B9'} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15 },
  scroll: { paddingBottom: 30 },
  dataHoje: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  horaBox: { backgroundColor: 'rgba(89, 89, 89, 0.8)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginRight: 15 },
  horaTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  infoBox: { flex: 1 },
  clienteTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  servicoTexto: { color: 'rgba(209, 209, 209, 0.7)', fontSize: 13, marginTop: 3 },
  btnAcao: { padding: 5 }
});
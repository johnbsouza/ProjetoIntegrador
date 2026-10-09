import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificacoesScreen() {
  const notificacoes = [
    { id: 1, titulo: 'Agendamento Confirmado', mensagem: 'O seu Spa dos Pés foi agendado para amanhã às 14:30.', tempo: 'Há 2 horas' },
    { id: 2, titulo: 'Lembrete', mensagem: 'Não se esqueça da sua hidratação semanal!', tempo: 'Há 1 dia' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.subtitle}>Fique por dentro das novidades e avisos</Text>

        {notificacoes.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name="notifications-outline" size={20} color="#FF98B9" />
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.notifTitulo}>{item.titulo}</Text>
              <Text style={styles.notifMsg}>{item.mensagem}</Text>
              <Text style={styles.notifTempo}>{item.tempo}</Text>
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
  card: { flexDirection: 'row', backgroundColor: '#595959', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#6B6E6B' },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#434643', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoBox: { flex: 1 },
  notifTitulo: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  notifMsg: { fontSize: 13, color: '#D1D1D1', marginBottom: 8, lineHeight: 18 },
  notifTempo: { fontSize: 11, color: '#FF98B9' },
});
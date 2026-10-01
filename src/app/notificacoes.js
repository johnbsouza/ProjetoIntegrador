import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteNotificacoesScreen() {
  const notificacoes = [
    { id: 1, titulo: 'Agendamento Confirmado! ✨', mensagem: 'O seu Spa dos Pés com Amanda Nunes foi confirmado para 15 de Outubro às 14:30.', tempo: 'Há 10 min', lido: false },
    { id: 2, titulo: 'Lembrete de Horário ⏰', mensagem: 'Tem um atendimento agendado para amanhã às 09:00 na Lirium Esmalteria.', tempo: 'Ontem', lido: true },
    { id: 3, titulo: 'Novidades na Lirium 💅', mensagem: 'Conheça os novos tons da nossa coleção de esmaltes em gel para esta temporada!', tempo: 'Há 3 dias', lido: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações 🔔</Text>
        <Text style={styles.subtitle}>Fique por dentro de tudo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {notificacoes.map(item => (
          <View key={item.id} style={[styles.card, !item.lido && styles.cardUnread]}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardTime}>{item.tempo}</Text>
            </View>
            <Text style={styles.cardMessage}>{item.mensagem}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E4A0B7' },
  subtitle: { fontSize: 13, color: '#A3B19B', marginTop: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#1E2C1B', padding: 18, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#3A4E36' },
  cardUnread: { borderColor: '#E4A0B7', backgroundColor: 'rgba(228, 160, 183, 0.03)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
  cardTime: { fontSize: 11, color: '#A3B19B' },
  cardMessage: { fontSize: 13, color: '#A3B19B', lineHeight: 18 }
});
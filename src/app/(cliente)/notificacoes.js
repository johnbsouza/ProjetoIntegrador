import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function NotificacoesScreen() {
  const { tema, config } = useAcessibilidade();

  const notificacoes = [
    { id: 1, titulo: 'Agendamento Confirmado', mensagem: 'O seu Spa dos Pés foi agendado para amanhã às 14:30.', tempo: 'Há 2 horas' },
    { id: 2, titulo: 'Lembrete', mensagem: 'Não se esqueça da sua hidratação semanal!', tempo: 'Há 1 dia' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + tema.espacoExtra },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            { color: tema.accent, fontSize: tema.fontSize(24) },
          ]}
        >
          Notificações
        </Text>
        {!config.modoCalmo && (
          <Text
            style={[
              styles.subtitle,
              {
                color: tema.textSecondary,
                fontSize: tema.fontSize(14),
                marginBottom: 20 + tema.espacoExtra,
              },
            ]}
          >
            Fique por dentro das novidades e avisos
          </Text>
        )}

        {notificacoes.map((item) => (
          <View
            key={item.id}
            accessible
            accessibilityLabel={`${item.titulo}: ${item.mensagem}. Recebida ${item.tempo}`}
            style={[
              styles.card,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                marginBottom: 15 + tema.espacoExtra,
                marginTop: config.modoCalmo ? 12 : 0,
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: tema.bgPrimary,
                  borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                  borderWidth: config.altoContraste ? 1 : 0,
                },
              ]}
            >
              <Ionicons name="notifications-outline" size={20} color={tema.accent} accessible={false} />
            </View>
            <View style={styles.infoBox}>
              <Text
                style={[
                  styles.notifTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                ]}
              >
                {item.titulo}
              </Text>
              <Text
                style={[
                  styles.notifMsg,
                  {
                    color: tema.textSecondary,
                    fontSize: tema.fontSize(13),
                    lineHeight: tema.fontSize(18),
                  },
                ]}
              >
                {item.mensagem}
              </Text>
              <Text
                style={[
                  styles.notifTempo,
                  { color: tema.accent, fontSize: tema.fontSize(11) },
                ]}
              >
                {item.tempo}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 4, paddingTop: 10 },
  subtitle: {},
  card: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoBox: { flex: 1 },
  notifTitulo: { fontWeight: 'bold', marginBottom: 4 },
  notifMsg: { marginBottom: 8 },
  notifTempo: {},
});
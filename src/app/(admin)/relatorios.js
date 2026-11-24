import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function RelatoriosScreen() {
  const { tema, config } = useAcessibilidade();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + tema.espacoExtra },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessible
          accessibilityLabel="Faturamento do Mês: R$ 28.450,00. +12% comparado ao mês anterior"
          style={[
            styles.summaryCard,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              marginBottom: 25 + tema.espacoExtra,
            },
          ]}
        >
          <Text
            style={[
              styles.summaryTitle,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Faturamento do Mês
          </Text>
          <Text
            style={[
              styles.summaryValue,
              { color: tema.textPrimary, fontSize: tema.fontSize(36) },
            ]}
          >
            R$ 28.450,00
          </Text>
          {!config.modoCalmo && (
            <Text
              style={[
                styles.summarySub,
                { color: tema.accent, fontSize: tema.fontSize(12) },
              ]}
            >
              +12% comparado ao mês anterior
            </Text>
          )}
        </View>

        <Text
          accessibilityRole="header"
          style={[
            styles.sectionTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Desempenho por Categoria
        </Text>

        <View
          accessible
          accessibilityLabel="Manicure e Unhas: R$ 16.200,00"
          style={[
            styles.card,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              marginBottom: 15 + tema.espacoExtra,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles-outline" size={20} color={tema.accent} accessible={false} />
            <Text
              style={[
                styles.cardTitle,
                { color: tema.textPrimary, fontSize: tema.fontSize(16) },
              ]}
            >
              Manicure & Unhas
            </Text>
          </View>
          <Text
            style={[
              styles.cardValue,
              { color: tema.accent, fontSize: tema.fontSize(20) },
            ]}
          >
            R$ 16.200,00
          </Text>
        </View>

        <View
          accessible
          accessibilityLabel="Spa e Tratamentos: R$ 12.250,00"
          style={[
            styles.card,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              marginBottom: 15 + tema.espacoExtra,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="flower-outline" size={20} color={tema.accent} accessible={false} />
            <Text
              style={[
                styles.cardTitle,
                { color: tema.textPrimary, fontSize: tema.fontSize(16) },
              ]}
            >
              Spa & Tratamentos
            </Text>
          </View>
          <Text
            style={[
              styles.cardValue,
              { color: tema.accent, fontSize: tema.fontSize(20) },
            ]}
          >
            R$ 12.250,00
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  summaryCard: {
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryTitle: { marginBottom: 8, fontWeight: 'bold' },
  summaryValue: { fontWeight: 'bold', marginBottom: 5 },
  summarySub: { fontWeight: 'bold' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
  card: {
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { fontWeight: 'bold' },
  cardValue: { fontWeight: 'bold' },
});
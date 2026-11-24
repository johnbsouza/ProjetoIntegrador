import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function AgendaProfissional() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();

  const agendamentosHoje = [
    { id: '1', hora: '10:00', cliente: 'Mariana Costa', servico: 'Mão + Pé', status: 'pendente' },
    { id: '2', hora: '14:30', cliente: 'Ana Silva', servico: 'Esmaltação em Gel', status: 'confirmado' },
    { id: '3', hora: '16:00', cliente: 'Beatriz Lima', servico: 'Sobrancelha com Henna', status: 'concluido' },
  ];

  return (
    <LinearGradient
      colors={config.altoContraste ? [tema.bgPrimary, tema.bgPrimary] : ['#1E201E', '#434643', '#1A1C1A']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent />

        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela anterior"
            style={[
              styles.backButton,
              {
                minWidth: tema.minTouchHeight,
                minHeight: tema.minTouchHeight,
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={tema.accent} />
          </TouchableOpacity>
          <Text
            accessibilityRole="header"
            style={[
              styles.tituloTopo,
              { color: tema.accent, fontSize: tema.fontSize(20) },
            ]}
          >
            Minha Agenda
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 88 + tema.espacoExtra },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[
              styles.dataHoje,
              {
                color: tema.textPrimary,
                fontSize: tema.fontSize(18),
                marginBottom: 20 + tema.espacoExtra,
              },
            ]}
          >
            Hoje, 23 de Outubro
          </Text>

          {agendamentosHoje.map((item) => {
            const concluido = item.status === 'concluido';
            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    marginBottom: 12 + tema.espacoExtra,
                    opacity: concluido && !config.altoContraste ? 0.65 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.horaBox,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                      borderWidth: config.altoContraste ? 1 : 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.horaTexto,
                      { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                    ]}
                  >
                    {item.hora}
                  </Text>
                </View>
                <View style={styles.infoBox}>
                  <Text
                    style={[
                      styles.clienteTexto,
                      { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {item.cliente}
                  </Text>
                  <Text
                    style={[
                      styles.servicoTexto,
                      { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                    ]}
                  >
                    {item.servico}
                  </Text>
                </View>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Atendimento de ${item.cliente} às ${item.hora}, ${item.servico}, status ${item.status}`}
                  style={[
                    styles.btnAcao,
                    {
                      minWidth: tema.minTouchHeight,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Ionicons
                    name={concluido ? 'checkmark-done-circle' : 'time-outline'}
                    size={26}
                    color={concluido ? tema.success : tema.accent}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tituloTopo: { fontWeight: 'bold', marginLeft: 15 },
  scroll: {},
  dataHoje: { fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  horaBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 15,
  },
  horaTexto: { fontWeight: 'bold' },
  infoBox: { flex: 1 },
  clienteTexto: { fontWeight: 'bold' },
  servicoTexto: { marginTop: 3 },
  btnAcao: { padding: 5 },
});
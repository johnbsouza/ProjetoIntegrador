import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

const funcoes = [
  {
    icone: 'calendar-outline',
    titulo: 'Agenda',
    texto: 'Visualize e gerencie os agendamentos das profissionais, com data, horário e cliente.',
    rota: '/agenda',
  },
  {
    icone: 'people-outline',
    titulo: 'Clientes',
    texto: 'Consulte e cadastre as clientes do estúdio e acompanhe o histórico de cada uma.',
    rota: '/clientes',
  },
  {
    icone: 'ribbon-outline',
    titulo: 'Equipe e Profissionais',
    texto: 'Cadastre, edite e acompanhe as profissionais e suas comissões.',
    rota: '/lista-profissionais',
  },
  {
    icone: 'color-palette-outline',
    titulo: 'Catálogo de Serviços',
    texto: 'Cadastre e edite os serviços oferecidos, com preço e tempo de duração.',
    rota: '/servicos',
  },
  {
    icone: 'gift-outline',
    titulo: 'Pacotes',
    texto: 'Gerencie os pacotes de serviços, como o 4 Mãos e suas variações.',
    rota: '/pacotes',
  },
  {
    icone: 'cash-outline',
    titulo: 'Caixa',
    texto: 'Registre pagamentos e acompanhe a movimentação financeira do dia.',
    rota: '/caixa',
  },
  {
    icone: 'bar-chart-outline',
    titulo: 'Relatórios',
    texto: 'Veja relatórios financeiros e de desempenho para acompanhar os resultados.',
    rota: '/relatorios',
  },
  {
    icone: 'shield-checkmark-outline',
    titulo: 'Controle de Acessos',
    texto: 'Gerencie os usuários do sistema e defina o perfil de cada um (admin, cliente, profissional).',
    rota: '/gerenciar-usuarios',
  },
  {
    icone: 'help-circle-outline',
    titulo: 'Ajuda & Suporte',
    texto: 'Acesse este guia e o contacto com o suporte técnico.',
    rota: '/ajuda',
  },
];

export default function TelaGuia() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();

  return (
    <LinearGradient
      colors={config.altoContraste ? [tema.bgPrimary, tema.bgPrimary] : ['#1E201E', '#434643', '#1A1C1A']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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
              styles.titulo,
              { color: tema.accent, fontSize: tema.fontSize(22) },
            ]}
          >
            Guia da Plataforma
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 88 + tema.espacoExtra,
            gap: 15 + tema.espacoExtra,
          }}
          showsVerticalScrollIndicator={false}
        >
          {funcoes.map((f) => (
            <View
              key={f.titulo}
              style={[
                styles.card,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                },
              ]}
            >
              <View style={styles.cardTopo}>
                <Ionicons name={f.icone} size={22} color={tema.accent} accessible={false} />
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.cardTitulo,
                    { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                  ]}
                >
                  {f.titulo}
                </Text>
              </View>
              <Text
                style={[
                  styles.cardTexto,
                  {
                    color: tema.textSecondary,
                    fontSize: tema.fontSize(14),
                    lineHeight: tema.fontSize(20),
                  },
                ]}
              >
                {f.texto}
              </Text>
              {f.rota && (
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${f.titulo}`}
                  style={[
                    styles.botao,
                    { minHeight: tema.minTouchHeight },
                  ]}
                  onPress={() => router.push(f.rota)}
                >
                  <Text
                    style={[
                      styles.botaoTexto,
                      { color: tema.accent, fontSize: tema.fontSize(14) },
                    ]}
                  >
                    Abrir
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={tema.accent} accessible={false} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  titulo: { fontWeight: 'bold', marginLeft: 15 },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitulo: { fontWeight: 'bold' },
  cardTexto: {},
  botao: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 12 },
  botaoTexto: { fontWeight: 'bold' },
});
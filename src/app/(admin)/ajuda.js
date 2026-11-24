import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function TelaAjuda() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();

  const abrirSuporte = async () => {
    const url = 'mailto:suporte@lirium.com?subject=Suporte%20Lirium';
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível abrir o contacto com o suporte.');
    }
  };

  const abrirGuia = () => {
    router.push('/guia');
  };

  return (
    <LinearGradient
      colors={config.altoContraste ? [tema.bgPrimary, tema.bgPrimary] : ['#1E201E', '#434643', '#1A1C1A']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.tela}>
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
              styles.tituloTopo,
              { color: tema.accent, fontSize: tema.fontSize(22) },
            ]}
          >
            Ajuda & Suporte
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 88 + tema.espacoExtra, gap: 15 + tema.espacoExtra },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <Ionicons
              name="book-outline"
              size={24}
              color={tema.accent}
              style={{ marginBottom: 10 }}
              accessible={false}
            />
            <Text
              accessibilityRole="header"
              style={[
                styles.cardTitulo,
                { color: tema.textPrimary, fontSize: tema.fontSize(16) },
              ]}
            >
              Como utilizar a plataforma?
            </Text>
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
              O sistema Lirium Esmalteria & Spa foi desenvolvido para gerir agendamentos, serviços, pacotes e comissões de forma integrada e segura através do painel administrativo.
            </Text>
            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Ver guia completo"
              style={[
                styles.botao,
                {
                  minHeight: tema.minTouchHeight,
                  borderColor: tema.accent,
                  backgroundColor: tema.accentSoft,
                },
              ]}
              onPress={abrirGuia}
            >
              <Ionicons name="book-outline" size={18} color={tema.accent} />
              <Text
                style={[
                  styles.botaoTexto,
                  { color: tema.accent, fontSize: tema.fontSize(14) },
                ]}
              >
                Ver guia completo
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <Ionicons
              name="call-outline"
              size={24}
              color={tema.accent}
              style={{ marginBottom: 10 }}
              accessible={false}
            />
            <Text
              accessibilityRole="header"
              style={[
                styles.cardTitulo,
                { color: tema.textPrimary, fontSize: tema.fontSize(16) },
              ]}
            >
              Suporte Técnico
            </Text>
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
              Em caso de dúvidas com o acesso ou relatórios financeiros, entre em contacto com o suporte administrativo através do e-mail suporte@lirium.com.
            </Text>
            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Falar com o suporte por e-mail"
              style={[
                styles.botao,
                {
                  minHeight: tema.minTouchHeight,
                  borderColor: tema.accent,
                  backgroundColor: tema.accentSoft,
                },
              ]}
              onPress={abrirSuporte}
            >
              <Ionicons name="mail-outline" size={18} color={tema.accent} />
              <Text
                style={[
                  styles.botaoTexto,
                  { color: tema.accent, fontSize: tema.fontSize(14) },
                ]}
              >
                Falar com o suporte
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tituloTopo: { fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  scroll: {},
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardTitulo: { fontWeight: 'bold', marginBottom: 8 },
  cardTexto: {},
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  botaoTexto: { fontWeight: 'bold' },
});
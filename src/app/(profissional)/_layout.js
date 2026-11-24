import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { signOut } from 'firebase/auth';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BotaoAcessibilidade from '../../components/BotaoAcessibilidade';
import { auth } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

const MENU_PRINCIPAL_PROFISSIONAL = [
  { name: 'index', label: 'Minha Agenda', icon: 'calendar-outline' },
  { name: 'ganhos', label: 'Minhas Comissões', icon: 'wallet-outline' },
  { name: 'perfil', label: 'Meu Perfil', icon: 'person-circle-outline' },
];

const ROTAS_SECUNDARIAS_PROFISSIONAL = [
  'agenda',
  'editar-perfil',
];

function CustomProfissionalDrawerContent(props) {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const { state, navigation } = props;
  const rotaAtual = state?.routes?.[state.index]?.name;

  function handleLogout() {
    Alert.alert('Sair da Conta', 'Tem certeza de que deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            if (navigation && typeof navigation.closeDrawer === 'function') {
              navigation.closeDrawer();
            }
            await signOut(auth);
          } catch (error) {
            console.error('Erro ao sair:', error);
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.drawerContainer, { backgroundColor: tema.bgPrimary }]}>
      <View
        style={[
          styles.drawerHeader,
          {
            backgroundColor: tema.bgSurface,
            borderBottomColor: tema.borderSubtle,
          },
        ]}
      >
        <Text style={[styles.brandTitle, { color: tema.accent, fontSize: tema.fontSize(16) }]}>
          Lirium Esmalteria
        </Text>
        {!config.modoCalmo && (
          <Text style={[styles.brandSub, { color: tema.textMuted, fontSize: tema.fontSize(12) }]}>
            Painel Profissional
          </Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { gap: 4 + tema.espacoExtra }]}
        showsVerticalScrollIndicator={false}
      >
        {MENU_PRINCIPAL_PROFISSIONAL.map((item) => {
          const ativa = rotaAtual === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: ativa }}
              style={[
                styles.itemBtn,
                {
                  minHeight: tema.minTouchHeight,
                  backgroundColor: ativa ? tema.accent : 'transparent',
                  borderColor: config.altoContraste ? tema.borderSubtle : 'transparent',
                },
              ]}
              onPress={() => {
                navigation.navigate(item.name);
                if (typeof navigation.closeDrawer === 'function') {
                  navigation.closeDrawer();
                }
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={ativa ? tema.textOnAccent : tema.textSecondary}
              />
              <Text
                style={[
                  styles.itemTexto,
                  {
                    color: ativa ? tema.textOnAccent : tema.textSecondary,
                    fontSize: tema.fontSize(14),
                    fontWeight: ativa ? 'bold' : '600',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        hitSlop={tema.hitSlopPadrao}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
        style={[
          styles.logoutBtn,
          {
            borderTopColor: tema.borderSubtle,
            minHeight: tema.minTouchHeight + 12,
          },
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={tema.danger} />
        <Text style={[styles.logoutTexto, { color: tema.danger, fontSize: tema.fontSize(14) }]}>
          Sair da conta
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProfissionalLayout() {
  const { tema } = useAcessibilidade();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomProfissionalDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: tema.bgPrimary,
            width: 280,
          },
        }}
      >
        {MENU_PRINCIPAL_PROFISSIONAL.map((item) => (
          <Drawer.Screen
            key={item.name}
            name={item.name}
            options={{ title: item.label }}
          />
        ))}

        {ROTAS_SECUNDARIAS_PROFISSIONAL.map((routeName) => (
          <Drawer.Screen
            key={routeName}
            name={routeName}
            options={{
              drawerItemStyle: { display: 'none' },
              href: null,
            }}
          />
        ))}
      </Drawer>

      <BotaoAcessibilidade />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  brandTitle: {
    fontWeight: 'bold',
  },
  brandSub: {
    marginTop: 2,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  itemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
  },
  itemTexto: {
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  logoutTexto: {
    fontWeight: 'bold',
  },
});
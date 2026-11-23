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
import { auth } from '../../config/firebase';

const COLORS = {
  drawerBg: '#434643',
  drawerHeaderBg: '#595959',
  borderSubtle: '#6B6E6B',
  accent: '#FF98B9',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D1D1',
  textMuted: '#A0A3A0',
  textOnAccent: '#1E201E',
  danger: '#FF7B7B',
};

const MENU_PRINCIPAL_ADMIN = [
  { name: 'index', label: 'Dashboard', icon: 'pie-chart-outline' },
  { name: 'catalogo-equipe', label: 'Catálogo e Equipe', icon: 'sparkles-outline' },
  { name: 'clientes', label: 'Contatos de Clientes', icon: 'people-outline' },
  { name: 'profissionais', label: 'Equipe de Profissionais', icon: 'people-circle-outline' },
  { name: 'gerenciar-usuarios', label: 'Controle de Acessos', icon: 'shield-checkmark-outline' },
  { name: 'servicos', label: 'Catálogo de Serviços', icon: 'list-outline' },
  { name: 'pacotes', label: 'Pacotes de Serviços', icon: 'gift-outline' },
  { name: 'caixa', label: 'Caixa & Estoque', icon: 'wallet-outline' },
  { name: 'perfil', label: 'Meu Perfil', icon: 'person-circle-outline' },
  { name: 'ajuda', label: 'Ajuda & Suporte', icon: 'help-circle-outline' },
];

const ROTAS_SECUNDARIAS_ADMIN = [
  'despesas',
  'editar-perfil',
  'editar-profissional',
  'equipe',
  'estoque',
  'guia',
  'lista-profissionais',
  'novo-profissional',
  'relatorios',
];

function CustomAdminDrawerContent(props) {
  const router = useRouter();
  const { state, navigation } = props;
  const rotaAtual = state?.routes?.[state.index]?.name;

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
    }
  }

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.brandTitle}>Lirium Esmalteria & Spa</Text>
        <Text style={styles.brandSub}>Painel Administrativo</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_PRINCIPAL_ADMIN.map((item) => {
          const ativa = rotaAtual === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.itemBtn, ativa && styles.itemBtnAtivo]}
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
                color={ativa ? COLORS.textOnAccent : COLORS.textSecondary}
              />
              <Text style={[styles.itemTexto, ativa && styles.itemTextoAtivo]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomAdminDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLORS.drawerBg,
          width: 280,
        },
      }}
    >
      {MENU_PRINCIPAL_ADMIN.map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name}
          options={{ title: item.label }}
        />
      ))}

      {ROTAS_SECUNDARIAS_ADMIN.map((routeName) => (
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
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.drawerBg,
  },
  drawerHeader: {
    backgroundColor: COLORS.drawerHeaderBg,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  brandTitle: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  itemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  itemBtnAtivo: {
    backgroundColor: COLORS.accent,
  },
  itemTexto: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  itemTextoAtivo: {
    color: COLORS.textOnAccent,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  logoutTexto: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
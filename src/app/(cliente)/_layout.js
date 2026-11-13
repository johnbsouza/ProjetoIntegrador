import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { signOut } from 'firebase/auth';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import BotaoAcessibilidade from '../../components/BotaoAcessibilidade';
import { auth } from '../../config/firebase';

function CustomDrawerCliente(props) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { label: 'Início', route: '/(cliente)', icon: 'home-outline' },
    { label: 'Explorar Serviços', route: '/(cliente)/explorar', icon: 'search-outline' },
    { label: 'Meus Agendamentos', route: '/(cliente)/agenda', icon: 'calendar-outline' },
    { label: 'Notificações', route: '/(cliente)/notificacoes', icon: 'notifications-outline' },
    { label: 'Meu Perfil', route: '/(cliente)/perfil', icon: 'person-outline' },
  ];

  function handleLogout() {
    Alert.alert('Sair da Conta', 'Tem certeza de que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            // 1. Fecha o menu lateral para desbloquear a navegação
            if (props?.navigation) {
              props.navigation.closeDrawer();
            }
            // 2. Desconecta a conta no Firebase
            await signOut(auth);
          } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
          } finally {
            // 3. Redireciona obrigatoriamente para a tela de login inicial
            router.replace('/');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#595959' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.drawerHeader}>
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={36} color="#1E201E" />
          </View>
          <Text style={styles.drawerTitle}>Olá, Cliente!</Text>
          <Text style={styles.drawerSubtitle}>Área Exclusiva</Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 10 }}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.route;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => router.push(item.route)}
              >
                <Ionicons name={item.icon} size={22} color={isActive ? '#1E201E' : '#D1D1D1'} />
                <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* BOTAO SAIR DA CONTA */}
          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 10 }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF4C4C" />
            <Text style={[styles.menuText, { color: '#FF4C4C', fontWeight: 'bold' }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.drawerFooter}>
          <View style={styles.linhaSeparadora} />
          <Text style={styles.footerText}>Esmalteria App</Text>
          <Text style={styles.footerSubText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ClienteLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerCliente {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: '#434643', shadowColor: 'transparent', elevation: 0 },
          headerTintColor: '#FF98B9', 
          headerTitleAlign: 'center',
          drawerStyle: { backgroundColor: '#595959', width: 280 },
        }}
      >
        <Drawer.Screen name="index" options={{ headerTitle: 'Área do Cliente' }} />
        <Drawer.Screen name="explorar" options={{ headerTitle: 'Serviços' }} />
        <Drawer.Screen name="agenda" options={{ headerTitle: 'Meus Agendamentos' }} />
        <Drawer.Screen name="notificacoes" options={{ headerTitle: 'Notificações' }} />
        <Drawer.Screen name="perfil" options={{ headerTitle: 'Meu Perfil' }} />
        <Drawer.Screen name="editar-perfil" options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Editar Perfil' }} />
        <Drawer.Screen name="agendar" options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Agendar Horário' }} />
      </Drawer>
      
      <BotaoAcessibilidade />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF98B9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  drawerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    color: '#FF98B9',
    fontSize: 14,
    marginTop: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  menuItemActive: {
    backgroundColor: '#FF98B9',
  },
  menuText: {
    color: '#D1D1D1',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 15,
  },
  menuTextActive: {
    color: '#1E201E',
    fontWeight: 'bold',
  },
  drawerFooter: {
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  linhaSeparadora: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
  },
  footerText: {
    color: '#D1D1D1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerSubText: {
    color: 'rgba(209, 209, 209, 0.5)',
    fontSize: 12,
    marginTop: 2,
  },
});
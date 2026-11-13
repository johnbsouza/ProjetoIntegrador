import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BotaoAcessibilidade from '../../components/BotaoAcessibilidade';

export default function AdminLayout() {
  const router = useRouter();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: '#434643', shadowColor: 'transparent', elevation: 0 },
          headerTintColor: '#FF98B9', 
          headerTitleAlign: 'center',
          headerTitleContainerStyle: {
            alignItems: 'center',
          },
          drawerStyle: { backgroundColor: '#595959', width: 280 },
          drawerActiveTintColor: '#434643',
          drawerActiveBackgroundColor: '#FF98B9',
          drawerInactiveTintColor: '#D1D1D1',
          headerRight: () => null,
        }}
      >
        <Drawer.Screen 
          name="index" 
          options={{ 
            drawerLabel: 'Dashboard', 
            headerTitle: () => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Painel Administrador</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="pie-chart-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="agenda" 
          options={{ 
            drawerLabel: 'Agenda', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Agenda da Esmalteria</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="clientes" 
          options={{ 
            drawerLabel: 'Contatos de Clientes', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Contatos de Clientes</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="lista-profissionais" 
          options={{ 
            drawerLabel: 'Equipe de Profissionais', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Equipe de Profissionais</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-circle-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="relatorios" 
          options={{ 
            drawerLabel: 'Gestão de Comissões', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Relatórios de Comissões</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="cash-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="gerenciar-usuarios" 
          options={{ 
            drawerLabel: 'Controle de Acessos', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Controle de Acessos</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="servicos" 
          options={{ 
            drawerLabel: 'Catálogo de Serviços', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Catálogo de Serviços</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="pacotes" 
          options={{ 
            drawerLabel: 'Pacotes de Serviços', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Pacotes de Serviços</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="gift-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="caixa" 
          options={{ 
            drawerLabel: 'Caixa & Estoque', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Caixa e Estoque</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="perfil" 
          options={{ 
            drawerLabel: 'Meu Perfil', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Meu Perfil</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }} 
        />

        <Drawer.Screen 
          name="ajuda" 
          options={{ 
            drawerLabel: 'Ajuda & Suporte', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Ajuda & Suporte</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="help-circle-outline" size={size} color={color} />
            ),
          }} 
        />

        {/* TELAS OCULTAS DO MENU LATERAL */}
        <Drawer.Screen name="editar-perfil" options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Editar Perfil' }} />
        <Drawer.Screen name="novo-profissional" options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Novo Profissional' }} />
        <Drawer.Screen name="editar-profissional" options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Editar Profissional' }} />
        <Drawer.Screen name="novo-servico" options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Novo Serviço' }} />
        <Drawer.Screen name="guia" options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Guia da Plataforma' }} />
        <Drawer.Screen name="equipe" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="estoque" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="despesas" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="profissionais" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
      
      <BotaoAcessibilidade />
    </GestureHandlerRootView>
  );
}
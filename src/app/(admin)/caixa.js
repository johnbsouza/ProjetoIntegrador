import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AdminLayout() {
  const router = useRouter();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: '#1E2C1B', shadowColor: 'transparent', elevation: 0 },
          headerTintColor: '#E4A0B7', // Cor do ícone do Drawer
          headerTitleAlign: 'left',
          drawerStyle: { backgroundColor: '#2C3D29', width: 280 },
          drawerActiveTintColor: '#1E2C1B',
          drawerActiveBackgroundColor: '#E4A0B7',
          drawerInactiveTintColor: '#A3B19B',
          
          // O botão de logout global aparece no topo de todas as telas do Admin
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 15, padding: 8, backgroundColor: 'rgba(255, 76, 76, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: '#FF4C4C' }} 
              onPress={() => router.replace('/')}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF4C4C" />
            </TouchableOpacity>
          ),
        }}
      >
        
        {/* Tela 1: Dashboard Principal */}
        <Drawer.Screen 
          name="index" 
          options={{ 
            drawerLabel: 'Dashboard', 
            headerTitle: () => (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E4A0B7' }}>Painel Admin 👑</Text>
                <Text style={{ fontSize: 11, color: '#A3B19B' }}>Gestão Geral da Lirium</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="pie-chart-outline" size={size} color={color} />
            ),
          }} 
        />

        {/* Tela 2: Gestão de Equipe */}
        <Drawer.Screen 
          name="equipe" 
          options={{ 
            drawerLabel: 'Equipe e Profissionais', 
            headerTitle: () => (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E4A0B7' }}>Gestão de Equipe</Text>
                <Text style={{ fontSize: 11, color: '#A3B19B' }}>Colaboradoras e Cargos</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }} 
        />

        {/* Tela 3: Catálogo de Serviços */}
        <Drawer.Screen 
          name="servicos" 
          options={{ 
            drawerLabel: 'Catálogo de Serviços', 
            headerTitle: () => (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E4A0B7' }}>Catálogo</Text>
                <Text style={{ fontSize: 11, color: '#A3B19B' }}>Tabela de Preços e Tempos</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }} 
        />

        {/* Tela 4: Caixa e Estoque */}
        <Drawer.Screen 
          name="caixa-estoque" 
          options={{ 
            drawerLabel: 'Caixa e Estoque', 
            headerTitle: () => (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E4A0B7' }}>Caixa e Estoque</Text>
                <Text style={{ fontSize: 11, color: '#A3B19B' }}>Controle Financeiro e Produtos</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }} 
        />
        
      </Drawer>
    </GestureHandlerRootView>
  );
}
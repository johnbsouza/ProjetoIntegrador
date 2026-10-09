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
          name="lista-profissionais" 
          options={{ 
            drawerLabel: 'Equipe e Profissionais', 
            headerTitle: () => (
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Gestão de Equipe</Text>
              </View>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
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
          name="caixa" 
          options={{ 
            drawerLabel: 'Caixa e Estoque', 
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


        <Drawer.Screen name="novo-profissional" options={{ 
          drawerItemStyle: { display: 'none' },
          headerTitle: () => (
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Novo Profisional</Text>
            </View>
          ) 
          }} />
        <Drawer.Screen name="novo-servico" options={{
           drawerItemStyle: { display: 'none' }, 
           headerTitle: () => (
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Novo Serviço</Text>
            </View>
          )
           }} />
        <Drawer.Screen name="relatorios" options={{ 
          drawerItemStyle: { display: 'none' }, 
          headerTitle: () => (
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF98B9' }}>Relatórios</Text>
            </View>
          )
          }} />

      </Drawer>
    </GestureHandlerRootView>
  );
}
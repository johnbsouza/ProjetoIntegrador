import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ProfissionalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#595959',
          borderTopColor: '#6B6E6B',
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#FF98B9',
        tabBarInactiveTintColor: '#D1D1D1',
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Agenda', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="calendar-outline" size={size} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="ganhos" 
        options={{ 
          title: 'Comissões', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="wallet-outline" size={size} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="person-outline" size={size} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="editar-perfil" 
        options={{ href: null }} 
      />
    </Tabs>
  );
}
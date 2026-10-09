import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ClienteLayout() {
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
          title: 'Início', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="home-outline" size={size} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="explorar" 
        options={{ 
          title: 'Explorar', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="search-outline" size={size} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="agenda" 
        options={{ 
          title: 'Agenda', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="calendar-outline" size={size} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="notificacoes" 
        options={{ 
          title: 'Notificações', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="notifications-outline" size={size} color={color} />) 
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
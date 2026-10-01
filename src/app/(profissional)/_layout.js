// src/app/(profissional)/_layout.js
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ProfissionalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E2C1B',
          borderTopColor: '#3A4E36',
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#E4A0B7',
        tabBarInactiveTintColor: '#8C9C88',
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Agenda', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ) 
        }} 
      />
      <Tabs.Screen 
        name="ganhos" 
        options={{ 
          title: 'Ganhos', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ) 
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ) 
        }} 
      />
    </Tabs>
  );
}
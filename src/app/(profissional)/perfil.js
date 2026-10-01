import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TelaPerfil() {
  const router = useRouter(); // <-- Roteador adicionado
  const [disponivel, setDisponivel] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <Text style={styles.name}>Mariana Silva</Text>
        <Text style={styles.role}>Especialista em Gel</Text>
        
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color="#1A2418" />
          <Text style={styles.ratingText}>4.9 (120 avaliações)</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={24} color="#E4A0B7" />
            <Text style={styles.menuText}>Receber novos agendamentos</Text>
          </View>
          <Switch 
            value={disponivel} 
            onValueChange={setDisponivel}
            trackColor={{ false: '#3A4E36', true: '#E4A0B7' }}
            thumbColor={'#FFF'}
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="time-outline" size={24} color="#E4A0B7" />
            <Text style={styles.menuText}>Meus Horários de Pausa</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8C9C88" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="help-buoy-outline" size={24} color="#E4A0B7" />
            <Text style={styles.menuText}>Suporte e Ajuda</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8C9C88" />
        </TouchableOpacity>

               <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={24} color="#FF4C4C" />
          <Text style={styles.logoutBtnText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 30, borderBottomWidth: 1, borderBottomColor: '#1E2C1B' },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E4A0B7', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#1A2418' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  role: { fontSize: 14, color: '#A3B19B', marginTop: 4 },
  ratingBadge: { flexDirection: 'row', backgroundColor: '#E4A0B7', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, marginTop: 15, alignItems: 'center', gap: 5 },
  ratingText: { color: '#1A2418', fontWeight: 'bold', fontSize: 13 },
  menuContainer: { padding: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E2C1B', padding: 20, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#3A4E36' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuText: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255, 76, 76, 0.1)', padding: 18, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: '#FF4C4C' },
  logoutBtnText: { color: '#FF4C4C', fontSize: 16, fontWeight: 'bold' }
});
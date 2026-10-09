import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilProfissionalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={styles.userName}>Ana Silva</Text>
        <Text style={styles.userEmail}>ana.profissional@lirium.com</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(profissional)/editar-perfil')}
        >
          <View style={styles.menuIconInfo}>
            <Ionicons name="create-outline" size={24} color="#D1D1D1" />
            <Text style={styles.menuText}>Editar Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D1D1" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(profissional)/ganhos')}
        >
          <View style={styles.menuIconInfo}>
            <Ionicons name="wallet-outline" size={24} color="#D1D1D1" />
            <Text style={styles.menuText}>Meus Ganhos & Comissões</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D1D1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={24} color="#FF4C4C" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 30, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: '#6B6E6B' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF98B9', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#434643' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  userEmail: { fontSize: 14, color: '#D1D1D1' },
  menuContainer: { padding: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#6B6E6B' },
  menuIconInfo: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 16, color: '#FFFFFF', marginLeft: 15 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 40, paddingVertical: 15, paddingHorizontal: 20, backgroundColor: 'rgba(255, 76, 76, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: '#FF4C4C' },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#FF4C4C', marginLeft: 10 },
});
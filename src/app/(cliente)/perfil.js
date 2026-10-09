import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilClienteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>J</Text>
        </View>
        <Text style={styles.userName}>Jonathan</Text>
        <Text style={styles.userEmail}>jonathan@email.com</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(cliente)/editar-perfil')}
        >
          <View style={styles.menuIconInfo}>
            <Ionicons name="create-outline" size={22} color="#D1D1D1" />
            <Text style={styles.menuText}>Editar Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D1D1" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => router.replace('/')}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF4C4C" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 25, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: '#6B6E6B' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF98B9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#434643' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#D1D1D1' },
  menuContainer: { padding: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#6B6E6B' },
  menuIconInfo: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 16, color: '#FFFFFF', marginLeft: 15 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 30, paddingVertical: 15, paddingHorizontal: 20, backgroundColor: 'rgba(255, 76, 76, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: '#FF4C4C' },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#FF4C4C', marginLeft: 10 },
});
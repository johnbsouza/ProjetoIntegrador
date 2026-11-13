import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { auth } from '../config/firebase';

export default function CustomDrawer(props) {
  const router = useRouter();

  async function handleLogout() {
    Alert.alert('Sair da Conta', 'Tem a certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/');
          } catch (error) {
            console.error('Erro ao sair:', error);
            Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
          }
        },
      },
    ]);
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#434643' }}>
      {/* Header do Perfil no Drawer */}
      <View style={styles.headerDrawer}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={40} color="#FF98B9" />
        </View>
        <Text style={styles.nomeUser}>Olá, Cliente!</Text>
        <Text style={styles.subtituloUser}>Área Exclusiva</Text>
      </View>

      {/* Lista de Navegação Principal */}
      <View style={{ flex: 1, paddingTop: 10 }}>
        <DrawerItemList {...props} />
        
        {/* OPÇÃO SAIR REFORMULADA NO MENU */}
        <DrawerItem
          label="Sair da Conta"
          icon={({ size }) => <Ionicons name="log-out-outline" size={size} color="#FF5252" />}
          labelStyle={{ color: '#FF5252', fontWeight: 'bold' }}
          onPress={handleLogout}
        />
      </View>

      {/* Rodapé com Versão */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Esmalteria App</Text>
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  headerDrawer: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,152,185,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  nomeUser: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  subtituloUser: { color: '#FF98B9', fontSize: 12 },
  footer: { padding: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  footerText: { color: '#D1D1D1', fontSize: 12, fontWeight: 'bold' },
  versionText: { color: '#888', fontSize: 10, marginTop: 2 },
});
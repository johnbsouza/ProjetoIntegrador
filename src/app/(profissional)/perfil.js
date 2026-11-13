import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function PerfilProfissionalScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  async function carregarPerfil() {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          setUsuario(userDoc.data());
        } else {
          setUsuario({
            nome: user.displayName || 'Profissional',
            email: user.email || '',
            fotoPerfil: null,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
    } finally {
      setCarregando(false);
    }
  }

  function handleLogout() {
    Alert.alert('Sair da Conta', 'Tem certeza de que deseja encerrar a sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
          } finally {
            router.replace('/');
          }
        },
      },
    ]);
  }

  const inicial = usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'P';

  return (
    <SafeAreaView style={styles.container}>
      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {usuario?.fotoPerfil ? (
                <Image source={{ uri: usuario.fotoPerfil }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{inicial}</Text>
              )}
            </View>
            <Text style={styles.userName}>{usuario?.nome || 'Profissional Lirium'}</Text>
            <Text style={styles.userEmail}>{usuario?.email || auth.currentUser?.email}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(profissional)/editar-perfil')}
            >
              <View style={styles.menuIconInfo}>
                <Ionicons name="create-outline" size={22} color="#D1D1D1" />
                <Text style={styles.menuText}>Editar Perfil</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D1D1" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF4C4C" />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 25, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: '#6B6E6B' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF98B9', justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
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
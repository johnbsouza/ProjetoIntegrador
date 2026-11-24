import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function PerfilProfissionalScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [saindo, setSaindo] = useState(false);

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
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          setSaindo(true)
          try {
            await signOut(auth);
          } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
            Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
            setSaindo(false)
          }
        },
      },
    ]);
  }

  const nomeExibicao = usuario?.nome || 'Profissional Lirium';
  const emailExibicao = usuario?.email || auth.currentUser?.email || '';
  const inicial = usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'P';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      {carregando ? (
        <ActivityIndicator
          color={tema.accent}
          accessibilityLabel="Carregando perfil"
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          <View
            accessible
            accessibilityLabel={`Perfil de ${nomeExibicao}, ${emailExibicao}`}
            style={[
              styles.header,
              {
                backgroundColor: tema.bgSurface,
                borderBottomColor: tema.borderSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: tema.accent,
                  borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                  borderWidth: config.altoContraste ? 2 : 0,
                },
              ]}
            >
              {usuario?.fotoPerfil ? (
                <Image source={{ uri: usuario.fotoPerfil }} style={styles.avatarImage} />
              ) : (
                <Text
                  style={[
                    styles.avatarText,
                    { color: tema.textOnAccent, fontSize: tema.fontSize(32) },
                  ]}
                >
                  {inicial}
                </Text>
              )}
            </View>
            <Text
              accessibilityRole="header"
              style={[
                styles.userName,
                { color: tema.textPrimary, fontSize: tema.fontSize(20) },
              ]}
            >
              {nomeExibicao}
            </Text>
            <Text
              style={[
                styles.userEmail,
                { color: tema.textSecondary, fontSize: tema.fontSize(13) },
              ]}
            >
              {emailExibicao}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.menuContainer,
              { paddingBottom: 88 + tema.espacoExtra },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Editar Perfil"
              style={[
                styles.menuItem,
                {
                  borderBottomColor: tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                  paddingVertical: 18 + tema.espacoExtra / 2,
                },
              ]}
              onPress={() => router.push('/(profissional)/editar-perfil')}
            >
              <View style={styles.menuIconInfo}>
                <Ionicons name="create-outline" size={22} color={tema.textSecondary} accessible={false} />
                <Text
                  style={[
                    styles.menuText,
                    { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                  ]}
                >
                  Editar Perfil
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={tema.textSecondary} accessible={false} />
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Sair da Conta"
              style={[
                styles.logoutButton,
                {
                  backgroundColor: tema.dangerSoft,
                  borderColor: tema.danger,
                  minHeight: tema.minTouchHeight,
                  marginTop: 30 + tema.espacoExtra,
                },
              ]}
              onPress={handleLogout}
              disabled={saindo}
            >
              <Ionicons name="log-out-outline" size={22} color={tema.danger} accessible={false} />
              <Text
                style={[
                  styles.logoutText,
                  { color: tema.danger, fontSize: tema.fontSize(16) },
                ]}
              >
                Sair da Conta
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 25,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontWeight: 'bold' },
  userName: { fontWeight: 'bold', marginBottom: 4 },
  userEmail: {},
  menuContainer: { padding: 20 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  menuIconInfo: { flexDirection: 'row', alignItems: 'center' },
  menuText: { marginLeft: 15 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: { fontWeight: 'bold', marginLeft: 10 },
});
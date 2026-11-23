import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

const COLORS = {
  bgPrimary: '#434643',
  bgSurface: '#595959',
  bgElevated: '#383B38',
  bgDark: '#2B2D2B',
  borderSubtle: 'rgba(255,255,255,0.08)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.14)',
  accentBorder: 'rgba(255, 152, 185, 0.35)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D1D1',
  textMuted: '#A0A3A0',
  textOnAccent: '#1E201E',
  danger: '#FF7B7B',
  dangerSoft: 'rgba(255, 123, 123, 0.14)',
};

export default function PerfilScreen() {
  const router = useRouter();
  const usuarioAtual = auth.currentUser;

  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (!usuarioAtual?.uid) {
      setPerfil(null);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    const userRef = doc(db, 'usuarios', usuarioAtual.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setPerfil({ id: snap.id, ...snap.data() });
        } else {
          setPerfil({
            id: usuarioAtual.uid,
            nome: usuarioAtual.displayName || 'Usuário',
            email: usuarioAtual.email || '',
            telefone: '',
            nivelAcesso: 'cliente',
          });
        }
        setCarregando(false);
      },
      (error) => {
        console.error('Erro ao carregar perfil:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, [usuarioAtual?.uid]);

  function handleIrParaEditar() {
    router.push({
      pathname: './editar-perfil',
      params: {
        nome: perfil?.nome || '',
        telefone: perfil?.telefone || '',
        email: perfil?.email || usuarioAtual?.email || '',
      },
    });
  }

  async function handleLogout() {
    setSaindo(true);
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
      Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
      setSaindo(false);
    }
  }

  const nomeExibicao = perfil?.nome || usuarioAtual?.displayName || 'Sem nome';
  const emailExibicao = perfil?.email || usuarioAtual?.email || 'Não informado';
  const telefoneExibicao = perfil?.telefone || 'Não informado';
  const nivelExibicao = (perfil?.nivelAcesso || 'cliente').toUpperCase();
  const fotoUrl = perfil?.fotoPerfil || usuarioAtual?.photoURL || '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Meu Perfil</Text>
        <TouchableOpacity
          onPress={handleIrParaEditar}
          style={styles.iconButton}
          accessibilityLabel="Editar perfil"
        >
          <Ionicons name="create-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.textoCarregando}>Carregando perfil...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatarImagem} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color={COLORS.accent} />
              </View>
            )}

            <Text style={styles.nomePrincipal}>{nomeExibicao}</Text>
            <View style={styles.badgeNivel}>
              <Text style={styles.badgeTexto}>{nivelExibicao}</Text>
            </View>
          </View>

          <View style={styles.dadosCard}>
            <View style={styles.campoLinha}>
              <View style={styles.campoIcone}>
                <Ionicons name="person-outline" size={20} color={COLORS.accent} />
              </View>
              <View style={styles.campoInfo}>
                <Text style={styles.campoLabel}>Nome completo</Text>
                <Text style={styles.campoValor}>{nomeExibicao}</Text>
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.campoLinha}>
              <View style={styles.campoIcone}>
                <Ionicons name="call-outline" size={20} color={COLORS.accent} />
              </View>
              <View style={styles.campoInfo}>
                <Text style={styles.campoLabel}>Telefone</Text>
                <Text style={styles.campoValor}>{telefoneExibicao}</Text>
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.campoLinha}>
              <View style={styles.campoIcone}>
                <Ionicons name="mail-outline" size={20} color={COLORS.accent} />
              </View>
              <View style={styles.campoInfo}>
                <Text style={styles.campoLabel}>E-mail</Text>
                <Text style={styles.campoValor}>{emailExibicao}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.botaoEditar} onPress={handleIrParaEditar}>
            <Ionicons name="create-outline" size={20} color={COLORS.textOnAccent} />
            <Text style={styles.textoBotaoEditar}>Editar Dados do Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSair}
            onPress={handleLogout}
            disabled={saindo}
          >
            {saindo ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                <Text style={styles.textoBotaoSair}>Sair da Conta</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#6B6E6B',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  iconButton: {
    padding: 4,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textoCarregando: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarImagem: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nomePrincipal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  badgeNivel: {
    marginTop: 6,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeTexto: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  dadosCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 22,
  },
  campoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  campoIcone: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campoInfo: {
    flex: 1,
  },
  campoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  campoValor: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: 10,
  },
  botaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  textoBotaoEditar: {
    color: COLORS.textOnAccent,
    fontSize: 15,
    fontWeight: 'bold',
  },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 123, 0.35)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  textoBotaoSair: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
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
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function PerfilScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
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

  function handleLogout() {
     Alert.alert('Sair da Conta', 'Tem certeza de que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            setSaindo(true);
          } catch (error) {
              Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
              setSaindo(false);
          } 
        },
      },
    ])
  }

  const nomeExibicao = perfil?.nome || usuarioAtual?.displayName || 'Sem nome';
  const emailExibicao = perfil?.email || usuarioAtual?.email || 'Não informado';
  const telefoneExibicao = perfil?.telefone || 'Não informado';
  const nivelExibicao = (perfil?.nivelAcesso || 'cliente').toUpperCase();
  const fotoUrl = perfil?.fotoPerfil || usuarioAtual?.photoURL || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: tema.bgSurface,
            borderBottomColor: tema.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          onPress={() => router.back()}
          style={[
            styles.iconButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={tema.textPrimary} />
        </TouchableOpacity>
        <Text
          accessibilityRole="header"
          style={[
            styles.topTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Meu Perfil
        </Text>
        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={handleIrParaEditar}
          style={[
            styles.iconButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Ionicons name="create-outline" size={22} color={tema.accent} />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={tema.accent} />
          <Text
            style={[
              styles.textoCarregando,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Carregando perfil...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 88 + tema.espacoExtra },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            accessible
            accessibilityLabel={`Perfil de ${nomeExibicao}, nível ${nivelExibicao}`}
            style={[styles.avatarSection, { marginBottom: 24 + tema.espacoExtra }]}
          >
            {fotoUrl ? (
              <Image
                source={{ uri: fotoUrl }}
                style={[styles.avatarImagem, { borderColor: tema.accent }]}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: tema.accent,
                  },
                ]}
              >
                <Ionicons name="person" size={44} color={tema.accent} accessible={false} />
              </View>
            )}

            <Text
              style={[
                styles.nomePrincipal,
                { color: tema.textPrimary, fontSize: tema.fontSize(20) },
              ]}
            >
              {nomeExibicao}
            </Text>
            <View
              style={[
                styles.badgeNivel,
                {
                  backgroundColor: tema.accentSoft,
                  borderColor: tema.accentBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeTexto,
                  { color: tema.accent, fontSize: tema.fontSize(11) },
                ]}
              >
                {nivelExibicao}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.dadosCard,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                marginBottom: 22 + tema.espacoExtra,
              },
            ]}
          >
            <View
              accessible
              accessibilityLabel={`Nome completo: ${nomeExibicao}`}
              style={[styles.campoLinha, { paddingVertical: 6 + tema.espacoExtra / 2 }]}
            >
              <View style={[styles.campoIcone, { backgroundColor: tema.bgElevated }]}>
                <Ionicons name="person-outline" size={20} color={tema.accent} accessible={false} />
              </View>
              <View style={styles.campoInfo}>
                <Text
                  style={[
                    styles.campoLabel,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Nome completo
                </Text>
                <Text
                  style={[
                    styles.campoValor,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                >
                  {nomeExibicao}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.divisor,
                {
                  backgroundColor: tema.borderSubtle,
                  marginVertical: 10 + tema.espacoExtra / 2,
                },
              ]}
            />

            <View
              accessible
              accessibilityLabel={`Telefone: ${telefoneExibicao}`}
              style={[styles.campoLinha, { paddingVertical: 6 + tema.espacoExtra / 2 }]}
            >
              <View style={[styles.campoIcone, { backgroundColor: tema.bgElevated }]}>
                <Ionicons name="call-outline" size={20} color={tema.accent} accessible={false} />
              </View>
              <View style={styles.campoInfo}>
                <Text
                  style={[
                    styles.campoLabel,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Telefone
                </Text>
                <Text
                  style={[
                    styles.campoValor,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                >
                  {telefoneExibicao}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.divisor,
                {
                  backgroundColor: tema.borderSubtle,
                  marginVertical: 10 + tema.espacoExtra / 2,
                },
              ]}
            />

            <View
              accessible
              accessibilityLabel={`E-mail: ${emailExibicao}`}
              style={[styles.campoLinha, { paddingVertical: 6 + tema.espacoExtra / 2 }]}
            >
              <View style={[styles.campoIcone, { backgroundColor: tema.bgElevated }]}>
                <Ionicons name="mail-outline" size={20} color={tema.accent} accessible={false} />
              </View>
              <View style={styles.campoInfo}>
                <Text
                  style={[
                    styles.campoLabel,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  E-mail
                </Text>
                <Text
                  style={[
                    styles.campoValor,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                >
                  {emailExibicao}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Editar Dados do Perfil"
            style={[
              styles.botaoEditar,
              {
                backgroundColor: tema.accent,
                minHeight: tema.minTouchHeight,
                marginBottom: 12 + tema.espacoExtra,
              },
            ]}
            onPress={handleIrParaEditar}
          >
            <Ionicons name="create-outline" size={20} color={tema.textOnAccent} accessible={false} />
            <Text
              style={[
                styles.textoBotaoEditar,
                { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
              ]}
            >
              Editar Dados do Perfil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel={saindo ? 'Encerrando sessão' : 'Sair da Conta'}
            accessibilityState={{ disabled: saindo, busy: saindo }}
            style={[
              styles.botaoSair,
              {
                backgroundColor: tema.dangerSoft,
                borderColor: tema.danger,
                minHeight: tema.minTouchHeight,
              },
            ]}
            onPress={handleLogout}
            disabled={saindo}
          >
            {saindo ? (
              <ActivityIndicator size="small" color={tema.danger} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color={tema.danger} accessible={false} />
                <Text
                  style={[
                    styles.textoBotaoSair,
                    { color: tema.danger, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Sair da Conta
                </Text>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topTitle: {
    fontWeight: 'bold',
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
  textoCarregando: {},
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarImagem: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nomePrincipal: {
    fontWeight: 'bold',
  },
  badgeNivel: {
    marginTop: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeTexto: {
    fontWeight: 'bold',
  },
  dadosCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  campoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  campoIcone: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campoInfo: {
    flex: 1,
  },
  campoLabel: {},
  campoValor: {
    fontWeight: '600',
    marginTop: 2,
  },
  divisor: {
    height: 1,
  },
  botaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
  },
  textoBotaoEditar: {
    fontWeight: 'bold',
  },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
  },
  textoBotaoSair: {
    fontWeight: 'bold',
  },
});
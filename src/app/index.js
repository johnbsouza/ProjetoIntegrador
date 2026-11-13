import { useRouter } from 'expo-router';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BotaoAcessibilidade from '../components/BotaoAcessibilidade';
import { auth, db } from '../config/firebase';

export default function LoginTela() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  // 1. Verifica se já existe um utilizador autenticado ao abrir o app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await redirecionarPorNivelAcesso(user.uid);
      } else {
        setVerificandoSessao(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Procura o perfil do utilizador no Firestore e redireciona para a rota correspondente
  async function redirecionarPorNivelAcesso(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid));

      if (userDoc.exists()) {
        const nivelAcesso = userDoc.data().nivelAcesso;

        if (nivelAcesso === 'admin') {
          router.replace('/(admin)');
        } else if (nivelAcesso === 'profissional') {
          router.replace('/(profissional)');
        } else {
          router.replace('/(cliente)');
        }
      } else {
        router.replace('/(cliente)');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do utilizador:', error);
      Alert.alert('Erro', 'Não foi possível carregar as permissões do seu perfil.');
    } finally {
      setVerificandoSessao(false);
      setCarregando(false);
    }
  }

  // 3. Executa o login com E-mail e Senha no Firebase
  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o e-mail e a palavra-passe.');
      return;
    }

    setCarregando(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), senha);
      await redirecionarPorNivelAcesso(userCredential.user.uid);
    } catch (error) {
      console.error('Erro no login:', error);
      let mensagem = 'Falha ao realizar login. Verifique as suas credenciais.';

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        mensagem = 'E-mail ou palavra-passe incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'O formato do e-mail é inválido.';
      }

      Alert.alert('Erro de Acesso', mensagem);
      setCarregando(false);
    }
  }

  if (verificandoSessao) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF98B9" />
        <Text style={styles.loadingText}>A carregar Lirium Esmalteria...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#272A27" />

      <View style={styles.content}>
        {/* LOGO E TÍTULOS DA MARCA */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircleGlow}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.brandTitle}>L I R I U M</Text>
          <Text style={styles.brandSubtitle}>ESMALTERIA</Text>
        </View>

        {/* CARD CENTRALIZADO COM FORMULÁRIO */}
        <View style={styles.cardContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Palavra-passe"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity
            style={[styles.loginButton, carregando && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#1E201E" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* LINKS DE AÇÃO NO CARD */}
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => router.push('/esqueci-senha')}>
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/cadastro')}>
              <Text style={styles.linkTextBold}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>

        
      </View>

      <BotaoAcessibilidade />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272A27',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#272A27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D1D1D1',
    marginTop: 15,
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircleGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#3D403D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF98B9',
    shadowColor: '#FF98B9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 28,
    color: '#FF98B9',
    letterSpacing: 6,
    fontWeight: '300',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 3,
    fontWeight: '400',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#383B38',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    backgroundColor: '#464946',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  loginButton: {
    backgroundColor: '#FF98B9',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
    shadowColor: '#FF98B9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#1E201E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  linkText: {
    color: '#FF98B9',
    fontSize: 13,
  },
  linkTextBold: {
    color: '#FF98B9',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
  },
  footerLinkText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
  },
  footerDot: {
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
    fontSize: 14,
  },
});
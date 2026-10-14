import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';

export default function TelaLogin() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (email === "" || senha === "") {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    setCarregando(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      
      setCarregando(false);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const nivelAcesso = userData.nivelAcesso;

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
      setCarregando(false);
      console.error("Erro no login:", error);
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login.');
      }
    }
  }

  return (
    <LinearGradient
      colors={['#1E201E', '#434643', '#1A1C1A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={estilos.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={estilos.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={estilos.marca}>
              <View style={estilos.logoContainer3D}>
                <Image 
                  source={require('../../assets/images/logo.png')} 
                  style={estilos.logo} 
                  resizeMode="contain"
                />
              </View>
              <Text style={estilos.nome}>LIRIUM</Text>
              <Text style={estilos.subtitulo}>ESMALTERIA & SPA</Text>
            </View>

            <View style={estilos.formulario}>
              <View style={estilos.inputWrapper}>
                <TextInput 
                  style={estilos.input} 
                  placeholder="E-mail" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              
              <View style={estilos.inputWrapper}>
                <TextInput 
                  style={estilos.input} 
                  placeholder="Senha" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  secureTextEntry
                  value={senha}
                  onChangeText={setSenha}
                />
              </View>

              <TouchableOpacity 
                style={[estilos.botaoEntrar, carregando && { opacity: 0.7 }]} 
                onPress={entrar} 
                activeOpacity={0.8}
                disabled={carregando}
              >
                <Text style={estilos.textoBotaoEntrar}>
                  {carregando ? 'A entrar...' : 'Entrar'}
                </Text>
              </TouchableOpacity>

              <View style={estilos.linhasLinks}>
                <TouchableOpacity onPress={() => router.push('/esqueci-senha')}>
                  <Text style={estilos.link}>Esqueceu a senha?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/cadastro')}>
                  <Text style={estilos.linkBold}>Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  marca: { alignItems: 'center', marginBottom: 35 },
  logoContainer3D: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: 'rgba(255, 152, 185, 0.4)', backgroundColor: '#595959', shadowColor: '#FF98B9', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 12 },
  logo: { width: 110, height: 110 },
  nome: { fontSize: 28, color: '#FF98B9', fontWeight: '500', letterSpacing: 3 },
  subtitulo: { fontSize: 11, color: 'rgba(209, 209, 209, 0.7)', letterSpacing: 2.5, marginTop: 4 },
  formulario: { width: '100%', backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 24, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  inputWrapper: { marginBottom: 16 },
  input: { backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)' },
  botaoEntrar: { backgroundColor: '#FF98B9', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 20, shadowColor: '#FF98B9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  textoBotaoEntrar: { color: '#434643', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  linhasLinks: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  link: { color: 'rgba(255, 152, 185, 0.85)', fontSize: 13 },
  linkBold: { color: '#FF98B9', fontSize: 13, fontWeight: '700' },
});
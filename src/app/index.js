import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TelaLogin() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function entrar() {
    if (email === "" || senha === "") {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }
    router.replace('/(cliente)'); 
  }

  return (
    // 1. O LinearGradient agora é o elemento PAI de todos para preencher a tela inteira.
    // 2. Cores ajustadas: Escuro no topo -> Cinza da marca no meio -> Fundo mais escuro em baixo
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

              <TouchableOpacity style={estilos.botaoEntrar} onPress={entrar} activeOpacity={0.8}>
                <Text style={estilos.textoBotaoEntrar}>Entrar</Text>
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

            <View style={estilos.footer}>
              <TouchableOpacity onPress={() => router.replace('/(profissional)')}>
                <Text style={estilos.footerLink}>Acesso Profissional</Text>
              </TouchableOpacity>
              
              <Text style={estilos.footerDivider}>•</Text>
              
              <TouchableOpacity onPress={() => router.replace('/(admin)')}>
                <Text style={estilos.footerLink}>Acesso Admin</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    // Removi o backgroundColor daqui para que o fundo fique transparente 
    // e permita ver o gradiente que está por trás dele!
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  marca: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer3D: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 152, 185, 0.4)', 
    backgroundColor: '#595959',

    // SOMBRA ROSA
    shadowColor: '#FF98B9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12, 
  },
  logo: {
    width: 110,
    height: 110,
  },
  nome: {
    fontSize: 28,
    color: '#FF98B9',
    fontWeight: '500',
    letterSpacing: 3,
    fontFamily: 'serif',
  },
  subtitulo: {
    fontSize: 11,
    color: 'rgba(209, 209, 209, 0.7)',
    letterSpacing: 2.5,
    marginTop: 4,
  },
  formulario: {
    width: '100%',
    backgroundColor: 'rgba(67, 70, 67, 0.8)', 
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(89, 89, 89, 0.6)',
    color: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(209, 209, 209, 0.15)',
  },
  botaoEntrar: {
    backgroundColor: '#FF98B9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    
    shadowColor: '#FF98B9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  textoBotaoEntrar: {
    color: '#434643',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  linhasLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  link: {
    color: 'rgba(255, 152, 185, 0.85)', 
    fontSize: 13,
  },
  linkBold: {
    color: '#FF98B9',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerLink: {
    color: 'rgba(209, 209, 209, 0.6)',
    fontSize: 12,
  },
  footerDivider: {
    color: 'rgba(209, 209, 209, 0.3)',
    fontSize: 12,
    marginHorizontal: 12,
  },
});
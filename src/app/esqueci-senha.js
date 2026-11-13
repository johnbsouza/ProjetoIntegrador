import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';

export default function EsqueciSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleEnviarEmail() {
    if (!email.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, digite o seu e-mail.');
      return;
    }

    setCarregando(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        'E-mail Enviado',
        'Enviamos um link de redefinição de senha para o e-mail informado. Verifique também a sua caixa de spam.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      let mensagemErro = 'Não foi possível enviar o e-mail de redefinição.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          mensagemErro = 'Nenhuma conta encontrada com este e-mail.';
          break;
        case 'auth/invalid-email':
          mensagemErro = 'O formato do e-mail digitado é inválido.';
          break;
        case 'auth/too-many-requests':
          mensagemErro = 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.';
          break;
      }
      
      Alert.alert('Erro', mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FF98B9" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconBox}>
            <Ionicons name="key-outline" size={48} color="#FF98B9" />
          </View>

          <Text style={styles.titulo}>Recuperar Senha</Text>
          <Text style={styles.subtitulo}>
            Digite o e-mail cadastrado na sua conta para receber as instruções de redefinição.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="rgba(209, 209, 209, 0.7)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite o seu e-mail"
              placeholderTextColor="rgba(209, 209, 209, 0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.botaoEnviar, carregando && styles.botaoDesativado]}
            onPress={handleEnviarEmail}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#1E201E" />
            ) : (
              <Text style={styles.botaoTexto}>Enviar E-mail</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(89, 89, 89, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(89, 89, 89, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 185, 0.3)'
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF98B9',
    marginBottom: 10
  },
  subtitulo: {
    fontSize: 14,
    color: 'rgba(209, 209, 209, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(89, 89, 89, 0.5)',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 55,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15
  },
  botaoEnviar: {
    backgroundColor: '#FF98B9',
    height: 55,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  botaoDesativado: {
    opacity: 0.6
  },
  botaoTexto: {
    color: '#1E201E',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
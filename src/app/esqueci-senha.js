import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleRecuperarSenha() {
    console.log("=== BOTÃO CLICADO ===");
    console.log("E-mail digitado:", email);

    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, insira o seu e-mail.');
      return;
    }

    setCarregando(true);
    try {
      console.log("A tentar ligar ao Firebase Auth para enviar e-mail...");
      await sendPasswordResetEmail(auth, email.trim());
      console.log("Sucesso no envio do e-mail!");
      
      Alert.alert(
        'E-mail Enviado',
        'Verifique a sua caixa de entrada (e a pasta de spam) para redefinir a palavra-passe.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('ERRO DETALHADO DO FIREBASE:', error);
      Alert.alert('Erro no Envio', `Código: ${error.code}\n\nMensagem: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#272A27" />

      <View style={styles.content}>
        <Text style={styles.titulo}>Recuperar Senha</Text>
        <Text style={styles.subtitulo}>Insira o seu e-mail para receber as instruções de redefinição.</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.botao, carregando && { opacity: 0.7 }]}
          onPress={handleRecuperarSenha}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#1E201E" />
          ) : (
            <Text style={styles.textoBotao}>Enviar E-mail</Text>
          )}
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
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                size='small'
                color='#1E201E'
                />
                <Text style={styles.botaoTexto}>
                  Enviando...
                </Text>
              </View>
            ): (
              <Text style={styles.botaoTexto}>
                Enviar E-mail
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#272A27' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
  titulo: { fontSize: 24, color: '#FF98B9', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitulo: { fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 25, textAlign: 'center' },
  input: {
    backgroundColor: '#383B38',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  botao: {
    backgroundColor: '#FF98B9',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF98B9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoDesativado: {
    opacity: 0.6
  },
  botaoTexto: {
    color: '#1E201E',
    fontSize: 16,
    fontWeight: 'bold'
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  }
});
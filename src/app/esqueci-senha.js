import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function enviarInstrucoes() {
    if (email === '') {
      Alert.alert('Atenção', 'Por favor, informe o seu e-mail cadastrado.');
      return;
    }

    Alert.alert(
      'E-mail Enviado',
      'Se o e-mail estiver cadastrado, receberá as instruções para redefinir a sua senha em instantes.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <StatusBar barStyle="light-content" backgroundColor="#434643" />
      
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
          {/* Botão de voltar mantido no topo */}
          <View style={estilos.headerTop}>
            <TouchableOpacity style={estilos.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FF98B9" />
            </TouchableOpacity>
          </View>

          {/* Bloco principal centralizado e expandido */}
          <View style={estilos.formularioContainer}>
            <Text style={estilos.tituloTopo}>Recuperar Senha</Text>
            <Text style={estilos.subtituloTopo}>
              Enviaremos um link seguro de redefinição para o seu e-mail cadastrado.
            </Text>

            <View style={estilos.inputWrapper}>
              <Text style={estilos.inputLabel}>E-mail</Text>
              <TextInput 
                style={estilos.input} 
                placeholder="exemplo@email.com" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity style={estilos.botaoEnviar} onPress={enviarInstrucoes} activeOpacity={0.8}>
              <Text style={estilos.textoBotaoEnviar}>Enviar Instruções</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.voltarLogin} onPress={() => router.back()}>
              <Text style={estilos.voltarLoginText}>Lembrou da senha? <Text style={estilos.voltarLoginTextBold}>Voltar ao login</Text></Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#434643', 
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 30,
  },
  headerTop: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(89, 89, 89, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 110, 107, 0.5)',
  },
  formularioContainer: {
    width: '100%',
    backgroundColor: '#434643',
    paddingVertical: 35,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 140,
  },
  tituloTopo: {
    fontSize: 28,
    color: '#FF98B9',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtituloTopo: {
    fontSize: 14,
    color: 'rgba(209, 209, 209, 0.8)',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 25,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF98B9',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(67, 70, 67, 0.85)',
    color: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(107, 110, 107, 0.6)',
  },
  botaoEnviar: {
    backgroundColor: '#FF98B9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF98B9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  textoBotaoEnviar: {
    color: '#434643',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  voltarLogin: {
    alignItems: 'center',
  },
  voltarLoginText: {
    fontSize: 14,
    color: 'rgba(209, 209, 209, 0.85)',
  },
  voltarLoginTextBold: {
    color: '#FF98B9',
    fontWeight: '600',
  },
});
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TelaLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function emBreve() {
    Alert.alert('Aviso', 'Esta funcionalidade estará disponível em breve.');
  }

  function entrar() {
    if (email === "" || senha === "") {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    // Simulação de verificação de permissões (Role-Based Access)
    const emailDigitado = email.toLowerCase().trim();

    if (emailDigitado.includes('admin')) {
      // Exemplo: admin@lirium.com
      router.replace('/(admin)');
    } else if (emailDigitado.includes('pro') || emailDigitado.includes('equipe')) {
      // Exemplo: pro@lirium.com
      router.replace('/(profissional)');
    } else {
      // Qualquer outro e-mail vai para o app do cliente
      router.replace('/(cliente)');
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3D29" />

      {/* Logo e Título */}
      <View style={estilos.marca}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={estilos.logo}
          resizeMode="contain"
        />
        <Text style={estilos.nome}>LIRIUM</Text>
        <Text style={estilos.subtitulo}>ESMALTERIA & SPA</Text>
      </View>

      {/* Formulário */}
      <View style={estilos.formulario}>
        <TextInput
          style={estilos.input}
          placeholder="E-mail"
          placeholderTextColor="#8C9C88"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={estilos.input}
          placeholder="Senha"
          placeholderTextColor="#8C9C88"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={estilos.botaoEntrar} onPress={entrar}>
          <Text style={estilos.textoBotaoEntrar}>Entrar</Text>
        </TouchableOpacity>

        <View style={estilos.linhasLinks}>
          <TouchableOpacity onPress={emBreve}>
            <Text style={estilos.link}>Esqueceu a senha?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={estilos.link}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* View vazia para manter o espaçamento do 'space-between' sem o rodapé */}
      <View />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#2C3D29',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  marca: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  nome: {
    fontSize: 32,
    color: '#E4A0B7',
    fontWeight: '400',
    letterSpacing: 2,
    fontFamily: 'serif',
  },
  subtitulo: {
    fontSize: 12,
    color: '#A3B19B',
    letterSpacing: 2,
    marginTop: 5,
  },
  formulario: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1E2C1B',
    color: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A4E36',
  },
  botaoEntrar: {
    backgroundColor: '#E4A0B7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  textoBotaoEntrar: {
    color: '#1A2418',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linhasLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: '#A3B19B',
    fontSize: 14,
  },
});
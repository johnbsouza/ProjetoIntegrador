import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TelaCadastro() {
  const router = useRouter();
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const buscarCep = async (cepDigitado) => {
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    setCep(cepDigitado);

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setEndereco(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
        } else {
          Alert.alert('Atenção', 'CEP não encontrado.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar o CEP. Verifique a conexão.');
      }
    }
  };

  function cadastrar() {
    if (!nome || !email || !telefone || !senha || !confirmaSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (senha !== confirmaSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem. Verifique e tente novamente.');
      return;
    }
    
    Alert.alert('Sucesso', 'Conta criada com sucesso!', [
      { text: 'OK', onPress: () => router.replace('/') }
    ]);
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
          <View style={estilos.headerContainer}>
            <TouchableOpacity style={estilos.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#FF98B9" />
            </TouchableOpacity>
            <Text style={estilos.tituloTopo}>Criar Conta</Text>
            
          </View>

          <View style={estilos.formulario}>
            <Text style={estilos.secaoTitulo}>Informações Pessoais</Text>

            <View style={estilos.inputWrapper}>
              <TextInput 
                style={estilos.input} 
                placeholder="Nome Completo *" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View style={estilos.inputWrapper}>
              <TextInput 
                style={estilos.input} 
                placeholder="E-mail *" 
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
                placeholder="Telefone / WhatsApp *" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
            </View>

            <Text style={estilos.secaoTitulo}>Endereço</Text>

            <View style={estilos.rowInputs}>
              <View style={[estilos.inputWrapper, { flex: 1 }]}>
                <TextInput 
                  style={estilos.input} 
                  placeholder="CEP" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="numeric"
                  maxLength={9}
                  value={cep}
                  onChangeText={buscarCep}
                />
              </View>
              <View style={[estilos.inputWrapper, { flex: 1.5 }]}>
                <TextInput 
                  style={estilos.input} 
                  placeholder="Cidade" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={cidade}
                  onChangeText={setCidade}
                />
              </View>
            </View>

            <View style={estilos.inputWrapper}>
              <TextInput 
                style={estilos.input} 
                placeholder="Bairro" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={bairro}
                onChangeText={setBairro}
              />
            </View>

            <View style={estilos.rowInputs}>
              <View style={[estilos.inputWrapper, { flex: 2.5 }]}>
                <TextInput 
                  style={estilos.input} 
                  placeholder="Endereço (Rua, Av...)" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={endereco}
                  onChangeText={setEndereco}
                />
              </View>
              <View style={[estilos.inputWrapper, { flex: 1 }]}>
                <TextInput 
                  style={estilos.input} 
                  placeholder="Nº" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="numeric"
                  value={numero}
                  onChangeText={setNumero}
                />
              </View>
            </View>

            <Text style={estilos.secaoTitulo}>Segurança</Text>

            <View style={estilos.inputWrapper}>
              <TextInput 
                style={estilos.input} 
                placeholder="Senha de Acesso *" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
            </View>

            <View style={estilos.inputWrapper}>
              <TextInput 
                style={estilos.input} 
                placeholder="Confirme a Senha *" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                secureTextEntry
                value={confirmaSenha}
                onChangeText={setConfirmaSenha}
              />
            </View>

            <TouchableOpacity style={estilos.botaoCadastrar} onPress={cadastrar} activeOpacity={0.8}>
              <Text style={estilos.textoBotaoCadastrar}>Concluir Cadastro</Text>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContainer: {
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(89, 89, 89, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(107, 110, 107, 0.5)',
  },
  tituloTopo: {
    fontSize: 26,
    color: '#FF98B9',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign:'center'
  },
  subtituloTopo: {
    fontSize: 13,
    color: 'rgba(209, 209, 209, 0.7)',
    marginTop: 2,
  },
  formulario: {
    width: '100%',
    backgroundColor: 'rgba(89, 89, 89, 0.45)',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  secaoTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF98B9',
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: 'rgba(67, 70, 67, 0.8)',
    color: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(107, 110, 107, 0.5)',
  },
  botaoCadastrar: {
    backgroundColor: '#FF98B9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
    shadowColor: '#FF98B9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  textoBotaoCadastrar: {
    color: '#434643',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
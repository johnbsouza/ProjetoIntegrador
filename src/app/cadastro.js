import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';

export default function TelaCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [carregando, setCarregando] = useState(false);

  function formatarTelefone(valor) {
    const apenasNumeros = valor.replace(/\D/g, '').substring(0, 11);
    let formatado = apenasNumeros;

    if (apenasNumeros.length > 2 && apenasNumeros.length <= 7) {
      formatado = `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2)}`;
    } else if (apenasNumeros.length > 7) {
      formatado = `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 7)}-${apenasNumeros.substring(7)}`;
    } else if (apenasNumeros.length > 0) {
      formatado = `(${apenasNumeros}`;
    }

    setTelefone(formatado);
  }

  async function cadastrarUtilizador() {
    if (!nome || !email || !senha || !telefone) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setCarregando(true);
    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = credencial.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nome,
        email,
        telefone,
        nivelAcesso: 'cliente',
        comissaoPorcentagem: 0,
        dataCriacao: serverTimestamp(),
      });

      setCarregando(false);
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      setCarregando(false);
      Alert.alert('Erro no Cadastro', error.message);
    }
  }

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={styles.tituloTopo}>Criar Nova Conta</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TextInput 
            style={styles.input} 
            placeholder="Nome Completo" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={nome}
            onChangeText={setNome}
          />

          <TextInput 
            style={styles.input} 
            placeholder="E-mail" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput 
            style={styles.input} 
            placeholder="Telefone" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={formatarTelefone}
          />

          <TextInput 
            style={styles.input} 
            placeholder="Palavra-passe (mínimo 6 dígitos)" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity 
            style={[styles.botaoSalvar, carregando && { opacity: 0.7 }]} 
            onPress={cadastrarUtilizador}
            disabled={carregando}
          >
            <Text style={styles.textoBotao}>{carregando ? 'A cadastrar...' : 'Cadastrar'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 22, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 30 },
  input: { backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)', marginBottom: 15 },
  botaoSalvar: { backgroundColor: '#FF98B9', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#434643', fontWeight: 'bold', fontSize: 16 }
});
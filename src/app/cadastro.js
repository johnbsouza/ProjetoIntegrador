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
  const [nivelAcesso, setNivelAcesso] = useState('cliente');
  const [carregando, setCarregando] = useState(false);

  async function registarUtilizador() {
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
        nivelAcesso,
        comissaoPorcentagem: nivelAcesso === 'profissional' ? 50 : 0,
        dataCriacao: serverTimestamp(),
      });

      setCarregando(false);
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      setCarregando(false);
      Alert.alert('Erro no Registo', error.message);
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
            placeholder="Telefone / WhatsApp" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />

          <TextInput 
            style={styles.input} 
            placeholder="Palavra-passe (mínimo 6 dígitos)" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <Text style={styles.labelPerfil}>Tipo de Conta:</Text>
          <View style={styles.perfisRow}>
            <TouchableOpacity 
              style={[styles.perfilBtn, nivelAcesso === 'cliente' && styles.perfilAtivo]} 
              onPress={() => setNivelAcesso('cliente')}
            >
              <Text style={[styles.perfilTxt, nivelAcesso === 'cliente' && styles.perfilTxtAtivo]}>Cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.perfilBtn, nivelAcesso === 'profissional' && styles.perfilAtivo]} 
              onPress={() => setNivelAcesso('profissional')}
            >
              <Text style={[styles.perfilTxt, nivelAcesso === 'profissional' && styles.perfilTxtAtivo]}>Profissional</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.botaoSalvar, carregando && { opacity: 0.7 }]} 
            onPress={registarUtilizador}
            disabled={carregando}
          >
            <Text style={styles.textoBotao}>{carregando ? 'A criar conta...' : 'Registar'}</Text>
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
  labelPerfil: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 5 },
  perfisRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  perfilBtn: { flex: 1, backgroundColor: 'rgba(89, 89, 89, 0.4)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  perfilAtivo: { backgroundColor: '#FF98B9', borderColor: '#FF98B9' },
  perfilTxt: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  perfilTxtAtivo: { color: '#434643', fontWeight: 'bold' },
  botaoSalvar: { backgroundColor: '#FF98B9', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  textoBotao: { color: '#434643', fontWeight: 'bold', fontSize: 16 }
});
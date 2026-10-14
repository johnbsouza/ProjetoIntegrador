import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
export default function EditarProfissionalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [comissao, setComissao] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      if (!id) return;
      try {
        const docRef = doc(db, 'usuarios', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setNome(dados.nome || '');
          setEmail(dados.email || '');
          setTelefone(dados.telefone || '');
          setComissao(String(dados.comissaoPorcentagem || '50'));
        }
      } catch (error) {
        console.error("Erro ao carregar profissional:", error);
      }
    }
    carregarDados();
  }, [id]);

  async function salvarAlteracoes() {
    if (!nome || !telefone) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    setCarregando(true);
    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, {
        nome,
        telefone,
        comissaoPorcentagem: Number(comissao)
      });
      setCarregando(false);
      Alert.alert('Sucesso', 'Profissional atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      setCarregando(false);
      Alert.alert('Erro', 'Não foi possível atualizar.');
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
          <Text style={styles.tituloTopo}>Editar Profissional</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TextInput 
            style={styles.input} 
            placeholder="Nome Completo" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput 
            style={[styles.input, { opacity: 0.6 }]} 
            placeholder="E-mail" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={email}
            editable={false}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Telefone" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />
          <TextInput 
            style={styles.input} 
            placeholder="% Comissão" 
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="numeric"
            maxLength={3}
            value={comissao}
            onChangeText={setComissao}
          />

          <TouchableOpacity 
            style={[styles.botaoSalvar, carregando && { opacity: 0.7 }]} 
            onPress={salvarAlteracoes}
            disabled={carregando}
          >
            <Text style={styles.textoBotao}>{carregando ? 'A guardar...' : 'Guardar Alterações'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 20, paddingTop: 10 },
  input: { backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)', marginBottom: 15 },
  botaoSalvar: { backgroundColor: '#FF98B9', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#434643', fontWeight: 'bold', fontSize: 16 }
});
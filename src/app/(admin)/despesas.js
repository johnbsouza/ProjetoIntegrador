import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';

export default function TelaDespesasManutencao() {
  const router = useRouter();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Manutenção');
  const [despesas, setDespesas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarDespesas = async () => {
    try {
      const q = query(collection(db, 'despesas'), orderBy('dataCriacao', 'desc'));
      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setDespesas(lista);
    } catch (error) {
      console.error("Erro ao buscar despesas:", error);
    }
  };

  useEffect(() => {
    buscarDespesas();
  }, []);

  async function adicionarDespesa() {
    if (!descricao || !valor) {
      Alert.alert('Atenção', 'Preencha a descrição e o valor.');
      return;
    }

    setCarregando(true);
    try {
      await addDoc(collection(db, 'despesas'), {
        descricao,
        valor: parseFloat(valor.replace(',', '.')),
        categoria,
        dataCriacao: serverTimestamp(),
      });
      setDescricao('');
      setValor('');
      setCarregando(false);
      buscarDespesas();
      Alert.alert('Sucesso', 'Registo guardado com sucesso!');
    } catch (error) {
      setCarregando(false);
      Alert.alert('Erro', 'Não foi possível guardar o registo.');
    }
  }

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={estilos.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={estilos.header}>
          <TouchableOpacity style={estilos.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={estilos.tituloTopo}>Despesas & Manutenção</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={estilos.formCard}>
            <TextInput 
              style={estilos.input} 
              placeholder="Descrição (ex: Compra de Esmaltes, Aluguel...)" 
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              maxLength={60}
              value={descricao}
              onChangeText={setDescricao}
            />
            
            <TextInput 
              style={estilos.input} 
              placeholder="Valor (R$)" 
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />

            <TouchableOpacity 
              style={[estilos.botaoSalvar, carregando && { opacity: 0.7 }]} 
              onPress={adicionarDespesa}
              disabled={carregando}
            >
              <Text style={estilos.textoBotaoSalvar}>{carregando ? 'A guardar...' : 'Registar Despesa'}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={despesas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={estilos.lista}
            renderItem={({ item }) => (
              <View style={estilos.itemCard}>
                <View>
                  <Text style={estilos.itemTitulo}>{item.descricao}</Text>
                  <Text style={estilos.itemSub}>{item.categoria}</Text>
                </View>
                <Text style={estilos.itemValor}>R$ {Number(item.valor).toFixed(2)}</Text>
              </View>
            )}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 22, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  formCard: { backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 20 },
  input: { backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)', marginBottom: 12 },
  botaoSalvar: { backgroundColor: '#FF98B9', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  textoBotaoSalvar: { color: '#434643', fontSize: 16, fontWeight: 'bold' },
  lista: { paddingBottom: 20 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(89, 89, 89, 0.45)', padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  itemTitulo: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  itemSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 2 },
  itemValor: { color: '#FF98B9', fontSize: 16, fontWeight: 'bold' }
});
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';

export default function TelaGestaoEquipeComissao() {
  const router = useRouter();
  const [profissionais, setProfissionais] = useState([]);
  const [comissaoEditando, setComissaoEditando] = useState({});

  const buscarProfissionais = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        const dados = documento.data();
        if (dados.nivelAcesso === 'profissional') {
          lista.push({ id: documento.id, ...dados });
        }
      });
      setProfissionais(lista);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    }
  };

  useEffect(() => {
    buscarProfissionais();
  }, []);

  async function atualizarComissao(id) {
    const novaComissao = comissaoEditando[id];
    if (!novaComissao) {
      Alert.alert('Atenção', 'Insira o valor da comissão.');
      return;
    }

    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, { comissaoPorcentagem: Number(novaComissao) });
      Alert.alert('Sucesso', 'Comissão atualizada com sucesso!');
      buscarProfissionais();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar.');
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
          <Text style={estilos.tituloTopo}>Equipe & Comissões</Text>
        </View>

        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <View style={estilos.card}>
              <Text style={estilos.nome}>{item.nome}</Text>
              <Text style={estilos.email}>{item.email}</Text>
              
              <View style={estilos.row}>
                <TextInput 
                  style={estilos.inputComissao} 
                  placeholder="% Comissão" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardDataType="numeric"
                  keyboardType="numeric"
                  defaultValue={String(item.comissaoPorcentagem || 50)}
                  onChangeText={(text) => setComissaoEditando({ ...comissaoEditando, [item.id]: text })}
                />
                <TouchableOpacity style={estilos.botaoSalvar} onPress={() => atualizarComissao(item.id)}>
                  <Text style={estilos.textoBotao}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 22, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  lista: { paddingBottom: 20 },
  card: { backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 18, borderRadius: 18, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  nome: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  email: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 13, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  inputComissao: { flex: 1, backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)' },
  botaoSalvar: { backgroundColor: '#FF98B9', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  textoBotao: { color: '#434643', fontWeight: 'bold', fontSize: 15 }
});
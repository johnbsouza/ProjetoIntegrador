import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';

export default function TelaEstoqueCaixa() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [precoFormatado, setPrecoFormatado] = useState('');
  const [idEditando, setIdEditando] = useState(null);

  const buscarProdutos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'estoque'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        lista.push({ id: documento.id, ...documento.data() });
      });
      setProdutos(lista);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function salvarProduto() {
    if (!nome || !quantidade || !precoFormatado) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    const precoNumerico = Number(precoFormatado.replace(/[^\d]/g, '')) / 100;

    try {
      if (idEditando) {
        const docRef = doc(db, 'estoque', idEditando);
        await updateDoc(docRef, {
          nome,
          quantidade: Number(quantidade),
          preco: precoNumerico
        });
        Alert.alert('Sucesso', 'Item atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'estoque'), {
          nome,
          quantidade: Number(quantidade),
          preco: precoNumerico
        });
        Alert.alert('Sucesso', 'Item adicionado ao estoque!');
      }

      fecharModal();
      buscarProdutos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível guardar o item.');
    }
  }

  async function excluirProduto(id) {
    try {
      await deleteDoc(doc(db, 'estoque', id));
      buscarProdutos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  }

  function abrirEdicao(item) {
    setIdEditando(item.id);
    setNome(item.nome);
    setQuantidade(String(item.quantidade));
    setPrecoFormatado((item.preco * 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    setModalVisivel(true);
  }

  function fecharModal() {
    setIdEditando(null);
    setNome('');
    setQuantidade('');
    setPrecoFormatado('');
    setModalVisivel(false);
  }

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={estilos.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={estilos.header}>
          <TouchableOpacity style={estilos.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={estilos.tituloTopo}>Caixa e Estoque</Text>
          <TouchableOpacity style={estilos.addButton} onPress={() => setModalVisivel(true)}>
            <Ionicons name="add" size={22} color="#434643" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <View style={estilos.card}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.cardTitulo}>{item.nome}</Text>
                <Text style={estilos.cardSub}>Qtd em Stock: {item.quantidade} unidades</Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
                <Text style={estilos.cardValor}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              </View>
              <TouchableOpacity onPress={() => abrirEdicao(item)} style={estilos.acaoBtn}>
                <Ionicons name="create-outline" size={18} color="#FF98B9" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => excluirProduto(item.id)} style={estilos.acaoBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF98B9" />
              </TouchableOpacity>
            </View>
          )}
        />

        <Modal visible={modalVisivel} animationType="slide" transparent>
          <View style={estilos.modalFundo}>
            <View style={estilos.modalCard}>
              <Text style={estilos.modalTitulo}>{idEditando ? 'Editar Produto' : 'Novo Produto'}</Text>
              
              <TextInput 
                style={estilos.input} 
                placeholder="Nome do Produto" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                maxLength={40}
                value={nome}
                onChangeText={setNome}
              />
              
              <TextInput 
                style={estilos.input} 
                placeholder="Quantidade" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                value={quantidade}
                onChangeText={setQuantidade}
              />

              <TextInput 
                style={estilos.input} 
                placeholder="Preço Unitário (R$)" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                value={precoFormatado}
                onChangeText={(text) => setPrecoFormatado(formatarMoeda(text))}
              />

              <View style={estilos.modalBotoes}>
                <TouchableOpacity style={estilos.botaoCancelar} onPress={fecharModal}>
                  <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={estilos.botaoSalvarModal} onPress={salvarProduto}>
                  <Text style={estilos.textoBotaoSalvar}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF98B9', justifyContent: 'center', alignItems: 'center' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', letterSpacing: 0.5 },
  lista: { paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 4 },
  cardValor: { color: '#FF98B9', fontSize: 16, fontWeight: 'bold' },
  acaoBtn: { padding: 8 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#2C2F2C', padding: 22, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },
  modalTitulo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)', marginBottom: 12 },
  modalBotoes: { flexDirection: 'row', gap: 10, marginTop: 10 },
  botaoCancelar: { flex: 1, backgroundColor: 'rgba(89, 89, 89, 0.8)', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  textoBotaoCancelar: { color: '#FFF', fontWeight: 'bold' },
  botaoSalvarModal: { flex: 1, backgroundColor: '#FF98B9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  textoBotaoSalvar: { color: '#434643', fontWeight: 'bold' }
});
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function TelaPacotesServicos() {
  const router = useRouter();
  const [pacotes, setPacotes] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoFormatado, setPrecoFormatado] = useState('');

  const buscarPacotes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pacotes'));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setPacotes(lista);
    } catch (error) {
      console.error("Erro ao buscar pacotes:", error);
    }
  };

  useEffect(() => {
    buscarPacotes();
  }, []);

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function salvarPacote() {
    if (!nome || !precoFormatado) {
      Alert.alert('Atenção', 'Preencha o nome e o preço.');
      return;
    }

    const precoNumerico = Number(precoFormatado.replace(/[^\d]/g, '')) / 100;

    try {
      await addDoc(collection(db, 'pacotes'), {
        nome,
        descricao,
        preco: precoNumerico
      });
      setNome('');
      setDescricao('');
      setPrecoFormatado('');
      setModalVisivel(false);
      buscarPacotes();
      Alert.alert('Sucesso', 'Pacote criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível guardar o pacote.');
    }
  }

  async function excluirPacote(id) {
    try {
      await deleteDoc(doc(db, 'pacotes', id));
      buscarPacotes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir.');
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
          <Text style={styles.tituloTopo}>Pacotes de Serviços</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisivel(true)}>
            <Ionicons name="add" size={22} color="#434643" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={pacotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo}>{item.nome}</Text>
                <Text style={styles.cardSub}>{item.descricao}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
                <Text style={styles.cardValor}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              </View>
              <TouchableOpacity onPress={() => excluirPacote(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#FF98B9" />
              </TouchableOpacity>
            </View>
          )}
        />

        <Modal visible={modalVisivel} animationType="slide" transparent>
          <View style={styles.modalFundo}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitulo}>Novo Pacote</Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Nome do Pacote" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={nome}
                onChangeText={setNome}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Descrição (ex: 4 Manicures + 2 Pedicures)" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={descricao}
                onChangeText={setDescricao}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Preço Total (R$)" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                value={precoFormatado}
                onChangeText={(text) => setPrecoFormatado(formatarMoeda(text))}
              />

              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
                  <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvarModal} onPress={salvarPacote}>
                  <Text style={styles.textoBotaoSalvar}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF98B9', justifyContent: 'center', alignItems: 'center' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', letterSpacing: 0.5 },
  lista: { paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 4 },
  cardValor: { color: '#FF98B9', fontSize: 16, fontWeight: 'bold' },
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
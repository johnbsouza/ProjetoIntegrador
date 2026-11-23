import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';


export default function TelaServicos() {
  const router = useRouter();
  const [servicos, setServicos] = useState([]);
  const [nome, setNome] = useState('');
  const [precoFormatado, setPrecoFormatado] = useState('');
  const [tempo, setTempo] = useState('');
  const [id, setId] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [carregando, setCarregando] = useState(true)

  /*const buscarServicos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'servicos'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        lista.push({ id: documento.id, ...documento.data() });
      });
      setServicos(lista);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };*/

  useEffect(() => {
    {/* buscarServicos() */ }
    const referencia = collection(db, 'servicos');

    const cancelar = onSnapshot(
      referencia,
      (snapshot) => {
        const lista = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setServicos(lista)
        setCarregando(false)
      },
      (erro) => {
        console.error('Erro ao buscar os serviços:', erro)
        setCarregando(false);
        Alert.alert('Erro', 'Não foi possível carregar os serviços')
      }
    )
    return cancelar;
  }, []);

  function excluirServico(id) {
    Alert.alert(
      'Excluir serviço',
      'Deseja realmente excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'servicos', id));
              Alert.alert('Sucesso', 'Serviço excluído com sucesso.');
              {/*buscarServicos();*/ }
            } catch (error) {
              console.error('Erro ao excluir serviço:', error)
              Alert.alert('Erro', 'Não foi possível excluir o serviço.');
            }
          }
        }
      ]
    )
  }

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function converterMinutosParaHoras(minutos) {
    const min = Number(minutos);
    if (!min || isNaN(min)) return '0min';
    const horas = Math.floor(min / 60);
    const resto = min % 60;
    if (horas === 0) return `${resto}min`;
    if (resto === 0) return `${horas}h`;
    return `${horas}h${resto < 10 ? '0' : ''}${resto}`;
  }

  async function salvarEatualizarServico() {
    const precoNumerico = Number(
      precoFormatado.replace(/[^\d]/g, '')) / 100;

      const tempoNumerico = Number(tempo)
      
    if (!nome.trim()) {
      Alert.alert('Nome', 'Digite um nome de serviço!');
      return;

    } else if (!Number.isFinite(precoNumerico) || precoNumerico <= 0) {
      Alert.alert('Preço', 'Digite um preço válido.')
      return;

    } else if (!Number.isInteger(tempoNumerico) || tempoNumerico <= 0) {
      Alert.alert('Tempo', 'Digite um tempo de serviço em minutos')
      return;
    }



    try {
      if (id) {
        const docRef = doc(db, 'servicos', id);
        await updateDoc(docRef, {
          nome,
          preco: precoNumerico,
          tempo: Number(tempo),
          servicoAtualizadoEm: serverTimestamp()
        });
        Alert.alert('Sucesso', 'Serviço atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'servicos'), {
          nome,
          preco: precoNumerico,
          tempo: tempoNumerico,
          servicoCriadoEm: serverTimestamp()
        });
        Alert.alert('Sucesso', 'Serviço criado com sucesso!', [
          { text: 'OK' }
        ]);
      }

      fecharModal();
      //buscarServicos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível guardar o serviço.');
    }
  }

  function abrirEdicao(item) {
    setId(item.id);
    setNome(item.nome);
    setPrecoFormatado((item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    setTempo(String(item.tempo));
    setModalVisivel(true);
  }

  function fecharModal() {
    setId(null);
    setNome('');
    setPrecoFormatado('');
    setTempo('');
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
          <Text style={estilos.tituloTopo}>Catálogo de Serviços</Text>
          <TouchableOpacity style={estilos.addButton} onPress={() => setModalVisivel(true)}>
            <Ionicons name="add" size={22} color="#434643" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={servicos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <View style={estilos.card}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.cardTitulo}>{item.nome}</Text>
                <Text style={estilos.cardSub}>Duração: {converterMinutosParaHoras(item.tempo)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
                <Text style={estilos.cardValor}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              </View>

              <TouchableOpacity
                onPress={() => abrirEdicao(item)}
                style={estilos.acaoBtn}>
                <Ionicons name="create-outline" size={18} color="#FF98B9" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => excluirServico(item.id)}
                style={estilos.acaoBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF98B9" />
              </TouchableOpacity>
            </View>
          )}
        />

        <Modal visible={modalVisivel} animationType="slide" transparent>
          <View style={estilos.modalFundo}>
            <View style={estilos.modalCard}>
              <Text style={estilos.modalTitulo}>{id ? 'Editar Serviço' : 'Novo Serviço'}</Text>

              <TextInput
                style={estilos.input}
                placeholder="Nome do Serviço"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                maxLength={40}
                value={nome}
                onChangeText={setNome}
              />

              <TextInput
                style={estilos.input}
                placeholder="Preço (R$)"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                value={precoFormatado}
                onChangeText={(text) => setPrecoFormatado(formatarMoeda(text))}
              />

              <TextInput
                style={estilos.input}
                placeholder="Tempo em minutos (ex: 90)"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                value={tempo}
                onChangeText={setTempo}
              />

              <View style={estilos.modalBotoes}>
                <TouchableOpacity style={estilos.botaoCancelar} onPress={fecharModal}>
                  <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={estilos.botaoSalvarModal} onPress={salvarEatualizarServico}>
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
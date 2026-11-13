import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function TelaEquipeComissao() {
  const router = useRouter();
  const [profissionais, setProfissionais] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [comissao, setComissao] = useState('');
  const [valorServico, setValorServico] = useState('');
  const [comissaoCalculada, setComissaoCalculada] = useState(null);

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

  async function atualizarComissaoPadrao(id) {
    if (!comissao) {
      Alert.alert('Atenção', 'Insira a percentagem.');
      return;
    }

    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, { comissaoPorcentagem: Number(comissao) });
      Alert.alert('Sucesso', 'Comissão padrão atualizada!');
      setComissao('');
      buscarProfissionais();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar.');
    }
  }

  function calcularComissaoSimulacao() {
    if (!valorServico || !profissionalSelecionado) return;
    const valorNum = Number(valorServico.replace(/[^\d]/g, '')) / 100;
    const porcentagem = profissionalSelecionado.comissaoPorcentagem || 50;
    const resultado = (valorNum * porcentagem) / 100;
    setComissaoCalculada(resultado.toFixed(2));
  }

  function abrirSimulador(item) {
    setProfissionalSelecionado(item);
    setValorServico('');
    setComissaoCalculada(null);
    setModalVisivel(true);
  }

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
              <View style={estilos.rowHeader}>
                <View>
                  <Text style={estilos.cardTitulo}>{item.nome}</Text>
                  <Text style={estilos.cardSub}>{item.email}</Text>
                </View>
                <TouchableOpacity onPress={() => abrirSimulador(item)} style={estilos.botaoSimular}>
                  <Ionicons name="calculator" size={18} color="#FF98B9" />
                  <Text style={estilos.textoSimular}>Simular</Text>
                </TouchableOpacity>
              </View>

              <Text style={estilos.comissaoAtual}>Comissão Padrão: {item.comissaoPorcentagem || 50}%</Text>

              <View style={estilos.rowInput}>
                <TextInput 
                  style={estilos.input} 
                  placeholder="Nova % Comissão" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="numeric"
                  maxLength={3}
                  onChangeText={setComissao}
                />
                <TouchableOpacity style={estilos.botaoSalvar} onPress={() => atualizarComissaoPadrao(item.id)}>
                  <Text style={estilos.textoBotao}>Atualizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <Modal visible={modalVisivel} animationType="slide" transparent>
          <View style={estilos.modalFundo}>
            <View style={estilos.modalCard}>
              <Text style={estilos.modalTitulo}>Simular Comissão</Text>
              <Text style={estilos.modalSub}>{profissionalSelecionado?.nome} ({profissionalSelecionado?.comissaoPorcentagem || 50}%)</Text>
              
              <TextInput 
                style={estilos.input} 
                placeholder="Valor do Serviço (R$)" 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                value={valorServico}
                onChangeText={(text) => setValorServico(formatarMoeda(text))}
              />

              <TouchableOpacity style={estilos.botaoCalcular} onPress={calcularComissaoSimulacao}>
                <Text style={estilos.textoBotao}>Calcular</Text>
              </TouchableOpacity>

              {comissaoCalculada !== null && (
                <View style={estilos.resultadoBox}>
                  <Text style={estilos.resultadoTexto}>Valor para o Profissional:</Text>
                  <Text style={estilos.resultadoValor}>R$ {comissaoCalculada.replace('.', ',')}</Text>
                </View>
              )}

              <TouchableOpacity style={estilos.botaoFecharModal} onPress={() => setModalVisivel(false)}>
                <Text style={estilos.textoBotaoCancelar}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  lista: { paddingBottom: 20 },
  card: { backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 18, borderRadius: 18, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 2 },
  botaoSimular: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(89, 89, 89, 0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  textoSimular: { color: '#FF98B9', fontSize: 13, fontWeight: 'bold' },
  comissaoAtual: { color: '#FF98B9', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  rowInput: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)', marginBottom: 10 },
  botaoSalvar: { backgroundColor: '#FF98B9', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 12, height: 48 },
  textoBotao: { color: '#434643', fontWeight: 'bold', fontSize: 15 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#2C2F2C', padding: 22, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },
  modalTitulo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', textAlign: 'center' },
  modalSub: { color: 'rgba(209, 209, 209, 0.7)', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  botaoCalcular: { backgroundColor: '#FF98B9', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  resultadoBox: { backgroundColor: 'rgba(89, 89, 89, 0.5)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  resultadoTexto: { color: 'rgba(209, 209, 209, 0.8)', fontSize: 13 },
  resultadoValor: { color: '#FF98B9', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  botaoFecharModal: { backgroundColor: 'rgba(89, 89, 89, 0.8)', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  textoBotaoCancelar: { color: '#FFF', fontWeight: 'bold' }
});
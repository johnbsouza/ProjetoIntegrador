import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function ListaProfissionaisScreen() {
  const router = useRouter();
  const [equipe, setEquipe] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [comissaoInput, setComissaoInput] = useState('');
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
      setEquipe(lista);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    }
  };

  useEffect(() => {
    buscarProfissionais();
  }, []);

  async function atualizarComissao(id) {
    if (!comissaoInput) {
      Alert.alert('Atenção', 'Insira a percentagem de comissão.');
      return;
    }

    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, { comissaoPorcentagem: Number(comissaoInput) });
      Alert.alert('Sucesso', 'Comissão atualizada com sucesso!');
      setComissaoInput('');
      buscarProfissionais();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a comissão.');
    }
  }

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calcularComissaoSimulacao() {
    if (!valorServico || !profissionalSelecionado) return;
    const valorNum = Number(valorServico.replace(/[^\d]/g, '')) / 100;
    const porcentagem = profissionalSelecionado.comissaoPorcentagem || 50;
    const resultado = (valorNum * porcentagem) / 100;
    setComissaoCalculada(resultado.toFixed(2));
  }

  function abrirSimulador(prof) {
    setProfissionalSelecionado(prof);
    setValorServico('');
    setComissaoCalculada(null);
    setModalVisivel(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerTopo}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={styles.tituloTopo}>Gestão de Equipe</Text>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(admin)/novo-profissional')}
        >
          <Ionicons name="person-add-outline" size={20} color="#434643" />
          <Text style={styles.addButtonText}>Adicionar Nova Profissional</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Colaboradoras Cadastradas</Text>

        {equipe.length === 0 ? (
          <Text style={styles.vazioText}>Nenhuma profissional cadastrada no momento.</Text>
        ) : (
          equipe.map((prof) => (
            <View key={prof.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{prof.nome ? prof.nome[0] : 'P'}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.nomeText}>{prof.nome}</Text>
                  <Text style={styles.cargoText}>{prof.email}</Text>
                  <Text style={styles.comissaoLabel}>Comissão: {prof.comissaoPorcentagem || 50}%</Text>
                </View>
                <TouchableOpacity onPress={() => abrirSimulador(prof)} style={styles.simularBtn}>
                  <Ionicons name="calculator-outline" size={20} color="#FF98B9" />
                </TouchableOpacity>
              </View>

              <View style={styles.rowComissao}>
                <TextInput 
                  style={styles.inputComissao} 
                  placeholder="Nova %" 
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="numeric"
                  maxLength={3}
                  onChangeText={setComissaoInput}
                />
                <TouchableOpacity style={styles.btnSalvarComissao} onPress={() => atualizarComissao(prof.id)}>
                  <Text style={styles.txtSalvarComissao}>Alterar %</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Simular Comissão</Text>
            <Text style={styles.modalSub}>{profissionalSelecionado?.nome} ({profissionalSelecionado?.comissaoPorcentagem || 50}%)</Text>
            
            <TextInput 
              style={styles.inputModal} 
              placeholder="Valor do Serviço (R$)" 
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              keyboardType="numeric"
              value={valorServico}
              onChangeText={(text) => setValorServico(formatarMoeda(text))}
            />

            <TouchableOpacity style={styles.botaoCalcular} onPress={calcularComissaoSimulacao}>
              <Text style={styles.textoBotaoCalc}>Calcular Comissão</Text>
            </TouchableOpacity>

            {comissaoCalculada !== null && (
              <View style={styles.resultadoBox}>
                <Text style={styles.resultadoTexto}>Valor para a Profissional:</Text>
                <Text style={styles.resultadoValor}>R$ {comissaoCalculada.replace('.', ',')}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.botaoFecharModal} onPress={() => setModalVisivel(false)}>
              <Text style={styles.textoBotaoFechar}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  headerTopo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  addButton: { backgroundColor: '#FF98B9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, marginBottom: 25 },
  addButtonText: { color: '#434643', fontSize: 15, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  vazioText: { color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: 'rgba(89, 89, 89, 0.45)', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#434643', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#FF98B9' },
  infoBox: { flex: 1 },
  nomeText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  cargoText: { fontSize: 12, color: '#D1D1D1' },
  comissaoLabel: { fontSize: 12, color: '#FF98B9', fontWeight: '600', marginTop: 4 },
  simularBtn: { padding: 8, backgroundColor: 'rgba(67, 70, 67, 0.8)', borderRadius: 10 },
  rowComissao: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', paddingTop: 10 },
  inputComissao: { flex: 1, backgroundColor: 'rgba(67, 70, 67, 0.8)', color: '#FFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  btnSalvarComissao: { backgroundColor: '#FF98B9', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10 },
  txtSalvarComissao: { color: '#434643', fontWeight: 'bold', fontSize: 13 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#2C2F2C', padding: 22, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },
  modalTitulo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', textAlign: 'center' },
  modalSub: { color: 'rgba(209, 209, 209, 0.7)', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  inputModal: { backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)', marginBottom: 12 },
  botaoCalcular: { backgroundColor: '#FF98B9', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  textoBotaoCalc: { color: '#434643', fontWeight: 'bold', fontSize: 15 },
  resultadoBox: { backgroundColor: 'rgba(89, 89, 89, 0.5)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  resultadoTexto: { color: 'rgba(209, 209, 209, 0.8)', fontSize: 13 },
  resultadoValor: { color: '#FF98B9', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  botaoFecharModal: { backgroundColor: 'rgba(89, 89, 89, 0.8)', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  textoBotaoFechar: { color: '#FFF', fontWeight: 'bold' }
});
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function GerenciarUsuariosScreen() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [comissao, setComissao] = useState('50');

  const buscarUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        lista.push({ id: documento.id, ...documento.data() });
      });
      setUsuarios(lista);
      setUsuariosFiltrados(lista);
    } catch (error) {
      console.error("Erro ao buscar utilizadores:", error);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  useEffect(() => {
    if (busca.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const termo = busca.toLowerCase();
      const filtrados = usuarios.filter((item) => {
        const nomeMatch = item.nome && item.nome.toLowerCase().includes(termo);
        const emailMatch = item.email && item.email.toLowerCase().includes(termo);
        return nomeMatch || emailMatch;
      });
      setUsuariosFiltrados(filtrados);
    }
  }, [busca, usuarios]);

  function abrirModal(usuario) {
    if (usuario.id === auth.currentUser?.uid) {
      Alert.alert('Restrição de Segurança', 'Por motivos de segurança, você não pode alterar o seu próprio nível de acesso.');
      return;
    }
    setUsuarioSelecionado(usuario);
    setComissao(String(usuario.comissaoPorcentagem || '50'));
    setModalVisivel(true);
  }

  function confirmarAlteracaoAcesso(novoNivel) {
    if (!usuarioSelecionado) return;

    Alert.alert(
      'Confirmar Alteração',
      `Deseja alterar o acesso de '${usuarioSelecionado.nome || usuarioSelecionado.email}' para '${novoNivel}'?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, Alterar', 
          onPress: () => executarAlteracaoAcesso(novoNivel) 
        }
      ]
    );
  }

  async function executarAlteracaoAcesso(novoNivel) {
    try {
      const docRef = doc(db, 'usuarios', usuarioSelecionado.id);
      const dadosAtualizados = { 
        nivelAcesso: novoNivel,
        comissaoPorcentagem: novoNivel === 'profissional' ? Number(comissao) : 0
      };

      await updateDoc(docRef, dadosAtualizados);

      Alert.alert('Sucesso', `Acesso alterado para '${novoNivel}' com sucesso!`);
      setModalVisivel(false);
      setUsuarioSelecionado(null);
      buscarUsuarios();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o nível de acesso.');
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
          <Text style={styles.tituloTopo}>Controlo de Acessos</Text>
        </View>

        <View style={styles.buscaContainer}>
          <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.buscaInput}
            placeholder="Pesquisar por nome ou e-mail..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{item.nome ? item.nome[0].toUpperCase() : 'U'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo}>{item.nome || 'Sem Nome'}</Text>
                <Text style={styles.cardSub}>{item.email}</Text>
                <Text style={styles.cardPerfil}>Perfil: <Text style={{ color: '#FF98B9', fontWeight: 'bold' }}>{item.nivelAcesso || 'cliente'}</Text></Text>
              </View>
              <TouchableOpacity style={styles.botaoEditar} onPress={() => abrirModal(item)}>
                <Ionicons name="create-outline" size={20} color="#FF98B9" />
              </TouchableOpacity>
            </View>
          )}
        />

        <Modal visible={modalVisivel} animationType="slide" transparent>
          <View style={styles.modalFundo}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitulo}>Alterar Permissão</Text>
              <Text style={styles.modalSub}>{usuarioSelecionado?.nome || usuarioSelecionado?.email}</Text>
              
              <TouchableOpacity 
                style={[styles.opcaoBtn, usuarioSelecionado?.nivelAcesso === 'cliente' && styles.opcaoAtiva]}
                onPress={() => confirmarAlteracaoAcesso('cliente')}
              >
                <Text style={styles.opcaoTxt}>Cliente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.opcaoBtn, usuarioSelecionado?.nivelAcesso === 'profissional' && styles.opcaoAtiva]}
                onPress={() => confirmarAlteracaoAcesso('profissional')}
              >
                <Text style={styles.opcaoTxt}>Profissional</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.opcaoBtn, usuarioSelecionado?.nivelAcesso === 'admin' && styles.opcaoAtiva]}
                onPress={() => confirmarAlteracaoAcesso('admin')}
              >
                <Text style={styles.opcaoTxt}>Administrador</Text>
              </TouchableOpacity>

              {usuarioSelecionado?.nivelAcesso === 'profissional' && (
                <TextInput 
                  style={styles.inputComissao}
                  placeholder="% Comissão"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="numeric"
                  maxLength={3}
                  value={comissao}
                  onChangeText={setComissao}
                />
              )}

              <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalVisivel(false)}>
                <Text style={styles.textoFechar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  buscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(89, 89, 89, 0.6)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)' },
  buscaInput: { flex: 1, color: '#FFF', fontSize: 15 },
  lista: { paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  avatarBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#FF98B9' },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 2 },
  cardPerfil: { color: 'rgba(209, 209, 209, 0.8)', fontSize: 12, marginTop: 4 },
  botaoEditar: { backgroundColor: 'rgba(89, 89, 89, 0.6)', padding: 10, borderRadius: 12 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#2C2F2C', padding: 22, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },
  modalTitulo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', textAlign: 'center' },
  modalSub: { color: 'rgba(209, 209, 209, 0.7)', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  opcaoBtn: { backgroundColor: 'rgba(89, 89, 89, 0.5)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  opcaoAtiva: { backgroundColor: '#FF98B9', borderColor: '#FF98B9' },
  opcaoTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  inputComissao: { backgroundColor: 'rgba(89, 89, 89, 0.6)', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: 'rgba(209, 209, 209, 0.15)', marginTop: 5, marginBottom: 10 },
  botaoFechar: { backgroundColor: 'rgba(89, 89, 89, 0.8)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  textoFechar: { color: '#FFF', fontWeight: 'bold' }
});
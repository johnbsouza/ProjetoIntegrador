import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function PainelCliente() {
  const router = useRouter();
  const [servicos, setServicos] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [meusAgendamentos, setMeusAgendamentos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const usuarioAtual = auth.currentUser;

  useEffect(() => {
    async function carregarDadosCliente() {
      try {
        const servicosSnap = await getDocs(collection(db, 'servicos'));
        const listaServicos = [];
        servicosSnap.forEach((doc) => {
          listaServicos.push({ id: doc.id, ...doc.data() });
        });
        setServicos(listaServicos);

        const pacotesSnap = await getDocs(collection(db, 'pacotes'));
        const listaPacotes = [];
        pacotesSnap.forEach((doc) => {
          listaPacotes.push({ id: doc.id, ...doc.data() });
        });
        setPacotes(listaPacotes);

        if (usuarioAtual) {
          const q = query(collection(db, 'agendamentos'), where('clienteId', '==', usuarioAtual.uid));
          const agendamentosSnap = await getDocs(q);
          const listaAgendamentos = [];
          agendamentosSnap.forEach((doc) => {
            listaAgendamentos.push({ id: doc.id, ...doc.data() });
          });
          setMeusAgendamentos(listaAgendamentos);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error);
      }
    }

    carregarDadosCliente();
  }, []);

  async function agendarServico(servico) {
    if (!usuarioAtual) {
      Alert.alert('Erro', 'Utilizador não autenticado.');
      return;
    }

    try {
      await addDoc(collection(db, 'agendamentos'), {
        clienteId: usuarioAtual.uid,
        clienteEmail: usuarioAtual.email,
        servicoNome: servico.nome,
        preco: servico.preco,
        status: 'Confirmado',
        dataCriacao: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Serviço agendado com sucesso!');
      
      const q = query(collection(db, 'agendamentos'), where('clienteId', '==', usuarioAtual.uid));
      const agendamentosSnap = await getDocs(q);
      const listaAgendamentos = [];
      agendamentosSnap.forEach((doc) => {
        listaAgendamentos.push({ id: doc.id, ...doc.data() });
      });
      setMeusAgendamentos(listaAgendamentos);

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível concluir o agendamento.');
    }
  }

  async function sair() {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá, Bem-vinda!</Text>
            <Text style={styles.subtitulo}>Lirium Esmalteria & Spa</Text>
          </View>
          <TouchableOpacity style={styles.botaoSair} onPress={sair}>
            <Ionicons name="log-out-outline" size={22} color="#FF98B9" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.secaoTitulo}>Os Meus Agendamentos</Text>
          {meusAgendamentos.length === 0 ? (
            <View style={styles.vazioCard}>
              <Text style={styles.vazioTexto}>Ainda não tens agendamentos ativos.</Text>
            </View>
          ) : (
            meusAgendamentos.map((item) => (
              <View key={item.id} style={styles.agendamentoCard}>
                <View>
                  <Text style={styles.agendamentoTitulo}>{item.servicoNome}</Text>
                  <Text style={styles.agendamentoSub}>Estado: {item.status}</Text>
                </View>
                <Text style={styles.agendamentoValor}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              </View>
            ))
          )}

          <Text style={styles.secaoTitulo}>Serviços Disponíveis</Text>
          {servicos.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo}>{item.nome}</Text>
                <Text style={styles.cardSub}>Duração: {item.tempo} min</Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
                <Text style={styles.cardValor}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              </View>
              <TouchableOpacity style={styles.botaoAgendar} onPress={() => agendarServico(item)}>
                <Text style={styles.textoAgendar}>Agendar</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={styles.secaoTitulo}>Pacotes Promocionais</Text>
          {pacotes.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo}>{item.nome}</Text>
                <Text style={styles.cardSub}>{item.descricao}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardValor}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  saudacao: { fontSize: 24, color: '#FF98B9', fontWeight: 'bold', letterSpacing: 0.5 },
  subtitulo: { fontSize: 13, color: 'rgba(209, 209, 209, 0.7)', marginTop: 2 },
  botaoSair: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  scrollContainer: { paddingBottom: 30 },
  secaoTitulo: { fontSize: 16, fontWeight: '600', color: '#FF98B9', marginBottom: 15, marginTop: 15, letterSpacing: 0.5 },
  vazioCard: { backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  vazioTexto: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 13 },
  agendamentoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  agendamentoTitulo: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  agendamentoSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 2 },
  agendamentoValor: { color: '#FF98B9', fontSize: 15, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(89, 89, 89, 0.45)', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 4 },
  cardValor: { color: '#FF98B9', fontSize: 15, fontWeight: 'bold' },
  botaoAgendar: { backgroundColor: '#FF98B9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 10 },
  textoAgendar: { color: '#434643', fontWeight: 'bold', fontSize: 12 }
});
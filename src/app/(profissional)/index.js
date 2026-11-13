import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function AgendaProfissionalScreen() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const dataHoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    carregarAgenda();
  }, []);

  async function carregarAgenda() {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      const uid = user ? user.uid : 'prof_default';

      const q = query(
        collection(db, 'agendamentos'),
        where('idProfissional', '==', uid),
        where('data', '==', dataHoje)
      );

      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });

      lista.sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
      setAgendamentos(lista);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setCarregando(false);
    }
  }

  async function handleConcluirServico(idAgendamento) {
    try {
      const refDoc = doc(db, 'agendamentos', idAgendamento);
      await updateDoc(refDoc, { status: 'concluido' });

      Alert.alert('Sucesso', 'Serviço marcado como concluído!');
      setAgendamentos((prev) =>
        prev.map((item) =>
          item.id === idAgendamento ? { ...item, status: 'concluido' } : item
        )
      );
    } catch (error) {
      console.error('Erro ao concluir serviço:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Atendimentos de Hoje</Text>
        <Text style={styles.headerData}>{dataHoje}</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.textoVazio}>Nenhum agendamento marcado para hoje.</Text>
          }
          renderItem={({ item }) => {
            const isConcluido = item.status === 'concluido';
            const inicial = item.nomeCliente ? item.nomeCliente.charAt(0).toUpperCase() : 'C';

            return (
              <View style={[styles.cardItem, isConcluido && styles.cardConcluido]}>
                <View style={styles.horarioBox}>
                  <Ionicons name="time-outline" size={16} color="#FF98B9" />
                  <Text style={styles.horarioTexto}>{item.horario}</Text>
                </View>

                {/* FOTO DO CLIENTE */}
                <View style={styles.avatarContainer}>
                  {item.fotoCliente ? (
                    <Image source={{ uri: item.fotoCliente }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{inicial}</Text>
                  )}
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.nomeCliente}>{item.nomeCliente || 'Cliente'}</Text>
                  <Text style={styles.nomeServico}>{item.nomeServico || 'Serviço'}</Text>
                  <Text style={styles.precoTexto}>R$ {parseFloat(item.preco || 0).toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  disabled={isConcluido}
                  style={[styles.btnCheck, isConcluido && styles.btnCheckDone]}
                  onPress={() => handleConcluirServico(item.id)}
                >
                  <Ionicons
                    name={isConcluido ? 'checkmark-done-circle' : 'checkmark-circle-outline'}
                    size={28}
                    color={isConcluido ? '#4CAF50' : '#FF98B9'}
                  />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  header: { padding: 20, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerTitulo: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerData: { color: '#FF98B9', fontSize: 14, marginTop: 2 },
  textoVazio: { color: '#D1D1D1', textAlign: 'center', marginTop: 40, fontSize: 15 },
  cardItem: {
    backgroundColor: '#595959',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardConcluido: { opacity: 0.6, backgroundColor: '#3A3D3A' },
  horarioBox: { alignItems: 'center', justifyContent: 'center', paddingRight: 12, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' },
  horarioTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginTop: 3 },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF98B9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { color: '#434643', fontSize: 18, fontWeight: 'bold' },
  infoBox: { flex: 1 },
  nomeCliente: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  nomeServico: { color: '#D1D1D1', fontSize: 12, marginTop: 2 },
  precoTexto: { color: '#FF98B9', fontSize: 13, fontWeight: 'bold', marginTop: 3 },
  btnCheck: { padding: 4 },
  btnCheckDone: { opacity: 0.8 },
});
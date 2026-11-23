import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function PacotesClienteScreen() {
  const [pacotes, setPacotes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPacotes() {
      try {
        const snap = await getDocs(collection(db, 'pacotes'));
        const lista = [];
        snap.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setPacotes(lista);
      } catch (error) {
        console.error('Erro ao carregar pacotes:', error);
      } finally {
        setCarregando(false);
      }
    }
    carregarPacotes();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Pacotes Promocionais</Text>
        <Text style={styles.headerSub}>Aproveite os nossos combos especiais</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={pacotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.textoVazio}>Nenhum pacote disponível no momento.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo}>{item.nome}</Text>
                <Text style={styles.cardSub}>{item.descricao}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                <Text style={styles.cardValor}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  header: { padding: 20, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerTitulo: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#FF98B9', fontSize: 13, marginTop: 2 },
  textoVazio: { color: '#D1D1D1', textAlign: 'center', marginTop: 40, fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#595959', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#D1D1D1', fontSize: 13, marginTop: 4 },
  cardValor: { color: '#FF98B9', fontSize: 16, fontWeight: 'bold' },
});
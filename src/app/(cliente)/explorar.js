import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function ClienteExplorarScreen() {
  const router = useRouter();
  const [servicos, setServicos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarServicos();
  }, []);

  async function carregarServicos() {
    setCarregando(true);
    try {
      const q = query(collection(db, 'servicos'), where('ativo', '==', true));
      const snap = await getDocs(q);
      const lista = [];
      snap.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });
      setServicos(lista);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setCarregando(false);
    }
  }

  const servicosFiltrados = servicos.filter((item) => {
    const termo = busca.toLowerCase();
    const nome = item.nome ? item.nome.toLowerCase() : '';
    const categoria = item.categoria ? item.categoria.toLowerCase() : '';
    return nome.includes(termo) || categoria.includes(termo);
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER FIXO */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explorar Serviços</Text>
      </View>

      {/* BARRA DE PESQUISA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#D1D1D1" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviço ou categoria..."
          placeholderTextColor="rgba(209, 209, 209, 0.5)"
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 ? (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={18} color="#D1D1D1" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* LISTA DE SERVIÇOS */}
      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={servicosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.textoVazio}>Nenhum serviço encontrado.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.cardServico}>
              <View style={styles.infoBox}>
                <Text style={styles.categoriaBadge}>{item.categoria || 'Geral'}</Text>
                <Text style={styles.nomeServico}>{item.nome}</Text>
                {Boolean(item.descricao) && (
                  <Text style={styles.descricaoServico}>{item.descricao}</Text>
                )}
                <Text style={styles.precoServico}>
                  R$ {parseFloat(item.preco || 0).toFixed(2)} • {item.duracaoMinutos || 45} min
                </Text>
              </View>

              <TouchableOpacity
                style={styles.btnAgendar}
                onPress={() =>
                  router.push({
                    pathname: '/(cliente)/agendar',
                    params: {
                      servicoId: item.id,
                      nomeServico: item.nome,
                      preco: item.preco,
                    },
                  })
                }
              >
                <Text style={styles.btnAgendarTexto}>Agendar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#595959',
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#595959',
    margin: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
  textoVazio: { color: '#D1D1D1', textAlign: 'center', marginTop: 40, fontSize: 14 },
  cardServico: {
    backgroundColor: '#595959',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoBox: { flex: 1, marginRight: 10 },
  categoriaBadge: { color: '#FF98B9', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  nomeServico: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  descricaoServico: { color: '#D1D1D1', fontSize: 12, marginTop: 4 },
  precoServico: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  btnAgendar: {
    backgroundColor: '#FF98B9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnAgendarTexto: { color: '#1E201E', fontWeight: 'bold', fontSize: 13 },
});
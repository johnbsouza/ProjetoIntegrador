import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function PainelCliente() {
  const router = useRouter();
  const [servicos, setServicos] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function carregarServicos() {
      try {
        const servicosSnap = await getDocs(collection(db, 'servicos'));
        const listaServicos = [];
        servicosSnap.forEach((docSnap) => {
          listaServicos.push({ id: docSnap.id, ...docSnap.data() });
        });
        setServicos(listaServicos);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    }

    carregarServicos();
  }, []);

  function toggleSelecionarServico(servico) {
    const jaExiste = servicosSelecionados.some((s) => s.id === servico.id);
    if (jaExiste) {
      setServicosSelecionados(servicosSelecionados.filter((s) => s.id !== servico.id));
    } else {
      setServicosSelecionados([...servicosSelecionados, servico]);
    }
  }

  function avancarParaAgendamento() {
    if (servicosSelecionados.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um serviço para continuar.');
      return;
    }

    // Passa apenas os IDs limpos por parâmetro
    const idsString = servicosSelecionados.map((s) => s.id).join(',');
    router.push({
      pathname: '/(cliente)/agendar',
      params: { ids: idsString },
    });
  }

  const servicosFiltrados = servicos.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const valorTotalSelecionado = servicosSelecionados.reduce((acc, curr) => {
    return acc + (Number(curr.preco) || 0);
  }, 0);

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá, Bem-vinda! ✨</Text>
            <Text style={styles.subtitulo}>Lirium Esmalteria & Spa</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="rgba(255, 255, 255, 0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar serviço..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.secaoTitulo}>
            {busca.length > 0 ? `Resultados (${servicosFiltrados.length})` : 'Escolha um ou mais serviços'}
          </Text>

          {servicosFiltrados.length === 0 ? (
            <Text style={styles.nenhumResultado}>Nenhum serviço encontrado.</Text>
          ) : (
            <View style={styles.gridContainer}>
              {servicosFiltrados.map((item) => {
                const selecionado = servicosSelecionados.some((s) => s.id === item.id);
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.cardCompacto3Col, selecionado && styles.cardSelecionado]}
                    onPress={() => toggleSelecionarServico(item)}
                  >
                    {selecionado && (
                      <View style={styles.badgeCheck}>
                        <Ionicons name="checkmark" size={12} color="#1E201E" />
                      </View>
                    )}
                    <Text style={styles.cardTitulo3Col} numberOfLines={2}>{item.nome}</Text>
                    <Text style={styles.cardValor3Col}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        </ScrollView>

        {servicosSelecionados.length > 0 && (
          <TouchableOpacity style={styles.botaoFlutuante} onPress={avancarParaAgendamento}>
            <View>
              <Text style={styles.textoFlutuanteQtd}>{servicosSelecionados.length} serviço(s) selecionado(s)</Text>
              <Text style={styles.textoFlutuanteValor}>Total: R$ {valorTotalSelecionado.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={styles.btnAvancarFixo}>
              <Text style={styles.textoBtnAvancar}>Avançar</Text>
              <Ionicons name="arrow-forward" size={16} color="#1E201E" />
            </View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 16 },
  header: { marginTop: 10, marginBottom: 10 },
  saudacao: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold' },
  subtitulo: { fontSize: 12, color: 'rgba(209, 209, 209, 0.7)', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(67, 70, 67, 0.9)',
    borderRadius: 10, paddingHorizontal: 12, height: 42, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 13 },
  scrollContainer: { paddingBottom: 110 },
  secaoTitulo: { fontSize: 14, fontWeight: '600', color: '#FF98B9', marginBottom: 10, marginTop: 12 },
  nenhumResultado: { color: 'rgba(209, 209, 209, 0.5)', fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardCompacto3Col: {
    width: '31.5%', backgroundColor: 'rgba(89, 89, 89, 0.5)', padding: 10, borderRadius: 12,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between', minHeight: 90, position: 'relative',
  },
  cardSelecionado: { borderColor: '#FF98B9', backgroundColor: 'rgba(255, 152, 185, 0.2)' },
  badgeCheck: {
    position: 'absolute', top: 6, right: 6, backgroundColor: '#FF98B9',
    width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
  },
  cardTitulo3Col: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  cardValor3Col: { color: '#FF98B9', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  botaoFlutuante: {
    position: 'absolute', bottom: 15, left: 16, right: 16,
    backgroundColor: '#595959', borderRadius: 14, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#FF98B9', elevation: 6,
  },
  textoFlutuanteQtd: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  textoFlutuanteValor: { color: '#FF98B9', fontSize: 12, marginTop: 2 },
  btnAvancarFixo: {
    backgroundColor: '#FF98B9', flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, gap: 6,
  },
  textoBtnAvancar: { color: '#1E201E', fontWeight: 'bold', fontSize: 13 },
});
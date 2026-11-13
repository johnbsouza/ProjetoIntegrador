import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { auth, db } from '../../config/firebase';

export default function GanhosProfissional() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [percentualComissao, setPercentualComissao] = useState(50);
  const [totalBruto, setTotalBruto] = useState(0);
  const [totalComissao, setTotalComissao] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  async function carregarDadosFinanceiros() {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      const uid = user ? user.uid : 'prof_default';

      // 1. Busca a taxa de comissão da profissional no seu perfil
      const docUser = await getDoc(doc(db, 'usuarios', uid));
      let comissaoTaxa = 50;
      if (docUser.exists() && docUser.data().comissaoPorcentagem) {
        comissaoTaxa = parseFloat(docUser.data().comissaoPorcentagem);
        setPercentualComissao(comissaoTaxa);
      }

      // 2. Procura todos os atendimentos concluídos desta profissional
      const q = query(
        collection(db, 'agendamentos'),
        where('idProfissional', '==', uid),
        where('status', '==', 'concluido')
      );

      const querySnapshot = await getDocs(q);
      const lista = [];
      let somaBruta = 0;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const valorServico = parseFloat(data.preco || 0);
        somaBruta += valorServico;
        lista.push({ id: docSnap.id, ...data });
      });

      const calculoComissao = (somaBruta * comissaoTaxa) / 100;

      setAtendimentos(lista);
      setTotalBruto(somaBruta);
      setTotalComissao(calculoComissao);
    } catch (error) {
      console.error('Erro ao calcular comissões:', error);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Card Resumo da Comissão */}
          <View style={styles.cardResumo}>
            <Text style={styles.cardSubtitulo}>SUA COMISSÃO ACUMULADA ({percentualComissao}%)</Text>
            <Text style={styles.valorComissao}>R$ {totalComissao.toFixed(2)}</Text>

            <View style={styles.divisor} />

            <View style={styles.rowResumo}>
              <View>
                <Text style={styles.labelPequeno}>Total Produzido</Text>
                <Text style={styles.valorPequeno}>R$ {totalBruto.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.labelPequeno}>Atendimentos</Text>
                <Text style={styles.valorPequeno}>{atendimentos.length} concluídos</Text>
              </View>
            </View>
          </View>

          {/* Histórico de Atendimentos */}
          <Text style={styles.seccaoTitulo}>Histórico de Serviços Concluídos</Text>

          <FlatList
            data={atendimentos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Nenhum serviço concluído registado até ao momento.</Text>
            }
            renderItem={({ item }) => {
              const valorComissaoItem = ((parseFloat(item.preco || 0) * percentualComissao) / 100);

              return (
                <View style={styles.itemCard}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="sparkles" size={20} color="#FF98B9" />
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.nomeCliente}>{item.nomeCliente || 'Cliente'}</Text>
                    <Text style={styles.nomeServico}>{item.nomeServico} • {item.data}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.valorGanho}>+ R$ {valorComissaoItem.toFixed(2)}</Text>
                    <Text style={styles.valorTotalItem}>R$ {parseFloat(item.preco || 0).toFixed(2)}</Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  cardResumo: {
    backgroundColor: '#595959',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 185, 0.3)',
  },
  cardSubtitulo: { color: '#D1D1D1', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  valorComissao: { color: '#FF98B9', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  divisor: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  rowResumo: { flexDirection: 'row', justifyContent: 'space-between' },
  labelPequeno: { color: '#D1D1D1', fontSize: 12 },
  valorPequeno: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  seccaoTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 15 },
  textoVazio: { color: '#D1D1D1', textAlign: 'center', marginTop: 30, fontSize: 14 },
  itemCard: {
    backgroundColor: '#595959',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 152, 185, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBox: { flex: 1 },
  nomeCliente: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  nomeServico: { color: '#D1D1D1', fontSize: 12, marginTop: 2 },
  valorGanho: { color: '#4CAF50', fontWeight: 'bold', fontSize: 15 },
  valorTotalItem: { color: '#888', fontSize: 11, marginTop: 2 },
});
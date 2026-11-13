import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function AdminDashboard() {
  const router = useRouter();
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [totalComissoes, setTotalComissoes] = useState(0);
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [totalServicosAtivos, setTotalServicosAtivos] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarMetricasGlobais();
  }, []);

  async function carregarMetricasGlobais() {
    setCarregando(true);
    try {
      // 1. Busca todos os agendamentos concluídos
      const qAgendamentos = query(collection(db, 'agendamentos'));
      const snapAgendamentos = await getDocs(qAgendamentos);
      
      let bruto = 0;
      let comissoes = 0;
      let contadorAgendamentos = 0;

      snapAgendamentos.forEach((docSnap) => {
        const item = docSnap.data();
        contadorAgendamentos++;

        if (item.status === 'concluido') {
          const valor = parseFloat(item.preco || 0);
          bruto += valor;
          // Assume 50% de comissão padrão se não especificado no documento
          comissoes += valor * 0.5;
        }
      });

      // 2. Busca total de serviços no catálogo
      const snapServicos = await getDocs(collection(db, 'servicos'));

      setFaturamentoTotal(bruto);
      setTotalComissoes(comissoes);
      setTotalAgendamentos(contadorAgendamentos);
      setTotalServicosAtivos(snapServicos.size);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setCarregando(false);
    }
  }

  const lucroLiquido = faturamentoTotal - totalComissoes;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.titulo}>Painel de Gestão</Text>
        <Text style={styles.subtitulo}>Visão geral financeira e operacional da Lirium Esmalteria</Text>

        {carregando ? (
          <ActivityIndicator color="#FF98B9" style={{ marginVertical: 30 }} />
        ) : (
          <>
            {/* Card Faturamento Bruto */}
            <View style={styles.cardDestaque}>
              <Text style={styles.cardHeader}>FATURAMENTO BRUTO</Text>
              <Text style={styles.valorDestaque}>R$ {faturamentoTotal.toFixed(2)}</Text>
              
              <View style={styles.rowMétricas}>
                <View>
                  <Text style={styles.subLabel}>Comissões Estimadas</Text>
                  <Text style={styles.subValor}>R$ {totalComissoes.toFixed(2)}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.subLabel}>Lucro Líquido</Text>
                  <Text style={[styles.subValor, { color: '#4CAF50' }]}>R$ {lucroLiquido.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Grid de Indicadores */}
            <View style={styles.gridIndicadores}>
              <View style={styles.cardIndicador}>
                <Ionicons name="calendar-outline" size={24} color="#FF98B9" />
                <Text style={styles.numIndicador}>{totalAgendamentos}</Text>
                <Text style={styles.labelIndicador}>Agendamentos Totais</Text>
              </View>

              <View style={styles.cardIndicador}>
                <Ionicons name="pricetag-outline" size={24} color="#FF98B9" />
                <Text style={styles.numIndicador}>{totalServicosAtivos}</Text>
                <Text style={styles.labelIndicador}>Serviços no Catálogo</Text>
              </View>
            </View>

            {/* Atalhos de Gestão */}
            <Text style={styles.seccaoTitulo}>Ações Rápidas</Text>

            <TouchableOpacity 
              style={styles.btnAtalho}
              onPress={() => router.push('/(admin)/novo-servico')}
            >
              <Ionicons name="add-circle-outline" size={22} color="#FF98B9" />
              <Text style={styles.btnAtalhoTexto}>Cadastrar Novo Serviço</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D1D1" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnAtalho}
              onPress={() => router.push('/(admin)/novo-profissional')}
            >
              <Ionicons name="person-add-outline" size={22} color="#FF98B9" />
              <Text style={styles.btnAtalhoTexto}>Cadastrar Nova Profissional</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D1D1" />
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  content: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#FF98B9' },
  subtitulo: { fontSize: 13, color: '#D1D1D1', marginTop: 3, marginBottom: 20 },
  cardDestaque: {
    backgroundColor: '#595959',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF98B9',
  },
  cardHeader: { color: '#D1D1D1', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  valorDestaque: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  rowMétricas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  subLabel: { color: '#D1D1D1', fontSize: 12 },
  subValor: { color: '#FF98B9', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  gridIndicadores: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  cardIndicador: {
    width: '48%',
    backgroundColor: '#595959',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  numIndicador: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  labelIndicador: { color: '#D1D1D1', fontSize: 12, marginTop: 2 },
  seccaoTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  btnAtalho: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#595959',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  btnAtalhoTexto: { flex: 1, color: '#FFF', fontSize: 15, fontWeight: '600', marginLeft: 12 },
});
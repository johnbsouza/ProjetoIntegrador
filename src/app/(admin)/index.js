import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
export default function PainelAdmin() {
  const router = useRouter();
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalProfissionais, setTotalProfissionais] = useState(0);
  const [filtroFaturamento, setFiltroFaturamento] = useState('mes');
  const [faturamentoTotal, setFaturamentoTotal] = useState(1480.00);

  useEffect(() => {
    async function carregarDados() {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        let clientesCount = 0;
        let profissionaisCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.nivelAcesso === 'profissional') {
            profissionaisCount++;
          } else if (data.nivelAcesso === 'cliente' || !data.nivelAcesso) {
            clientesCount++;
          }
        });

        setTotalClientes(clientesCount);
        setTotalProfissionais(profissionaisCount);
      } catch (error) {
        console.error("Erro:", error);
      }
    }
    carregarDados();
  }, []);

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
            <Text style={styles.saudacao}>Dashboard</Text>
            <Text style={styles.subtitulo}>Lirium Esmalteria & Spa</Text>
          </View>
          <TouchableOpacity style={styles.botaoAcaoTopo} onPress={sair}>
            <Ionicons name="log-out-outline" size={22} color="#FF98B9" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.faturamentoCard}>
            <View style={styles.faturamentoHeader}>
              <Text style={styles.faturamentoTitulo}>Faturamento</Text>
              <View style={styles.filtrosRow}>
                <TouchableOpacity 
                  style={[styles.filtroBtn, filtroFaturamento === 'dia' && styles.filtroAtivo]} 
                  onPress={() => { setFiltroFaturamento('dia'); setFaturamentoTotal(320.00); }}
                >
                  <Text style={[styles.filtroTxt, filtroFaturamento === 'dia' && styles.filtroTxtAtivo]}>Dia</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filtroBtn, filtroFaturamento === 'mes' && styles.filtroAtivo]} 
                  onPress={() => { setFiltroFaturamento('mes'); setFaturamentoTotal(1480.00); }}
                >
                  <Text style={[styles.filtroTxt, filtroFaturamento === 'mes' && styles.filtroTxtAtivo]}>Mês</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.faturamentoValor}>R$ {faturamentoTotal.toFixed(2).replace('.', ',')}</Text>
            <View style={styles.barraGraficoFicticia}>
              <View style={[styles.progressoGrafico, { width: filtroFaturamento === 'dia' ? '40%' : '85%' }]} />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={26} color="#FF98B9" />
              <Text style={styles.statNumber}>{totalClientes}</Text>
              <Text style={styles.statLabel}>Clientes Ativos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="ribbon" size={26} color="#FF98B9" />
              <Text style={styles.statNumber}>{totalProfissionais}</Text>
              <Text style={styles.statLabel}>Profissionais Ativos</Text>
            </View>
          </View>

          <Text style={styles.secaoTitulo}>Gestão & Operações</Text>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/clientes')}>
            <View style={styles.iconBox}><Ionicons name="people-outline" size={22} color="#FF98B9" /></View>
            <View style={styles.menuTextos}>
              <Text style={styles.menuTitulo}>Contatos de Clientes</Text>
              <Text style={styles.menuDesc}>Ver lista e telefones dos clientes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/profissionais')}>
            <View style={styles.iconBox}><Ionicons name="ribbon-outline" size={22} color="#FF98B9" /></View>
            <View style={styles.menuTextos}>
              <Text style={styles.menuTitulo}>Equipe & Comissões</Text>
              <Text style={styles.menuDesc}>Gerir profissionais e comissões</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/servicos')}>
            <View style={styles.iconBox}><Ionicons name="list-outline" size={22} color="#FF98B9" /></View>
            <View style={styles.menuTextos}>
              <Text style={styles.menuTitulo}>Catálogo de Serviços</Text>
              <Text style={styles.menuDesc}>Gerir serviços, preços e durações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/pacotes')}>
            <View style={styles.iconBox}><Ionicons name="gift-outline" size={22} color="#FF98B9" /></View>
            <View style={styles.menuTextos}>
              <Text style={styles.menuTitulo}>Pacotes de Serviços</Text>
              <Text style={styles.menuDesc}>Gerir pacotes promocionais</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/estoque')}>
            <View style={styles.iconBox}><Ionicons name="cube-outline" size={22} color="#FF98B9" /></View>
            <View style={styles.menuTextos}>
              <Text style={styles.menuTitulo}>Caixa & Estoque</Text>
              <Text style={styles.menuDesc}>Controlar produtos e insumos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/ajuda')}>
            <View style={styles.iconBox}><Ionicons name="help-circle-outline" size={22} color="#FF98B9" /></View>
            <View style={styles.menuTextos}>
              <Text style={styles.menuTitulo}>Ajuda & Suporte</Text>
              <Text style={styles.menuDesc}>Dúvidas e informações do sistema</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>

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
  botaoAcaoTopo: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  scrollContainer: { paddingBottom: 30 },
  faturamentoCard: { backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 20, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 20 },
  faturamentoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  faturamentoTitulo: { color: 'rgba(209, 209, 209, 0.7)', fontSize: 14, fontWeight: '600' },
  filtrosRow: { flexDirection: 'row', backgroundColor: 'rgba(89, 89, 89, 0.6)', borderRadius: 10, padding: 3 },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  filtroAtivo: { backgroundColor: '#FF98B9' },
  filtroTxt: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  filtroTxtAtivo: { color: '#434643' },
  faturamentoValor: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  barraGraficoFicticia: { height: 8, backgroundColor: 'rgba(89, 89, 89, 0.6)', borderRadius: 4, overflow: 'hidden' },
  progressoGrafico: { height: '100%', backgroundColor: '#FF98B9', borderRadius: 4 },
  statsContainer: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  statNumber: { fontSize: 22, color: '#FFF', fontWeight: 'bold', marginVertical: 6 },
  statLabel: { fontSize: 12, color: 'rgba(209, 209, 209, 0.6)', textAlign: 'center' },
  secaoTitulo: { fontSize: 16, fontWeight: '600', color: '#FF98B9', marginBottom: 15, letterSpacing: 0.5 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(89, 89, 89, 0.45)', padding: 18, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(67, 70, 67, 0.9)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuTextos: { flex: 1 },
  menuTitulo: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  menuDesc: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 2 }
});
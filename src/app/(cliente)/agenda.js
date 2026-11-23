import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

const COLORS = {
  bgPrimary: '#434643',
  bgSurface: '#595959',
  bgElevated: '#383B38',
  bgDark: '#2B2D2B',
  borderSubtle: 'rgba(255,255,255,0.08)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.14)',
  accentBorder: 'rgba(255, 152, 185, 0.35)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D1D1',
  textMuted: '#A0A3A0',
  textOnAccent: '#1E201E',
  success: '#A5D6A7',
  danger: '#FF7B7B',
  dangerSoft: 'rgba(255, 123, 123, 0.14)',
};

const FILTROS = ['Todos', 'Confirmado', 'Cancelado'];

function formatarMoeda(valor) {
  return `R$ ${(Number(valor) || 0).toFixed(2).replace('.', ',')}`;
}

function getChaveOrdenacao(item) {
  const dataIso = item.dataAgendamento || '0000-00-00';
  const horario = item.horario || '00:00';
  return `${dataIso} ${horario}`;
}

export default function HistoricoAgendamentosClienteScreen() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);

  const usuarioAtual = auth.currentUser;

  useEffect(() => {
    if (!usuarioAtual?.uid) {
      setAgendamentos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);

    // Busca na coleção agendamentos onde clienteId == auth.currentUser.uid
    // (evita exigir índice composto usando ordenação no cliente)
    const q = query(
      collection(db, 'agendamentos'),
      where('clienteId', '==', usuarioAtual.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = [];
        snapshot.forEach((docSnap) => {
          lista.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });

        // Ordena do agendamento mais recente / próximo para o mais antigo
        lista.sort((a, b) => getChaveOrdenacao(b).localeCompare(getChaveOrdenacao(a)));

        setAgendamentos(lista);
        setCarregando(false);
        setAtualizando(false);
      },
      (error) => {
        console.error('Erro ao carregar histórico de agendamentos:', error);
        Alert.alert('Erro', 'Não foi possível carregar o seu histórico de agendamentos.');
        setCarregando(false);
        setAtualizando(false);
      }
    );

    return () => unsubscribe();
  }, [usuarioAtual?.uid]);

  const agendamentosFiltrados = useMemo(() => {
    if (filtroStatus === 'Todos') return agendamentos;
    return agendamentos.filter((item) => (item.status || 'Confirmado') === filtroStatus);
  }, [agendamentos, filtroStatus]);

  function handleRefresh() {
    setAtualizando(true);
    setTimeout(() => setAtualizando(false), 500);
  }

  function solicitarCancelamento(agendamento) {
    if (agendamento.status === 'Cancelado') return;

    Alert.alert(
      'Cancelar Agendamento',
      `Deseja cancelar o atendimento de "${agendamento.servicoNome || 'Serviço'}" em ${
        agendamento.dataFormatada || agendamento.dataAgendamento
      } às ${agendamento.horario}?`,
      [
        { text: 'Manter', style: 'cancel' },
        {
          text: 'Cancelar Agendamento',
          style: 'destructive',
          onPress: () => confirmarCancelamento(agendamento.id),
        },
      ]
    );
  }

  async function confirmarCancelamento(agendamentoId) {
    setCancelandoId(agendamentoId);
    try {
      const refAgendamento = doc(db, 'agendamentos', agendamentoId);
      await updateDoc(refAgendamento, {
        status: 'Cancelado',
        canceladoEm: serverTimestamp(),
      });
      Alert.alert('Agendamento cancelado', 'Seu agendamento foi marcado como cancelado.');
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
    } finally {
      setCancelandoId(null);
    }
  }

  function renderItem({ item }) {
    const statusAtual = item.status || 'Confirmado';
    const estaCancelado = statusAtual === 'Cancelado';
    const estaCancelando = cancelandoId === item.id;

    return (
      <View style={[styles.card, estaCancelado && styles.cardCancelado]}>
        <View style={styles.cardTopo}>
          <View style={styles.dataHoraBadge}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.accent} />
            <Text style={styles.dataHoraTexto}>
              {item.dataFormatada || item.dataAgendamento || 'Data não informada'} •{' '}
              {item.horario || '--:--'}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              estaCancelado ? styles.statusCanceladoPill : styles.statusConfirmadoPill,
            ]}
          >
            <Text
              style={[
                styles.statusTexto,
                estaCancelado ? styles.statusCanceladoTexto : styles.statusConfirmadoTexto,
              ]}
            >
              {statusAtual}
            </Text>
          </View>
        </View>

        <Text style={styles.servicoNome}>{item.servicoNome || 'Serviço selecionado'}</Text>

        <View style={styles.infoLinha}>
          <Ionicons name="person-outline" size={15} color={COLORS.textSecondary} />
          <Text style={styles.infoTexto}>
            Profissional: {item.profissionalNome || 'A definir'}
          </Text>
        </View>

        <View style={styles.cardRodape}>
          <Text style={styles.precoTexto}>{formatarMoeda(item.preco)}</Text>

          {!estaCancelado && (
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => solicitarCancelamento(item)}
              disabled={estaCancelando}
            >
              {estaCancelando ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
                  <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Meus Agendamentos</Text>
        <TouchableOpacity
          onPress={() => router.push('/(cliente)/servicos')}
          style={styles.novoButton}
          accessibilityLabel="Novo agendamento"
        >
          <Ionicons name="add" size={22} color={COLORS.textOnAccent} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosContainer}>
        {FILTROS.map((filtro) => {
          const ativo = filtroStatus === filtro;
          return (
            <TouchableOpacity
              key={filtro}
              style={[styles.filtroChip, ativo && styles.filtroChipAtivo]}
              onPress={() => setFiltroStatus(filtro)}
            >
              <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>
                {filtro}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {carregando ? (
        <View style={styles.centroEstado}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.estadoTexto}>Carregando seus agendamentos...</Text>
        </View>
      ) : !usuarioAtual ? (
        <View style={styles.centroEstado}>
          <Ionicons name="lock-closed-outline" size={44} color={COLORS.textMuted} />
          <Text style={styles.estadoTitulo}>Sessão não encontrada</Text>
          <Text style={styles.estadoTexto}>
            Faça login novamente para visualizar o histórico dos seus agendamentos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendamentosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centroEstado}>
              <Ionicons name="calendar-clear-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.estadoTitulo}>Nenhum agendamento encontrado</Text>
              <Text style={styles.estadoTexto}>
                {filtroStatus === 'Todos'
                  ? 'Você ainda não realizou agendamentos no Lirium Esmalteria & Spa.'
                  : `Não há agendamentos com status "${filtroStatus}".`}
              </Text>
              <TouchableOpacity
                style={styles.botaoAgendarAgora}
                onPress={() => router.push('/(cliente)/servicos')}
              >
                <Text style={styles.textoBotaoAgendarAgora}>Agendar um Serviço</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#6B6E6B',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  backButton: {
    padding: 4,
  },
  novoButton: {
    backgroundColor: COLORS.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: COLORS.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  filtroChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  filtroChipAtivo: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filtroTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filtroTextoAtivo: {
    color: COLORS.textOnAccent,
    fontWeight: 'bold',
  },
  listaContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 14,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardCancelado: {
    opacity: 0.72,
    backgroundColor: COLORS.bgDark,
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dataHoraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dataHoraTexto: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusConfirmadoPill: {
    backgroundColor: 'rgba(165, 214, 167, 0.14)',
    borderColor: 'rgba(165, 214, 167, 0.35)',
  },
  statusCanceladoPill: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: 'rgba(255, 123, 123, 0.35)',
  },
  statusTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusConfirmadoTexto: {
    color: COLORS.success,
  },
  statusCanceladoTexto: {
    color: COLORS.danger,
  },
  servicoNome: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  infoTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  precoTexto: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 123, 0.35)',
  },
  textoBotaoCancelar: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  centroEstado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 10,
  },
  estadoTitulo: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  estadoTexto: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  botaoAgendarAgora: {
    marginTop: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  textoBotaoAgendarAgora: {
    color: COLORS.textOnAccent,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
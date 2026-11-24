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
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

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
  const { tema, config } = useAcessibilidade();
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
    const dataTexto = item.dataFormatada || item.dataAgendamento || 'Data não informada';
    const horarioTexto = item.horario || '--:--';
    const servicoTexto = item.servicoNome || 'Serviço selecionado';
    const profTexto = item.profissionalNome || 'A definir';
    const precoTexto = formatarMoeda(item.preco);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: estaCancelado ? tema.bgElevated : tema.bgSurface,
            borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
            opacity: estaCancelado && !config.altoContraste ? 0.78 : 1,
          },
        ]}
      >
        <View style={styles.cardTopo}>
          <View style={styles.dataHoraBadge}>
            <Ionicons name="calendar-outline" size={15} color={tema.accent} accessible={false} />
            <Text
              style={[
                styles.dataHoraTexto,
                { color: tema.accent, fontSize: tema.fontSize(13) },
              ]}
            >
              {dataTexto} • {horarioTexto}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              estaCancelado
                ? { backgroundColor: tema.dangerSoft, borderColor: tema.danger }
                : { backgroundColor: tema.successSoft, borderColor: tema.success },
            ]}
          >
            <Text
              style={[
                styles.statusTexto,
                {
                  color: estaCancelado ? tema.danger : tema.success,
                  fontSize: tema.fontSize(11),
                },
              ]}
            >
              {statusAtual}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.servicoNome,
            { color: tema.textPrimary, fontSize: tema.fontSize(16) },
          ]}
        >
          {servicoTexto}
        </Text>

        <View style={styles.infoLinha}>
          <Ionicons name="person-outline" size={15} color={tema.textSecondary} accessible={false} />
          <Text
            style={[
              styles.infoTexto,
              { color: tema.textSecondary, fontSize: tema.fontSize(13) },
            ]}
          >
            Profissional: {profTexto}
          </Text>
        </View>

        <View
          style={[
            styles.cardRodape,
            { borderTopColor: tema.borderSubtle },
          ]}
        >
          <Text
            style={[
              styles.precoTexto,
              { color: tema.textPrimary, fontSize: tema.fontSize(16) },
            ]}
          >
            {precoTexto}
          </Text>

          {!estaCancelado && (
            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel={`Cancelar agendamento de ${servicoTexto} em ${dataTexto} às ${horarioTexto}`}
              accessibilityState={{ disabled: estaCancelando, busy: estaCancelando }}
              style={[
                styles.botaoCancelar,
                {
                  minHeight: tema.minTouchHeight,
                  backgroundColor: tema.dangerSoft,
                  borderColor: tema.danger,
                },
              ]}
              onPress={() => solicitarCancelamento(item)}
              disabled={estaCancelando}
            >
              {estaCancelando ? (
                <ActivityIndicator size="small" color={tema.danger} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color={tema.danger} accessible={false} />
                  <Text
                    style={[
                      styles.textoBotaoCancelar,
                      { color: tema.danger, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Cancelar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: tema.bgSurface,
            borderBottomColor: tema.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={tema.textPrimary} />
        </TouchableOpacity>
        <Text
          accessibilityRole="header"
          style={[
            styles.topTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Meus Agendamentos
        </Text>
        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Novo agendamento"
          onPress={() => router.push('/(cliente)/servicos')}
          style={[
            styles.novoButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              backgroundColor: tema.accent,
            },
          ]}
        >
          <Ionicons name="add" size={22} color={tema.textOnAccent} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.filtrosContainer,
          {
            backgroundColor: tema.bgElevated,
            borderBottomColor: tema.borderSubtle,
            gap: 10 + tema.espacoExtra,
          },
        ]}
      >
        {FILTROS.map((filtro) => {
          const ativo = filtroStatus === filtro;
          return (
            <TouchableOpacity
              key={filtro}
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${filtro}`}
              accessibilityState={{ selected: ativo }}
              style={[
                styles.filtroChip,
                {
                  minHeight: tema.minTouchHeight,
                  justifyContent: 'center',
                  backgroundColor: ativo ? tema.accent : tema.bgSurface,
                  borderColor: ativo ? tema.accent : tema.borderSubtle,
                },
              ]}
              onPress={() => setFiltroStatus(filtro)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  {
                    fontSize: tema.fontSize(13),
                    color: ativo ? tema.textOnAccent : tema.textSecondary,
                    fontWeight: ativo ? 'bold' : '600',
                  },
                ]}
              >
                {filtro}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {carregando ? (
        <View style={styles.centroEstado}>
          <ActivityIndicator size="large" color={tema.accent} />
          <Text
            style={[
              styles.estadoTexto,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Carregando seus agendamentos...
          </Text>
        </View>
      ) : !usuarioAtual ? (
        <View style={styles.centroEstado}>
          <Ionicons name="lock-closed-outline" size={44} color={tema.textMuted} accessible={false} />
          <Text
            style={[
              styles.estadoTitulo,
              { color: tema.textPrimary, fontSize: tema.fontSize(17) },
            ]}
          >
            Sessão não encontrada
          </Text>
          <Text
            style={[
              styles.estadoTexto,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Faça login novamente para visualizar o histórico dos seus agendamentos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendamentosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listaContent,
            {
              paddingBottom: 88 + tema.espacoExtra,
              gap: 14 + tema.espacoExtra,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={handleRefresh}
              tintColor={tema.accent}
              colors={[tema.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centroEstado}>
              <Ionicons name="calendar-clear-outline" size={48} color={tema.textMuted} accessible={false} />
              <Text
                style={[
                  styles.estadoTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(17) },
                ]}
              >
                Nenhum agendamento encontrado
              </Text>
              <Text
                style={[
                  styles.estadoTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                ]}
              >
                {filtroStatus === 'Todos'
                  ? 'Você ainda não realizou agendamentos no Lirium Esmalteria & Spa.'
                  : `Não há agendamentos com status "${filtroStatus}".`}
              </Text>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Agendar um Serviço"
                style={[
                  styles.botaoAgendarAgora,
                  {
                    backgroundColor: tema.accent,
                    minHeight: tema.minTouchHeight,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => router.push('/(cliente)/servicos')}
              >
                <Text
                  style={[
                    styles.textoBotaoAgendarAgora,
                    { color: tema.textOnAccent, fontSize: tema.fontSize(14) },
                  ]}
                >
                  Agendar um Serviço
                </Text>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topTitle: {
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  novoButton: {
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
    borderBottomWidth: 1,
  },
  filtroChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filtroTexto: {},
  listaContent: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
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
    fontWeight: 'bold',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusTexto: {
    fontWeight: 'bold',
  },
  servicoNome: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  infoTexto: {},
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  precoTexto: {
    fontWeight: 'bold',
  },
  botaoCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  textoBotaoCancelar: {
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  estadoTexto: {
    textAlign: 'center',
    lineHeight: 20,
  },
  botaoAgendarAgora: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  textoBotaoAgendarAgora: {
    fontWeight: 'bold',
  },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
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
  successSoft: 'rgba(165, 214, 167, 0.14)',
  danger: '#FF7B7B',
  dangerSoft: 'rgba(255, 123, 123, 0.14)',
  info: '#90CAF9',
  infoSoft: 'rgba(144, 202, 249, 0.14)',
};

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

function obterInfoHoje() {
  const agora = new Date();
  const yyyy = String(agora.getFullYear());
  const mm = String(agora.getMonth() + 1).padStart(2, '0');
  const dd = String(agora.getDate()).padStart(2, '0');
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    formatada: `${dd}/${mm}/${yyyy}`,
    diaSemana: DIAS_SEMANA[agora.getDay()],
  };
}

function formatarMoeda(valor) {
  return `R$ ${(Number(valor) || 0).toFixed(2).replace('.', ',')}`;
}

function normalizarStatus(status) {
  const valor = String(status || 'confirmado').toLowerCase();
  if (valor === 'concluido' || valor === 'concluído') return 'concluido';
  if (valor === 'cancelado') return 'cancelado';
  return 'confirmado';
}

function rotuloStatus(statusNormalizado) {
  if (statusNormalizado === 'concluido') return 'Concluído';
  if (statusNormalizado === 'cancelado') return 'Cancelado';
  return 'Confirmado';
}

function getEstiloStatus(statusNormalizado) {
  switch (statusNormalizado) {
    case 'concluido':
      return {
        pill: { backgroundColor: COLORS.infoSoft, borderColor: 'rgba(144, 202, 249, 0.35)' },
        texto: { color: COLORS.info },
      };
    case 'cancelado':
      return {
        pill: { backgroundColor: COLORS.dangerSoft, borderColor: 'rgba(255, 123, 123, 0.35)' },
        texto: { color: COLORS.danger },
      };
    default:
      return {
        pill: { backgroundColor: COLORS.successSoft, borderColor: 'rgba(165, 214, 167, 0.35)' },
        texto: { color: COLORS.success },
      };
  }
}

export default function AgendaProfissionalScreen() {
  const router = useRouter();
  const usuarioAtual = auth.currentUser;

  const infoHoje = useMemo(() => obterInfoHoje(), []);

  const [nomeProfissional, setNomeProfissional] = useState(
    usuarioAtual?.displayName || 'Profissional'
  );
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [processandoId, setProcessandoId] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function buscarNomeProfissional() {
      if (!usuarioAtual?.uid) return;
      try {
        const snap = await getDoc(doc(db, 'usuarios', usuarioAtual.uid));
        if (ativo && snap.exists() && snap.data()?.nome) {
          setNomeProfissional(snap.data().nome);
        }
      } catch (error) {
        console.error('Erro ao buscar nome da profissional:', error);
      }
    }
    buscarNomeProfissional();
    return () => {
      ativo = false;
    };
  }, [usuarioAtual?.uid]);

  useEffect(() => {
    if (!usuarioAtual?.uid) {
      setAgendamentosHoje([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);

    const mapDocs = new Map();

    function publicarResultados() {
      const lista = Array.from(mapDocs.values()).filter((item) => {
        const dataDoc = item.data || item.dataAgendamento || '';
        const profDoc = item.idProfissional || item.profissionalId || '';
        return dataDoc === infoHoje.iso && profDoc === usuarioAtual.uid;
      });

      lista.sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
      setAgendamentosHoje(lista);
      setCarregando(false);
      setAtualizando(false);
    }

    // Consulta principal usando os campos salvos no Firestore: idProfissional e data
    const qPrincipal = query(
      collection(db, 'agendamentos'),
      where('idProfissional', '==', usuarioAtual.uid),
      where('data', '==', infoHoje.iso)
    );

    // Consulta secundária de compatibilidade caso algum documento use profissionalId / dataAgendamento
    const qLegado = query(
      collection(db, 'agendamentos'),
      where('profissionalId', '==', usuarioAtual.uid),
      where('dataAgendamento', '==', infoHoje.iso)
    );

    const unsubPrincipal = onSnapshot(
      qPrincipal,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            mapDocs.delete(change.doc.id);
          } else {
            mapDocs.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
          }
        });
        publicarResultados();
      },
      (error) => {
        console.error('Erro ao carregar agenda (idProfissional/data):', error);
        Alert.alert('Erro', 'Não foi possível carregar os atendimentos de hoje.');
        setCarregando(false);
        setAtualizando(false);
      }
    );

    const unsubLegado = onSnapshot(
      qLegado,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            mapDocs.delete(change.doc.id);
          } else if (!mapDocs.has(change.doc.id)) {
            mapDocs.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
          }
        });
        publicarResultados();
      },
      () => {
        // Ignora erro caso documentos legados não existam
      }
    );

    return () => {
      unsubPrincipal();
      unsubLegado();
    };
  }, [usuarioAtual?.uid, infoHoje.iso]);

  const resumoDia = useMemo(() => {
    const confirmados = agendamentosHoje.filter(
      (a) => normalizarStatus(a.status) === 'confirmado'
    ).length;
    const concluidos = agendamentosHoje.filter(
      (a) => normalizarStatus(a.status) === 'concluido'
    ).length;

    return {
      total: agendamentosHoje.length,
      confirmados,
      concluidos,
    };
  }, [agendamentosHoje]);

  function handleRefresh() {
    setAtualizando(true);
    setTimeout(() => setAtualizando(false), 500);
  }

  async function concluirServicoNoFirebase(item) {
    setProcessandoId(item.id);
    try {
      await updateDoc(doc(db, 'agendamentos', item.id), {
        status: 'concluido',
        concluidoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao concluir serviço:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status para concluído.');
    } finally {
      setProcessandoId(null);
    }
  }

  async function cancelarServicoNoFirebase(item) {
    setProcessandoId(item.id);
    try {
      await updateDoc(doc(db, 'agendamentos', item.id), {
        status: 'cancelado',
        canceladoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao cancelar serviço:', error);
      Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
    } finally {
      setProcessandoId(null);
    }
  }

  function confirmarConclusao(item) {
    const nomeCli = item.nomeCliente || item.clienteNome || 'Cliente';
    Alert.alert(
      'Concluir Serviço',
      `Marcar o atendimento de ${nomeCli} às ${item.horario || '--:--'} como concluído?`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Concluir',
          onPress: () => concluirServicoNoFirebase(item),
        },
      ]
    );
  }

  function confirmarCancelamento(item) {
    const nomeCli = item.nomeCliente || item.clienteNome || 'Cliente';
    Alert.alert(
      'Cancelar Atendimento',
      `Deseja cancelar o atendimento de ${nomeCli} às ${item.horario || '--:--'}?`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => cancelarServicoNoFirebase(item),
        },
      ]
    );
  }

  function renderAtendimento({ item }) {
    const statusNorm = normalizarStatus(item.status);
    const estiloStatus = getEstiloStatus(statusNorm);
    const encerrado = statusNorm === 'concluido' || statusNorm === 'cancelado';
    const estaProcessando = processandoId === item.id;
    const nomeClienteExibido = item.nomeCliente || item.clienteNome || 'Cliente';
    const nomeServicoExibido = item.nomeServico || item.servicoNome || 'Serviço agendado';

    return (
      <View style={[styles.card, statusNorm === 'cancelado' && styles.cardCancelado]}>
        <View style={styles.cardTopo}>
          <View style={styles.horarioBadge}>
            <Ionicons name="time-outline" size={16} color={COLORS.accent} />
            <Text style={styles.horarioTexto}>{item.horario || '--:--'}</Text>
          </View>

          <View style={[styles.statusPill, estiloStatus.pill]}>
            <Text style={[styles.statusTexto, estiloStatus.texto]}>
              {rotuloStatus(statusNorm)}
            </Text>
          </View>
        </View>

        <Text style={styles.clienteNome}>{nomeClienteExibido}</Text>
        <Text style={styles.servicoTexto}>{nomeServicoExibido}</Text>

        <View style={styles.cardRodape}>
          <Text style={styles.precoTexto}>{formatarMoeda(item.preco)}</Text>

          {!encerrado && (
            <View style={styles.acoesRow}>
              <TouchableOpacity
                style={styles.botaoCheck}
                onPress={() => confirmarConclusao(item)}
                disabled={estaProcessando}
                accessibilityLabel="Concluir serviço"
              >
                {estaProcessando ? (
                  <ActivityIndicator size="small" color={COLORS.textOnAccent} />
                ) : (
                  <Ionicons name="checkmark" size={18} color={COLORS.textOnAccent} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => confirmarCancelamento(item)}
                disabled={estaProcessando}
                accessibilityLabel="Cancelar serviço"
              >
                <Ionicons name="close" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topSubtitulo}>Olá, {nomeProfissional}</Text>
          <Text style={styles.topTitle}>Agenda de Hoje</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('./perfil')}
          style={styles.perfilButton}
          accessibilityLabel="Meu perfil"
        >
          <Ionicons name="person-circle-outline" size={28} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.dataBanner}>
        <Ionicons name="calendar-outline" size={18} color={COLORS.accent} />
        <Text style={styles.dataBannerTexto}>
          {infoHoje.diaSemana}, {infoHoje.formatada}
        </Text>
      </View>

      <View style={styles.resumoGrid}>
        <View style={styles.resumoBox}>
          <Text style={styles.resumoNumero}>{resumoDia.total}</Text>
          <Text style={styles.resumoLabel}>Total Hoje</Text>
        </View>
        <View style={styles.resumoBox}>
          <Text style={styles.resumoNumero}>{resumoDia.confirmados}</Text>
          <Text style={styles.resumoLabel}>Confirmados</Text>
        </View>
        <View style={styles.resumoBox}>
          <Text style={styles.resumoNumero}>{resumoDia.concluidos}</Text>
          <Text style={styles.resumoLabel}>Concluídos</Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.estadoTexto}>Carregando atendimentos de hoje...</Text>
        </View>
      ) : !usuarioAtual ? (
        <View style={styles.centro}>
          <Ionicons name="lock-closed-outline" size={44} color={COLORS.textMuted} />
          <Text style={styles.estadoTitulo}>Sessão não encontrada</Text>
          <Text style={styles.estadoTexto}>
            Faça login na conta profissional para visualizar os atendimentos do dia.
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendamentosHoje}
          keyExtractor={(item) => item.id}
          renderItem={renderAtendimento}
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
            <View style={styles.centro}>
              <Ionicons name="calendar-clear-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.estadoTitulo}>Nenhum atendimento hoje</Text>
              <Text style={styles.estadoTexto}>
                Você não possui agendamentos designados para {infoHoje.formatada}.
              </Text>
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
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#6B6E6B',
  },
  topSubtitulo: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  topTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  perfilButton: {
    padding: 4,
  },
  dataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  dataBannerTexto: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 'bold',
  },
  resumoGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  resumoBox: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  resumoNumero: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resumoLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  horarioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  horarioTexto: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  clienteNome: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  servicoTexto: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 14,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    gap: 8,
  },
  precoTexto: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  acoesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoCheck: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 123, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
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
});
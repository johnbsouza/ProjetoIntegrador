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
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

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

export default function AgendaProfissionalScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const usuarioAtual = auth.currentUser;

  const infoHoje = useMemo(() => obterInfoHoje(), []);

  const [nomeProfissional, setNomeProfissional] = useState(
    usuarioAtual?.displayName || 'Profissional'
  );
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [processandoId, setProcessandoId] = useState(null);

  function getEstiloStatus(statusNormalizado) {
    switch (statusNormalizado) {
      case 'concluido':
        return {
          pill: { backgroundColor: tema.infoSoft, borderColor: tema.info },
          texto: { color: tema.info },
        };
      case 'cancelado':
        return {
          pill: { backgroundColor: tema.dangerSoft, borderColor: tema.danger },
          texto: { color: tema.danger },
        };
      default:
        return {
          pill: { backgroundColor: tema.successSoft, borderColor: tema.success },
          texto: { color: tema.success },
        };
    }
  }

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

    const qPrincipal = query(
      collection(db, 'agendamentos'),
      where('idProfissional', '==', usuarioAtual.uid),
      where('data', '==', infoHoje.iso)
    );

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
      () => {}
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
    const horarioExibido = item.horario || '--:--';
    const precoExibido = formatarMoeda(item.preco);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: statusNorm === 'cancelado' ? tema.bgElevated : tema.bgSurface,
            borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
            opacity: statusNorm === 'cancelado' && !config.altoContraste ? 0.78 : 1,
          },
        ]}
      >
        <View style={styles.cardTopo}>
          <View
            style={[
              styles.horarioBadge,
              {
                backgroundColor: tema.accentSoft,
                borderColor: tema.accentBorder,
              },
            ]}
          >
            <Ionicons name="time-outline" size={16} color={tema.accent} accessible={false} />
            <Text
              style={[
                styles.horarioTexto,
                { color: tema.accent, fontSize: tema.fontSize(14) },
              ]}
            >
              {horarioExibido}
            </Text>
          </View>

          <View style={[styles.statusPill, estiloStatus.pill]}>
            <Text
              style={[
                styles.statusTexto,
                estiloStatus.texto,
                { fontSize: tema.fontSize(11) },
              ]}
            >
              {rotuloStatus(statusNorm)}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.clienteNome,
            { color: tema.textPrimary, fontSize: tema.fontSize(16) },
          ]}
        >
          {nomeClienteExibido}
        </Text>
        <Text
          style={[
            styles.servicoTexto,
            { color: tema.textSecondary, fontSize: tema.fontSize(14) },
          ]}
        >
          {nomeServicoExibido}
        </Text>

        <View
          style={[
            styles.cardRodape,
            { borderTopColor: tema.borderSubtle },
          ]}
        >
          <Text
            style={[
              styles.precoTexto,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
          >
            {precoExibido}
          </Text>

          {!encerrado && (
            <View style={[styles.acoesRow, { gap: 8 + tema.espacoExtra }]}>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel={`Concluir atendimento de ${nomeClienteExibido} às ${horarioExibido}`}
                accessibilityState={{ disabled: estaProcessando, busy: estaProcessando }}
                style={[
                  styles.botaoCheck,
                  {
                    backgroundColor: tema.accent,
                    minWidth: tema.minTouchHeight,
                    minHeight: tema.minTouchHeight,
                    borderRadius: tema.minTouchHeight / 2,
                  },
                ]}
                onPress={() => confirmarConclusao(item)}
                disabled={estaProcessando}
              >
                {estaProcessando ? (
                  <ActivityIndicator size="small" color={tema.textOnAccent} />
                ) : (
                  <Ionicons name="checkmark" size={18} color={tema.textOnAccent} accessible={false} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel={`Cancelar atendimento de ${nomeClienteExibido} às ${horarioExibido}`}
                accessibilityState={{ disabled: estaProcessando }}
                style={[
                  styles.botaoCancelar,
                  {
                    backgroundColor: tema.dangerSoft,
                    borderColor: tema.danger,
                    minWidth: tema.minTouchHeight,
                    minHeight: tema.minTouchHeight,
                    borderRadius: tema.minTouchHeight / 2,
                  },
                ]}
                onPress={() => confirmarCancelamento(item)}
                disabled={estaProcessando}
              >
                <Ionicons name="close" size={18} color={tema.danger} accessible={false} />
              </TouchableOpacity>
            </View>
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
        <View>
          {!config.modoCalmo && (
            <Text
              style={[
                styles.topSubtitulo,
                { color: tema.textSecondary, fontSize: tema.fontSize(12) },
              ]}
            >
              Olá, {nomeProfissional}
            </Text>
          )}
          <Text
            accessibilityRole="header"
            style={[
              styles.topTitle,
              { color: tema.textPrimary, fontSize: tema.fontSize(19) },
            ]}
          >
            Agenda de Hoje
          </Text>
        </View>

        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Meu perfil"
          onPress={() => router.push('./perfil')}
          style={[
            styles.perfilButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Ionicons name="person-circle-outline" size={28} color={tema.accent} />
        </TouchableOpacity>
      </View>

      <View
        accessible
        accessibilityLabel={`Data de hoje: ${infoHoje.diaSemana}, ${infoHoje.formatada}`}
        style={[
          styles.dataBanner,
          {
            backgroundColor: tema.bgElevated,
            borderBottomColor: tema.borderSubtle,
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={tema.accent} accessible={false} />
        <Text
          style={[
            styles.dataBannerTexto,
            { color: tema.accent, fontSize: tema.fontSize(13) },
          ]}
        >
          {infoHoje.diaSemana}, {infoHoje.formatada}
        </Text>
      </View>

      <View
        style={[
          styles.resumoGrid,
          { gap: 10 + tema.espacoExtra },
        ]}
      >
        <View
          accessible
          accessibilityLabel={`Total Hoje: ${resumoDia.total}`}
          style={[
            styles.resumoBox,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
            },
          ]}
        >
          <Text
            style={[
              styles.resumoNumero,
              { color: tema.accent, fontSize: tema.fontSize(18) },
            ]}
          >
            {resumoDia.total}
          </Text>
          <Text
            style={[
              styles.resumoLabel,
              { color: tema.textSecondary, fontSize: tema.fontSize(11) },
            ]}
          >
            Total Hoje
          </Text>
        </View>
        <View
          accessible
          accessibilityLabel={`Confirmados: ${resumoDia.confirmados}`}
          style={[
            styles.resumoBox,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
            },
          ]}
        >
          <Text
            style={[
              styles.resumoNumero,
              { color: tema.accent, fontSize: tema.fontSize(18) },
            ]}
          >
            {resumoDia.confirmados}
          </Text>
          <Text
            style={[
              styles.resumoLabel,
              { color: tema.textSecondary, fontSize: tema.fontSize(11) },
            ]}
          >
            Confirmados
          </Text>
        </View>
        <View
          accessible
          accessibilityLabel={`Concluídos: ${resumoDia.concluidos}`}
          style={[
            styles.resumoBox,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
            },
          ]}
        >
          <Text
            style={[
              styles.resumoNumero,
              { color: tema.accent, fontSize: tema.fontSize(18) },
            ]}
          >
            {resumoDia.concluidos}
          </Text>
          <Text
            style={[
              styles.resumoLabel,
              { color: tema.textSecondary, fontSize: tema.fontSize(11) },
            ]}
          >
            Concluídos
          </Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={tema.accent} />
          <Text
            style={[
              styles.estadoTexto,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Carregando atendimentos de hoje...
          </Text>
        </View>
      ) : !usuarioAtual ? (
        <View style={styles.centro}>
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
            Faça login na conta profissional para visualizar os atendimentos do dia.
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendamentosHoje}
          keyExtractor={(item) => item.id}
          renderItem={renderAtendimento}
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
            <View style={styles.centro}>
              <Ionicons name="calendar-clear-outline" size={48} color={tema.textMuted} accessible={false} />
              <Text
                style={[
                  styles.estadoTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(17) },
                ]}
              >
                Nenhum atendimento hoje
              </Text>
              <Text
                style={[
                  styles.estadoTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                ]}
              >
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topSubtitulo: {},
  topTitle: {
    fontWeight: 'bold',
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
    borderBottomWidth: 1,
  },
  dataBannerTexto: {
    fontWeight: 'bold',
  },
  resumoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  resumoBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  resumoNumero: {
    fontWeight: 'bold',
  },
  resumoLabel: {
    marginTop: 2,
    fontWeight: '600',
  },
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
    marginBottom: 10,
  },
  horarioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  horarioTexto: {
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
  clienteNome: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  servicoTexto: {
    marginBottom: 14,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  precoTexto: {
    fontWeight: 'bold',
  },
  acoesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoCheck: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    width: 34,
    height: 34,
    borderWidth: 1,
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  estadoTexto: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
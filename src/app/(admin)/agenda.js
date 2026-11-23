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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

const COLORS = {
  bgPrimary: '#1E201E',
  bgSurface: '#2A2D2A',
  bgElevated: '#343834',
  bgDark: '#161816',
  borderSubtle: 'rgba(255,255,255,0.08)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.15)',
  accentBorder: 'rgba(255, 152, 185, 0.42)',
  textPrimary: '#FFFFFF',
  textSecondary: '#C8CCC8',
  textMuted: '#8E938E',
  textOnAccent: '#1E201E',
  success: '#A5D6A7',
  successSoft: 'rgba(165, 214, 167, 0.14)',
  danger: '#FF7B7B',
  dangerSoft: 'rgba(255, 123, 123, 0.14)',
  info: '#90CAF9',
  infoSoft: 'rgba(144, 202, 249, 0.14)',
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const FILTROS_STATUS = [
  { key: 'todos', label: 'Todos' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'concluido', label: 'Concluídos' },
  { key: 'cancelado', label: 'Cancelados' },
];

function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function obterHojeIso() {
  const agora = new Date();
  const yyyy = String(agora.getFullYear());
  const mm = String(agora.getMonth() + 1).padStart(2, '0');
  const dd = String(agora.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizarStatus(status) {
  const s = String(status || 'confirmado').trim().toLowerCase();
  if (s === 'concluido' || s === 'concluído') return 'concluido';
  if (s === 'cancelado') return 'cancelado';
  return 'confirmado';
}

function rotuloStatus(statusNorm) {
  if (statusNorm === 'concluido') return 'Concluído';
  if (statusNorm === 'cancelado') return 'Cancelado';
  return 'Confirmado';
}

function getEstiloStatus(statusNorm) {
  switch (statusNorm) {
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

function gerarGradeDoMes(ano, mes, hojeIso) {
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];

  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);

  for (let d = 1; d <= totalDias; d++) {
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const iso = `${ano}-${mm}-${dd}`;

    celulas.push({
      iso,
      diaNumero: dd,
      formatada: `${dd}/${mm}/${ano}`,
      ehHoje: iso === hojeIso,
    });
  }

  while (celulas.length % 7 !== 0) celulas.push(null);
  return celulas;
}

export default function AdminAgendaGeralScreen() {
  const router = useRouter();
  const hojeIso = useMemo(() => obterHojeIso(), []);

  const [mesVisivel, setMesVisivel] = useState(() => {
    const agora = new Date();
    return { ano: agora.getFullYear(), mes: agora.getMonth() };
  });

  const [diaSelecionadoIso, setDiaSelecionadoIso] = useState(hojeIso);
  const [profissionalFiltroId, setProfissionalFiltroId] = useState('TODAS');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  const [agendamentos, setAgendamentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [processandoId, setProcessandoId] = useState(null);

  useEffect(() => {
    setCarregando(true);

    const unsubAgendamentos = onSnapshot(
      collection(db, 'agendamentos'),
      (snapshot) => {
        const lista = [];
        snapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAgendamentos(lista);
        setCarregando(false);
        setAtualizando(false);
      },
      (error) => {
        console.error('Erro ao carregar agenda geral:', error);
        Alert.alert('Erro', 'Não foi possível carregar os agendamentos do salão.');
        setCarregando(false);
        setAtualizando(false);
      }
    );

    const qProf = query(
      collection(db, 'usuarios'),
      where('nivelAcesso', '==', 'profissional')
    );

    const unsubProf = onSnapshot(
      qProf,
      (snapshot) => {
        const listaProf = [];
        snapshot.forEach((docSnap) => {
          listaProf.push({ id: docSnap.id, ...docSnap.data() });
        });
        listaProf.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        setProfissionais(listaProf);
      },
      (error) => {
        console.error('Erro ao carregar profissionais:', error);
      }
    );

    return () => {
      unsubAgendamentos();
      unsubProf();
    };
  }, []);

  const mapaProfissionais = useMemo(() => {
    const map = new Map();
    profissionais.forEach((p) => {
      map.set(p.id, p.nome || 'Profissional');
    });
    return map;
  }, [profissionais]);

  const mudarMes = useCallback((delta) => {
    setMesVisivel((atual) => {
      const nova = new Date(atual.ano, atual.mes + delta, 1);
      return { ano: nova.getFullYear(), mes: nova.getMonth() };
    });
  }, []);

  function irParaHoje() {
    const agora = new Date();
    setMesVisivel({ ano: agora.getFullYear(), mes: agora.getMonth() });
    setDiaSelecionadoIso(hojeIso);
  }

  function handleRefresh() {
    setAtualizando(true);
    setTimeout(() => setAtualizando(false), 500);
  }

  const gradeDoMes = useMemo(
    () => gerarGradeDoMes(mesVisivel.ano, mesVisivel.mes, hojeIso),
    [mesVisivel, hojeIso]
  );

  const contagemPorDia = useMemo(() => {
    const counts = new Map();
    agendamentos.forEach((item) => {
      if (normalizarStatus(item.status) === 'cancelado') return;
      const profId = item.idProfissional || item.profissionalId || '';
      if (profissionalFiltroId !== 'TODAS' && profId !== profissionalFiltroId) {
        return;
      }
      const dataDoc = item.data || item.dataAgendamento || '';
      if (!dataDoc) return;
      counts.set(dataDoc, (counts.get(dataDoc) || 0) + 1);
    });
    return counts;
  }, [agendamentos, profissionalFiltroId]);

  const agendamentosDoDiaBase = useMemo(() => {
    return agendamentos
      .filter((item) => {
        const dataDoc = item.data || item.dataAgendamento || '';
        if (dataDoc !== diaSelecionadoIso) return false;

        const profId = item.idProfissional || item.profissionalId || '';
        if (profissionalFiltroId !== 'TODAS' && profId !== profissionalFiltroId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
  }, [agendamentos, diaSelecionadoIso, profissionalFiltroId]);

  const agendamentosFiltrados = useMemo(() => {
    if (statusFiltro === 'todos') return agendamentosDoDiaBase;
    return agendamentosDoDiaBase.filter(
      (item) => normalizarStatus(item.status) === statusFiltro
    );
  }, [agendamentosDoDiaBase, statusFiltro]);

  const resumoDiaSelecionado = useMemo(() => {
    const validos = agendamentosDoDiaBase.filter(
      (a) => normalizarStatus(a.status) !== 'cancelado'
    );
    const faturamentoDia = validos.reduce(
      (acc, item) => acc + (Number(item.preco) || 0),
      0
    );
    return {
      total: agendamentosDoDiaBase.length,
      ativos: validos.length,
      faturamentoDia,
    };
  }, [agendamentosDoDiaBase]);

  async function alterarStatusAgendamento(item, novoStatus) {
    setProcessandoId(item.id);
    try {
      await updateDoc(doc(db, 'agendamentos', item.id), {
        status: novoStatus,
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento pelo admin:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do agendamento.');
    } finally {
      setProcessandoId(null);
    }
  }

  function confirmarAlteracaoStatus(item, novoStatus) {
    const rotuloAcao = novoStatus === 'concluido' ? 'concluir' : 'cancelar';
    const nomeCli = item.nomeCliente || item.clienteNome || 'Cliente';
    Alert.alert(
      `${novoStatus === 'concluido' ? 'Concluir' : 'Cancelar'} Agendamento`,
      `Deseja ${rotuloAcao} o atendimento de ${nomeCli} às ${item.horario || '--:--'}?`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: novoStatus === 'cancelado' ? 'destructive' : 'default',
          onPress: () => alterarStatusAgendamento(item, novoStatus),
        },
      ]
    );
  }

  const diaFormatadoExibicao = useMemo(() => {
    if (!diaSelecionadoIso) return '';
    const [aaaa, mm, dd] = diaSelecionadoIso.split('-');
    return `${dd}/${mm}/${aaaa}`;
  }, [diaSelecionadoIso]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Agenda Geral</Text>

        <TouchableOpacity
          onPress={irParaHoje}
          style={styles.hojePill}
          accessibilityLabel="Ir para hoje"
        >
          <Text style={styles.hojePillTexto}>Hoje</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        <Text style={styles.secaoLabel}>Profissionais do Salão</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            style={[
              styles.chipProf,
              profissionalFiltroId === 'TODAS' && styles.chipProfAtivo,
            ]}
            onPress={() => setProfissionalFiltroId('TODAS')}
          >
            <Text
              style={[
                styles.chipProfTexto,
                profissionalFiltroId === 'TODAS' && styles.chipProfTextoAtivo,
              ]}
            >
              Todas ({profissionais.length})
            </Text>
          </TouchableOpacity>

          {profissionais.map((prof) => {
            const ativo = profissionalFiltroId === prof.id;
            return (
              <TouchableOpacity
                key={prof.id}
                style={[styles.chipProf, ativo && styles.chipProfAtivo]}
                onPress={() => setProfissionalFiltroId(prof.id)}
              >
                <Text
                  style={[
                    styles.chipProfTexto,
                    ativo && styles.chipProfTextoAtivo,
                  ]}
                >
                  {prof.nome || 'Profissional'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.calendarioCard}>
          <View style={styles.calendarioHeader}>
            <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.botaoMes}>
              <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.calendarioMesTitulo}>
              {MESES[mesVisivel.mes]} {mesVisivel.ano}
            </Text>

            <TouchableOpacity onPress={() => mudarMes(1)} style={styles.botaoMes}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarioLinha}>
            {DIAS_SEMANA.map((d) => (
              <View key={d} style={styles.celulaCalendario}>
                <Text style={styles.cabecalhoSemana}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarioLinha}>
            {gradeDoMes.map((diaObj, index) => {
              if (!diaObj) {
                return <View key={`vazio-${index}`} style={styles.celulaCalendario} />;
              }

              const selecionado = diaSelecionadoIso === diaObj.iso;
              const qtdMarcacoes = contagemPorDia.get(diaObj.iso) || 0;

              return (
                <View key={diaObj.iso} style={styles.celulaCalendario}>
                  <TouchableOpacity
                    onPress={() => setDiaSelecionadoIso(diaObj.iso)}
                    style={[
                      styles.cardDia,
                      diaObj.ehHoje && styles.cardDiaHoje,
                      selecionado && styles.cardDiaSelecionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.diaNumeroTexto,
                        selecionado && styles.textoEscuro,
                      ]}
                    >
                      {diaObj.diaNumero}
                    </Text>

                    {qtdMarcacoes > 0 && (
                      <View
                        style={[
                          styles.pontoEvento,
                          selecionado && styles.pontoEventoSelecionado,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.resumoDiaCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resumoDiaTitulo}>{diaFormatadoExibicao}</Text>
            <Text style={styles.resumoDiaSub}>
              {resumoDiaSelecionado.ativos}{' '}
              {resumoDiaSelecionado.ativos === 1 ? 'ativo' : 'ativos'} •{' '}
              {resumoDiaSelecionado.total}{' '}
              {resumoDiaSelecionado.total === 1 ? 'registro' : 'registros'}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.resumoDiaValorLabel}>Receita prevista</Text>
            <Text style={styles.resumoDiaValor}>
              {formatarMoeda(resumoDiaSelecionado.faturamentoDia)}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilterRow}
        >
          {FILTROS_STATUS.map((f) => {
            const ativo = statusFiltro === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.statusChip, ativo && styles.statusChipAtivo]}
                onPress={() => setStatusFiltro(f.key)}
              >
                <Text
                  style={[
                    styles.statusChipTexto,
                    ativo && styles.statusChipTextoAtivo,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.estadoTexto}>Sincronizando agenda do salão...</Text>
          </View>
        ) : agendamentosFiltrados.length === 0 ? (
          <View style={styles.centro}>
            <Ionicons name="calendar-clear-outline" size={44} color={COLORS.textMuted} />
            <Text style={styles.estadoTitulo}>Nenhum atendimento encontrado</Text>
            <Text style={styles.estadoTexto}>
              Sem registros para {diaFormatadoExibicao} com os filtros selecionados.
            </Text>
          </View>
        ) : (
          <View style={styles.listaAgendamentos}>
            {agendamentosFiltrados.map((item) => {
              const statusNorm = normalizarStatus(item.status);
              const estiloStatus = getEstiloStatus(statusNorm);
              const encerrado = statusNorm === 'concluido' || statusNorm === 'cancelado';
              const estaProcessando = processandoId === item.id;

              const profId = item.idProfissional || item.profissionalId || '';
              const nomeProf =
                item.nomeProfissional ||
                item.profissionalNome ||
                mapaProfissionais.get(profId) ||
                'Profissional';
              const nomeCli = item.nomeCliente || item.clienteNome || 'Cliente';
              const nomeServ = item.nomeServico || item.servicoNome || 'Serviço';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.cardAgendamento,
                    statusNorm === 'cancelado' && styles.cardCancelado,
                  ]}
                >
                  <View style={styles.cardTopo}>
                    <View style={styles.horarioBadge}>
                      <Ionicons name="time-outline" size={14} color={COLORS.accent} />
                      <Text style={styles.horarioTexto}>{item.horario || '--:--'}</Text>
                    </View>

                    <View style={[styles.statusPill, estiloStatus.pill]}>
                      <Text style={[styles.statusTexto, estiloStatus.texto]}>
                        {rotuloStatus(statusNorm)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.clienteNome}>{nomeCli}</Text>
                  <Text style={styles.servicoTexto}>{nomeServ}</Text>

                  <View style={styles.profLinha}>
                    <Ionicons name="sparkles" size={13} color={COLORS.accent} />
                    <Text style={styles.profTexto}>{nomeProf}</Text>
                  </View>

                  <View style={styles.cardRodape}>
                    <Text style={styles.precoTexto}>{formatarMoeda(item.preco)}</Text>

                    {!encerrado && (
                      <View style={styles.acoesRow}>
                        <TouchableOpacity
                          style={styles.botaoCheck}
                          onPress={() => confirmarAlteracaoStatus(item, 'concluido')}
                          disabled={estaProcessando}
                          accessibilityLabel="Concluir agendamento"
                        >
                          {estaProcessando ? (
                            <ActivityIndicator size="small" color={COLORS.textOnAccent} />
                          ) : (
                            <Ionicons name="checkmark" size={16} color={COLORS.textOnAccent} />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.botaoCancelar}
                          onPress={() => confirmarAlteracaoStatus(item, 'cancelado')}
                          disabled={estaProcessando}
                          accessibilityLabel="Cancelar agendamento"
                        >
                          <Ionicons name="close" size={16} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    paddingVertical: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hojePill: {
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  hojePillTexto: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  secaoLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 14,
  },
  chipProf: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  chipProfAtivo: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipProfTexto: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipProfTextoAtivo: {
    color: COLORS.textOnAccent,
    fontWeight: 'bold',
  },
  calendarioCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 14,
  },
  calendarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarioMesTitulo: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoMes: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarioLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celulaCalendario: {
    width: `${100 / 7}%`,
    padding: 2,
    alignItems: 'center',
  },
  cabecalhoSemana: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    paddingBottom: 6,
  },
  cardDia: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardDiaHoje: {
    borderColor: COLORS.accentBorder,
  },
  cardDiaSelecionado: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  diaNumeroTexto: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  textoEscuro: {
    color: COLORS.textOnAccent,
  },
  pontoEvento: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
  pontoEventoSelecionado: {
    backgroundColor: COLORS.textOnAccent,
  },
  resumoDiaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 12,
  },
  resumoDiaTitulo: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  resumoDiaSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  resumoDiaValorLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  resumoDiaValor: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusFilterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  statusChipAtivo: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentBorder,
  },
  statusChipTexto: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusChipTextoAtivo: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  listaAgendamentos: {
    gap: 12,
  },
  cardAgendamento: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardCancelado: {
    opacity: 0.68,
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
    fontSize: 13,
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
    marginBottom: 3,
  },
  servicoTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  profLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  profTexto: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  acoesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoCheck: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 123, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
    paddingVertical: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  estadoTitulo: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  estadoTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});
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
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

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

function getEstiloStatus(statusNorm, tema, altoContraste) {
  switch (statusNorm) {
    case 'concluido':
      return {
        pill: {
          backgroundColor: tema.infoSoft,
          borderColor: altoContraste ? tema.info : 'rgba(144, 202, 249, 0.35)',
        },
        texto: { color: tema.info },
      };
    case 'cancelado':
      return {
        pill: {
          backgroundColor: tema.dangerSoft,
          borderColor: altoContraste ? tema.danger : 'rgba(255, 123, 123, 0.35)',
        },
        texto: { color: tema.danger },
      };
    default:
      return {
        pill: {
          backgroundColor: tema.successSoft,
          borderColor: altoContraste ? tema.success : 'rgba(165, 214, 167, 0.35)',
        },
        texto: { color: tema.success },
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
  const { tema, config } = useAcessibilidade();
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
          onPress={() => router.back()}
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          style={[
            styles.iconButton,
            {
              backgroundColor: tema.bgElevated,
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              borderWidth: config.altoContraste ? 1 : 0,
              borderColor: tema.borderSubtle,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={tema.textPrimary} />
        </TouchableOpacity>

        <Text
          accessibilityRole="header"
          style={[
            styles.topTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Agenda Geral
        </Text>

        <TouchableOpacity
          onPress={irParaHoje}
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Ir para a data de hoje"
          style={[
            styles.hojePill,
            {
              backgroundColor: tema.accentSoft,
              borderColor: tema.accentBorder,
              minHeight: tema.minTouchHeight,
              justifyContent: 'center',
            },
          ]}
        >
          <Text
            style={[
              styles.hojePillTexto,
              { color: tema.accent, fontSize: tema.fontSize(12) },
            ]}
          >
            Hoje
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 88 + tema.espacoExtra },
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
      >
        <Text
          style={[
            styles.secaoLabel,
            { color: tema.accent, fontSize: tema.fontSize(12) },
          ]}
        >
          Profissionais do Salão
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsRow, { gap: 8 + tema.espacoExtra }]}
        >
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por todas as profissionais, total ${profissionais.length}`}
            accessibilityState={{ selected: profissionalFiltroId === 'TODAS' }}
            style={[
              styles.chipProf,
              {
                minHeight: tema.minTouchHeight,
                justifyContent: 'center',
                backgroundColor:
                  profissionalFiltroId === 'TODAS' ? tema.accent : tema.bgSurface,
                borderColor:
                  profissionalFiltroId === 'TODAS'
                    ? tema.accent
                    : tema.borderSubtle,
              },
            ]}
            onPress={() => setProfissionalFiltroId('TODAS')}
          >
            <Text
              style={[
                styles.chipProfTexto,
                {
                  fontSize: tema.fontSize(12),
                  color:
                    profissionalFiltroId === 'TODAS'
                      ? tema.textOnAccent
                      : tema.textSecondary,
                  fontWeight: profissionalFiltroId === 'TODAS' ? 'bold' : '600',
                },
              ]}
            >
              Todas ({profissionais.length})
            </Text>
          </TouchableOpacity>

          {profissionais.map((prof) => {
            const ativo = profissionalFiltroId === prof.id;
            const nomeProf = prof.nome || 'Profissional';
            return (
              <TouchableOpacity
                key={prof.id}
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar agenda por ${nomeProf}`}
                accessibilityState={{ selected: ativo }}
                style={[
                  styles.chipProf,
                  {
                    minHeight: tema.minTouchHeight,
                    justifyContent: 'center',
                    backgroundColor: ativo ? tema.accent : tema.bgSurface,
                    borderColor: ativo ? tema.accent : tema.borderSubtle,
                  },
                ]}
                onPress={() => setProfissionalFiltroId(prof.id)}
              >
                <Text
                  style={[
                    styles.chipProfTexto,
                    {
                      fontSize: tema.fontSize(12),
                      color: ativo ? tema.textOnAccent : tema.textSecondary,
                      fontWeight: ativo ? 'bold' : '600',
                    },
                  ]}
                >
                  {nomeProf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.calendarioCard,
            {
              backgroundColor: tema.bgSurface,
              borderColor: tema.borderSubtle,
              marginBottom: 14 + tema.espacoExtra,
            },
          ]}
        >
          <View style={styles.calendarioHeader}>
            <TouchableOpacity
              onPress={() => mudarMes(-1)}
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Mês anterior"
              style={[
                styles.botaoMes,
                {
                  backgroundColor: tema.bgElevated,
                  minWidth: tema.minTouchHeight,
                  minHeight: tema.minTouchHeight,
                  borderWidth: config.altoContraste ? 1 : 0,
                  borderColor: tema.borderSubtle,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={18} color={tema.textPrimary} />
            </TouchableOpacity>

            <Text
              accessibilityRole="header"
              style={[
                styles.calendarioMesTitulo,
                { color: tema.textPrimary, fontSize: tema.fontSize(16) },
              ]}
            >
              {MESES[mesVisivel.mes]} {mesVisivel.ano}
            </Text>

            <TouchableOpacity
              onPress={() => mudarMes(1)}
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Próximo mês"
              style={[
                styles.botaoMes,
                {
                  backgroundColor: tema.bgElevated,
                  minWidth: tema.minTouchHeight,
                  minHeight: tema.minTouchHeight,
                  borderWidth: config.altoContraste ? 1 : 0,
                  borderColor: tema.borderSubtle,
                },
              ]}
            >
              <Ionicons name="chevron-forward" size={18} color={tema.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarioLinha}>
            {DIAS_SEMANA.map((d) => (
              <View key={d} style={styles.celulaCalendario}>
                <Text
                  style={[
                    styles.cabecalhoSemana,
                    { color: tema.textMuted, fontSize: tema.fontSize(11) },
                  ]}
                >
                  {d}
                </Text>
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
              const descricaoDia = `${diaObj.formatada}${
                diaObj.ehHoje ? ', hoje' : ''
              }${
                qtdMarcacoes > 0
                  ? `, ${qtdMarcacoes} ${qtdMarcacoes === 1 ? 'agendamento' : 'agendamentos'}`
                  : ', sem agendamentos'
              }`;

              return (
                <View key={diaObj.iso} style={styles.celulaCalendario}>
                  <TouchableOpacity
                    onPress={() => setDiaSelecionadoIso(diaObj.iso)}
                    accessibilityRole="button"
                    accessibilityLabel={descricaoDia}
                    accessibilityState={{ selected: selecionado }}
                    style={[
                      styles.cardDia,
                      {
                        backgroundColor: selecionado ? tema.accent : tema.bgElevated,
                        borderColor: selecionado
                          ? tema.accent
                          : diaObj.ehHoje
                          ? tema.accentBorder
                          : config.altoContraste
                          ? tema.borderSubtle
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.diaNumeroTexto,
                        {
                          fontSize: tema.fontSize(13),
                          color: selecionado ? tema.textOnAccent : tema.textPrimary,
                        },
                      ]}
                    >
                      {diaObj.diaNumero}
                    </Text>

                    {qtdMarcacoes > 0 && (
                      <View
                        style={[
                          styles.pontoEvento,
                          {
                            backgroundColor: selecionado
                              ? tema.textOnAccent
                              : tema.accent,
                          },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View
          accessible
          accessibilityLabel={`Resumo do dia ${diaFormatadoExibicao}: ${resumoDiaSelecionado.ativos} ativos de ${resumoDiaSelecionado.total} registros, receita prevista ${formatarMoeda(resumoDiaSelecionado.faturamentoDia)}`}
          style={[
            styles.resumoDiaCard,
            {
              backgroundColor: tema.bgSurface,
              borderColor: tema.accentBorder,
              marginBottom: 12 + tema.espacoExtra,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.resumoDiaTitulo,
                { color: tema.textPrimary, fontSize: tema.fontSize(15) },
              ]}
            >
              {diaFormatadoExibicao}
            </Text>
            {!config.modoCalmo && (
              <Text
                style={[
                  styles.resumoDiaSub,
                  { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                ]}
              >
                {resumoDiaSelecionado.ativos}{' '}
                {resumoDiaSelecionado.ativos === 1 ? 'ativo' : 'ativos'} •{' '}
                {resumoDiaSelecionado.total}{' '}
                {resumoDiaSelecionado.total === 1 ? 'registro' : 'registros'}
              </Text>
            )}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            {!config.modoCalmo && (
              <Text
                style={[
                  styles.resumoDiaValorLabel,
                  { color: tema.textMuted, fontSize: tema.fontSize(11) },
                ]}
              >
                Receita prevista
              </Text>
            )}
            <Text
              style={[
                styles.resumoDiaValor,
                { color: tema.accent, fontSize: tema.fontSize(16) },
              ]}
            >
              {formatarMoeda(resumoDiaSelecionado.faturamentoDia)}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.statusFilterRow,
            { gap: 8 + tema.espacoExtra },
          ]}
        >
          {FILTROS_STATUS.map((f) => {
            const ativo = statusFiltro === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por status ${f.label}`}
                accessibilityState={{ selected: ativo }}
                style={[
                  styles.statusChip,
                  {
                    minHeight: tema.minTouchHeight,
                    justifyContent: 'center',
                    backgroundColor: ativo ? tema.accentSoft : tema.bgElevated,
                    borderColor: ativo ? tema.accentBorder : tema.borderSubtle,
                  },
                ]}
                onPress={() => setStatusFiltro(f.key)}
              >
                <Text
                  style={[
                    styles.statusChipTexto,
                    {
                      fontSize: tema.fontSize(12),
                      color: ativo ? tema.accent : tema.textSecondary,
                      fontWeight: ativo ? 'bold' : '600',
                    },
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
            <ActivityIndicator size="large" color={tema.accent} />
            <Text
              style={[
                styles.estadoTexto,
                { color: tema.textSecondary, fontSize: tema.fontSize(13) },
              ]}
            >
              Sincronizando agenda do salão...
            </Text>
          </View>
        ) : agendamentosFiltrados.length === 0 ? (
          <View style={styles.centro}>
            <Ionicons
              name="calendar-clear-outline"
              size={44}
              color={tema.textMuted}
            />
            <Text
              style={[
                styles.estadoTitulo,
                { color: tema.textPrimary, fontSize: tema.fontSize(16) },
              ]}
            >
              Nenhum atendimento encontrado
            </Text>
            {!config.modoCalmo && (
              <Text
                style={[
                  styles.estadoTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                Sem registros para {diaFormatadoExibicao} com os filtros selecionados.
              </Text>
            )}
          </View>
        ) : (
          <View style={[styles.listaAgendamentos, { gap: 12 + tema.espacoExtra }]}>
            {agendamentosFiltrados.map((item) => {
              const statusNorm = normalizarStatus(item.status);
              const estiloStatus = getEstiloStatus(
                statusNorm,
                tema,
                config.altoContraste
              );
              const encerrado =
                statusNorm === 'concluido' || statusNorm === 'cancelado';
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
                    {
                      backgroundColor:
                        statusNorm === 'cancelado' ? tema.bgDark : tema.bgSurface,
                      borderColor: tema.borderSubtle,
                      opacity:
                        statusNorm === 'cancelado' && !config.altoContraste
                          ? 0.68
                          : 1,
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
                      <Ionicons name="time-outline" size={14} color={tema.accent} />
                      <Text
                        style={[
                          styles.horarioTexto,
                          { color: tema.accent, fontSize: tema.fontSize(13) },
                        ]}
                      >
                        {item.horario || '--:--'}
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
                    {nomeCli}
                  </Text>
                  <Text
                    style={[
                      styles.servicoTexto,
                      { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                    ]}
                  >
                    {nomeServ}
                  </Text>

                  <View style={styles.profLinha}>
                    <Ionicons name="sparkles" size={13} color={tema.accent} />
                    <Text
                      style={[
                        styles.profTexto,
                        { color: tema.accent, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {nomeProf}
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
                        { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                      ]}
                    >
                      {formatarMoeda(item.preco)}
                    </Text>

                    {!encerrado && (
                      <View style={[styles.acoesRow, { gap: 8 + tema.espacoExtra }]}>
                        <TouchableOpacity
                          hitSlop={tema.hitSlopPadrao}
                          accessibilityRole="button"
                          accessibilityLabel={`Concluir agendamento de ${nomeCli} às ${item.horario || ''}`}
                          style={[
                            styles.botaoCheck,
                            {
                              backgroundColor: tema.accent,
                              minWidth: tema.minTouchHeight,
                              minHeight: tema.minTouchHeight,
                            },
                          ]}
                          onPress={() => confirmarAlteracaoStatus(item, 'concluido')}
                          disabled={estaProcessando}
                        >
                          {estaProcessando ? (
                            <ActivityIndicator
                              size="small"
                              color={tema.textOnAccent}
                            />
                          ) : (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={tema.textOnAccent}
                            />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          hitSlop={tema.hitSlopPadrao}
                          accessibilityRole="button"
                          accessibilityLabel={`Cancelar agendamento de ${nomeCli} às ${item.horario || ''}`}
                          style={[
                            styles.botaoCancelar,
                            {
                              backgroundColor: tema.dangerSoft,
                              borderColor: config.altoContraste
                                ? tema.danger
                                : 'rgba(255, 123, 123, 0.35)',
                              minWidth: tema.minTouchHeight,
                              minHeight: tema.minTouchHeight,
                            },
                          ]}
                          onPress={() => confirmarAlteracaoStatus(item, 'cancelado')}
                          disabled={estaProcessando}
                        >
                          <Ionicons name="close" size={18} color={tema.danger} />
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topTitle: {
    fontWeight: 'bold',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hojePill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  hojePillTexto: {
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  secaoLabel: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  chipsRow: {
    paddingBottom: 14,
  },
  chipProf: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipProfTexto: {
    fontWeight: '600',
  },
  calendarioCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  calendarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarioMesTitulo: {
    fontWeight: 'bold',
  },
  botaoMes: {
    width: 32,
    height: 32,
    borderRadius: 9,
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
    fontWeight: '700',
    paddingBottom: 6,
  },
  cardDia: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  diaNumeroTexto: {
    fontWeight: '700',
  },
  pontoEvento: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  resumoDiaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  resumoDiaTitulo: {
    fontWeight: 'bold',
  },
  resumoDiaSub: {
    marginTop: 2,
  },
  resumoDiaValorLabel: {},
  resumoDiaValor: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusFilterRow: {
    paddingBottom: 14,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusChipTexto: {
    fontWeight: '600',
  },
  listaAgendamentos: {},
  cardAgendamento: {
    borderRadius: 16,
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
    marginBottom: 3,
  },
  servicoTexto: {
    marginBottom: 8,
  },
  profLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  profTexto: {
    fontWeight: '600',
  },
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
  acoesRow: {
    flexDirection: 'row',
  },
  botaoCheck: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
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
    fontWeight: 'bold',
  },
  estadoTexto: {
    textAlign: 'center',
  },
});
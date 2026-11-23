import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
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
  accentSoft: 'rgba(255, 152, 185, 0.12)',
  accentBorder: 'rgba(255, 152, 185, 0.35)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D1D1',
  textMuted: '#A0A3A0',
  textOnAccent: '#1E201E',
  success: '#A5D6A7',
  danger: '#FF7B7B',
};

const HORARIOS_PADRAO = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatarMoeda(valor) {
  return `R$ ${(Number(valor) || 0).toFixed(2).replace('.', ',')}`;
}

function chunkArray(arr, size = 10) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function isHorarioPassadoHoje(isoData, horarioStr, agora = new Date()) {
  const mm = String(agora.getMonth() + 1).padStart(2, '0');
  const dd = String(agora.getDate()).padStart(2, '0');
  const hojeIso = `${agora.getFullYear()}-${mm}-${dd}`;

  if (isoData !== hojeIso) return false;

  const [hora, minuto] = horarioStr.split(':').map(Number);
  const slotDate = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
    hora,
    minuto,
    0,
    0
  );

  return slotDate <= agora;
}

function gerarGradeDoMes(ano, mes) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];

  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(ano, mes, d);
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');

    celulas.push({
      iso: `${ano}-${mm}-${dd}`,
      diaNumero: dd,
      diaSemana: DIAS_SEMANA[data.getDay()],
      formatada: `${dd}/${mm}/${ano}`,
      rotuloCompleto: `${DIAS_SEMANA[data.getDay()]}, ${dd}/${mm}`,
      passado: data < hoje,
      ehHoje: data.getTime() === hoje.getTime(),
    });
  }

  while (celulas.length % 7 !== 0) celulas.push(null);
  return celulas;
}

export default function AgendarServicoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const idsParam = typeof params.ids === 'string' ? params.ids : '';
  const idsKey = useMemo(
    () =>
      idsParam
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .join(','),
    [idsParam]
  );

  const hojeRef = useMemo(() => new Date(), []);
  const [mesVisivel, setMesVisivel] = useState({
    ano: hojeRef.getFullYear(),
    mes: hojeRef.getMonth(),
  });

  const gradeDoMes = useMemo(
    () => gerarGradeDoMes(mesVisivel.ano, mesVisivel.mes),
    [mesVisivel]
  );

  const estaNoMesAtual =
    mesVisivel.ano === hojeRef.getFullYear() && mesVisivel.mes === hojeRef.getMonth();

  const [servicosEscolhidos, setServicosEscolhidos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);

  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [horariosOcupados, setHorariosOcupados] = useState([]);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const mudarMes = useCallback((delta) => {
    setMesVisivel((atual) => {
      const nova = new Date(atual.ano, atual.mes + delta, 1);
      return { ano: nova.getFullYear(), mes: nova.getMonth() };
    });
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarDadosIniciais() {
      setCarregandoDados(true);
      try {
        const ids = idsKey ? idsKey.split(',').filter(Boolean) : [];
        let listaServicos = [];

        if (ids.length > 0) {
          const chunks = chunkArray(ids, 10);
          for (const grupoIds of chunks) {
            const qServicos = query(
              collection(db, 'servicos'),
              where(documentId(), 'in', grupoIds)
            );
            const snapServicos = await getDocs(qServicos);
            snapServicos.forEach((docSnap) => {
              listaServicos.push({ id: docSnap.id, ...docSnap.data() });
            });
          }

          const ordemMap = new Map(ids.map((id, idx) => [id, idx]));
          listaServicos.sort(
            (a, b) => (ordemMap.get(a.id) ?? 999) - (ordemMap.get(b.id) ?? 999)
          );
        }

        const qProf = query(
          collection(db, 'usuarios'),
          where('nivelAcesso', '==', 'profissional')
        );
        const snapProf = await getDocs(qProf);
        const listaProf = [];
        snapProf.forEach((docSnap) => {
          listaProf.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (ativo) {
          setServicosEscolhidos(listaServicos);
          setProfissionais(listaProf);
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        if (ativo) {
          Alert.alert('Erro', 'Não foi possível carregar os serviços ou profissionais.');
        }
      } finally {
        if (ativo) setCarregandoDados(false);
      }
    }

    carregarDadosIniciais();
    return () => {
      ativo = false;
    };
  }, [idsKey]);

  const buscarHorariosOcupados = useCallback(async (profId, dataIso) => {
    if (!profId || !dataIso) return [];
    setCarregandoHorarios(true);
    try {
      const qAgendamentos = query(
        collection(db, 'agendamentos'),
        where('profissionalId', '==', profId),
        where('dataAgendamento', '==', dataIso)
      );

      const snapshot = await getDocs(qAgendamentos);
      const ocupados = new Set();

      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();
        if (dados.status !== 'Cancelado' && dados.horario) {
          ocupados.add(dados.horario);
        }
      });

      const listaOcupados = Array.from(ocupados);
      setHorariosOcupados(listaOcupados);
      return listaOcupados;
    } catch (error) {
      console.error('Erro ao buscar horários ocupados:', error);
      Alert.alert('Erro', 'Não foi possível verificar a disponibilidade dos horários.');
      return [];
    } finally {
      setCarregandoHorarios(false);
    }
  }, []);

  function selecionarProfissional(prof) {
    if (profissionalSelecionado?.id === prof.id) return;
    setProfissionalSelecionado(prof);
    setDiaSelecionado(null);
    setHorarioSelecionado(null);
    setHorariosOcupados([]);
  }

  async function abrirModalDoDia(diaObj) {
    if (!profissionalSelecionado) {
      Alert.alert(
        'Escolha o profissional',
        'Selecione primeiro um profissional para ver os horários do dia.'
      );
      return;
    }

    if (diaSelecionado?.iso !== diaObj.iso) {
      setHorarioSelecionado(null);
    }

    setDiaSelecionado(diaObj);
    setModalVisivel(true);
    const ocupadosAtualizados = await buscarHorariosOcupados(
      profissionalSelecionado.id,
      diaObj.iso
    );

    if (
      horarioSelecionado &&
      (ocupadosAtualizados.includes(horarioSelecionado) ||
        isHorarioPassadoHoje(diaObj.iso, horarioSelecionado))
    ) {
      setHorarioSelecionado(null);
    }
  }

  function selecionarHorarioNoModal(horario, indisponivel) {
    if (indisponivel) return;
    setHorarioSelecionado(horario);
    setModalVisivel(false);
  }

  const precoTotal = useMemo(
    () =>
      servicosEscolhidos.reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0),
    [servicosEscolhidos]
  );

  const nomesServicosString = useMemo(
    () => servicosEscolhidos.map((s) => s.nome).filter(Boolean).join(', '),
    [servicosEscolhidos]
  );

  const podeConfirmar =
    servicosEscolhidos.length > 0 &&
    Boolean(profissionalSelecionado) &&
    Boolean(diaSelecionado) &&
    Boolean(horarioSelecionado) &&
    !salvando;

  async function confirmarAgendamento() {
    if (servicosEscolhidos.length === 0) {
      Alert.alert('Atenção', 'Nenhum serviço selecionado.');
      return;
    }
    if (!profissionalSelecionado) {
      Alert.alert('Atenção', 'Por favor, selecione um profissional.');
      return;
    }
    if (!diaSelecionado || !horarioSelecionado) {
      Alert.alert('Atenção', 'Por favor, escolha um dia e um horário disponível.');
      return;
    }
    if (isHorarioPassadoHoje(diaSelecionado.iso, horarioSelecionado)) {
      setHorarioSelecionado(null);
      Alert.alert('Horário expirado', 'Esse horário já passou. Escolha outro horário.');
      return;
    }

    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    setSalvando(true);
    try {
      const qConflito = query(
        collection(db, 'agendamentos'),
        where('profissionalId', '==', profissionalSelecionado.id),
        where('dataAgendamento', '==', diaSelecionado.iso),
        where('horario', '==', horarioSelecionado)
      );
      const snapConflito = await getDocs(qConflito);
      const jaReservado = snapConflito.docs.some(
        (d) => d.data().status !== 'Cancelado'
      );

      if (jaReservado) {
        await buscarHorariosOcupados(profissionalSelecionado.id, diaSelecionado.iso);
        setHorarioSelecionado(null);
        Alert.alert(
          'Horário indisponível',
          'Esse horário acabou de ser reservado por outra pessoa. Escolha outro.'
        );
        return;
      }

      const userDocSnap = await getDoc(doc(db, 'usuarios', usuarioAtual.uid));
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};

      await addDoc(collection(db, 'agendamentos'), {
        clienteId: usuarioAtual.uid,
        clienteNome: userData.nome || 'Cliente',
        clienteEmail: usuarioAtual.email || '',
        clienteFoto: userData.fotoPerfil || '',
        profissionalId: profissionalSelecionado.id,
        profissionalNome: profissionalSelecionado.nome,
        servicoIds: servicosEscolhidos.map((s) => s.id),
        servicoNome: nomesServicosString,
        preco: precoTotal,
        dataAgendamento: diaSelecionado.iso,
        dataFormatada: diaSelecionado.formatada,
        horario: horarioSelecionado,
        status: 'Confirmado',
        dataCriacao: serverTimestamp(),
      });

      Alert.alert(
        'Sucesso',
        `Agendamento confirmado para ${diaSelecionado.formatada} às ${horarioSelecionado}!`,
        [
          {
            text: 'Ver Agendamentos',
            onPress: () => router.replace('/(cliente)/agenda'),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível concluir o agendamento.');
    } finally {
      setSalvando(false);
    }
  }

  const agoraModal = new Date();

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
        <Text style={styles.topTitle}>Concluir Agendamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resumoCard}>
          <Text style={styles.resumoLabel}>
            Serviços Selecionados ({servicosEscolhidos.length})
          </Text>
          <Text style={styles.resumoServico}>
            {nomesServicosString || 'Nenhum serviço'}
          </Text>
          <Text style={styles.resumoPreco}>Total: {formatarMoeda(precoTotal)}</Text>
        </View>

        <Text style={styles.secaoTitulo}>1. Escolha o Profissional</Text>
        {carregandoDados ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 15 }} />
        ) : profissionais.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhum profissional disponível.</Text>
        ) : (
          <View style={styles.gridProfissionais}>
            {profissionais.map((prof) => {
              const selecionado = profissionalSelecionado?.id === prof.id;
              return (
                <TouchableOpacity
                  key={prof.id}
                  style={[
                    styles.cardProfissional,
                    selecionado && styles.cardProfissionalSelecionado,
                  ]}
                  onPress={() => selecionarProfissional(prof)}
                >
                  <Ionicons
                    name={selecionado ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={selecionado ? COLORS.accent : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.nomeProfissional,
                      selecionado && styles.nomeProfissionalSelecionado,
                    ]}
                  >
                    {prof.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.secaoTitulo}>2. Clique no Dia para Ver os Horários</Text>
        <View style={styles.calendarioCard}>
          <View style={styles.calendarioHeader}>
            <TouchableOpacity
              onPress={() => mudarMes(-1)}
              disabled={estaNoMesAtual}
              style={[styles.botaoMes, estaNoMesAtual && styles.botaoMesDesabilitado]}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.calendarioMesTitulo}>
              {MESES[mesVisivel.mes]} {mesVisivel.ano}
            </Text>

            <TouchableOpacity onPress={() => mudarMes(1)} style={styles.botaoMes}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
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
              const ativo = diaSelecionado?.iso === diaObj.iso;
              return (
                <View key={diaObj.iso} style={styles.celulaCalendario}>
                  <TouchableOpacity
                    disabled={diaObj.passado}
                    onPress={() => abrirModalDoDia(diaObj)}
                    style={[
                      styles.cardDia,
                      diaObj.ehHoje && styles.cardDiaHoje,
                      diaObj.passado && styles.cardDiaPassado,
                      ativo && styles.cardDiaSelecionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.diaNumeroTexto,
                        diaObj.passado && styles.diaNumeroPassado,
                        ativo && styles.textoEscuro,
                      ]}
                    >
                      {diaObj.diaNumero}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {diaSelecionado && (
          <TouchableOpacity
            style={styles.resumoSelecaoDataHora}
            onPress={() => abrirModalDoDia(diaSelecionado)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.resumoDataHoraTitulo}>
                Data escolhida: {diaSelecionado.rotuloCompleto} ({diaSelecionado.formatada})
              </Text>
              <Text style={styles.resumoDataHoraSub}>
                {horarioSelecionado
                  ? `Horário selecionado: ${horarioSelecionado}`
                  : 'Toque aqui para escolher um horário disponível'}
              </Text>
            </View>
            <Ionicons name="time-outline" size={22} color={COLORS.accent} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.botaoConfirmar,
            !podeConfirmar && styles.botaoConfirmarDesabilitado,
          ]}
          onPress={confirmarAgendamento}
          disabled={!podeConfirmar}
        >
          {salvando ? (
            <ActivityIndicator color={COLORS.textOnAccent} />
          ) : (
            <Text style={styles.textoBotaoConfirmar}>Confirmar Agendamento</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.modalTitulo}>Horários Disponíveis</Text>
                <Text style={styles.modalSubtitulo}>
                  {profissionalSelecionado?.nome} • {diaSelecionado?.rotuloCompleto} (
                  {diaSelecionado?.formatada})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisivel(false)}
                style={styles.botaoFecharModal}
              >
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {carregandoHorarios ? (
              <ActivityIndicator
                size="large"
                color={COLORS.accent}
                style={{ marginVertical: 30 }}
              />
            ) : (
              <View style={styles.modalGridHorarios}>
                {HORARIOS_PADRAO.map((horario) => {
                  const ocupado = horariosOcupados.includes(horario);
                  const passadoHoje = diaSelecionado
                    ? isHorarioPassadoHoje(diaSelecionado.iso, horario, agoraModal)
                    : false;
                  const indisponivel = ocupado || passadoHoje;
                  const selecionado = horarioSelecionado === horario && !indisponivel;

                  let labelStatus = 'Livre';
                  if (ocupado) labelStatus = 'Ocupado';
                  else if (passadoHoje) labelStatus = 'Encerrado';
                  else if (selecionado) labelStatus = 'Selecionado';

                  return (
                    <TouchableOpacity
                      key={horario}
                      disabled={indisponivel}
                      onPress={() => selecionarHorarioNoModal(horario, indisponivel)}
                      style={[
                        styles.slotHorario,
                        indisponivel && styles.slotOcupado,
                        selecionado && styles.slotSelecionado,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotTexto,
                          indisponivel && styles.slotTextoOcupado,
                          selecionado && styles.slotTextoSelecionado,
                        ]}
                      >
                        {horario}
                      </Text>
                      <Text
                        style={[
                          styles.slotStatus,
                          indisponivel && styles.slotTextoOcupado,
                          selecionado && styles.slotTextoSelecionado,
                        ]}
                      >
                        {labelStatus}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
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
  topTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  backButton: { padding: 4 },
  content: { padding: 20, paddingBottom: 36 },
  resumoCard: {
    backgroundColor: COLORS.bgSurface,
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  resumoLabel: { color: COLORS.textSecondary, fontSize: 12 },
  resumoServico: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  resumoPreco: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  secaoTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 12,
    marginTop: 6,
  },
  textoVazio: { color: COLORS.textSecondary, fontSize: 13, fontStyle: 'italic' },
  gridProfissionais: { gap: 10, marginBottom: 16 },
  cardProfissional: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  cardProfissionalSelecionado: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
  },
  nomeProfissional: { color: COLORS.textPrimary, fontSize: 15 },
  nomeProfissionalSelecionado: { color: COLORS.accent, fontWeight: 'bold' },

  calendarioCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
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
  botaoMes: { backgroundColor: '#4A4E4A', padding: 6, borderRadius: 8 },
  botaoMesDesabilitado: { opacity: 0.3 },
  calendarioLinha: { flexDirection: 'row', flexWrap: 'wrap' },
  celulaCalendario: { width: `${100 / 7}%`, padding: 2, alignItems: 'center' },
  cabecalhoSemana: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    paddingBottom: 4,
  },
  cardDia: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.bgPrimary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardDiaHoje: { borderColor: COLORS.accent },
  cardDiaPassado: { backgroundColor: COLORS.bgDark, opacity: 0.45 },
  cardDiaSelecionado: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  diaNumeroTexto: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  diaNumeroPassado: { color: COLORS.textMuted },
  textoEscuro: { color: COLORS.textOnAccent },

  resumoSelecaoDataHora: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  resumoDataHoraTitulo: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  resumoDataHoraSub: { color: COLORS.accent, fontSize: 12, marginTop: 3 },
  botaoConfirmar: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoConfirmarDesabilitado: { opacity: 0.5 },
  textoBotaoConfirmar: {
    color: COLORS.textOnAccent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitulo: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  modalSubtitulo: { color: COLORS.accent, fontSize: 12, marginTop: 3 },
  botaoFecharModal: {
    backgroundColor: '#4A4E4A',
    padding: 6,
    borderRadius: 8,
  },
  modalGridHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  slotHorario: {
    width: '48%',
    backgroundColor: COLORS.bgSurface,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  slotOcupado: {
    backgroundColor: COLORS.bgDark,
    borderColor: 'rgba(255, 76, 76, 0.25)',
    opacity: 0.55,
  },
  slotSelecionado: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  slotTexto: { color: COLORS.textPrimary, fontSize: 15, fontWeight: 'bold' },
  slotStatus: {
    color: COLORS.success,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },
  slotTextoOcupado: { color: COLORS.danger },
  slotTextoSelecionado: { color: COLORS.textOnAccent },
});
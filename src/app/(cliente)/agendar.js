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
import { useEffect, useMemo, useState } from 'react';
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
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

const HORARIOS_PADRAO = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function gerarProximosDias(quantidade = 28) {
  const dias = [];
  const hoje = new Date();

  for (let i = 0; i < quantidade; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    dias.push({
      iso: `${ano}-${mes}-${dia}`,
      diaNumero: dia,
      diaSemana: DIAS_SEMANA[data.getDay()],
      formatada: `${dia}/${mes}/${ano}`,
      rotuloCompleto: `${DIAS_SEMANA[data.getDay()]}, ${dia}/${mes}`,
    });
  }

  return dias;
}

export default function AgendarServicoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tema, config } = useAcessibilidade();

  const idsParam = params.ids || '';
  const idsArray = useMemo(
    () => (idsParam ? idsParam.split(',').map((id) => id.trim()).filter(Boolean) : []),
    [idsParam]
  );

  const pacoteId = params.pacoteId ? String(params.pacoteId) : '';
  const nomePacoteParam = params.nomePacote ? String(params.nomePacote) : '';
  const precoPacoteParam = Number(params.preco) || 0;
  const isPacoteQuatroSessoes =
    Boolean(pacoteId) &&
    (params.frequenciaSemanal === '1_por_semana' || /4\s*sess/i.test(nomePacoteParam));

  const proximosDias = useMemo(() => gerarProximosDias(28), []);

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

  const datasSemanaisPacote = useMemo(() => {
    if (!diaSelecionado) return [];
    const base = new Date(`${diaSelecionado.iso}T12:00:00`);
    const quantidadeSessoes = isPacoteQuatroSessoes ? 4 : 1;
    const lista = [];

    for (let s = 0; s < quantidadeSessoes; s++) {
      const d = new Date(base);
      d.setDate(base.getDate() + s * 7);
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      lista.push({
        sessaoNumero: s + 1,
        iso: `${ano}-${mes}-${dia}`,
        formatada: `${dia}/${mes}/${ano}`,
        rotulo: `${DIAS_SEMANA[d.getDay()]}, ${dia}/${mes}/${ano}`,
      });
    }

    return lista;
  }, [diaSelecionado, isPacoteQuatroSessoes]);

  useEffect(() => {
    async function carregarDadosIniciais() {
      setCarregandoDados(true);
      try {
        let listaServicos = [];
        if (idsArray.length > 0) {
          const qServicos = query(collection(db, 'servicos'), where(documentId(), 'in', idsArray));
          const snapServicos = await getDocs(qServicos);
          snapServicos.forEach((docSnap) => {
            listaServicos.push({ id: docSnap.id, ...docSnap.data() });
          });
        }
        setServicosEscolhidos(listaServicos);

        const qProf = query(collection(db, 'usuarios'), where('nivelAcesso', '==', 'profissional'));
        const snapProf = await getDocs(qProf);
        const listaProf = [];
        snapProf.forEach((docSnap) => {
          listaProf.push({ id: docSnap.id, ...docSnap.data() });
        });
        setProfissionais(listaProf);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDadosIniciais();
  }, [idsArray]);

  async function buscarHorariosOcupados(profId, dataIso) {
    if (!profId || !dataIso) return;
    setCarregandoHorarios(true);
    try {
      const qAgendamentos = query(
        collection(db, 'agendamentos'),
        where('profissionalId', '==', profId),
        where('dataAgendamento', '==', dataIso)
      );

      const snapshot = await getDocs(qAgendamentos);
      const ocupados = [];

      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();
        if (dados.status !== 'Cancelado' && dados.horario) {
          ocupados.push(dados.horario);
        }
      });

      setHorariosOcupados(ocupados);
    } catch (error) {
      console.error('Erro ao buscar horários ocupados:', error);
      Alert.alert('Erro', 'Não foi possível verificar a disponibilidade dos horários.');
    } finally {
      setCarregandoHorarios(false);
    }
  }

  function selecionarProfissional(prof) {
    setProfissionalSelecionado(prof);
    setDiaSelecionado(null);
    setHorarioSelecionado(null);
    setHorariosOcupados([]);
  }

  async function abrirModalDoDia(diaObj) {
    if (!profissionalSelecionado) {
      Alert.alert('Escolha o profissional', 'Selecione primeiro um profissional para ver os horários do dia.');
      return;
    }

    if (diaSelecionado?.iso !== diaObj.iso) {
      setHorarioSelecionado(null);
    }

    setDiaSelecionado(diaObj);
    setModalVisivel(true);
    await buscarHorariosOcupados(profissionalSelecionado.id, diaObj.iso);
  }

  function selecionarHorarioNoModal(horario) {
    if (horariosOcupados.includes(horario)) return;
    setHorarioSelecionado(horario);
    setModalVisivel(false);
  }

  const precoServicos = servicosEscolhidos.reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);
  const precoTotal = pacoteId ? precoPacoteParam : precoServicos;
  const tituloResumo = pacoteId
    ? nomePacoteParam || 'Pacote Promocional'
    : servicosEscolhidos.map((s) => s.nome).join(', ') || 'Nenhum serviço';

  async function confirmarAgendamento() {
    if (!pacoteId && servicosEscolhidos.length === 0) {
      Alert.alert('Atenção', 'Nenhum serviço ou pacote selecionado.');
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

    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) {
      Alert.alert('Erro', 'Utilizador não autenticado.');
      return;
    }

    setSalvando(true);
    try {
      const datasParaConfirmar = isPacoteQuatroSessoes
        ? datasSemanaisPacote
        : [
            {
              sessaoNumero: 1,
              iso: diaSelecionado.iso,
              formatada: diaSelecionado.formatada,
              rotulo: diaSelecionado.rotuloCompleto,
            },
          ];

      for (const sessaoData of datasParaConfirmar) {
        const qConflito = query(
          collection(db, 'agendamentos'),
          where('profissionalId', '==', profissionalSelecionado.id),
          where('dataAgendamento', '==', sessaoData.iso),
          where('horario', '==', horarioSelecionado)
        );
        const snapConflito = await getDocs(qConflito);
        const jaReservado = snapConflito.docs.some((d) => d.data().status !== 'Cancelado');

        if (jaReservado) {
          await buscarHorariosOcupados(profissionalSelecionado.id, diaSelecionado.iso);
          setHorarioSelecionado(null);
          Alert.alert(
            'Horário indisponível',
            `O horário ${horarioSelecionado} em ${sessaoData.formatada} já está ocupado. Escolha outro.`
          );
          return;
        }
      }

      const userDocSnap = await getDoc(doc(db, 'usuarios', usuarioAtual.uid));
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};

      const valorPorAgendamento =
        datasParaConfirmar.length > 1
          ? Number((precoTotal / datasParaConfirmar.length).toFixed(2))
          : precoTotal;

      for (const sessaoData of datasParaConfirmar) {
        const nomeRotulo = isPacoteQuatroSessoes
          ? `${tituloResumo} (Sessão ${sessaoData.sessaoNumero}/4 - 1x/semana)`
          : tituloResumo;

        await addDoc(collection(db, 'agendamentos'), {
          clienteId: usuarioAtual.uid,
          clienteNome: userData.nome || 'Cliente',
          clienteEmail: usuarioAtual.email || '',
          clienteFoto: userData.fotoPerfil || '',
          profissionalId: profissionalSelecionado.id,
          profissionalNome: profissionalSelecionado.nome,
          servicoNome: nomeRotulo,
          pacoteId: pacoteId || null,
          sessaoNumero: sessaoData.sessaoNumero,
          totalSessoes: datasParaConfirmar.length,
          frequencia: isPacoteQuatroSessoes ? 'semanal' : 'unica',
          preco: valorPorAgendamento,
          dataAgendamento: sessaoData.iso,
          dataFormatada: sessaoData.formatada,
          horario: horarioSelecionado,
          status: 'Confirmado',
          dataCriacao: serverTimestamp(),
        });
      }

      const mensagemSucesso = isPacoteQuatroSessoes
        ? `Pacote confirmado! As 4 sessões foram agendadas para 1x por semana às ${horarioSelecionado}, começando em ${diaSelecionado.formatada}.`
        : `Agendamento confirmado para ${diaSelecionado.formatada} às ${horarioSelecionado}!`;

      Alert.alert('Sucesso', mensagemSucesso, [
        { text: 'Ver Agendamentos', onPress: () => router.replace('/(cliente)/agenda') },
      ]);
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível concluir o agendamento.');
    } finally {
      setSalvando(false);
    }
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
          Concluir Agendamento
        </Text>
        <View style={{ width: Math.max(24, tema.minTouchHeight) }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 88 + tema.espacoExtra },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessible
          accessibilityLabel={`${pacoteId ? 'Pacote Selecionado' : 'Serviços Selecionados'}: ${tituloResumo}. Total: R$ ${precoTotal.toFixed(2).replace('.', ',')}`}
          style={[
            styles.resumoCard,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              marginBottom: 20 + tema.espacoExtra,
            },
          ]}
        >
          <Text
            style={[
              styles.resumoLabel,
              { color: tema.textSecondary, fontSize: tema.fontSize(12) },
            ]}
          >
            {pacoteId
              ? 'Pacote Selecionado'
              : `Serviços Selecionados (${servicosEscolhidos.length})`}
          </Text>
          <Text
            style={[
              styles.resumoServico,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
          >
            {tituloResumo}
          </Text>
          {isPacoteQuatroSessoes && (
            <Text
              style={[
                styles.regraPacoteBadge,
                { color: tema.accent, fontSize: tema.fontSize(12) },
              ]}
            >
              Regra do pacote: 4 sessões, sendo 1 sessão por semana no mesmo dia e horário.
            </Text>
          )}
          <Text
            style={[
              styles.resumoPreco,
              { color: tema.accent, fontSize: tema.fontSize(16) },
            ]}
          >
            Total: R$ {precoTotal.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <Text
          accessibilityRole="header"
          style={[
            styles.secaoTitulo,
            { color: tema.accent, fontSize: tema.fontSize(15) },
          ]}
        >
          1. Escolha o Profissional
        </Text>
        {carregandoDados ? (
          <ActivityIndicator color={tema.accent} style={{ marginVertical: 15 }} />
        ) : profissionais.length === 0 ? (
          <Text
            style={[
              styles.textoVazio,
              { color: tema.textSecondary, fontSize: tema.fontSize(13) },
            ]}
          >
            Nenhum profissional disponível.
          </Text>
        ) : (
          <View
            style={[
              styles.gridProfissionais,
              { gap: 10 + tema.espacoExtra, marginBottom: 16 + tema.espacoExtra },
            ]}
          >
            {profissionais.map((prof) => {
              const selecionado = profissionalSelecionado?.id === prof.id;
              return (
                <TouchableOpacity
                  key={prof.id}
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Profissional ${prof.nome}`}
                  accessibilityState={{ selected: selecionado }}
                  style={[
                    styles.cardProfissional,
                    {
                      backgroundColor: selecionado ? tema.accentSoft : tema.bgSurface,
                      borderColor: selecionado
                        ? tema.accent
                        : config.altoContraste
                          ? tema.borderSubtle
                          : 'rgba(255,255,255,0.05)',
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                  onPress={() => selecionarProfissional(prof)}
                >
                  <Ionicons
                    name={selecionado ? 'checkbox-outline' : 'square-outline'}
                    size={20}
                    color={selecionado ? tema.accent : tema.textMuted}
                    accessible={false}
                  />
                  <Text
                    style={[
                      styles.nomeProfissional,
                      {
                        color: selecionado ? tema.accent : tema.textPrimary,
                        fontSize: tema.fontSize(15),
                        fontWeight: selecionado ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {prof.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text
          accessibilityRole="header"
          style={[
            styles.secaoTitulo,
            { color: tema.accent, fontSize: tema.fontSize(15) },
          ]}
        >
          {isPacoteQuatroSessoes
            ? '2. Escolha o Dia Inicial (1 sessão por semana)'
            : '2. Clique no Dia para Ver os Horários'}
        </Text>
        <View
          style={[
            styles.gridDias,
            { gap: 8 + tema.espacoExtra, marginBottom: 16 + tema.espacoExtra },
          ]}
        >
          {proximosDias.map((diaObj) => {
            const ativo = diaSelecionado?.iso === diaObj.iso;
            return (
              <TouchableOpacity
                key={diaObj.iso}
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel={diaObj.rotuloCompleto}
                accessibilityState={{ selected: ativo }}
                style={[
                  styles.cardDia,
                  {
                    backgroundColor: ativo ? tema.accent : tema.bgSurface,
                    borderColor: ativo
                      ? tema.accent
                      : config.altoContraste
                        ? tema.borderSubtle
                        : 'rgba(255,255,255,0.06)',
                    minHeight: tema.minTouchHeight,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => abrirModalDoDia(diaObj)}
              >
                <Text
                  style={[
                    styles.diaSemanaTexto,
                    {
                      color: ativo ? tema.textOnAccent : tema.textSecondary,
                      fontSize: tema.fontSize(11),
                    },
                  ]}
                >
                  {diaObj.diaSemana}
                </Text>
                <Text
                  style={[
                    styles.diaNumeroTexto,
                    {
                      color: ativo ? tema.textOnAccent : tema.textPrimary,
                      fontSize: tema.fontSize(15),
                    },
                  ]}
                >
                  {diaObj.diaNumero}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {diaSelecionado && (
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel={`Data escolhida: ${diaSelecionado.rotuloCompleto}. ${
              horarioSelecionado
                ? `Horário selecionado: ${horarioSelecionado}. Toque para alterar`
                : 'Toque aqui para escolher um horário disponível'
            }`}
            style={[
              styles.resumoSelecaoDataHora,
              {
                backgroundColor: tema.bgElevated,
                borderColor: tema.accentBorder,
                minHeight: tema.minTouchHeight,
                marginBottom: 22 + tema.espacoExtra,
              },
            ]}
            onPress={() => abrirModalDoDia(diaSelecionado)}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={[
                  styles.resumoDataHoraTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(13) },
                ]}
              >
                Data escolhida: {diaSelecionado.rotuloCompleto} ({diaSelecionado.formatada})
              </Text>
              <Text
                style={[
                  styles.resumoDataHoraSub,
                  { color: tema.accent, fontSize: tema.fontSize(12) },
                ]}
              >
                {horarioSelecionado
                  ? `Horário selecionado: ${horarioSelecionado}`
                  : 'Toque aqui para escolher um horário disponível'}
              </Text>
              {isPacoteQuatroSessoes && (
                <Text
                  style={[
                    styles.resumoDataHoraSub,
                    { color: tema.textSecondary, fontSize: tema.fontSize(11) },
                  ]}
                >
                  Sessões semanais:{' '}
                  {datasSemanaisPacote.map((s) => `${s.sessaoNumero}ª (${s.formatada})`).join(' • ')}
                </Text>
              )}
            </View>
            <Ionicons name="time-outline" size={22} color={tema.accent} accessible={false} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel={
            salvando
              ? isPacoteQuatroSessoes
                ? 'Confirmando compra e agendamento do pacote'
                : 'Confirmando agendamento'
              : isPacoteQuatroSessoes
                ? 'Confirmar Compra e Agendamento'
                : 'Confirmar Agendamento'
          }
          accessibilityState={{ disabled: salvando, busy: salvando }}
          style={[
            styles.botaoConfirmar,
            {
              backgroundColor: tema.accent,
              minHeight: tema.minTouchHeight,
              justifyContent: 'center',
            },
            salvando && { opacity: 0.6 },
          ]}
          onPress={confirmarAgendamento}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color={tema.textOnAccent} />
          ) : (
            <Text
              style={[
                styles.textoBotaoConfirmar,
                { color: tema.textOnAccent, fontSize: tema.fontSize(16) },
              ]}
            >
              {isPacoteQuatroSessoes ? 'Confirmar Compra e Agendar' : 'Confirmar Agendamento'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        accessibilityViewIsModal
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: tema.bgElevated,
                borderColor: tema.accentBorder,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.modalTitulo,
                    { color: tema.textPrimary, fontSize: tema.fontSize(18) },
                  ]}
                >
                  Horários Disponíveis
                </Text>
                <Text
                  style={[
                    styles.modalSubtitulo,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  {profissionalSelecionado?.nome} • {diaSelecionado?.rotuloCompleto} ({diaSelecionado?.formatada})
                </Text>
              </View>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Fechar janela de horários"
                onPress={() => setModalVisivel(false)}
                style={[
                  styles.botaoFecharModal,
                  {
                    backgroundColor: tema.bgSurface,
                    minWidth: tema.minTouchHeight,
                    minHeight: tema.minTouchHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Ionicons name="close" size={22} color={tema.textPrimary} />
              </TouchableOpacity>
            </View>

            {carregandoHorarios ? (
              <ActivityIndicator
                size="large"
                color={tema.accent}
                accessibilityLabel="Carregando horários disponíveis"
                style={{ marginVertical: 30 }}
              />
            ) : (
              <View
                style={[
                  styles.modalGridHorarios,
                  { gap: 10 + tema.espacoExtra },
                ]}
              >
                {HORARIOS_PADRAO.map((horario) => {
                  const ocupado = horariosOcupados.includes(horario);
                  const selecionado = horarioSelecionado === horario && !ocupado;
                  const statusTexto = ocupado ? 'Ocupado' : selecionado ? 'Selecionado' : 'Livre';

                  return (
                    <TouchableOpacity
                      key={horario}
                      hitSlop={tema.hitSlopPadrao}
                      accessibilityRole="button"
                      accessibilityLabel={`Horário ${horario}, ${statusTexto}`}
                      accessibilityState={{ disabled: ocupado, selected: selecionado }}
                      disabled={ocupado}
                      onPress={() => selecionarHorarioNoModal(horario)}
                      style={[
                        styles.slotHorario,
                        {
                          backgroundColor: tema.bgSurface,
                          borderColor: config.altoContraste
                            ? tema.accentBorder
                            : tema.borderSubtle,
                          minHeight: tema.minTouchHeight,
                        },
                        ocupado && {
                          backgroundColor: tema.bgPrimary,
                          borderColor: tema.danger,
                          opacity: 0.55,
                        },
                        selecionado && {
                          backgroundColor: tema.accent,
                          borderColor: tema.accent,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotTexto,
                          {
                            color: selecionado
                              ? tema.textOnAccent
                              : ocupado
                                ? tema.danger
                                : tema.textPrimary,
                            fontSize: tema.fontSize(15),
                          },
                        ]}
                      >
                        {horario}
                      </Text>
                      <Text
                        style={[
                          styles.slotStatus,
                          {
                            color: selecionado
                              ? tema.textOnAccent
                              : ocupado
                                ? tema.danger
                                : tema.success,
                            fontSize: tema.fontSize(11),
                          },
                        ]}
                      >
                        {statusTexto}
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
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topTitle: { fontWeight: 'bold' },
  backButton: { padding: 4 },
  content: { padding: 20 },
  resumoCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  resumoLabel: {},
  resumoServico: { fontWeight: 'bold', marginTop: 4 },
  regraPacoteBadge: { fontWeight: '600', marginTop: 6 },
  resumoPreco: { fontWeight: 'bold', marginTop: 8 },
  secaoTitulo: { fontWeight: 'bold', marginBottom: 12, marginTop: 6 },
  textoVazio: { fontStyle: 'italic' },
  gridProfissionais: {},
  cardProfissional: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  nomeProfissional: {},
  gridDias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardDia: {
    width: '18.5%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  diaSemanaTexto: { fontWeight: '600' },
  diaNumeroTexto: { fontWeight: 'bold', marginTop: 2 },
  resumoSelecaoDataHora: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumoDataHoraTitulo: { fontWeight: 'bold' },
  resumoDataHoraSub: { marginTop: 3 },
  botaoConfirmar: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotaoConfirmar: { fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitulo: { fontWeight: 'bold' },
  modalSubtitulo: { marginTop: 3 },
  botaoFecharModal: {
    padding: 6,
    borderRadius: 8,
  },
  modalGridHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotHorario: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  slotTexto: { fontWeight: 'bold' },
  slotStatus: { marginTop: 3, fontWeight: '600' },
});
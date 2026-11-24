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

function gerarProximosDias(quantidade = 14) {
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

  const proximosDias = useMemo(() => gerarProximosDias(14), []);

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

  const precoTotal = servicosEscolhidos.reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);
  const nomesServicosString = servicosEscolhidos.map((s) => s.nome).join(', ');
  const larguraDia = config.tamanhoFonte >= 1.15 || config.espacamentoAmplo ? '22.5%' : '18.5%';

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

    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) {
      Alert.alert('Erro', 'Utilizador não autenticado.');
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
      const jaReservado = snapConflito.docs.some((d) => d.data().status !== 'Cancelado');

      if (jaReservado) {
        await buscarHorariosOcupados(profissionalSelecionado.id, diaSelecionado.iso);
        setHorarioSelecionado(null);
        Alert.alert('Horário indisponível', 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro.');
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
        servicoNome: nomesServicosString,
        preco: precoTotal,
        dataAgendamento: diaSelecionado.iso,
        dataFormatada: diaSelecionado.formatada,
        horario: horarioSelecionado,
        status: 'Confirmado',
        dataCriacao: serverTimestamp(),
      });

      Alert.alert('Sucesso', `Agendamento confirmado para ${diaSelecionado.formatada} às ${horarioSelecionado}!`, [
        { text: 'Ver Agendamentos', onPress: () => router.replace('/(profissional)/agenda') },
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
          accessibilityLabel={`Serviços Selecionados (${servicosEscolhidos.length}): ${nomesServicosString || 'Nenhum serviço'}. Total: R$ ${precoTotal.toFixed(2).replace('.', ',')}`}
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
            Serviços Selecionados ({servicosEscolhidos.length})
          </Text>
          <Text
            style={[
              styles.resumoServico,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
          >
            {nomesServicosString || 'Nenhum serviço'}
          </Text>
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
          2. Clique no Dia para Ver os Horários
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
                    width: larguraDia,
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
            accessibilityLabel={`Data escolhida: ${diaSelecionado.rotuloCompleto}. ${horarioSelecionado ? `Horário selecionado: ${horarioSelecionado}. Toque para alterar` : 'Toque aqui para escolher um horário disponível'}`}
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
            <View style={{ flex: 1 }}>
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
            </View>
            <Ionicons name="time-outline" size={22} color={tema.accent} accessible={false} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel={salvando ? 'Confirmando agendamento' : 'Confirmar Agendamento'}
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
              Confirmar Agendamento
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
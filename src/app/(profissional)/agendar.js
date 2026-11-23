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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Concluir Agendamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoLabel}>Serviços Selecionados ({servicosEscolhidos.length})</Text>
          <Text style={styles.resumoServico}>{nomesServicosString || 'Nenhum serviço'}</Text>
          <Text style={styles.resumoPreco}>Total: R$ {precoTotal.toFixed(2).replace('.', ',')}</Text>
        </View>

        <Text style={styles.secaoTitulo}>1. Escolha o Profissional</Text>
        {carregandoDados ? (
          <ActivityIndicator color="#FF98B9" style={{ marginVertical: 15 }} />
        ) : profissionais.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhum profissional disponível.</Text>
        ) : (
          <View style={styles.gridProfissionais}>
            {profissionais.map((prof) => {
              const selecionado = profissionalSelecionado?.id === prof.id;
              return (
                <TouchableOpacity
                  key={prof.id}
                  style={[styles.cardProfissional, selecionado && styles.cardProfissionalSelecionado]}
                  onPress={() => selecionarProfissional(prof)}
                >
                  <Ionicons
                    name={selecionado ? 'checkbox-outline' : 'square-outline'}
                    size={20}
                    color={selecionado ? '#FF98B9' : '#A0A3A0'}
                  />
                  <Text style={[styles.nomeProfissional, selecionado && { color: '#FF98B9', fontWeight: 'bold' }]}>
                    {prof.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.secaoTitulo}>2. Clique no Dia para Ver os Horários</Text>
        <View style={styles.gridDias}>
          {proximosDias.map((diaObj) => {
            const ativo = diaSelecionado?.iso === diaObj.iso;
            return (
              <TouchableOpacity
                key={diaObj.iso}
                style={[styles.cardDia, ativo && styles.cardDiaSelecionado]}
                onPress={() => abrirModalDoDia(diaObj)}
              >
                <Text style={[styles.diaSemanaTexto, ativo && styles.textoEscuro]}>{diaObj.diaSemana}</Text>
                <Text style={[styles.diaNumeroTexto, ativo && styles.textoEscuro]}>{diaObj.diaNumero}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {diaSelecionado && (
          <TouchableOpacity style={styles.resumoSelecaoDataHora} onPress={() => abrirModalDoDia(diaSelecionado)}>
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
            <Ionicons name="time-outline" size={22} color="#FF98B9" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.botaoConfirmar, salvando && { opacity: 0.6 }]}
          onPress={confirmarAgendamento}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#1E201E" />
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
                  {profissionalSelecionado?.nome} • {diaSelecionado?.rotuloCompleto} ({diaSelecionado?.formatada})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisivel(false)} style={styles.botaoFecharModal}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {carregandoHorarios ? (
              <ActivityIndicator size="large" color="#FF98B9" style={{ marginVertical: 30 }} />
            ) : (
              <View style={styles.modalGridHorarios}>
                {HORARIOS_PADRAO.map((horario) => {
                  const ocupado = horariosOcupados.includes(horario);
                  const selecionado = horarioSelecionado === horario && !ocupado;

                  return (
                    <TouchableOpacity
                      key={horario}
                      disabled={ocupado}
                      onPress={() => selecionarHorarioNoModal(horario)}
                      style={[
                        styles.slotHorario,
                        ocupado && styles.slotOcupado,
                        selecionado && styles.slotSelecionado,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotTexto,
                          ocupado && styles.slotTextoOcupado,
                          selecionado && styles.slotTextoSelecionado,
                        ]}
                      >
                        {horario}
                      </Text>
                      <Text
                        style={[
                          styles.slotStatus,
                          ocupado && styles.slotTextoOcupado,
                          selecionado && styles.slotTextoSelecionado,
                        ]}
                      >
                        {ocupado ? 'Ocupado' : selecionado ? 'Selecionado' : 'Livre'}
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
  container: { flex: 1, backgroundColor: '#434643' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#595959',
    borderBottomWidth: 1,
    borderBottomColor: '#6B6E6B',
  },
  topTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  backButton: { padding: 4 },
  content: { padding: 20, paddingBottom: 36 },
  resumoCard: {
    backgroundColor: '#595959',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resumoLabel: { color: '#D1D1D1', fontSize: 12 },
  resumoServico: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  resumoPreco: { color: '#FF98B9', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  secaoTitulo: { fontSize: 15, fontWeight: 'bold', color: '#FF98B9', marginBottom: 12, marginTop: 6 },
  textoVazio: { color: '#D1D1D1', fontSize: 13, fontStyle: 'italic' },
  gridProfissionais: { gap: 10, marginBottom: 16 },
  cardProfissional: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#595959',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  cardProfissionalSelecionado: { borderColor: '#FF98B9', backgroundColor: 'rgba(255, 152, 185, 0.12)' },
  nomeProfissional: { color: '#FFF', fontSize: 15 },
  gridDias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  cardDia: {
    width: '18.5%',
    backgroundColor: '#595959',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardDiaSelecionado: {
    backgroundColor: '#FF98B9',
    borderColor: '#FF98B9',
  },
  diaSemanaTexto: { color: '#D1D1D1', fontSize: 11, fontWeight: '600' },
  diaNumeroTexto: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  textoEscuro: { color: '#1E201E' },
  resumoSelecaoDataHora: {
    backgroundColor: '#383B38',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 185, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  resumoDataHoraTitulo: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  resumoDataHoraSub: { color: '#FF98B9', fontSize: 12, marginTop: 3 },
  botaoConfirmar: {
    backgroundColor: '#FF98B9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotaoConfirmar: { color: '#1E201E', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#383B38',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 185, 0.35)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitulo: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalSubtitulo: { color: '#FF98B9', fontSize: 12, marginTop: 3 },
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
    backgroundColor: '#595959',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  slotOcupado: {
    backgroundColor: '#2B2D2B',
    borderColor: 'rgba(255, 76, 76, 0.25)',
    opacity: 0.55,
  },
  slotSelecionado: {
    backgroundColor: '#FF98B9',
    borderColor: '#FF98B9',
  },
  slotTexto: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  slotStatus: { color: '#A5D6A7', fontSize: 11, marginTop: 3, fontWeight: '600' },
  slotTextoOcupado: { color: '#FF7B7B' },
  slotTextoSelecionado: { color: '#1E201E' },
});
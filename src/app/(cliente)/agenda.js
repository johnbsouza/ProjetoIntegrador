import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function ClienteAgendaScreen() {
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const horariosPorDia = {
    1: ['09:00', '10:00', '14:00', '16:00'],
    2: ['09:30', '11:00', '14:30', '16:30'],
    3: ['10:00', '13:00', '15:00', '17:00'],
    4: ['09:00', '11:30', '16:00', '18:00'],
    5: ['10:30', '14:00', '17:00', '19:00'],
    6: ['09:00', '13:30', '15:30', '17:30'],
  };

  const anoAtual = 2026;
  const mesAtual = 9; // Outubro (0-11)
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();

  const calendario = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      carregarDadosIniciais(user);
    });
    return () => unsubscribe();
  }, []);

  async function carregarDadosIniciais(userAtual) {
    setCarregando(true);
    try {
      const qProf = query(collection(db, 'usuarios'), where('nivelAcesso', '==', 'profissional'));
      const snapProf = await getDocs(qProf);
      const listaProf = [];
      snapProf.forEach((docSnap) => {
        listaProf.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (listaProf.length > 0) {
        setProfissionais(listaProf);
        setProfissionalSelecionado(listaProf[0]);
      } else {
        const profPadrao = { id: 'prof_default', nome: 'Ana' };
        setProfissionais([profPadrao]);
        setProfissionalSelecionado(profPadrao);
      }

      await carregarAgendamentosCliente(userAtual);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      const profPadrao = { id: 'prof_default', nome: 'Ana' };
      setProfissionais([profPadrao]);
      setProfissionalSelecionado(profPadrao);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarAgendamentosCliente(userAtual) {
    try {
      const uid = userAtual ? userAtual.uid : auth.currentUser?.uid || 'anonimo';
      const qAgend = query(
        collection(db, 'agendamentos'),
        where('idCliente', '==', uid)
      );
      const snapAgend = await getDocs(qAgend);
      const listaAgend = [];
      snapAgend.forEach((docSnap) => {
        listaAgend.push({ id: docSnap.id, ...docSnap.data() });
      });

      listaAgend.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
      setAgendamentos(listaAgend);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  }

  const pegarHorarios = (dia) => {
    if (!dia) return [];
    const dataObj = new Date(anoAtual, mesAtual, dia);
    return horariosPorDia[dataObj.getDay()] || [];
  };

  async function agendar() {
    if (!diaSelecionado || !horarioSelecionado || !profissionalSelecionado) {
      Alert.alert('Atenção', 'Selecione o profissional, o dia e o horário.');
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      const dataFormatada = `${anoAtual}-10-${String(diaSelecionado).padStart(2, '0')}`;

      // Busca dados atualizados do cliente (nome e foto) para guardar no agendamento
      let nomeCliente = user?.displayName || user?.email || 'Cliente';
      let fotoCliente = '';

      if (user) {
        const docUser = await getDoc(doc(db, 'usuarios', user.uid));
        if (docUser.exists()) {
          nomeCliente = docUser.data().nome || nomeCliente;
          fotoCliente = docUser.data().fotoPerfil || '';
        }
      }

      await addDoc(collection(db, 'agendamentos'), {
        idCliente: user ? user.uid : 'anonimo',
        nomeCliente: nomeCliente,
        fotoCliente: fotoCliente,
        idProfissional: profissionalSelecionado.id,
        nomeProfissional: profissionalSelecionado.nome || 'Profissional',
        servicoId: 'servico_geral',
        nomeServico: 'Atendimento Personalizado',
        preco: 55.00,
        data: dataFormatada,
        horario: horarioSelecionado,
        status: 'confirmado',
        criadoEm: serverTimestamp(),
      });

      Alert.alert('Sucesso!', `Agendado com ${profissionalSelecionado.nome} para o dia ${diaSelecionado}/10/${anoAtual} às ${horarioSelecionado}`);
      setHorarioSelecionado(null);
      setDiaSelecionado(null);

      await carregarAgendamentosCliente(user);
    } catch (error) {
      console.error('Erro ao agendar:', error);
      Alert.alert('Erro', 'Não foi possível concluir o agendamento.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleCancelar(idAgendamento) {
    Alert.alert('Cancelar Agendamento', 'Deseja realmente cancelar este horário?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, Cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'agendamentos', idAgendamento), {
              status: 'cancelado',
            });
            await carregarAgendamentosCliente(auth.currentUser);
          } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.title}>Novo Agendamento</Text>
          <Text style={styles.subtitle}>Selecione o profissional, a data e o horário</Text>

          {/* SELEÇÃO DE PROFISSIONAL COM FOTO */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Profissional</Text>
            <View style={styles.profissionaisRow}>
              {profissionais.map((item) => {
                const ativo = profissionalSelecionado?.id === item.id;
                const nomeExibicao = item.nome || 'Profissional';
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => { setProfissionalSelecionado(item); setDiaSelecionado(null); setHorarioSelecionado(null); }}
                    style={[styles.profissionalCard, ativo && styles.profissionalAtivo]}
                  >
                    <View style={[styles.avatar, ativo && styles.avatarAtivo, { overflow: 'hidden' }]}>
                      {item.fotoPerfil ? (
                        <Image source={{ uri: item.fotoPerfil }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Text style={[styles.avatarTexto, ativo && styles.avatarTextoAtivo]}>{nomeExibicao.charAt(0)}</Text>
                      )}
                    </View>
                    <Text style={[styles.profissionalTexto, ativo && styles.profissionalTextoAtivo]}>{nomeExibicao}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* CALENDÁRIO */}
          <View style={styles.card}>
            <View style={styles.cabecalhoMes}>
              <Text style={styles.nomeMes}>Outubro de 2026</Text>
            </View>

            <View style={styles.semanaRow}>
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d) => (
                <Text key={d} style={styles.diaSemanaText}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarioGrid}>
              {calendario.map((dia, index) => {
                const selecionado = dia === diaSelecionado;
                const horarios = pegarHorarios(dia);
                const disponivel = horarios.length > 0 && dia;

                return (
                  <Pressable
                    key={index}
                    disabled={!disponivel}
                    onPress={() => { setDiaSelecionado(dia); setHorarioSelecionado(null); }}
                    style={[
                      styles.celulaDia,
                      !dia && styles.celulaVazia,
                      selecionado && styles.celulaSelecionada,
                    ]}
                  >
                    {dia && (
                      <Text style={[styles.numeroDia, selecionado && styles.numeroDiaSelecionado]}>
                        {dia}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* HORÁRIOS DISPONÍVEIS */}
          {diaSelecionado && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Horários para o dia {diaSelecionado} ({profissionalSelecionado?.nome})</Text>
              <View style={styles.horariosGrid}>
                {pegarHorarios(diaSelecionado).map((horario) => {
                  const ativo = horarioSelecionado === horario;
                  return (
                    <Pressable
                      key={horario}
                      onPress={() => setHorarioSelecionado(horario)}
                      style={[styles.horarioChip, ativo && styles.horarioChipAtivo]}
                    >
                      <Text style={[styles.horarioChipTexto, ativo && styles.horarioChipTextoAtivo]}>{horario}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* BOTÃO DE CONFIRMAR */}
          {diaSelecionado && horarioSelecionado && (
            <Pressable style={[styles.botaoConfirmar, salvando && { opacity: 0.6 }]} onPress={agendar} disabled={salvando}>
              {salvando ? (
                <ActivityIndicator color="#434643" />
              ) : (
                <Text style={styles.textoBotaoConfirmar}>Confirmar para às {horarioSelecionado}</Text>
              )}
            </Pressable>
          )}

          {/* MEUS AGENDAMENTOS */}
          <Text style={[styles.title, { marginTop: 25 }]}>Meus Agendamentos</Text>
          <Text style={styles.subtitle}>Acompanhe seus horários marcados</Text>

          {agendamentos.length === 0 ? (
            <Text style={{ color: '#D1D1D1', textAlign: 'center', marginVertical: 15 }}>Sem agendamentos registrados.</Text>
          ) : (
            agendamentos.map((item) => {
              const isCancelado = item.status === 'cancelado';
              const isConcluido = item.status === 'concluido';

              return (
                <View key={item.id} style={[styles.card, (isCancelado || isConcluido) && { opacity: 0.5 }]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.horarioText}>{item.data} às {item.horario}</Text>
                    <Text style={[styles.statusText, { color: isCancelado ? '#FF5252' : isConcluido ? '#4CAF50' : '#FF98B9' }]}>
                      {(item.status || 'Confirmado').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.servicoNome}>{item.nomeServico || item.servico}</Text>
                  <Text style={styles.profissionalSubtext}>Profissional: {item.nomeProfissional || item.profissional}</Text>
                  
                  {!isCancelado && !isConcluido && (
                    <Pressable 
                      style={{ marginTop: 10, alignSelf: 'flex-end' }}
                      onPress={() => handleCancelar(item.id)}
                    >
                      <Text style={{ color: '#FF5252', fontSize: 12, fontWeight: 'bold' }}>Cancelar Reserva</Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FF98B9', marginBottom: 2, paddingTop: 5, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#D1D1D1', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
  profissionaisRow: { flexDirection: 'row', gap: 10 },
  profissionalCard: { flex: 1, backgroundColor: '#595959', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#6B6E6B' },
  profissionalAtivo: { borderColor: '#FF98B9', backgroundColor: '#4E514E' },
  profissionalTexto: { fontSize: 13, fontWeight: 'bold', color: '#D1D1D1', marginTop: 4 },
  profissionalTextoAtivo: { color: '#FF98B9' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6B6E6B', alignItems: 'center', justifyContent: 'center' },
  avatarAtivo: { backgroundColor: '#FF98B9' },
  avatarTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  avatarTextoAtivo: { color: '#434643' },
  card: { backgroundColor: '#595959', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#6B6E6B' },
  cabecalhoMes: { alignItems: 'center', marginBottom: 12 },
  nomeMes: { fontSize: 16, fontWeight: 'bold', color: '#FF98B9' },
  semanaRow: { flexDirection: 'row', marginBottom: 6 },
  diaSemanaText: { width: '14.2857%', textAlign: 'center', color: '#D1D1D1', fontSize: 10, fontWeight: 'bold' },
  calendarioGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  celulaDia: { width: '14.2857%', height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  celulaVazia: { backgroundColor: 'transparent' },
  celulaSelecionada: { backgroundColor: '#FF98B9' },
  numeroDia: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  numeroDiaSelecionado: { color: '#434643', fontWeight: 'bold' },
  horariosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  horarioChip: { backgroundColor: '#434643', borderWidth: 1, borderColor: '#6B6E6B', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  horarioChipAtivo: { backgroundColor: '#FF98B9', borderColor: '#FF98B9' },
  horarioChipTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  horarioChipTextoAtivo: { color: '#434643' },
  botaoConfirmar: { backgroundColor: '#FF98B9', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  textoBotaoConfirmar: { color: '#434643', fontSize: 15, fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  horarioText: { fontSize: 12, fontWeight: 'bold', color: '#D1D1D1' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  servicoNome: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  profissionalSubtext: { fontSize: 12, color: '#D1D1D1', marginTop: 4 },
});
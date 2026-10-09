import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteAgendaScreen() {
  const [profissional, setProfissional] = useState('Ana');
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      servico: 'Spa dos Pés',
      profissional: 'Ana',
      data: '08/10/2026',
      horario: '14:30',
      status: 'Confirmado',
    },
    {
      id: 2,
      servico: 'Manicure Clássica',
      profissional: 'Carlos',
      data: '20/09/2026',
      horario: '10:00',
      status: 'Concluído',
    },
  ]);

  const profissionais = ['Ana', 'Carlos', 'Marina'];

  // Horários disponíveis por dia da semana (0=Dom, 1=Seg, ..., 6=Sáb)
  const horariosPorDia = {
    1: ['09:00', '10:00', '14:00', '16:00'],
    2: ['09:30', '11:00', '14:30', '16:30'],
    3: ['10:00', '13:00', '15:00', '17:00'],
    4: ['09:00', '11:30', '16:00', '18:00'],
    5: ['10:30', '14:00', '17:00', '19:00'],
    6: ['09:00', '13:30', '15:30', '17:30'],
  };

  // Dias do mês atual gerados dinamicamente (Outubro de 2026)
  const anoAtual = 2026;
  const mesAtual = 9; // Outubro (0 a 11)
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();

  const calendario = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  const pegarHorarios = (dia) => {
    if (!dia) return [];
    const dataObj = new Date(anoAtual, mesAtual, dia);
    return horariosPorDia[dataObj.getDay()] || [];
  };

  const agendar = () => {
    const dataFormatada = `${String(diaSelecionado).padStart(2, '0')}/10/${anoAtual}`;
    const novoAgendamento = {
      id: Date.now(),
      servico: 'Atendimento Personalizado',
      profissional,
      data: dataFormatada,
      horario: horarioSelecionado,
      status: 'Confirmado',
    };

    setAgendamentos([novoAgendamento, ...agendamentos]);
    Alert.alert('Sucesso!', `Agendado com ${profissional} para o dia ${dataFormatada} às ${horarioSelecionado}`);
    setHorarioSelecionado(null);
    setDiaSelecionado(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Novo Agendamento</Text>
        <Text style={styles.subtitle}>Selecione o profissional, a data e o horário</Text>

        {/* SELEÇÃO DE PROFISSIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Profissional</Text>
          <View style={styles.profissionaisRow}>
            {profissionais.map((item) => {
              const ativo = profissional === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => { setProfissional(item); setDiaSelecionado(null); setHorarioSelecionado(null); }}
                  style={[styles.profissionalCard, ativo && styles.profissionalAtivo]}
                >
                  <View style={[styles.avatar, ativo && styles.avatarAtivo]}>
                    <Text style={[styles.avatarTexto, ativo && styles.avatarTextoAtivo]}>{item.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.profissionalTexto, ativo && styles.profissionalTextoAtivo]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* CALENDÁRIO SIMPLIFICADO */}
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
            <Text style={styles.sectionLabel}>Horários para o dia {diaSelecionado} ({profissional})</Text>
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
          <Pressable style={styles.botaoConfirmar} onPress={agendar}>
            <Text style={styles.textoBotaoConfirmar}>Confirmar para às {horarioSelecionado}</Text>
          </Pressable>
        )}

        {/* MEUS AGENDAMENTOS */}
        <Text style={[styles.title, { marginTop: 25 }]}>Meus Agendamentos</Text>
        <Text style={styles.subtitle}>Acompanhe seus horários marcados</Text>

        {agendamentos.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.horarioText}>{item.data} às {item.horario}</Text>
              <Text style={[styles.statusText, { color: item.status === 'Confirmado' ? '#FF98B9' : '#D1D1D1' }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.servicoNome}>{item.servico}</Text>
            {item.profissional && (
              <Text style={styles.profissionalSubtext}>Profissional: {item.profissional}</Text>
            )}
          </View>
        ))}

      </ScrollView>
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
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6B6E6B', alignItems: 'center', justifyContent: 'center' },
  avatarAtivo: { backgroundColor: '#FF98B9' },
  avatarTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
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
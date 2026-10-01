import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminAgendaGeralScreen() {
  const [dataAtual, setDataAtual] = useState('01 de Outubro, 2026');
  const [profissionalFiltro, setProfissionalFiltro] = useState('Todas');

  // Profissionais da esmalteria
  const profissionais = ['Amanda Nunes', 'Letícia Costa', 'Camila Silva'];

  // Filtros rápidos estilo painel de gestão
  const categoriasFiltro = ['Todas', 'Amanda', 'Letícia', 'Camila'];

  // Horários do dia
  const horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Dados simulados de agendamentos na grade
  const agendaData = {
    '10:00': { 
      'Amanda Nunes': { cliente: 'Joana Silva', servico: 'Spa dos Pés', status: 'Confirmado' } 
    },
    '11:00': { 
      'Letícia Costa': { cliente: 'Mariana Costa', servico: 'Alongamento Gel', status: 'Em andamento' } 
    },
    '14:00': { 
      'Amanda Nunes': { cliente: 'Sofia Lima', servico: 'Manicure Clássica', status: 'Pendente' },
      'Camila Silva': { cliente: 'Beatriz Ramos', servico: 'Hidratação', status: 'Confirmado' }
    },
  };

  // Filtragem de colunas de profissionais com base no chip selecionado
  const profissionaisVisiveis = profissionalFiltro === 'Todas' 
    ? profissionais 
    : profissionais.filter(p => p.toLowerCase().includes(profissionalFiltro.toLowerCase()));

  return (
    <View style={styles.container}>
      
      {/* 1. Barra de Controlo de Data (Estilo Painel Web) */}
      <View style={styles.topControlBar}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-back" size={18} color="#E4A0B7" />
        </TouchableOpacity>
        
        <View style={styles.dateDisplay}>
          <Ionicons name="calendar-outline" size={16} color="#E4A0B7" />
          <Text style={styles.dateDisplayText}>{dataAtual}</Text>
        </View>

        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-forward" size={18} color="#E4A0B7" />
        </TouchableOpacity>
      </View>

      {/* 2. Barra de Filtros Rápidos por Profissional */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {categoriasFiltro.map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.filterChip, profissionalFiltro === cat && styles.filterChipActive]}
            onPress={() => setProfissionalFiltro(cat)}
          >
            <Text style={[styles.filterChipText, profissionalFiltro === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 3. Matriz / Grade de Agendamentos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.gridWrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Cabeçalho da Grade (Nomes das Profissionais) */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.headerTimeCell]}>
              <Text style={styles.headerColumnTitle}>Hora</Text>
            </View>
            {profissionaisVisiveis.map(prof => (
              <View key={prof} style={[styles.tableCell, styles.headerProfCell]}>
                <View style={styles.profAvatarMini}>
                  <Text style={styles.profAvatarText}>{prof.charAt(0)}</Text>
                </View>
                <Text style={styles.headerProfName} numberOfLines={1}>{prof.split(' ')[0]}</Text>
              </View>
            ))}
          </View>

          {/* Linhas de Horários */}
          {horarios.map(hora => (
            <View key={hora} style={styles.tableRow}>
              
              {/* Coluna de Horas */}
              <View style={[styles.tableCell, styles.timeCell]}>
                <Text style={styles.timeText}>{hora}</Text>
              </View>

              {/* Colunas das Profissionais para o respetivo horário */}
              {profissionaisVisiveis.map(prof => {
                const agendamento = agendaData[hora]?.[prof];
                return (
                  <View key={prof} style={[styles.tableCell, styles.slotCell]}>
                    {agendamento ? (
                      <TouchableOpacity style={[
                        styles.eventCard, 
                        { backgroundColor: agendamento.status === 'Confirmado' ? '#1E2C1B' : '#2C3D29' }
                      ]}>
                        <Text style={styles.eventClient} numberOfLines={1}>{agendamento.cliente}</Text>
                        <Text style={styles.eventService} numberOfLines={1}>{agendamento.servico}</Text>
                        <View style={styles.eventFooter}>
                          <View style={[styles.statusIndicator, { backgroundColor: agendamento.status === 'Confirmado' ? '#A3B19B' : '#E4A0B7' }]} />
                          <Text style={styles.eventStatusText}>{agendamento.status}</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptySlot}>
                        <Text style={styles.emptySlotText}>·</Text>
                      </View>
                    )}
                  </View>
                );
              })}

            </View>
          ))}

        </ScrollView>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29', paddingHorizontal: 12, paddingTop: 10 },
  topControlBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E2C1B', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#3A4E36' },
  navButton: { padding: 5 },
  dateDisplay: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateDisplayText: { color: '#E4A0B7', fontSize: 14, fontWeight: 'bold' },
  filterBar: { maxHeight: 45, marginBottom: 12 },
  filterChip: { backgroundColor: '#1E2C1B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, height: 36, borderWidth: 1, borderColor: '#3A4E36', justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#E4A0B7', borderColor: '#E4A0B7' },
  filterChipText: { color: '#A3B19B', fontSize: 12, fontWeight: 'bold' },
  filterChipTextActive: { color: '#1A2418' },
  gridWrapper: { flex: 1 },
  tableRow: { flexDirection: 'row' },
  tableCell: { borderWidth: 1, borderColor: '#3A4E36', justifyContent: 'center', alignItems: 'center' },
  headerTimeCell: { width: 65, height: 45, backgroundColor: '#1E2C1B' },
  headerColumnTitle: { color: '#A3B19B', fontSize: 11, fontWeight: 'bold' },
  headerProfCell: { width: 120, height: 45, backgroundColor: '#1E2C1B', flexDirection: 'row', paddingHorizontal: 8, gap: 6, alignItems: 'center' },
  profAvatarMini: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E4A0B7', justifyContent: 'center', alignItems: 'center' },
  profAvatarText: { color: '#1A2418', fontSize: 10, fontWeight: 'bold' },
  headerProfName: { color: '#FFF', fontSize: 12, fontWeight: 'bold', flex: 1 },
  timeCell: { width: 65, height: 75, backgroundColor: '#1E2C1B' },
  timeText: { color: '#A3B19B', fontSize: 12, fontWeight: '600' },
  slotCell: { width: 120, height: 75, backgroundColor: '#162215', padding: 3 },
  emptySlot: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptySlotText: { color: '#3A4E36', fontSize: 16 },
  eventCard: { flex: 1, borderRadius: 6, padding: 6, justifyContent: 'space-between', borderWidth: 1, borderColor: '#3A4E36' },
  eventClient: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  eventService: { color: '#A3B19B', fontSize: 9 },
  eventFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusIndicator: { width: 5, height: 5, borderRadius: 2.5 },
  eventStatusText: { color: '#E4A0B7', fontSize: 8, opacity: 0.9 }
});
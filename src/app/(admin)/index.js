import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PainelAdminScreen() {
  const acaoEmBreve = (titulo) => {
    Alert.alert('Gestão Admin', `Abrir formulário ou painel de: ${titulo}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Visão Geral & Estatísticas */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Faturação do Dia</Text>
          <Text style={styles.statsValue}>R$ 1.240,00</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="people" size={14} color="#E4A0B7" />
              <Text style={styles.statBadgeText}>12 Atendimentos</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="sparkles" size={14} color="#E4A0B7" />
              <Text style={styles.statBadgeText}>4 Profissionais Ativas</Text>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => acaoEmBreve('Nova Profissional')}
          >
            <Ionicons name="person-add-outline" size={22} color="#1A2418" />
            <Text style={styles.quickButtonText}>+ Profissional</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => acaoEmBreve('Novo Serviço')}
          >
            <Ionicons name="add-circle-outline" size={22} color="#1A2418" />
            <Text style={styles.quickButtonText}>+ Serviço</Text>
          </TouchableOpacity>
        </View>

        {/* Gestão Completa */}
        <Text style={styles.sectionTitle}>Gestão Completa</Text>

        <TouchableOpacity style={styles.menuCard} onPress={() => acaoEmBreve('Equipa e Profissionais')}>
          <View style={styles.menuIconBox}>
            <Ionicons name="people-outline" size={22} color="#E4A0B7" />
          </View>
          <View style={styles.menuTexts}>
            <Text style={styles.menuTitle}>Equipa e Profissionais</Text>
            <Text style={styles.menuDesc}>Gerir colaboradoras, comissões e escalas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8C9C88" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => acaoEmBreve('Agenda Geral')}>
          <View style={styles.menuIconBox}>
            <Ionicons name="calendar-outline" size={22} color="#E4A0B7" />
          </View>
          <View style={styles.menuTexts}>
            <Text style={styles.menuTitle}>Agenda Geral</Text>
            <Text style={styles.menuDesc}>Linha do tempo com todos os agendamentos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8C9C88" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => acaoEmBreve('Cadastro de Serviços')}>
          <View style={styles.menuIconBox}>
            <Ionicons name="list-outline" size={22} color="#E4A0B7" />
          </View>
          <View style={styles.menuTexts}>
            <Text style={styles.menuTitle}>Catálogo de Serviços</Text>
            <Text style={styles.menuDesc}>Editar preços, categorias e durações</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8C9C88" />
        </TouchableOpacity>

        {/* Fecho de Caixa */}
        <TouchableOpacity style={styles.closeBoxButton} onPress={() => Alert.alert('Fecho de Caixa', 'Caixa do dia fechada com sucesso!')}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.closeBoxText}>Realizar Fecho de Caixa</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }, // Ajustado paddingTop
  
  statsCard: { backgroundColor: '#1E2C1B', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#3A4E36', marginBottom: 25, alignItems: 'center' },
  statsTitle: { fontSize: 14, color: '#A3B19B', marginBottom: 5 },
  statsValue: { fontSize: 36, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2C3D29', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  statBadgeText: { color: '#E4A0B7', fontSize: 12, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 15, marginTop: 10 },
  
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  quickButton: { flex: 1, backgroundColor: '#E4A0B7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, marginHorizontal: 5 },
  quickButtonText: { color: '#1A2418', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },

  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2C1B', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#3A4E36' },
  menuIconBox: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#2C3D29', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTexts: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 3 },
  menuDesc: { fontSize: 12, color: '#A3B19B' },

  closeBoxButton: { flexDirection: 'row', backgroundColor: '#3A4E36', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20, borderWidth: 1, borderColor: '#E4A0B7' },
  closeBoxText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
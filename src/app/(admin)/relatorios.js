import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminRelatoriosScreen() {
  const fecharCaixa = () => {
    Alert.alert(
      'Fecho de Caixa',
      'Deseja realmente encerrar o caixa do dia e consolidar o faturamento de R$ 1.240,00?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Fechar Caixa', onPress: () => Alert.alert('Sucesso', 'Caixa fechado com sucesso!') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Card Faturamento Geral */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Faturamento Total (Mês)</Text>
          <Text style={styles.mainCardValue}>R$ 18.450,00</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.subText}>Comissões pagas: R$ 5.535,00</Text>
            <Text style={styles.subTextGreen}>Lucro Líquido: R$ 12.915,00</Text>
          </View>
        </View>

        {/* Resumo do Dia */}
        <Text style={styles.sectionTitle}>Resumo Financeiro de Hoje</Text>
        <View style={styles.boxInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dinheiro / Pix</Text>
            <Text style={styles.infoVal}>R$ 820,00</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cartão de Crédito</Text>
            <Text style={styles.infoVal}>R$ 420,00</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.infoLabelBold}>Total Arrecadado Hoje</Text>
            <Text style={styles.infoValTotal}>R$ 1.240,00</Text>
          </View>
        </View>

        {/* Botão de Fecho de Caixa */}
        <TouchableOpacity style={styles.closeBoxButton} onPress={fecharCaixa}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#1A2418" />
          <Text style={styles.closeBoxButtonText}>Realizar Fecho de Caixa</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  mainCard: { backgroundColor: '#E4A0B7', borderRadius: 16, padding: 22, marginBottom: 25 },
  mainCardLabel: { fontSize: 13, color: '#1A2418', opacity: 0.8, fontWeight: '600' },
  mainCardValue: { fontSize: 34, fontWeight: 'bold', color: '#1A2418', marginVertical: 8 },
  divider: { height: 1, backgroundColor: 'rgba(26, 36, 24, 0.15)', marginVertical: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  subText: { fontSize: 11, color: '#1A2418', fontWeight: '500' },
  subTextGreen: { fontSize: 11, color: '#1A2418', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  boxInfo: { backgroundColor: '#1E2C1B', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#3A4E36', marginBottom: 25 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2C3D29' },
  infoLabel: { color: '#A3B19B', fontSize: 14 },
  infoVal: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  infoLabelBold: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  infoValTotal: { color: '#E4A0B7', fontSize: 18, fontWeight: 'bold' },
  closeBoxButton: { flexDirection: 'row', backgroundColor: '#E4A0B7', padding: 18, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 10 },
  closeBoxButtonText: { color: '#1A2418', fontSize: 16, fontWeight: 'bold' }
});
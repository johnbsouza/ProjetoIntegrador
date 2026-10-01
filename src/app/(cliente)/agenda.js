import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteAgendarScreen() {
  const router = useRouter();
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [profissionalSelecionada, setProfissionalSelecionada] = useState(null);

  const horarios = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];
  const profissionais = [
    { id: 1, nome: 'Amanda Nunes', especialidade: 'Manicure' },
    { id: 2, nome: 'Letícia Costa', especialidade: 'Spa & Gel' },
  ];

  const confirmarAgendamento = () => {
    if (!horarioSelecionado || !profissionalSelecionada) {
      Alert.alert('Atenção', 'Selecione uma profissional e um horário.');
      return;
    }
    Alert.alert('Sucesso!', 'Agendamento realizado com sucesso!', [
      { text: 'OK', onPress: () => router.push('/(cliente)/agenda') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Novo Agendamento 💅</Text>
        <Text style={styles.subtitle}>Spa dos Pés Completo • R$ 85,00</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Escolher Profissional */}
        <Text style={styles.sectionTitle}>Escolha a Profissional</Text>
        {profissionais.map(p => (
          <TouchableOpacity 
            key={p.id} 
            style={[styles.cardSelect, profissionalSelecionada === p.id && styles.cardSelected]}
            onPress={() => setProfissionalSelecionada(p.id)}
          >
            <Ionicons name="person-circle-outline" size={32} color="#E4A0B7" />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.cardTitle}>{p.nome}</Text>
              <Text style={styles.cardSubtitle}>{p.especialidade}</Text>
            </View>
            {profissionalSelecionada === p.id && (
              <Ionicons name="checkmark-circle" size={22} color="#E4A0B7" />
            )}
          </TouchableOpacity>
        ))}

        {/* Escolher Horário */}
        <Text style={styles.sectionTitle}>Horários Disponíveis Hoje</Text>
        <View style={styles.gridHorarios}>
          {horarios.map(h => (
            <TouchableOpacity 
              key={h} 
              style={[styles.horaBox, horarioSelecionado === h && styles.horaSelected]}
              onPress={() => setHorarioSelecionado(h)}
            >
              <Text style={[styles.horaText, horarioSelecionado === h && styles.horaTextSelected]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão Finalizar */}
        <TouchableOpacity style={styles.confirmButton} onPress={confirmarAgendamento}>
          <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#E4A0B7' },
  subtitle: { fontSize: 13, color: '#A3B19B', marginTop: 4 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 12, marginTop: 15 },
  cardSelect: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2C1B', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#3A4E36' },
  cardSelected: { borderColor: '#E4A0B7', backgroundColor: 'rgba(228, 160, 183, 0.05)' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  cardSubtitle: { fontSize: 12, color: '#A3B19B' },
  gridHorarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  horaBox: { width: '30%', backgroundColor: '#1E2C1B', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#3A4E36' },
  horaSelected: { backgroundColor: '#E4A0B7', borderColor: '#E4A0B7' },
  horaText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  horaTextSelected: { color: '#1A2418' },
  confirmButton: { backgroundColor: '#E4A0B7', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  confirmButtonText: { color: '#1A2418', fontSize: 16, fontWeight: 'bold' }
});
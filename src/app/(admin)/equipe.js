import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminEquipeScreen() {
  const equipe = [
    { id: 1, nome: 'Amanda Nunes', cargo: 'Manicure Sênior', status: 'Ativa' },
    { id: 2, nome: 'Letícia Costa', cargo: 'Especialista em Gel', status: 'Ativa' },
    { id: 3, nome: 'Camila Silva', cargo: 'Esteticista', status: 'Férias' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#1A2418" />
          <Text style={styles.addButtonText}>Cadastrar Profissional</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Equipe Atual</Text>

        {equipe.map(membro => (
          <View key={membro.id} style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Text style={styles.avatarText}>{membro.nome.charAt(0)}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{membro.nome}</Text>
              <Text style={styles.memberRole}>{membro.cargo}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: membro.status === 'Ativa' ? '#A3B19B' : '#FFC107' }]}>
                {membro.status}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#A3B19B" />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  addButton: { flexDirection: 'row', backgroundColor: '#E4A0B7', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  addButtonText: { color: '#1A2418', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2C1B', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#3A4E36' },
  memberAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E4A0B7', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#1A2418' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  memberRole: { fontSize: 13, color: '#A3B19B' },
  statusBadge: { backgroundColor: '#2C3D29', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 10 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  editBtn: { padding: 5 },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditarPerfilProfissionalScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('Ana Silva');
  const [email, setEmail] = useState('ana.profissional@lirium.com');
  const [telefone, setTelefone] = useState('(11) 91234-5678');

  const handleSalvar = () => {
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput 
          style={styles.input} 
          value={nome}
          onChangeText={setNome}
          placeholderTextColor="#A0A3A0"
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput 
          style={styles.input} 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#A0A3A0"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput 
          style={styles.input} 
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          placeholderTextColor="#A0A3A0"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>Guardar Alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: '#6B6E6B' },
  topTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  backButton: { padding: 4 },
  scrollContent: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#595959', borderWidth: 1, borderColor: '#6B6E6B', borderRadius: 12, padding: 15, fontSize: 16, color: '#FFFFFF' },
  saveButton: { backgroundColor: '#FF98B9', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 35 },
  saveButtonText: { color: '#434643', fontSize: 16, fontWeight: 'bold' },
});
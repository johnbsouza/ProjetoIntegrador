
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NovoProfissionalScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cargo, setCargo] = useState('');

  const handleSalvar = () => {
    if (!nome || !email || !cargo || !dataNascimento) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    Alert.alert('Sucesso', 'Profissional cadastrada com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Ana Silva" 
          placeholderTextColor="#A0A3A0"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput 
          style={styles.input} 
          placeholder="exemplo@lirium.com" 
          placeholderTextColor="#A0A3A0"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 01/01/2001" 
          placeholderTextColor="#A0A3A0"
          keyboardType='numeric'
          value={dataNascimento}
          onChangeText={setDataNascimento}
        />

        <Text style={styles.label}>Cargo / Especialidade</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Manicure & Nail Designer" 
          placeholderTextColor="#A0A3A0"
          value={cargo}
          onChangeText={setCargo}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>Salvar Profissional</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  scrollContent: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#595959', borderWidth: 1, borderColor: '#6B6E6B', borderRadius: 12, padding: 15, fontSize: 16, color: '#FFFFFF' },
  saveButton: { backgroundColor: '#FF98B9', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 35 },
  saveButtonText: { color: '#434643', fontSize: 16, fontWeight: 'bold' },
});
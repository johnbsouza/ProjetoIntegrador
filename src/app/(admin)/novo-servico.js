import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NovoServicoScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [tempo, setTempo] = useState('');

  const handleSalvar = () => {
    if (!nome || !preco || !tempo) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>Nome do Serviço</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Spa dos Pés" 
          placeholderTextColor="#A0A3A0"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 85,00" 
          placeholderTextColor="#A0A3A0"
          keyboardType="numeric"
          value={preco}
          onChangeText={setPreco}
        />

        <Text style={styles.label}>Duração estimada</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 60 min" 
          placeholderTextColor="#A0A3A0"
          value={tempo}
          onChangeText={setTempo}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>Salvar Serviço</Text>
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
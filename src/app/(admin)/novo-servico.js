import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function NovoServicoScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvarServico() {

    if (!nome.trim() || !preco.trim() || !duracao.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    const valorNumerico = Number(
      preco.trim().replace(/\s/g, '').replace(',', '.')
    );
    const duracaoNumerica = Number(duracao);

    if (!Number.isFinite(valorNumerico) || valorNumerico < 0) {
      Alert.alert('Atenção', 'Informe um preço válido.');
      return;
    }

    if (!Number.isInteger(duracaoNumerica) || duracaoNumerica <= 0) {
      Alert.alert('Atenção', 'Informe uma duração de serviço válida em minutos')
      return;
    }

    try {
      setSalvando(true);

      await addDoc(collection(db, 'servicos'), {
        nome: nome.trim(),
        preco: valorNumerico,
        tempo: duracaoNumerica,
        criadoEm: serverTimestamp(),
      });
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

      setNome('');
      setPreco('');
      setDuracao('');
    } catch (errado) {
      console.error('Erro ao salvar serviço:', errado);
      Alert.alert(
        'Falha / Erro',
        'Não foi possível salvar o serviço. Verifique sua conexão e configurações do Firebase.'
      )
    } finally {
      setSalvando(false)
    }
  }


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
        keyboardType="decimal-pad"
        value={preco}
        onChangeText={setPreco}
      />

      <Text style={styles.label}>Duração estimada</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 60 min"
        placeholderTextColor="#A0A3A0"
        value={duracao}
        onChangeText={setDuracao}
        keyboardType='number-pad'
      />

      <TouchableOpacity 
      style={styles.saveButton} 
      onPress={salvarServico}
      disabled={salvando}>

        <Text style={styles.saveButtonText}>
          {salvando ? 'Salvando...' : 'Salvar serviço'}
          </Text>
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
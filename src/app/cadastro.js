import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleCadastro = () => {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    Alert.alert('Sucesso', 'Conta criada com sucesso!', [
      { text: 'Entrar', onPress: () => router.replace('/') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#E4A0B7" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Criar Conta ✨</Text>
        <Text style={styles.subtitle}>Junte-se à Lirium Esmalteria</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#8C9C88"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#8C9C88"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Palavra-passe"
          placeholderTextColor="#8C9C88"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Registar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3D29', paddingHorizontal: 30, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 30 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#E4A0B7', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#A3B19B' },
  form: { width: '100%' },
  input: { backgroundColor: '#1E2C1B', color: '#FFF', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#3A4E36' },
  button: { backgroundColor: '#E4A0B7', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#1A2418', fontSize: 16, fontWeight: 'bold' }
});
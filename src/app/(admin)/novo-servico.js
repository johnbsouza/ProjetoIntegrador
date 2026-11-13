import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

const CATEGORIAS = ['Manicure', 'Pedicure', 'Esmaltação em Gel', 'Spa dos Pés', 'Alongamento', 'Pacotes'];

export default function NovoServico() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('45');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSalvarServico() {
    if (!nome.trim() || !preco.trim() || !duracao.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome, preço e duração do serviço.');
      return;
    }

    const precoNumero = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNumero) || precoNumero <= 0) {
      Alert.alert('Preço Inválido', 'Digite um valor numérico válido para o preço.');
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, 'servicos'), {
        nome: nome.trim(),
        categoria,
        preco: precoNumero,
        duracaoMinutos: parseInt(duracao, 10) || 45,
        descricao: descricao.trim(),
        ativo: true,
        criadoEm: serverTimestamp(),
      });

      Alert.alert('Sucesso!', 'Serviço cadastrado com sucesso no catálogo.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o serviço.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.titulo}>Novo Serviço</Text>
        <Text style={styles.subtitulo}>Preencha as informações para adicionar ao catálogo</Text>

        {/* Nome do Serviço */}
        <Text style={styles.label}>Nome do Serviço *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="sparkles-outline" size={20} color="#FF98B9" style={styles.iconInput} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Esmaltação em Gel"
            placeholderTextColor="rgba(209, 209, 209, 0.5)"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        {/* Categoria */}
        <Text style={styles.label}>Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catContainer}>
          {CATEGORIAS.map((cat) => {
            const selecionada = categoria === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, selecionada && styles.catChipSelecionada]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={[styles.catTexto, selecionada && styles.catTextoSelecionada]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Preço e Duração */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Preço (R$) *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="cash-outline" size={20} color="#FF98B9" style={styles.iconInput} />
              <TextInput
                style={styles.input}
                placeholder="00.00"
                placeholderTextColor="rgba(209, 209, 209, 0.5)"
                keyboardType="numeric"
                value={preco}
                onChangeText={setPreco}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duração (min) *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="time-outline" size={20} color="#FF98B9" style={styles.iconInput} />
              <TextInput
                style={styles.input}
                placeholder="45"
                placeholderTextColor="rgba(209, 209, 209, 0.5)"
                keyboardType="numeric"
                value={duracao}
                onChangeText={setDuracao}
              />
            </View>
          </View>
        </View>

        {/* Descrição */}
        <Text style={styles.label}>Descrição Detalhada</Text>
        <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <TextInput
            style={[styles.input, { textAlignVertical: 'top' }]}
            placeholder="Descreva o procedimento e produtos incluídos..."
            placeholderTextColor="rgba(209, 209, 209, 0.5)"
            multiline
            numberOfLines={4}
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[styles.btnSalvar, salvando && { opacity: 0.6 }]}
          onPress={handleSalvarServico}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#1E201E" />
          ) : (
            <Text style={styles.btnTexto}>Cadastrar Serviço</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  content: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#FF98B9' },
  subtitulo: { fontSize: 13, color: '#D1D1D1', marginTop: 3, marginBottom: 20 },
  label: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#595959',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconInput: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  catContainer: { flexDirection: 'row', marginBottom: 10 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#595959',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  catChipSelecionada: { backgroundColor: '#FF98B9', borderColor: '#FF98B9' },
  catTexto: { color: '#D1D1D1', fontSize: 13, fontWeight: '600' },
  catTextoSelecionada: { color: '#1E201E', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSalvar: {
    backgroundColor: '#FF98B9',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  btnTexto: { color: '#1E201E', fontSize: 16, fontWeight: 'bold' },
});
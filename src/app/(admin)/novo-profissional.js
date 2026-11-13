import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function NovoProfissional() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [comissao, setComissao] = useState('50');
  const [especialidades, setEspecialidades] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSalvarProfissional() {
    if (!nome.trim() || !email.trim() || !comissao.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome, e-mail e porcentagem de comissão.');
      return;
    }

    const valorComissao = parseFloat(comissao);
    if (isNaN(valorComissao) || valorComissao < 0 || valorComissao > 100) {
      Alert.alert('Comissão Inválida', 'A comissão deve ser um valor entre 0% e 100%.');
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, 'usuarios'), {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim(),
        comissaoPorcentagem: valorComissao,
        especialidades: especialidades.trim() || 'Geral',
        nivelAcesso: 'profissional',
        ativo: true,
        criadoEm: serverTimestamp(),
      });

      Alert.alert('Sucesso!', 'Profissional cadastrada na equipe.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil da profissional.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.titulo}>Nova Profissional</Text>
        <Text style={styles.subtitulo}>Cadastre uma colaboradora para receber agendamentos</Text>

        {/* Nome Completo */}
        <Text style={styles.label}>Nome Completo *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={20} color="#FF98B9" style={styles.iconInput} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Beatriz Silva"
            placeholderTextColor="rgba(209, 209, 209, 0.5)"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        {/* E-mail */}
        <Text style={styles.label}>E-mail de Acesso *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#FF98B9" style={styles.iconInput} />
          <TextInput
            style={styles.input}
            placeholder="beatriz@liriumesmalteria.com"
            placeholderTextColor="rgba(209, 209, 209, 0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Telefone e Comissão */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Telefone / WhatsApp</Text>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={20} color="#FF98B9" style={styles.iconInput} />
              <TextInput
                style={styles.input}
                placeholder="(11) 99999-9999"
                placeholderTextColor="rgba(209, 209, 209, 0.5)"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Comissão (%) *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="pie-chart-outline" size={20} color="#FF98B9" style={styles.iconInput} />
              <TextInput
                style={styles.input}
                placeholder="50"
                placeholderTextColor="rgba(209, 209, 209, 0.5)"
                keyboardType="numeric"
                value={comissao}
                onChangeText={setComissao}
              />
            </View>
          </View>
        </View>

        {/* Especialidades */}
        <Text style={styles.label}>Especialidades</Text>
        <View style={styles.inputBox}>
          <Ionicons name="ribbon-outline" size={20} color="#FF98B9" style={styles.iconInput} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Nail Art, Spa dos Pés, Alongamento em Gel"
            placeholderTextColor="rgba(209, 209, 209, 0.5)"
            value={especialidades}
            onChangeText={setEspecialidades}
          />
        </View>

        {/* Botão Cadastrar */}
        <TouchableOpacity
          style={[styles.btnSalvar, salvando && { opacity: 0.6 }]}
          onPress={handleSalvarProfissional}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#1E201E" />
          ) : (
            <Text style={styles.btnTexto}>Cadastrar Profissional</Text>
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
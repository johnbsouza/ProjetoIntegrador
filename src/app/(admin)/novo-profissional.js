import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function NovoProfissional() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
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
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 88 + tema.espacoExtra },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          accessibilityRole="header"
          style={[
            styles.titulo,
            { color: tema.accent, fontSize: tema.fontSize(22) },
          ]}
        >
          Nova Profissional
        </Text>
        {!config.modoCalmo && (
          <Text
            style={[
              styles.subtitulo,
              { color: tema.textSecondary, fontSize: tema.fontSize(13) },
            ]}
          >
            Cadastre uma colaboradora para receber agendamentos
          </Text>
        )}

        <Text
          style={[
            styles.label,
            {
              color: tema.textPrimary,
              fontSize: tema.fontSize(14),
              marginTop: 10 + tema.espacoExtra,
            },
          ]}
        >
          Nome Completo *
        </Text>
        <View
          style={[
            styles.inputBox,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              minHeight: Math.max(52, tema.minTouchHeight),
            },
          ]}
        >
          <Ionicons name="person-outline" size={20} color={tema.accent} style={styles.iconInput} accessible={false} />
          <TextInput
            accessibilityLabel="Nome Completo obrigatório"
            style={[
              styles.input,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
            placeholder="Ex: Beatriz Silva"
            placeholderTextColor={tema.textMuted}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <Text
          style={[
            styles.label,
            {
              color: tema.textPrimary,
              fontSize: tema.fontSize(14),
              marginTop: 10 + tema.espacoExtra,
            },
          ]}
        >
          E-mail de Acesso *
        </Text>
        <View
          style={[
            styles.inputBox,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              minHeight: Math.max(52, tema.minTouchHeight),
            },
          ]}
        >
          <Ionicons name="mail-outline" size={20} color={tema.accent} style={styles.iconInput} accessible={false} />
          <TextInput
            accessibilityLabel="E-mail de Acesso obrigatório"
            style={[
              styles.input,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
            placeholder="beatriz@liriumesmalteria.com"
            placeholderTextColor={tema.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 + tema.espacoExtra }}>
            <Text
              style={[
                styles.label,
                {
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(14),
                  marginTop: 10 + tema.espacoExtra,
                },
              ]}
            >
              Telefone / WhatsApp
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: Math.max(52, tema.minTouchHeight),
                },
              ]}
            >
              <Ionicons name="call-outline" size={20} color={tema.accent} style={styles.iconInput} accessible={false} />
              <TextInput
                accessibilityLabel="Telefone ou WhatsApp"
                style={[
                  styles.input,
                  { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                ]}
                placeholder="(11) 99999-9999"
                placeholderTextColor={tema.textMuted}
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.label,
                {
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(14),
                  marginTop: 10 + tema.espacoExtra,
                },
              ]}
            >
              Comissão (%) *
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: Math.max(52, tema.minTouchHeight),
                },
              ]}
            >
              <Ionicons name="pie-chart-outline" size={20} color={tema.accent} style={styles.iconInput} accessible={false} />
              <TextInput
                accessibilityLabel="Porcentagem de comissão obrigatória"
                style={[
                  styles.input,
                  { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                ]}
                placeholder="50"
                placeholderTextColor={tema.textMuted}
                keyboardType="numeric"
                value={comissao}
                onChangeText={setComissao}
              />
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.label,
            {
              color: tema.textPrimary,
              fontSize: tema.fontSize(14),
              marginTop: 10 + tema.espacoExtra,
            },
          ]}
        >
          Especialidades
        </Text>
        <View
          style={[
            styles.inputBox,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              minHeight: Math.max(52, tema.minTouchHeight),
            },
          ]}
        >
          <Ionicons name="ribbon-outline" size={20} color={tema.accent} style={styles.iconInput} accessible={false} />
          <TextInput
            accessibilityLabel="Especialidades da profissional"
            style={[
              styles.input,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
            placeholder="Ex: Nail Art, Spa dos Pés, Alongamento em Gel"
            placeholderTextColor={tema.textMuted}
            value={especialidades}
            onChangeText={setEspecialidades}
          />
        </View>

        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel={salvando ? 'Cadastrando profissional' : 'Cadastrar profissional'}
          accessibilityState={{ disabled: salvando, busy: salvando }}
          style={[
            styles.btnSalvar,
            {
              backgroundColor: tema.accent,
              minHeight: Math.max(52, tema.minTouchHeight),
            },
            salvando && { opacity: 0.6 },
          ]}
          onPress={handleSalvarProfissional}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color={tema.textOnAccent} />
          ) : (
            <Text
              style={[
                styles.btnTexto,
                { color: tema.textOnAccent, fontSize: tema.fontSize(16) },
              ]}
            >
              Cadastrar Profissional
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  titulo: { fontWeight: 'bold' },
  subtitulo: { marginTop: 3, marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  iconInput: { marginRight: 10 },
  input: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSalvar: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  btnTexto: { fontWeight: 'bold' },
});
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function EditarProfissionalScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const { id } = useLocalSearchParams();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [comissao, setComissao] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      if (!id) return;
      try {
        const docRef = doc(db, 'usuarios', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setNome(dados.nome || '');
          setEmail(dados.email || '');
          setTelefone(dados.telefone || '');
          setComissao(String(dados.comissaoPorcentagem || '50'));
        }
      } catch (error) {
        console.error('Erro ao carregar profissional:', error);
      }
    }
    carregarDados();
  }, [id]);

  async function salvarAlteracoes() {
    if (!nome || !telefone) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    setCarregando(true);
    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, {
        nome,
        telefone,
        comissaoPorcentagem: Number(comissao),
      });
      setCarregando(false);
      Alert.alert('Sucesso', 'Profissional atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      setCarregando(false);
      Alert.alert('Erro', 'Não foi possível atualizar.');
    }
  }

  return (
    <LinearGradient
      colors={config.altoContraste ? [tema.bgPrimary, tema.bgPrimary] : ['#1E201E', '#434643', '#1A1C1A']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela anterior"
            style={[
              styles.backButton,
              {
                minWidth: tema.minTouchHeight,
                minHeight: tema.minTouchHeight,
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={tema.accent} />
          </TouchableOpacity>
          <Text
            accessibilityRole="header"
            style={[
              styles.tituloTopo,
              { color: tema.accent, fontSize: tema.fontSize(20) },
            ]}
          >
            Editar Profissional
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 88 + tema.espacoExtra },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            accessibilityLabel="Nome completo da profissional"
            style={[
              styles.input,
              {
                backgroundColor: tema.bgSurface,
                color: tema.textPrimary,
                fontSize: tema.fontSize(15),
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                minHeight: tema.minTouchHeight,
                marginBottom: 15 + tema.espacoExtra,
              },
            ]}
            placeholder="Nome Completo"
            placeholderTextColor={tema.textMuted}
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            accessibilityLabel="E-mail da profissional somente leitura"
            accessibilityState={{ disabled: true }}
            style={[
              styles.input,
              {
                backgroundColor: tema.bgSurface,
                color: tema.textSecondary,
                fontSize: tema.fontSize(15),
                borderColor: tema.borderSubtle,
                minHeight: tema.minTouchHeight,
                marginBottom: 15 + tema.espacoExtra,
                opacity: 0.7,
              },
            ]}
            placeholder="E-mail"
            placeholderTextColor={tema.textMuted}
            value={email}
            editable={false}
          />
          <TextInput
            accessibilityLabel="Telefone da profissional"
            style={[
              styles.input,
              {
                backgroundColor: tema.bgSurface,
                color: tema.textPrimary,
                fontSize: tema.fontSize(15),
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                minHeight: tema.minTouchHeight,
                marginBottom: 15 + tema.espacoExtra,
              },
            ]}
            placeholder="Telefone"
            placeholderTextColor={tema.textMuted}
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />
          <TextInput
            accessibilityLabel="Percentual de comissão"
            style={[
              styles.input,
              {
                backgroundColor: tema.bgSurface,
                color: tema.textPrimary,
                fontSize: tema.fontSize(15),
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                minHeight: tema.minTouchHeight,
                marginBottom: 15 + tema.espacoExtra,
              },
            ]}
            placeholder="% Comissão"
            placeholderTextColor={tema.textMuted}
            keyboardType="numeric"
            maxLength={3}
            value={comissao}
            onChangeText={setComissao}
          />

          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel={carregando ? 'A guardar alterações' : 'Guardar alterações'}
            accessibilityState={{ disabled: carregando, busy: carregando }}
            style={[
              styles.botaoSalvar,
              {
                backgroundColor: tema.accent,
                minHeight: tema.minTouchHeight,
                justifyContent: 'center',
              },
              carregando && { opacity: 0.7 },
            ]}
            onPress={salvarAlteracoes}
            disabled={carregando}
          >
            <Text
              style={[
                styles.textoBotao,
                { color: tema.textOnAccent, fontSize: tema.fontSize(16) },
              ]}
            >
              {carregando ? 'A guardar...' : 'Guardar Alterações'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tituloTopo: { fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  scrollContent: { paddingTop: 10 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  botaoSalvar: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: { fontWeight: 'bold' },
});
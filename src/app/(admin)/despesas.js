import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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

export default function TelaDespesasManutencao() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Manutenção');
  const [despesas, setDespesas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarDespesas = async () => {
    try {
      const q = query(collection(db, 'despesas'), orderBy('dataCriacao', 'desc'));
      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setDespesas(lista);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    }
  };

  useEffect(() => {
    buscarDespesas();
  }, []);

  async function adicionarDespesa() {
    if (!descricao || !valor) {
      Alert.alert('Atenção', 'Preencha a descrição e o valor.');
      return;
    }

    setCarregando(true);
    try {
      await addDoc(collection(db, 'despesas'), {
        descricao,
        valor: parseFloat(valor.replace(',', '.')),
        categoria,
        dataCriacao: serverTimestamp(),
      });
      setDescricao('');
      setValor('');
      setCarregando(false);
      buscarDespesas();
      Alert.alert('Sucesso', 'Registo guardado com sucesso!');
    } catch (error) {
      setCarregando(false);
      Alert.alert('Erro', 'Não foi possível guardar o registo.');
    }
  }

  return (
    <LinearGradient
      colors={config.altoContraste ? [tema.bgPrimary, tema.bgPrimary] : ['#1E201E', '#434643', '#1A1C1A']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={estilos.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={estilos.header}>
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela anterior"
            style={[
              estilos.backButton,
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
              estilos.tituloTopo,
              { color: tema.accent, fontSize: tema.fontSize(22) },
            ]}
          >
            Despesas & Manutenção
          </Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View
            style={[
              estilos.formCard,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                marginBottom: 20 + tema.espacoExtra,
              },
            ]}
          >
            <TextInput
              accessibilityLabel="Descrição da despesa"
              style={[
                estilos.input,
                {
                  backgroundColor: tema.bgElevated,
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(15),
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              placeholder="Descrição (ex: Compra de Esmaltes, Aluguel...)"
              placeholderTextColor={tema.textMuted}
              maxLength={60}
              value={descricao}
              onChangeText={setDescricao}
            />

            <TextInput
              accessibilityLabel="Valor da despesa em reais"
              style={[
                estilos.input,
                {
                  backgroundColor: tema.bgElevated,
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(15),
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              placeholder="Valor (R$)"
              placeholderTextColor={tema.textMuted}
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel={carregando ? 'A guardar despesa' : 'Registar despesa'}
              accessibilityState={{ disabled: carregando, busy: carregando }}
              style={[
                estilos.botaoSalvar,
                {
                  backgroundColor: tema.accent,
                  minHeight: tema.minTouchHeight,
                  justifyContent: 'center',
                },
                carregando && { opacity: 0.7 },
              ]}
              onPress={adicionarDespesa}
              disabled={carregando}
            >
              <Text
                style={[
                  estilos.textoBotaoSalvar,
                  { color: tema.textOnAccent, fontSize: tema.fontSize(16) },
                ]}
              >
                {carregando ? 'A guardar...' : 'Registar Despesa'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={despesas}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              estilos.lista,
              { paddingBottom: 88 + tema.espacoExtra, gap: 10 + tema.espacoExtra },
            ]}
            ListEmptyComponent={
              <Text
                style={[
                  estilos.vazioTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                ]}
              >
                Nenhuma despesa registada.
              </Text>
            }
            renderItem={({ item }) => {
              const valorFormatado = `R$ ${Number(item.valor).toFixed(2).replace('.', ',')}`;
              return (
                <View
                  accessible
                  accessibilityLabel={`${item.descricao}, categoria ${item.categoria || 'Manutenção'}, valor ${valorFormatado}`}
                  style={[
                    estilos.itemCard,
                    {
                      backgroundColor: tema.bgSurface,
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    },
                  ]}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text
                      style={[
                        estilos.itemTitulo,
                        { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                      ]}
                    >
                      {item.descricao}
                    </Text>
                    <Text
                      style={[
                        estilos.itemSub,
                        { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {item.categoria}
                    </Text>
                  </View>
                  <Text
                    style={[
                      estilos.itemValor,
                      { color: tema.accent, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {valorFormatado}
                  </Text>
                </View>
              );
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 20 },
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
  formCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    marginBottom: 12,
  },
  botaoSalvar: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  textoBotaoSalvar: { fontWeight: 'bold' },
  lista: {},
  vazioTexto: { textAlign: 'center', marginTop: 24 },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  itemTitulo: { fontWeight: '600' },
  itemSub: { marginTop: 2 },
  itemValor: { fontWeight: 'bold' },
});
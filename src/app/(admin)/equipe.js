import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
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

export default function TelaGestaoEquipeComissao() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [profissionais, setProfissionais] = useState([]);
  const [comissaoEditando, setComissaoEditando] = useState({});

  const buscarProfissionais = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        const dados = documento.data();
        if (dados.nivelAcesso === 'profissional') {
          lista.push({ id: documento.id, ...dados });
        }
      });
      setProfissionais(lista);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  };

  useEffect(() => {
    buscarProfissionais();
  }, []);

  async function atualizarComissao(id) {
    const novaComissao = comissaoEditando[id];
    if (!novaComissao) {
      Alert.alert('Atenção', 'Insira o valor da comissão.');
      return;
    }

    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, { comissaoPorcentagem: Number(novaComissao) });
      Alert.alert('Sucesso', 'Comissão atualizada com sucesso!');
      buscarProfissionais();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar.');
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
            Equipe & Comissões
          </Text>
        </View>

        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            estilos.lista,
            { paddingBottom: 88 + tema.espacoExtra, gap: 15 + tema.espacoExtra },
          ]}
          ListEmptyComponent={
            <Text
              style={[
                estilos.vazioTexto,
                { color: tema.textSecondary, fontSize: tema.fontSize(14) },
              ]}
            >
              Nenhuma profissional cadastrada.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                estilos.card,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  estilos.nome,
                  { color: tema.textPrimary, fontSize: tema.fontSize(18) },
                ]}
              >
                {item.nome}
              </Text>
              <Text
                style={[
                  estilos.email,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                {item.email}
              </Text>

              <View style={[estilos.row, { gap: 10 + tema.espacoExtra }]}>
                <TextInput
                  accessibilityLabel={`Percentual de comissão de ${item.nome}`}
                  style={[
                    estilos.inputComissao,
                    {
                      backgroundColor: tema.bgElevated,
                      color: tema.textPrimary,
                      fontSize: tema.fontSize(15),
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                  placeholder="% Comissão"
                  placeholderTextColor={tema.textMuted}
                  keyboardType="numeric"
                  defaultValue={String(item.comissaoPorcentagem || 50)}
                  onChangeText={(text) => setComissaoEditando({ ...comissaoEditando, [item.id]: text })}
                />
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Salvar comissão de ${item.nome}`}
                  style={[
                    estilos.botaoSalvar,
                    {
                      backgroundColor: tema.accent,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={() => atualizarComissao(item.id)}
                >
                  <Text
                    style={[
                      estilos.textoBotao,
                      { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
                    ]}
                  >
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
  lista: {},
  vazioTexto: { textAlign: 'center', marginTop: 40 },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  nome: { fontWeight: 'bold' },
  email: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  inputComissao: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  botaoSalvar: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  textoBotao: { fontWeight: 'bold' },
});
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function TelaEquipeComissao() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [profissionais, setProfissionais] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [comissao, setComissao] = useState('');
  const [valorServico, setValorServico] = useState('');
  const [comissaoCalculada, setComissaoCalculada] = useState(null);

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

  async function atualizarComissaoPadrao(id) {
    if (!comissao) {
      Alert.alert('Atenção', 'Insira a percentagem.');
      return;
    }

    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, { comissaoPorcentagem: Number(comissao) });
      Alert.alert('Sucesso', 'Comissão padrão atualizada!');
      setComissao('');
      buscarProfissionais();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar.');
    }
  }

  function calcularComissaoSimulacao() {
    if (!valorServico || !profissionalSelecionado) return;
    const valorNum = Number(valorServico.replace(/[^\d]/g, '')) / 100;
    const porcentagem = profissionalSelecionado.comissaoPorcentagem || 50;
    const resultado = (valorNum * porcentagem) / 100;
    setComissaoCalculada(resultado.toFixed(2));
  }

  function abrirSimulador(item) {
    setProfissionalSelecionado(item);
    setValorServico('');
    setComissaoCalculada(null);
    setModalVisivel(true);
  }

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
              { color: tema.accent, fontSize: tema.fontSize(20) },
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
            <View style={estilos.vazioBox}>
              <Ionicons name="people-outline" size={40} color={tema.textMuted} accessible={false} />
              <Text
                style={[
                  estilos.vazioTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                ]}
              >
                Nenhuma profissional cadastrada.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const nomeProf = item.nome || 'Profissional';
            const comissaoAtual = item.comissaoPorcentagem || 50;
            return (
              <View
                style={[
                  estilos.card,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  },
                ]}
              >
                <View style={estilos.rowHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={[
                        estilos.cardTitulo,
                        { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                      ]}
                    >
                      {nomeProf}
                    </Text>
                    <Text
                      style={[
                        estilos.cardSub,
                        { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {item.email}
                    </Text>
                  </View>
                  <TouchableOpacity
                    hitSlop={tema.hitSlopPadrao}
                    accessibilityRole="button"
                    accessibilityLabel={`Simular comissão de ${nomeProf}`}
                    onPress={() => abrirSimulador(item)}
                    style={[
                      estilos.botaoSimular,
                      {
                        backgroundColor: tema.bgElevated,
                        borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                        borderWidth: config.altoContraste ? 1 : 0,
                        minHeight: tema.minTouchHeight,
                      },
                    ]}
                  >
                    <Ionicons name="calculator" size={18} color={tema.accent} accessible={false} />
                    <Text
                      style={[
                        estilos.textoSimular,
                        { color: tema.accent, fontSize: tema.fontSize(13) },
                      ]}
                    >
                      Simular
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    estilos.comissaoAtual,
                    { color: tema.accent, fontSize: tema.fontSize(13) },
                  ]}
                >
                  Comissão Padrão: {comissaoAtual}%
                </Text>

                <View style={[estilos.rowInput, { gap: 10 + tema.espacoExtra }]}>
                  <TextInput
                    accessibilityLabel={`Nova porcentagem de comissão para ${nomeProf}`}
                    style={[
                      estilos.input,
                      {
                        backgroundColor: tema.bgElevated,
                        color: tema.textPrimary,
                        fontSize: tema.fontSize(15),
                        borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                        minHeight: Math.max(48, tema.minTouchHeight),
                        marginBottom: 0,
                      },
                    ]}
                    placeholder="Nova % Comissão"
                    placeholderTextColor={tema.textMuted}
                    keyboardType="numeric"
                    maxLength={3}
                    onChangeText={setComissao}
                  />
                  <TouchableOpacity
                    hitSlop={tema.hitSlopPadrao}
                    accessibilityRole="button"
                    accessibilityLabel={`Atualizar comissão padrão de ${nomeProf}`}
                    style={[
                      estilos.botaoSalvar,
                      {
                        backgroundColor: tema.accent,
                        minHeight: Math.max(48, tema.minTouchHeight),
                      },
                    ]}
                    onPress={() => atualizarComissaoPadrao(item.id)}
                  >
                    <Text
                      style={[
                        estilos.textoBotao,
                        { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
                      ]}
                    >
                      Atualizar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />

        <Modal
          visible={modalVisivel}
          animationType="slide"
          transparent
          accessibilityViewIsModal
          onRequestClose={() => setModalVisivel(false)}
        >
          <View style={estilos.modalFundo}>
            <View
              style={[
                estilos.modalCard,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                },
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[
                  estilos.modalTitulo,
                  { color: tema.accent, fontSize: tema.fontSize(20) },
                ]}
              >
                Simular Comissão
              </Text>
              <Text
                style={[
                  estilos.modalSub,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                {profissionalSelecionado?.nome} ({profissionalSelecionado?.comissaoPorcentagem || 50}%)
              </Text>

              <TextInput
                accessibilityLabel="Valor do serviço em reais para simulação"
                style={[
                  estilos.inputModal,
                  {
                    backgroundColor: tema.bgElevated,
                    color: tema.textPrimary,
                    fontSize: tema.fontSize(15),
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                  },
                ]}
                placeholder="Valor do Serviço (R$)"
                placeholderTextColor={tema.textMuted}
                keyboardType="numeric"
                value={valorServico}
                onChangeText={(text) => setValorServico(formatarMoeda(text))}
              />

              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Calcular comissão"
                style={[
                  estilos.botaoCalcular,
                  {
                    backgroundColor: tema.accent,
                    minHeight: tema.minTouchHeight,
                    justifyContent: 'center',
                  },
                ]}
                onPress={calcularComissaoSimulacao}
              >
                <Text
                  style={[
                    estilos.textoBotao,
                    { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Calcular
                </Text>
              </TouchableOpacity>

              {comissaoCalculada !== null && (
                <View
                  accessible
                  accessibilityLabel={`Valor calculado para a profissional: R$ ${comissaoCalculada.replace('.', ',')}`}
                  style={[
                    estilos.resultadoBox,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                      borderWidth: config.altoContraste ? 1 : 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      estilos.resultadoTexto,
                      { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                    ]}
                  >
                    Valor para o Profissional:
                  </Text>
                  <Text
                    style={[
                      estilos.resultadoValor,
                      { color: tema.accent, fontSize: tema.fontSize(22) },
                    ]}
                  >
                    R$ {comissaoCalculada.replace('.', ',')}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Fechar simulador de comissão"
                style={[
                  estilos.botaoFecharModal,
                  {
                    backgroundColor: tema.bgElevated,
                    borderColor: config.altoContraste ? tema.borderSubtle : 'transparent',
                    borderWidth: config.altoContraste ? 1 : 0,
                    minHeight: tema.minTouchHeight,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setModalVisivel(false)}
              >
                <Text
                  style={[
                    estilos.textoBotaoCancelar,
                    { color: tema.textPrimary, fontSize: tema.fontSize(14) },
                  ]}
                >
                  Fechar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  vazioBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  vazioTexto: {
    textAlign: 'center',
  },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitulo: { fontWeight: 'bold' },
  cardSub: { marginTop: 2 },
  botaoSimular: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  textoSimular: { fontWeight: 'bold' },
  comissaoAtual: { marginBottom: 10, fontWeight: '600' },
  rowInput: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  inputModal: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  botaoSalvar: { paddingHorizontal: 20, justifyContent: 'center', borderRadius: 12 },
  textoBotao: { fontWeight: 'bold' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
  },
  modalTitulo: { fontWeight: 'bold', textAlign: 'center' },
  modalSub: { textAlign: 'center', marginBottom: 20 },
  botaoCalcular: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  resultadoBox: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  resultadoTexto: {},
  resultadoValor: { fontWeight: 'bold', marginTop: 4 },
  botaoFecharModal: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  textoBotaoCancelar: { fontWeight: 'bold' },
});
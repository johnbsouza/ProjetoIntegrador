import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function TelaEstoqueCaixa() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [produtos, setProdutos] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [precoFormatado, setPrecoFormatado] = useState('');
  const [idEditando, setIdEditando] = useState(null);

  const buscarProdutos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'estoque'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        lista.push({ id: documento.id, ...documento.data() });
      });
      setProdutos(lista);
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function salvarProduto() {
    if (!nome || !quantidade || !precoFormatado) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    const precoNumerico = Number(precoFormatado.replace(/[^\d]/g, '')) / 100;

    try {
      if (idEditando) {
        const docRef = doc(db, 'estoque', idEditando);
        await updateDoc(docRef, {
          nome,
          quantidade: Number(quantidade),
          preco: precoNumerico,
        });
        Alert.alert('Sucesso', 'Item atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'estoque'), {
          nome,
          quantidade: Number(quantidade),
          preco: precoNumerico,
        });
        Alert.alert('Sucesso', 'Item adicionado ao estoque!');
      }

      fecharModal();
      buscarProdutos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível guardar o item.');
    }
  }

  async function excluirProduto(id) {
    try {
      await deleteDoc(doc(db, 'estoque', id));
      buscarProdutos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  }

  function abrirEdicao(item) {
    setIdEditando(item.id);
    setNome(item.nome);
    setQuantidade(String(item.quantidade));
    setPrecoFormatado((item.preco * 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    setModalVisivel(true);
  }

  function fecharModal() {
    setIdEditando(null);
    setNome('');
    setQuantidade('');
    setPrecoFormatado('');
    setModalVisivel(false);
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
            Caixa e Estoque
          </Text>
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Adicionar novo produto ao estoque"
            style={[
              estilos.addButton,
              {
                minWidth: tema.minTouchHeight,
                minHeight: tema.minTouchHeight,
                backgroundColor: tema.accent,
              },
            ]}
            onPress={() => setModalVisivel(true)}
          >
            <Ionicons name="add" size={22} color={tema.textOnAccent} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            estilos.lista,
            { paddingBottom: 88 + tema.espacoExtra, gap: 12 + tema.espacoExtra },
          ]}
          ListEmptyComponent={
            <View style={estilos.vazioBox}>
              <Ionicons name="cube-outline" size={40} color={tema.textMuted} accessible={false} />
              <Text
                style={[
                  estilos.vazioTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                ]}
              >
                Nenhum produto cadastrado no estoque.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const precoTexto = `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`;
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
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={[
                      estilos.cardTitulo,
                      { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {item.nome}
                  </Text>
                  <Text
                    style={[
                      estilos.cardSub,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Qtd em Stock: {item.quantidade} unidades
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                  <Text
                    style={[
                      estilos.cardValor,
                      { color: tema.accent, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {precoTexto}
                  </Text>
                </View>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar produto ${item.nome}`}
                  onPress={() => abrirEdicao(item)}
                  style={[
                    estilos.acaoBtn,
                    {
                      minWidth: tema.minTouchHeight,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Ionicons name="create-outline" size={18} color={tema.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir produto ${item.nome}`}
                  onPress={() => excluirProduto(item.id)}
                  style={[
                    estilos.acaoBtn,
                    {
                      minWidth: tema.minTouchHeight,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Ionicons name="trash-outline" size={18} color={tema.danger} />
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <Modal
          visible={modalVisivel}
          animationType="slide"
          transparent
          accessibilityViewIsModal
          onRequestClose={fecharModal}
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
                {idEditando ? 'Editar Produto' : 'Novo Produto'}
              </Text>

              <TextInput
                accessibilityLabel="Nome do Produto"
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
                placeholder="Nome do Produto"
                placeholderTextColor={tema.textMuted}
                maxLength={40}
                value={nome}
                onChangeText={setNome}
              />

              <TextInput
                accessibilityLabel="Quantidade em estoque"
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
                placeholder="Quantidade"
                placeholderTextColor={tema.textMuted}
                keyboardType="numeric"
                value={quantidade}
                onChangeText={setQuantidade}
              />

              <TextInput
                accessibilityLabel="Preço Unitário em Reais"
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
                placeholder="Preço Unitário (R$)"
                placeholderTextColor={tema.textMuted}
                keyboardType="numeric"
                value={precoFormatado}
                onChangeText={(text) => setPrecoFormatado(formatarMoeda(text))}
              />

              <View style={[estilos.modalBotoes, { gap: 10 + tema.espacoExtra }]}>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar operação"
                  style={[
                    estilos.botaoCancelar,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: config.altoContraste ? tema.borderSubtle : 'transparent',
                      borderWidth: config.altoContraste ? 1 : 0,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={fecharModal}
                >
                  <Text
                    style={[
                      estilos.textoBotaoCancelar,
                      { color: tema.textPrimary, fontSize: tema.fontSize(14) },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel="Salvar produto"
                  style={[
                    estilos.botaoSalvarModal,
                    {
                      backgroundColor: tema.accent,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={salvarProduto}
                >
                  <Text
                    style={[
                      estilos.textoBotaoSalvar,
                      { color: tema.textOnAccent, fontSize: tema.fontSize(14) },
                    ]}
                  >
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloTopo: { fontWeight: 'bold', letterSpacing: 0.5 },
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  cardTitulo: { fontWeight: 'bold' },
  cardSub: { marginTop: 4 },
  cardValor: { fontWeight: 'bold' },
  acaoBtn: { padding: 8 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
  },
  modalTitulo: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalBotoes: { flexDirection: 'row', marginTop: 10 },
  botaoCancelar: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  textoBotaoCancelar: { fontWeight: 'bold' },
  botaoSalvarModal: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  textoBotaoSalvar: { fontWeight: 'bold' },
});
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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

export default function TelaServicos() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [servicos, setServicos] = useState([]);
  const [nome, setNome] = useState('');
  const [precoFormatado, setPrecoFormatado] = useState('');
  const [tempo, setTempo] = useState('');
  const [id, setId] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const referencia = collection(db, 'servicos');

    const cancelar = onSnapshot(
      referencia,
      (snapshot) => {
        const lista = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setServicos(lista);
        setCarregando(false);
      },
      (erro) => {
        console.error('Erro ao buscar os serviços:', erro);
        setCarregando(false);
        Alert.alert('Erro', 'Não foi possível carregar os serviços');
      }
    );
    return cancelar;
  }, []);

  function excluirServico(servicoId) {
    Alert.alert(
      'Excluir serviço',
      'Deseja realmente excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'servicos', servicoId));
              Alert.alert('Sucesso', 'Serviço excluído com sucesso.');
            } catch (error) {
              console.error('Erro ao excluir serviço:', error);
              Alert.alert('Erro', 'Não foi possível excluir o serviço.');
            }
          },
        },
      ]
    );
  }

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function converterMinutosParaHoras(minutos) {
    const min = Number(minutos);
    if (!min || isNaN(min)) return '0min';
    const horas = Math.floor(min / 60);
    const resto = min % 60;
    if (horas === 0) return `${resto}min`;
    if (resto === 0) return `${horas}h`;
    return `${horas}h${resto < 10 ? '0' : ''}${resto}`;
  }

  async function salvarEatualizarServico() {
    const precoNumerico = Number(precoFormatado.replace(/[^\d]/g, '')) / 100;
    const tempoNumerico = Number(tempo);

    if (!nome.trim()) {
      Alert.alert('Nome', 'Digite um nome de serviço!');
      return;
    } else if (!Number.isFinite(precoNumerico) || precoNumerico <= 0) {
      Alert.alert('Preço', 'Digite um preço válido.');
      return;
    } else if (!Number.isInteger(tempoNumerico) || tempoNumerico <= 0) {
      Alert.alert('Tempo', 'Digite um tempo de serviço em minutos');
      return;
    }

    try {
      if (id) {
        const docRef = doc(db, 'servicos', id);
        await updateDoc(docRef, {
          nome,
          preco: precoNumerico,
          tempo: Number(tempo),
          servicoAtualizadoEm: serverTimestamp(),
        });
        Alert.alert('Sucesso', 'Serviço atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'servicos'), {
          nome,
          preco: precoNumerico,
          tempo: tempoNumerico,
          servicoCriadoEm: serverTimestamp(),
        });
        Alert.alert('Sucesso', 'Serviço criado com sucesso!', [{ text: 'OK' }]);
      }

      fecharModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível guardar o serviço.');
    } finally {
      setCarregando(false)
    }
  }

  function abrirEdicao(item) {
    setId(item.id);
    setNome(item.nome);
    setPrecoFormatado(Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    setTempo(String(item.tempo));
    setModalVisivel(true);
  }

  function fecharModal() {
    setId(null);
    setNome('');
    setPrecoFormatado('');
    setTempo('');
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
            Catálogo de Serviços
          </Text>
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Adicionar novo serviço"
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

        {carregando ? (
          <ActivityIndicator
            color={tema.accent}
            accessibilityLabel="Carregando catálogo de serviços"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={servicos}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              estilos.lista,
              { paddingBottom: 88 + tema.espacoExtra, gap: 12 + tema.espacoExtra },
            ]}
            ListEmptyComponent={
              <View style={estilos.vazioBox}>
                <Ionicons name="sparkles-outline" size={40} color={tema.textMuted} accessible={false} />
                <Text
                  style={[
                    estilos.vazioTexto,
                    { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                  ]}
                >
                  Nenhum serviço cadastrado no catálogo.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const duracaoTexto = converterMinutosParaHoras(item.tempo);
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
                      Duração: {duracaoTexto}
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
                    accessibilityLabel={`Editar serviço ${item.nome}`}
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
                    accessibilityLabel={`Excluir serviço ${item.nome}`}
                    onPress={() => excluirServico(item.id)}
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
        )}

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
                {id ? 'Editar Serviço' : 'Novo Serviço'}
              </Text>

              <TextInput
                accessibilityLabel="Nome do Serviço"
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
                placeholder="Nome do Serviço"
                placeholderTextColor={tema.textMuted}
                maxLength={40}
                value={nome}
                onChangeText={setNome}
              />

              <TextInput
                accessibilityLabel="Preço do Serviço em Reais"
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
                placeholder="Preço (R$)"
                placeholderTextColor={tema.textMuted}
                keyboardType="numeric"
                value={precoFormatado}
                onChangeText={(text) => setPrecoFormatado(formatarMoeda(text))}
              />

              <TextInput
                accessibilityLabel="Tempo de duração em minutos"
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
                placeholder="Tempo em minutos (ex: 90)"
                placeholderTextColor={tema.textMuted}
                keyboardType="numeric"
                value={tempo}
                onChangeText={setTempo}
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
                  accessibilityLabel="Salvar serviço"
                  style={[
                    estilos.botaoSalvarModal,
                    {
                      backgroundColor: tema.accent,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={salvarEatualizarServico}
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
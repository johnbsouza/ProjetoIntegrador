import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function TelaPacotesServicos() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [pacotes, setPacotes] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoFormatado, setPrecoFormatado] = useState('');

  const buscarPacotes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pacotes'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        lista.push({ id: documento.id, ...documento.data() });
      });
      setPacotes(lista);
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
    }
  };

  useEffect(() => {
    buscarPacotes();
  }, []);

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function salvarPacote() {
    if (!nome || !precoFormatado) {
      Alert.alert('Atenção', 'Preencha o nome e o preço.');
      return;
    }

    const precoNumerico = Number(precoFormatado.replace(/[^\d]/g, '')) / 100;

    try {
      await addDoc(collection(db, 'pacotes'), {
        nome,
        descricao,
        preco: precoNumerico,
      });
      fecharModal();
      buscarPacotes();
      Alert.alert('Sucesso', 'Pacote criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível guardar o pacote.');
    }
  }

  async function excluirPacote(id) {
    try {
      await deleteDoc(doc(db, 'pacotes', id));
      buscarPacotes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  }

  function fecharModal() {
    setNome('');
    setDescricao('');
    setPrecoFormatado('');
    setModalVisivel(false);
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
            Pacotes de Serviços
          </Text>
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Adicionar novo pacote de serviços"
            style={[
              styles.addButton,
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
          data={pacotes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.lista,
            { paddingBottom: 88 + tema.espacoExtra, gap: 12 + tema.espacoExtra },
          ]}
          ListEmptyComponent={
            <View style={styles.vazioBox}>
              <Ionicons name="gift-outline" size={40} color={tema.textMuted} accessible={false} />
              <Text
                style={[
                  styles.vazioTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                ]}
              >
                Nenhum pacote cadastrado no momento.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const precoTexto = `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`;
            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  },
                ]}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={[
                      styles.cardTitulo,
                      { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {item.nome}
                  </Text>
                  {Boolean(item.descricao) && (
                    <Text
                      style={[
                        styles.cardSub,
                        { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {item.descricao}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                  <Text
                    style={[
                      styles.cardValor,
                      { color: tema.accent, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {precoTexto}
                  </Text>
                </View>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir pacote ${item.nome}`}
                  onPress={() => excluirPacote(item.id)}
                  style={[
                    styles.acaoBtn,
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
          <View style={styles.modalFundo}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                },
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[
                  styles.modalTitulo,
                  { color: tema.accent, fontSize: tema.fontSize(20) },
                ]}
              >
                Novo Pacote
              </Text>

              <TextInput
                accessibilityLabel="Nome do Pacote"
                style={[
                  styles.input,
                  {
                    backgroundColor: tema.bgElevated,
                    color: tema.textPrimary,
                    fontSize: tema.fontSize(15),
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                  },
                ]}
                placeholder="Nome do Pacote"
                placeholderTextColor={tema.textMuted}
                value={nome}
                onChangeText={setNome}
              />
              <TextInput
                accessibilityLabel="Descrição do Pacote"
                style={[
                  styles.input,
                  {
                    backgroundColor: tema.bgElevated,
                    color: tema.textPrimary,
                    fontSize: tema.fontSize(15),
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                  },
                ]}
                placeholder="Descrição (ex: 4 Manicures + 2 Pedicures)"
                placeholderTextColor={tema.textMuted}
                value={descricao}
                onChangeText={setDescricao}
              />
              <TextInput
                accessibilityLabel="Preço Total do Pacote em Reais"
                style={[
                  styles.input,
                  {
                    backgroundColor: tema.bgElevated,
                    color: tema.textPrimary,
                    fontSize: tema.fontSize(15),
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                  },
                ]}
                placeholder="Preço Total (R$)"
                placeholderTextColor={tema.textMuted}
                keyboardType="numeric"
                value={precoFormatado}
                onChangeText={(text) => setPrecoFormatado(formatarMoeda(text))}
              />

              <View style={[styles.modalBotoes, { gap: 10 + tema.espacoExtra }]}>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar criação de pacote"
                  style={[
                    styles.botaoCancelar,
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
                      styles.textoBotaoCancelar,
                      { color: tema.textPrimary, fontSize: tema.fontSize(14) },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel="Salvar novo pacote"
                  style={[
                    styles.botaoSalvarModal,
                    {
                      backgroundColor: tema.accent,
                      minHeight: tema.minTouchHeight,
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={salvarPacote}
                >
                  <Text
                    style={[
                      styles.textoBotaoSalvar,
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
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
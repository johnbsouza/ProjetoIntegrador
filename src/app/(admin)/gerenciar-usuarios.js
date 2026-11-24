import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function GerenciarUsuariosScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [comissao, setComissao] = useState('50');

  const buscarUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const lista = [];
      querySnapshot.forEach((documento) => {
        lista.push({ id: documento.id, ...documento.data() });
      });
      setUsuarios(lista);
      setUsuariosFiltrados(lista);
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  useEffect(() => {
    if (busca.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const termo = busca.toLowerCase();
      const filtrados = usuarios.filter((item) => {
        const nomeMatch = item.nome && item.nome.toLowerCase().includes(termo);
        const emailMatch = item.email && item.email.toLowerCase().includes(termo);
        return nomeMatch || emailMatch;
      });
      setUsuariosFiltrados(filtrados);
    }
  }, [busca, usuarios]);

  function abrirModal(usuario) {
    if (usuario.id === auth.currentUser?.uid) {
      Alert.alert('Restrição de Segurança', 'Por motivos de segurança, você não pode alterar o seu próprio nível de acesso.');
      return;
    }
    setUsuarioSelecionado(usuario);
    setComissao(String(usuario.comissaoPorcentagem || '50'));
    setModalVisivel(true);
  }

  function confirmarAlteracaoAcesso(novoNivel) {
    if (!usuarioSelecionado) return;

    Alert.alert(
      'Confirmar Alteração',
      `Deseja alterar o acesso de '${usuarioSelecionado.nome || usuarioSelecionado.email}' para '${novoNivel}'?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Alterar',
          onPress: () => executarAlteracaoAcesso(novoNivel),
        },
      ]
    );
  }

  async function executarAlteracaoAcesso(novoNivel) {
    try {
      const docRef = doc(db, 'usuarios', usuarioSelecionado.id);
      const dadosAtualizados = {
        nivelAcesso: novoNivel,
        comissaoPorcentagem: novoNivel === 'profissional' ? Number(comissao) : 0,
      };

      await updateDoc(docRef, dadosAtualizados);

      Alert.alert('Sucesso', `Acesso alterado para '${novoNivel}' com sucesso!`);
      setModalVisivel(false);
      setUsuarioSelecionado(null);
      buscarUsuarios();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o nível de acesso.');
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
            Controle de Acessos
          </Text>
        </View>

        <View
          style={[
            styles.buscaContainer,
            {
              backgroundColor: tema.bgElevated,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              minHeight: tema.minTouchHeight,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={tema.textMuted} style={{ marginRight: 10 }} accessible={false} />
          <TextInput
            accessibilityLabel="Pesquisar utilizador por nome ou e-mail"
            style={[
              styles.buscaInput,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
            placeholder="Pesquisar por nome ou e-mail..."
            placeholderTextColor={tema.textMuted}
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
          />
          {busca.length > 0 && (
            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Limpar pesquisa"
              onPress={() => setBusca('')}
            >
              <Ionicons name="close-circle" size={18} color={tema.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.lista,
            { paddingBottom: 88 + tema.espacoExtra, gap: 12 + tema.espacoExtra },
          ]}
          ListEmptyComponent={
            <Text
              style={[
                styles.vazioTexto,
                { color: tema.textSecondary, fontSize: tema.fontSize(14) },
              ]}
            >
              Nenhum utilizador encontrado.
            </Text>
          }
          renderItem={({ item }) => {
            const nomeItem = item.nome || 'Sem Nome';
            const perfilAtual = item.nivelAcesso || 'cliente';
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
                <View
                  style={[
                    styles.avatarBox,
                    { backgroundColor: tema.bgElevated },
                  ]}
                  accessible={false}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: tema.accent, fontSize: tema.fontSize(18) },
                    ]}
                  >
                    {item.nome ? item.nome[0].toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={[
                      styles.cardTitulo,
                      { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {nomeItem}
                  </Text>
                  <Text
                    style={[
                      styles.cardSub,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    {item.email}
                  </Text>
                  <Text
                    style={[
                      styles.cardPerfil,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Perfil:{' '}
                    <Text style={{ color: tema.accent, fontWeight: 'bold' }}>
                      {perfilAtual}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Alterar nível de acesso de ${nomeItem}, perfil atual ${perfilAtual}`}
                  style={[
                    styles.botaoEditar,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                      borderWidth: config.altoContraste ? 1 : 0,
                      minWidth: tema.minTouchHeight,
                      minHeight: tema.minTouchHeight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={() => abrirModal(item)}
                >
                  <Ionicons name="create-outline" size={20} color={tema.accent} />
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
          onRequestClose={() => setModalVisivel(false)}
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
                Alterar Permissão
              </Text>
              <Text
                style={[
                  styles.modalSub,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                {usuarioSelecionado?.nome || usuarioSelecionado?.email}
              </Text>

              {[
                { key: 'cliente', label: 'Cliente' },
                { key: 'profissional', label: 'Profissional' },
                { key: 'admin', label: 'Administrador' },
              ].map((opcao) => {
                const selecionada = usuarioSelecionado?.nivelAcesso === opcao.key;
                return (
                  <TouchableOpacity
                    key={opcao.key}
                    hitSlop={tema.hitSlopPadrao}
                    accessibilityRole="button"
                    accessibilityLabel={`Definir acesso como ${opcao.label}`}
                    accessibilityState={{ selected: selecionada }}
                    style={[
                      styles.opcaoBtn,
                      {
                        minHeight: tema.minTouchHeight,
                        justifyContent: 'center',
                        backgroundColor: selecionada ? tema.accent : tema.bgElevated,
                        borderColor: selecionada ? tema.accent : tema.borderSubtle,
                        marginBottom: 10 + tema.espacoExtra,
                      },
                    ]}
                    onPress={() => confirmarAlteracaoAcesso(opcao.key)}
                  >
                    <Text
                      style={[
                        styles.opcaoTxt,
                        {
                          fontSize: tema.fontSize(15),
                          color: selecionada ? tema.textOnAccent : tema.textPrimary,
                        },
                      ]}
                    >
                      {opcao.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {usuarioSelecionado?.nivelAcesso === 'profissional' && (
                <TextInput
                  accessibilityLabel="Percentual de comissão"
                  style={[
                    styles.inputComissao,
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
                  maxLength={3}
                  value={comissao}
                  onChangeText={setComissao}
                />
              )}

              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Cancelar alteração de permissão"
                style={[
                  styles.botaoFechar,
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
                    styles.textoFechar,
                    { color: tema.textPrimary, fontSize: tema.fontSize(14) },
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
  },
  buscaInput: { flex: 1 },
  lista: {},
  vazioTexto: { textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatarBox: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { fontWeight: 'bold' },
  cardTitulo: { fontWeight: 'bold' },
  cardSub: { marginTop: 2 },
  cardPerfil: { marginTop: 4 },
  botaoEditar: { padding: 10, borderRadius: 12 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
  },
  modalTitulo: { fontWeight: 'bold', textAlign: 'center' },
  modalSub: { textAlign: 'center', marginBottom: 20 },
  opcaoBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  opcaoTxt: { fontWeight: 'bold' },
  inputComissao: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 10,
  },
  botaoFechar: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  textoFechar: { fontWeight: 'bold' },
});
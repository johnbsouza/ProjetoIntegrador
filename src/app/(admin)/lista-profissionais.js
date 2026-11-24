import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
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

export default function ListaProfissionaisScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [equipe, setEquipe] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [comissaoInput, setComissaoInput] = useState('');
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
      setEquipe(lista);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  };

  useEffect(() => {
    buscarProfissionais();
  }, []);

  async function atualizarComissao(id) {
    if (!comissaoInput) {
      Alert.alert('Atenção', 'Insira a percentagem de comissão.');
      return;
    }

    try {
      const docRef = doc(db, 'usuarios', id);
      await updateDoc(docRef, { comissaoPorcentagem: Number(comissaoInput) });
      Alert.alert('Sucesso', 'Comissão atualizada com sucesso!');
      setComissaoInput('');
      buscarProfissionais();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a comissão.');
    }
  }

  function formatarMoeda(valor) {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calcularComissaoSimulacao() {
    if (!valorServico || !profissionalSelecionado) return;
    const valorNum = Number(valorServico.replace(/[^\d]/g, '')) / 100;
    const porcentagem = profissionalSelecionado.comissaoPorcentagem || 50;
    const resultado = (valorNum * porcentagem) / 100;
    setComissaoCalculada(resultado.toFixed(2));
  }

  function abrirSimulador(prof) {
    setProfissionalSelecionado(prof);
    setValorServico('');
    setComissaoCalculada(null);
    setModalVisivel(true);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + tema.espacoExtra },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerTopo}>
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
            Gestão de Equipe
          </Text>
        </View>

        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Adicionar nova profissional"
          style={[
            styles.addButton,
            {
              backgroundColor: tema.accent,
              minHeight: tema.minTouchHeight,
              marginBottom: 25 + tema.espacoExtra,
            },
          ]}
          onPress={() => router.push('/(admin)/novo-profissional')}
        >
          <Ionicons name="person-add-outline" size={20} color={tema.textOnAccent} accessible={false} />
          <Text
            style={[
              styles.addButtonText,
              { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
            ]}
          >
            Adicionar Nova Profissional
          </Text>
        </TouchableOpacity>

        <Text
          accessibilityRole="header"
          style={[
            styles.sectionTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Colaboradoras Cadastradas
        </Text>

        {equipe.length === 0 ? (
          <Text
            style={[
              styles.vazioText,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Nenhuma profissional cadastrada no momento.
          </Text>
        ) : (
          equipe.map((prof) => {
            const nomeProf = prof.nome || 'Profissional';
            const comissaoAtual = prof.comissaoPorcentagem || 50;
            return (
              <View
                key={prof.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    marginBottom: 15 + tema.espacoExtra,
                  },
                ]}
              >
                <View style={styles.cardTopRow}>
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
                      {prof.nome ? prof.nome[0].toUpperCase() : 'P'}
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text
                      style={[
                        styles.nomeText,
                        { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                      ]}
                    >
                      {nomeProf}
                    </Text>
                    <Text
                      style={[
                        styles.cargoText,
                        { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {prof.email}
                    </Text>
                    <Text
                      style={[
                        styles.comissaoLabel,
                        { color: tema.accent, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      Comissão: {comissaoAtual}%
                    </Text>
                  </View>
                  <TouchableOpacity
                    hitSlop={tema.hitSlopPadrao}
                    accessibilityRole="button"
                    accessibilityLabel={`Simular comissão de ${nomeProf}`}
                    onPress={() => abrirSimulador(prof)}
                    style={[
                      styles.simularBtn,
                      {
                        minWidth: tema.minTouchHeight,
                        minHeight: tema.minTouchHeight,
                        backgroundColor: tema.bgElevated,
                        borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                        borderWidth: config.altoContraste ? 1 : 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    ]}
                  >
                    <Ionicons name="calculator-outline" size={20} color={tema.accent} />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.rowComissao,
                    {
                      borderTopColor: tema.borderSubtle,
                      gap: 10 + tema.espacoExtra,
                    },
                  ]}
                >
                  <TextInput
                    accessibilityLabel={`Nova porcentagem de comissão para ${nomeProf}`}
                    style={[
                      styles.inputComissao,
                      {
                        backgroundColor: tema.bgElevated,
                        color: tema.textPrimary,
                        fontSize: tema.fontSize(14),
                        borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                        minHeight: tema.minTouchHeight,
                      },
                    ]}
                    placeholder="Nova %"
                    placeholderTextColor={tema.textMuted}
                    keyboardType="numeric"
                    maxLength={3}
                    onChangeText={setComissaoInput}
                  />
                  <TouchableOpacity
                    hitSlop={tema.hitSlopPadrao}
                    accessibilityRole="button"
                    accessibilityLabel={`Salvar nova comissão de ${nomeProf}`}
                    style={[
                      styles.btnSalvarComissao,
                      {
                        backgroundColor: tema.accent,
                        minHeight: tema.minTouchHeight,
                      },
                    ]}
                    onPress={() => atualizarComissao(prof.id)}
                  >
                    <Text
                      style={[
                        styles.txtSalvarComissao,
                        { color: tema.textOnAccent, fontSize: tema.fontSize(13) },
                      ]}
                    >
                      Alterar %
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

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
              Simular Comissão
            </Text>
            <Text
              style={[
                styles.modalSub,
                { color: tema.textSecondary, fontSize: tema.fontSize(13) },
              ]}
            >
              {profissionalSelecionado?.nome} ({profissionalSelecionado?.comissaoPorcentagem || 50}%)
            </Text>

            <TextInput
              accessibilityLabel="Valor do serviço em reais para simulação"
              style={[
                styles.inputModal,
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
                styles.botaoCalcular,
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
                  styles.textoBotaoCalc,
                  { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
                ]}
              >
                Calcular Comissão
              </Text>
            </TouchableOpacity>

            {comissaoCalculada !== null && (
              <View
                accessible
                accessibilityLabel={`Valor calculado para a profissional: R$ ${comissaoCalculada.replace('.', ',')}`}
                style={[
                  styles.resultadoBox,
                  {
                    backgroundColor: tema.bgElevated,
                    borderColor: config.altoContraste ? tema.accentBorder : 'transparent',
                    borderWidth: config.altoContraste ? 1 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resultadoTexto,
                    { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                  ]}
                >
                  Valor para a Profissional:
                </Text>
                <Text
                  style={[
                    styles.resultadoValor,
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
                styles.botaoFecharModal,
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
                  styles.textoBotaoFechar,
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  headerTopo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tituloTopo: { fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: { fontWeight: 'bold' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
  vazioText: { textAlign: 'center', marginTop: 20 },
  card: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarBox: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { fontWeight: 'bold' },
  infoBox: { flex: 1, marginRight: 8 },
  nomeText: { fontWeight: 'bold', marginBottom: 2 },
  cargoText: {},
  comissaoLabel: { fontWeight: '600', marginTop: 4 },
  simularBtn: { padding: 8, borderRadius: 10 },
  rowComissao: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  inputComissao: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  btnSalvarComissao: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10 },
  txtSalvarComissao: { fontWeight: 'bold' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
  },
  modalTitulo: { fontWeight: 'bold', textAlign: 'center' },
  modalSub: { textAlign: 'center', marginBottom: 20 },
  inputModal: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  botaoCalcular: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  textoBotaoCalc: { fontWeight: 'bold' },
  resultadoBox: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  resultadoTexto: {},
  resultadoValor: { fontWeight: 'bold', marginTop: 4 },
  botaoFecharModal: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  textoBotaoFechar: { fontWeight: 'bold' },
});
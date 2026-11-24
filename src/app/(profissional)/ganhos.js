import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

const COMISSAO_PADRAO_PERCENTUAL = 50;

function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function normalizarStatus(status) {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'concluido' || s === 'concluído') return 'concluido';
  if (s === 'cancelado') return 'cancelado';
  return 'confirmado';
}

function extrairPercentualComissao(dadosUsuario) {
  if (!dadosUsuario) return COMISSAO_PADRAO_PERCENTUAL;
  const bruto =
    dadosUsuario.comissaoPorcentagem ??
    dadosUsuario.percentualComissao ??
    dadosUsuario.comissao ??
    dadosUsuario.porcentagemComissao ??
    COMISSAO_PADRAO_PERCENTUAL;

  const limpo =
    typeof bruto === 'string'
      ? Number(bruto.replace('%', '').replace(',', '.').trim())
      : Number(bruto);

  if (!Number.isFinite(limpo) || limpo < 0) {
    return COMISSAO_PADRAO_PERCENTUAL;
  }
  return Math.min(limpo, 100);
}

export default function GanhosComissoesScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const usuarioAtual = auth.currentUser;

  const [nomeProfissional, setNomeProfissional] = useState(
    usuarioAtual?.displayName || 'Profissional'
  );
  const [percentualComissao, setPercentualComissao] = useState(
    COMISSAO_PADRAO_PERCENTUAL
  );
  const [servicosConcluidos, setServicosConcluidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    if (!usuarioAtual?.uid) {
      setCarregando(false);
      return;
    }

    const userRef = doc(db, 'usuarios', usuarioAtual.uid);
    const unsubUser = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const dados = snap.data();
          if (dados.nome) setNomeProfissional(dados.nome);
          setPercentualComissao(extrairPercentualComissao(dados));
        }
      },
      (error) => {
        console.error('Erro ao carregar dados da profissional:', error);
      }
    );

    return () => unsubUser();
  }, [usuarioAtual?.uid]);

  useEffect(() => {
    if (!usuarioAtual?.uid) {
      setServicosConcluidos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    const docsMap = new Map();

    function atualizarListaConcluidos() {
      const filtrados = Array.from(docsMap.values()).filter((item) => {
        const profId = item.idProfissional || item.profissionalId || '';
        return profId === usuarioAtual.uid && normalizarStatus(item.status) === 'concluido';
      });

      filtrados.sort((a, b) => {
        const chaveA = `${a.data || a.dataAgendamento || ''} ${a.horario || ''}`;
        const chaveB = `${b.data || b.dataAgendamento || ''} ${b.horario || ''}`;
        return chaveB.localeCompare(chaveA);
      });

      setServicosConcluidos(filtrados);
      setCarregando(false);
      setAtualizando(false);
    }

    const qPrincipal = query(
      collection(db, 'agendamentos'),
      where('idProfissional', '==', usuarioAtual.uid)
    );

    const qLegado = query(
      collection(db, 'agendamentos'),
      where('profissionalId', '==', usuarioAtual.uid)
    );

    const unsubPrincipal = onSnapshot(
      qPrincipal,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            docsMap.delete(change.doc.id);
          } else {
            docsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
          }
        });
        atualizarListaConcluidos();
      },
      (error) => {
        console.error('Erro ao buscar agendamentos para comissões:', error);
        Alert.alert('Erro', 'Não foi possível calcular os ganhos.');
        setCarregando(false);
        setAtualizando(false);
      }
    );

    const unsubLegado = onSnapshot(
      qLegado,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            if (!snapshot.docs.some((d) => d.id === change.doc.id)) {
              docsMap.delete(change.doc.id);
            }
          } else if (!docsMap.has(change.doc.id)) {
            docsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
          }
        });
        atualizarListaConcluidos();
      },
      () => {}
    );

    return () => {
      unsubPrincipal();
      unsubLegado();
    };
  }, [usuarioAtual?.uid]);

  const resumoFinanceiro = useMemo(() => {
    const totalBruto = servicosConcluidos.reduce((soma, item) => {
      return soma + (Number(item.preco) || 0);
    }, 0);

    const valorComissao = totalBruto * (percentualComissao / 100);
    const parteSalao = totalBruto - valorComissao;

    return {
      quantidade: servicosConcluidos.length,
      totalBruto,
      valorComissao,
      parteSalao,
    };
  }, [servicosConcluidos, percentualComissao]);

  function handleRefresh() {
    setAtualizando(true);
    setTimeout(() => setAtualizando(false), 500);
  }

  function renderItem({ item }) {
    const precoItem = Number(item.preco) || 0;
    const comissaoItem = precoItem * (percentualComissao / 100);
    const nomeCliente = item.nomeCliente || item.clienteNome || 'Cliente';
    const nomeServico = item.nomeServico || item.servicoNome || 'Serviço';
    const dataExibicao = item.dataFormatada || item.data || item.dataAgendamento || '';

    return (
      <View
        accessible
        accessibilityLabel={`${nomeServico}, valor bruto ${formatarMoeda(precoItem)}, cliente ${nomeCliente}${dataExibicao ? `, em ${dataExibicao}` : ''}${item.horario ? ` às ${item.horario}` : ''}. Comissão de ${percentualComissao}%: ${formatarMoeda(comissaoItem)}`}
        style={[
          styles.cardItem,
          {
            backgroundColor: tema.bgSurface,
            borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
          },
        ]}
      >
        <View style={styles.cardTopo}>
          <Text
            style={[
              styles.servicoNome,
              { color: tema.textPrimary, fontSize: tema.fontSize(15) },
            ]}
          >
            {nomeServico}
          </Text>
          <Text
            style={[
              styles.precoBruto,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            {formatarMoeda(precoItem)}
          </Text>
        </View>

        <Text
          style={[
            styles.detalheTexto,
            { color: tema.textMuted, fontSize: tema.fontSize(12) },
          ]}
        >
          Cliente: {nomeCliente}
          {dataExibicao ? ` • ${dataExibicao}` : ''}
          {item.horario ? ` às ${item.horario}` : ''}
        </Text>

        <View
          style={[
            styles.cardRodape,
            { borderTopColor: tema.borderSubtle },
          ]}
        >
          <Text
            style={[
              styles.comissaoLabel,
              { color: tema.textSecondary, fontSize: tema.fontSize(12) },
            ]}
          >
            Comissão ({percentualComissao}%):
          </Text>
          <Text
            style={[
              styles.comissaoValor,
              { color: tema.success, fontSize: tema.fontSize(14) },
            ]}
          >
            {formatarMoeda(comissaoItem)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: tema.bgSurface,
            borderBottomColor: tema.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={tema.textPrimary} />
        </TouchableOpacity>
        <Text
          accessibilityRole="header"
          style={[
            styles.topTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Ganhos e Comissões
        </Text>
        <View style={{ width: Math.max(24, tema.minTouchHeight) }} />
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={tema.accent} />
          <Text
            style={[
              styles.estadoTexto,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Calculando suas comissões...
          </Text>
        </View>
      ) : !usuarioAtual ? (
        <View style={styles.centro}>
          <Ionicons name="lock-closed-outline" size={44} color={tema.textMuted} accessible={false} />
          <Text
            style={[
              styles.estadoTitulo,
              { color: tema.textPrimary, fontSize: tema.fontSize(17) },
            ]}
          >
            Sessão não encontrada
          </Text>
          <Text
            style={[
              styles.estadoTexto,
              { color: tema.textSecondary, fontSize: tema.fontSize(14) },
            ]}
          >
            Faça login na conta profissional para visualizar seus ganhos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={servicosConcluidos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listaContent,
            {
              paddingBottom: 88 + tema.espacoExtra,
              gap: 12 + tema.espacoExtra,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={handleRefresh}
              tintColor={tema.accent}
              colors={[tema.accent]}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerBloco}>
              <View
                accessible
                accessibilityLabel={`Sua comissão a receber: ${formatarMoeda(resumoFinanceiro.valorComissao)}, ${percentualComissao}% de comissão, ${nomeProfissional}, ${resumoFinanceiro.quantidade} ${resumoFinanceiro.quantidade === 1 ? 'serviço concluído' : 'serviços concluídos'}`}
                style={[
                  styles.destaqueCard,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: tema.accentBorder,
                    marginBottom: 12 + tema.espacoExtra,
                  },
                ]}
              >
                <View style={styles.destaqueTopo}>
                  <Text
                    style={[
                      styles.destaqueLabel,
                      { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                    ]}
                  >
                    Sua Comissão a Receber
                  </Text>
                  <View
                    style={[
                      styles.badgePercentual,
                      {
                        backgroundColor: tema.accentSoft,
                        borderColor: tema.accentBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgePercentualTexto,
                        { color: tema.accent, fontSize: tema.fontSize(11) },
                      ]}
                    >
                      {percentualComissao}% de comissão
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.valorDestaque,
                    { color: tema.accent, fontSize: tema.fontSize(30) },
                  ]}
                >
                  {formatarMoeda(resumoFinanceiro.valorComissao)}
                </Text>

                <Text
                  style={[
                    styles.profissionalSub,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  {nomeProfissional} • {resumoFinanceiro.quantidade}{' '}
                  {resumoFinanceiro.quantidade === 1
                    ? 'serviço concluído'
                    : 'serviços concluídos'}
                </Text>
              </View>

              <View
                style={[
                  styles.metricasRow,
                  { gap: 10 + tema.espacoExtra, marginBottom: 18 + tema.espacoExtra },
                ]}
              >
                <View
                  accessible
                  accessibilityLabel={`Total Concluído: ${formatarMoeda(resumoFinanceiro.totalBruto)}`}
                  style={[
                    styles.metricaCard,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.metricaLabel,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Total Concluído
                  </Text>
                  <Text
                    style={[
                      styles.metricaValor,
                      { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {formatarMoeda(resumoFinanceiro.totalBruto)}
                  </Text>
                </View>

                <View
                  accessible
                  accessibilityLabel={`Repasse Salão: ${formatarMoeda(resumoFinanceiro.parteSalao)}`}
                  style={[
                    styles.metricaCard,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.metricaLabel,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Repasse Salão
                  </Text>
                  <Text
                    style={[
                      styles.metricaValorSecundario,
                      { color: tema.info, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {formatarMoeda(resumoFinanceiro.parteSalao)}
                  </Text>
                </View>
              </View>

              <Text
                accessibilityRole="header"
                style={[
                  styles.secaoTitulo,
                  { color: tema.accent, fontSize: tema.fontSize(15) },
                ]}
              >
                Serviços Concluídos
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centro}>
              <Ionicons name="wallet-outline" size={48} color={tema.textMuted} accessible={false} />
              <Text
                style={[
                  styles.estadoTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(17) },
                ]}
              >
                Nenhum serviço concluído ainda
              </Text>
              <Text
                style={[
                  styles.estadoTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                ]}
              >
                Quando você concluir atendimentos na agenda, o valor e a sua comissão
                aparecerão aqui automaticamente.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topTitle: {
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  listaContent: {
    padding: 20,
    flexGrow: 1,
  },
  headerBloco: {
    marginBottom: 4,
  },
  destaqueCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  destaqueTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  destaqueLabel: {
    fontWeight: '600',
  },
  badgePercentual: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePercentualTexto: {
    fontWeight: 'bold',
  },
  valorDestaque: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profissionalSub: {},
  metricasRow: {
    flexDirection: 'row',
  },
  metricaCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  metricaLabel: {
    marginBottom: 4,
  },
  metricaValor: {
    fontWeight: 'bold',
  },
  metricaValorSecundario: {
    fontWeight: 'bold',
  },
  secaoTitulo: {
    fontWeight: 'bold',
  },
  cardItem: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  servicoNome: {
    fontWeight: 'bold',
    flex: 1,
  },
  precoBruto: {
    fontWeight: 'bold',
  },
  detalheTexto: {
    marginBottom: 10,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  comissaoLabel: {
    fontWeight: '600',
  },
  comissaoValor: {
    fontWeight: 'bold',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
    gap: 10,
  },
  estadoTitulo: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  estadoTexto: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
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

const COLORS = {
  bgPrimary: '#434643',
  bgSurface: '#595959',
  bgElevated: '#383B38',
  bgDark: '#2B2D2B',
  borderSubtle: 'rgba(255,255,255,0.08)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.14)',
  accentBorder: 'rgba(255, 152, 185, 0.35)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D1D1',
  textMuted: '#A0A3A0',
  textOnAccent: '#1E201E',
  success: '#A5D6A7',
  successSoft: 'rgba(165, 214, 167, 0.14)',
  info: '#90CAF9',
};

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
      <View style={styles.cardItem}>
        <View style={styles.cardTopo}>
          <Text style={styles.servicoNome}>{nomeServico}</Text>
          <Text style={styles.precoBruto}>{formatarMoeda(precoItem)}</Text>
        </View>

        <Text style={styles.detalheTexto}>
          Cliente: {nomeCliente}
          {dataExibicao ? ` • ${dataExibicao}` : ''}
          {item.horario ? ` às ${item.horario}` : ''}
        </Text>

        <View style={styles.cardRodape}>
          <Text style={styles.comissaoLabel}>
            Comissão ({percentualComissao}%):
          </Text>
          <Text style={styles.comissaoValor}>{formatarMoeda(comissaoItem)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ganhos e Comissões</Text>
        <View style={{ width: 24 }} />
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.estadoTexto}>Calculando suas comissões...</Text>
        </View>
      ) : !usuarioAtual ? (
        <View style={styles.centro}>
          <Ionicons name="lock-closed-outline" size={44} color={COLORS.textMuted} />
          <Text style={styles.estadoTitulo}>Sessão não encontrada</Text>
          <Text style={styles.estadoTexto}>
            Faça login na conta profissional para visualizar seus ganhos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={servicosConcluidos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerBloco}>
              <View style={styles.destaqueCard}>
                <View style={styles.destaqueTopo}>
                  <Text style={styles.destaqueLabel}>Sua Comissão a Receber</Text>
                  <View style={styles.badgePercentual}>
                    <Text style={styles.badgePercentualTexto}>
                      {percentualComissao}% de comissão
                    </Text>
                  </View>
                </View>

                <Text style={styles.valorDestaque}>
                  {formatarMoeda(resumoFinanceiro.valorComissao)}
                </Text>

                <Text style={styles.profissionalSub}>
                  {nomeProfissional} • {resumoFinanceiro.quantidade}{' '}
                  {resumoFinanceiro.quantidade === 1
                    ? 'serviço concluído'
                    : 'serviços concluídos'}
                </Text>
              </View>

              <View style={styles.metricasRow}>
                <View style={styles.metricaCard}>
                  <Text style={styles.metricaLabel}>Total Concluído</Text>
                  <Text style={styles.metricaValor}>
                    {formatarMoeda(resumoFinanceiro.totalBruto)}
                  </Text>
                </View>

                <View style={styles.metricaCard}>
                  <Text style={styles.metricaLabel}>Repasse Salão</Text>
                  <Text style={styles.metricaValorSecundario}>
                    {formatarMoeda(resumoFinanceiro.parteSalao)}
                  </Text>
                </View>
              </View>

              <Text style={styles.secaoTitulo}>Serviços Concluídos</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centro}>
              <Ionicons name="wallet-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.estadoTitulo}>Nenhum serviço concluído ainda</Text>
              <Text style={styles.estadoTexto}>
                Quando você concluir atendimentos na agenda (✔️), o valor e a sua comissão
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
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#6B6E6B',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  backButton: {
    padding: 4,
  },
  listaContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 12,
    flexGrow: 1,
  },
  headerBloco: {
    marginBottom: 4,
  },
  destaqueCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 12,
  },
  destaqueTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  destaqueLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  badgePercentual: {
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePercentualTexto: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  valorDestaque: {
    color: COLORS.accent,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profissionalSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  metricasRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  metricaCard: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  metricaLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  metricaValor: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricaValorSecundario: {
    color: COLORS.info,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secaoTitulo: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardItem: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  servicoNome: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  precoBruto: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  detalheTexto: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  comissaoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  comissaoValor: {
    color: COLORS.success,
    fontSize: 14,
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
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  estadoTexto: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
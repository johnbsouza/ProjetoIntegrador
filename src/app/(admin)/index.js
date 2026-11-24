import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

function obterInfoHoje() {
  const agora = new Date();
  const yyyy = String(agora.getFullYear());
  const mm = String(agora.getMonth() + 1).padStart(2, '0');
  const dd = String(agora.getDate()).padStart(2, '0');
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    formatada: `${dd}/${mm}/${yyyy}`,
    diaSemana: DIAS_SEMANA[agora.getDay()],
  };
}

function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function normalizarStatus(status) {
  const s = String(status || 'confirmado').trim().toLowerCase();
  if (s === 'concluido' || s === 'concluído') return 'concluido';
  if (s === 'cancelado') return 'cancelado';
  return 'confirmado';
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { tema, config } = useAcessibilidade();
  const usuarioAtual = auth.currentUser;
  const infoHoje = useMemo(() => obterInfoHoje(), []);

  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregandoAgenda, setCarregandoAgenda] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    setCarregandoAgenda(true);

    const unsubscribe = onSnapshot(
      collection(db, 'agendamentos'),
      (snapshot) => {
        const lista = [];
        snapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAgendamentos(lista);
        setCarregandoAgenda(false);
        setAtualizando(false);
      },
      (error) => {
        console.error('Erro ao carregar agendamentos no dashboard admin:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados de agendamentos.');
        setCarregandoAgenda(false);
        setAtualizando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCarregandoClientes(true);

    const qClientes = query(
      collection(db, 'usuarios'),
      where('nivelAcesso', '==', 'cliente')
    );

    const unsubscribe = onSnapshot(
      qClientes,
      (snapshot) => {
        const lista = [];
        snapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        setClientes(lista);
        setCarregandoClientes(false);
        setAtualizando(false);
      },
      (error) => {
        console.error('Erro ao carregar clientes no dashboard admin:', error);
        Alert.alert('Erro', 'Não foi possível carregar os clientes.');
        setCarregandoClientes(false);
        setAtualizando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const metricas = useMemo(() => {
    const agendamentosValidos = agendamentos.filter(
      (item) => normalizarStatus(item.status) !== 'cancelado'
    );

    const faturamentoTotal = agendamentosValidos.reduce(
      (soma, item) => soma + (Number(item.preco) || 0),
      0
    );

    const faturamentoConcluido = agendamentosValidos
      .filter((item) => normalizarStatus(item.status) === 'concluido')
      .reduce((soma, item) => soma + (Number(item.preco) || 0), 0);

    const agendamentosHojeLista = agendamentos.filter((item) => {
      const dataDoc = item.data || item.dataAgendamento || '';
      return dataDoc === infoHoje.iso && normalizarStatus(item.status) !== 'cancelado';
    });

    const clientesAtivosLista = clientes.filter((c) => c.ativo !== false);

    return {
      faturamentoTotal,
      faturamentoConcluido,
      agendamentosHojeCount: agendamentosHojeLista.length,
      clientesAtivosCount: clientesAtivosLista.length,
    };
  }, [agendamentos, clientes, infoHoje.iso]);

  function abrirMenuLateral() {
    if (typeof navigation.openDrawer === 'function') {
      navigation.openDrawer();
    } else if (typeof navigation.dispatch === 'function') {
      navigation.dispatch({ type: 'OPEN_DRAWER' });
    }
  }

  function handleRefresh() {
    setAtualizando(true);
    setTimeout(() => setAtualizando(false), 500);
  }

  const carregando = carregandoAgenda || carregandoClientes;

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
        <View style={styles.topEsquerda}>
          <TouchableOpacity
            onPress={abrirMenuLateral}
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu lateral"
            style={[
              styles.menuButton,
              {
                minWidth: tema.minTouchHeight,
                minHeight: tema.minTouchHeight,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Ionicons name="menu" size={26} color={tema.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            {!config.modoCalmo && (
              <Text
                style={[
                  styles.topSubtitulo,
                  { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                ]}
              >
                Painel Administrativo
              </Text>
            )}
            <Text
              accessibilityRole="header"
              style={[
                styles.topTitle,
                { color: tema.textPrimary, fontSize: tema.fontSize(19) },
              ]}
            >
              Lirium Esmalteria & Spa
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('./perfil')}
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil do administrador"
          style={[
            styles.perfilButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Ionicons name="person-circle-outline" size={28} color={tema.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 88 + tema.espacoExtra },
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
      >
        <View
          accessible
          accessibilityLabel={`Data de hoje: ${infoHoje.diaSemana}, ${infoHoje.formatada}`}
          style={[
            styles.dataBanner,
            {
              backgroundColor: tema.bgElevated,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              marginBottom: 16 + tema.espacoExtra,
            },
          ]}
        >
          <Ionicons name="calendar-outline" size={16} color={tema.accent} accessible={false} />
          <Text
            style={[
              styles.dataBannerTexto,
              { color: tema.accent, fontSize: tema.fontSize(13) },
            ]}
          >
            {infoHoje.diaSemana}, {infoHoje.formatada}
          </Text>
        </View>

        {carregando ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={tema.accent} />
            <Text
              style={[
                styles.loadingTexto,
                { color: tema.textSecondary, fontSize: tema.fontSize(14) },
              ]}
            >
              A calcular indicadores do salão...
            </Text>
          </View>
        ) : (
          <>
            <View
              accessible
              accessibilityLabel={`Faturamento total: ${formatarMoeda(metricas.faturamentoTotal)}. Concluído até o momento: ${formatarMoeda(metricas.faturamentoConcluido)}`}
              style={[
                styles.cardDestaque,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: tema.accentBorder,
                  marginBottom: 14 + tema.espacoExtra,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconeBox,
                    { backgroundColor: tema.accentSoft },
                  ]}
                  accessible={false}
                >
                  <Ionicons name="cash-outline" size={22} color={tema.accent} />
                </View>
                <Text
                  style={[
                    styles.cardLabel,
                    { color: tema.textSecondary, fontSize: tema.fontSize(14) },
                  ]}
                >
                  Faturamento
                </Text>
              </View>

              <Text
                style={[
                  styles.valorDestaque,
                  { color: tema.accent, fontSize: tema.fontSize(30) },
                ]}
              >
                {formatarMoeda(metricas.faturamentoTotal)}
              </Text>
              <Text
                style={[
                  styles.cardDetalhe,
                  { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                ]}
              >
                Concluído até o momento: {formatarMoeda(metricas.faturamentoConcluido)}
              </Text>
            </View>

            <View
              style={[
                styles.gridDois,
                {
                  gap: 12 + tema.espacoExtra,
                  marginBottom: 22 + tema.espacoExtra,
                },
              ]}
            >
              <View
                accessible
                accessibilityLabel={`Agendamentos hoje: ${metricas.agendamentosHojeCount}, data ${infoHoje.formatada}`}
                style={[
                  styles.cardMetrica,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconeBoxMenor,
                      { backgroundColor: tema.bgElevated },
                    ]}
                    accessible={false}
                  >
                    <Ionicons name="calendar-outline" size={18} color={tema.info} />
                  </View>
                  <Text
                    style={[
                      styles.cardTituloMenor,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Agendamentos Hoje
                  </Text>
                </View>

                <Text
                  style={[
                    styles.valorMetrica,
                    { color: tema.info, fontSize: tema.fontSize(26) },
                  ]}
                >
                  {metricas.agendamentosHojeCount}
                </Text>
                {!config.modoCalmo && (
                  <Text
                    style={[
                      styles.cardDetalheMenor,
                      { color: tema.textMuted, fontSize: tema.fontSize(11) },
                    ]}
                  >
                    Data: {infoHoje.formatada}
                  </Text>
                )}
              </View>

              <View
                accessible
                accessibilityLabel={`Clientes ativos: ${metricas.clientesAtivosCount}, base cadastrada`}
                style={[
                  styles.cardMetrica,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconeBoxMenor,
                      { backgroundColor: tema.bgElevated },
                    ]}
                    accessible={false}
                  >
                    <Ionicons name="people-outline" size={18} color={tema.success} />
                  </View>
                  <Text
                    style={[
                      styles.cardTituloMenor,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Clientes Ativos
                  </Text>
                </View>

                <Text
                  style={[
                    styles.valorMetrica,
                    { color: tema.success, fontSize: tema.fontSize(26) },
                  ]}
                >
                  {metricas.clientesAtivosCount}
                </Text>
                {!config.modoCalmo && (
                  <Text
                    style={[
                      styles.cardDetalheMenor,
                      { color: tema.textMuted, fontSize: tema.fontSize(11) },
                    ]}
                  >
                    Base cadastrada
                  </Text>
                )}
              </View>
            </View>

            <Text
              accessibilityRole="header"
              style={[
                styles.secaoTitulo,
                { color: tema.accent, fontSize: tema.fontSize(15) },
              ]}
            >
              Gerenciamento Rápido
            </Text>

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar Usuários: Clientes, profissionais e níveis de acesso"
              style={[
                styles.atalhoCard,
                {
                  minHeight: tema.minTouchHeight,
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  marginBottom: 10 + tema.espacoExtra,
                },
              ]}
              onPress={() => router.push('./gerenciar-usuarios')}
            >
              <View style={styles.atalhoEsquerda}>
                <Ionicons name="people-circle-outline" size={22} color={tema.accent} accessible={false} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.atalhoTitulo,
                      { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                    ]}
                  >
                    Gerenciar Usuários
                  </Text>
                  {!config.modoCalmo && (
                    <Text
                      style={[
                        styles.atalhoSub,
                        { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      Clientes, profissionais e níveis de acesso
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={tema.textSecondary} accessible={false} />
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Catálogo e Equipe: Serviços, preços e profissionais do salão"
              style={[
                styles.atalhoCard,
                {
                  minHeight: tema.minTouchHeight,
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  marginBottom: 10 + tema.espacoExtra,
                },
              ]}
              onPress={() => router.push('./catalogo-equipe')}
            >
              <View style={styles.atalhoEsquerda}>
                <Ionicons name="sparkles-outline" size={22} color={tema.accent} accessible={false} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.atalhoTitulo,
                      { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                    ]}
                  >
                    Catálogo e Equipe
                  </Text>
                  {!config.modoCalmo && (
                    <Text
                      style={[
                        styles.atalhoSub,
                        { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      Serviços, preços e profissionais do salão
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={tema.textSecondary} accessible={false} />
            </TouchableOpacity>

            {usuarioAtual?.email && !config.modoCalmo && (
              <Text
                style={[
                  styles.rodapeSessao,
                  { color: tema.textMuted, fontSize: tema.fontSize(11) },
                ]}
              >
                Sessão admin: {usuarioAtual.email}
              </Text>
            )}
          </>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  topSubtitulo: {},
  topTitle: {
    fontWeight: 'bold',
  },
  perfilButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  dataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dataBannerTexto: {
    fontWeight: 'bold',
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingTexto: {},
  cardDestaque: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconeBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontWeight: '600',
  },
  valorDestaque: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDetalhe: {},
  gridDois: {
    flexDirection: 'row',
  },
  cardMetrica: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  iconeBoxMenor: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTituloMenor: {
    fontWeight: '600',
    flex: 1,
  },
  valorMetrica: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDetalheMenor: {},
  secaoTitulo: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  atalhoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  atalhoEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  atalhoTitulo: {
    fontWeight: 'bold',
  },
  atalhoSub: {
    marginTop: 2,
  },
  rodapeSessao: {
    textAlign: 'center',
    marginTop: 14,
  },
});
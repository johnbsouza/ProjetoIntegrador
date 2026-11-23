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

const COLORS = {
  bgPrimary: '#434643',
  bgSurface: '#595959',
  bgElevated: '#383B38',
  bgDark: '#2B2D2B',
  borderSubtle: '#6B6E6B',
  borderSoft: 'rgba(255,255,255,0.08)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.14)',
  accentBorder: 'rgba(255, 152, 185, 0.35)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D1D1',
  textMuted: '#A0A3A0',
  textOnAccent: '#1E201E',
  success: '#A5D6A7',
  info: '#90CAF9',
};

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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topEsquerda}>
          <TouchableOpacity
            onPress={abrirMenuLateral}
            style={styles.menuButton}
            accessibilityLabel="Abrir menu"
          >
            <Ionicons name="menu" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View>
            <Text style={styles.topSubtitulo}>Painel Administrativo</Text>
            <Text style={styles.topTitle}>Lirium Esmalteria & Spa</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('./perfil')}
          style={styles.perfilButton}
          accessibilityLabel="Perfil do administrador"
        >
          <Ionicons name="person-circle-outline" size={28} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        <View style={styles.dataBanner}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.accent} />
          <Text style={styles.dataBannerTexto}>
            {infoHoje.diaSemana}, {infoHoje.formatada}
          </Text>
        </View>

        {carregando ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingTexto}>A calcular indicadores do salão...</Text>
          </View>
        ) : (
          <>
            <View style={styles.cardDestaque}>
              <View style={styles.cardHeader}>
                <View style={styles.iconeBox}>
                  <Ionicons name="cash-outline" size={22} color={COLORS.accent} />
                </View>
                <Text style={styles.cardLabel}>Faturamento</Text>
              </View>

              <Text style={styles.valorDestaque}>
                {formatarMoeda(metricas.faturamentoTotal)}
              </Text>
              <Text style={styles.cardDetalhe}>
                Concluído até o momento: {formatarMoeda(metricas.faturamentoConcluido)}
              </Text>
            </View>

            <View style={styles.gridDois}>
              <View style={styles.cardMetrica}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconeBoxMenor}>
                    <Ionicons name="calendar-outline" size={18} color={COLORS.info} />
                  </View>
                  <Text style={styles.cardTituloMenor}>Agendamentos Hoje</Text>
                </View>

                <Text style={[styles.valorMetrica, { color: COLORS.info }]}>
                  {metricas.agendamentosHojeCount}
                </Text>
                <Text style={styles.cardDetalheMenor}>Data: {infoHoje.formatada}</Text>
              </View>

              <View style={styles.cardMetrica}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconeBoxMenor}>
                    <Ionicons name="people-outline" size={18} color={COLORS.success} />
                  </View>
                  <Text style={styles.cardTituloMenor}>Clientes Ativos</Text>
                </View>

                <Text style={[styles.valorMetrica, { color: COLORS.success }]}>
                  {metricas.clientesAtivosCount}
                </Text>
                <Text style={styles.cardDetalheMenor}>Base cadastrada</Text>
              </View>
            </View>

            <Text style={styles.secaoTitulo}>Gerenciamento Rápido</Text>

            <TouchableOpacity
              style={styles.atalhoCard}
              onPress={() => router.push('./gerenciar-usuarios')}
            >
              <View style={styles.atalhoEsquerda}>
                <Ionicons name="people-circle-outline" size={22} color={COLORS.accent} />
                <View>
                  <Text style={styles.atalhoTitulo}>Gerenciar Usuários</Text>
                  <Text style={styles.atalhoSub}>
                    Clientes, profissionais e níveis de acesso
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.atalhoCard}
              onPress={() => router.push('./catalogo-equipe')}
            >
              <View style={styles.atalhoEsquerda}>
                <Ionicons name="sparkles-outline" size={22} color={COLORS.accent} />
                <View>
                  <Text style={styles.atalhoTitulo}>Catálogo e Equipe</Text>
                  <Text style={styles.atalhoSub}>
                    Serviços, preços e profissionais do salão
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {usuarioAtual?.email && (
              <Text style={styles.rodapeSessao}>
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
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
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
  topSubtitulo: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  topTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  perfilButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  dataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    marginBottom: 16,
  },
  dataBannerTexto: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 'bold',
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingTexto: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  cardDestaque: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 14,
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
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  valorDestaque: {
    color: COLORS.accent,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDetalhe: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  gridDois: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  cardMetrica: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  iconeBoxMenor: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTituloMenor: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  valorMetrica: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDetalheMenor: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  secaoTitulo: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  atalhoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgSurface,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    marginBottom: 10,
  },
  atalhoEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  atalhoTitulo: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  atalhoSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rodapeSessao: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
  },
});
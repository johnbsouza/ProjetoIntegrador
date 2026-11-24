import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

function formatarMoeda(valor) {
  return `R$ ${(Number(valor) || 0).toFixed(2).replace('.', ',')}`;
}

function obterDataChave(item) {
  const dataIso = item.data || item.dataAgendamento || '';
  const horario = item.horario || '00:00';
  return `${dataIso}T${horario}`;
}

function statusValidoParaProximo(status) {
  const s = String(status || '').trim().toLowerCase();
  return s !== 'cancelado' && s !== 'concluido' && s !== 'concluído';
}

function obterNomeFallback(usuario) {
  if (!usuario) return 'Cliente';
  if (usuario.displayName && usuario.displayName.trim()) {
    return usuario.displayName.trim();
  }
  if (usuario.email && usuario.email.includes('@')) {
    const prefixo = usuario.email.split('@')[0];
    return prefixo.charAt(0).toUpperCase() + prefixo.slice(1);
  }
  return 'Cliente';
}

export default function PainelCliente() {
  const router = useRouter();
  const navigation = useNavigation();
  const { tema, config } = useAcessibilidade();
  const usuarioAtual = auth.currentUser;

  const [nomeCliente, setNomeCliente] = useState(() => obterNomeFallback(usuarioAtual));
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const promocoesDestaque = useMemo(
    () => [
      {
        id: 'promo-1',
        titulo: 'Pacote 4 Sessões Semanais',
        descricao: '1 sessão por semana com condição especial e agendamento direto.',
      },
      {
        id: 'promo-2',
        titulo: 'Combos & Pacotes Lirium',
        descricao: 'Confira os pacotes promocionais disponíveis para economizar.',
      },
    ],
    []
  );

  useEffect(() => {
    if (!usuarioAtual?.uid) {
      setNomeCliente('Cliente');
      return;
    }

    const userRef = doc(db, 'usuarios', usuarioAtual.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const dados = snap.data();
          const nomeDoc = (dados?.nome || dados?.nomeCompleto || '').trim();
          setNomeCliente(nomeDoc || obterNomeFallback(usuarioAtual));
        } else {
          setNomeCliente(obterNomeFallback(usuarioAtual));
        }
      },
      (error) => {
        console.error('Erro ao buscar nome do cliente:', error);
        setNomeCliente(obterNomeFallback(usuarioAtual));
      }
    );

    return () => unsubscribe();
  }, [usuarioAtual?.uid, usuarioAtual?.displayName, usuarioAtual?.email]);

  useEffect(() => {
    let ativo = true;

    async function carregarPacotes() {
      try {
        const snap = await getDocs(collection(db, 'pacotes'));
        if (!ativo) return;
        const lista = [];
        snap.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        setPacotes(lista);
      } catch (error) {
        console.error('Erro ao carregar pacotes na home:', error);
      }
    }

    carregarPacotes();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!usuarioAtual?.uid) {
      setAgendamentos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    const docsMap = new Map();

    function atualizarAgendamentos() {
      const lista = Array.from(docsMap.values()).filter((item) => {
        const cliId = item.clienteId || item.idCliente || '';
        return cliId === usuarioAtual.uid;
      });
      lista.sort((a, b) => obterDataChave(a).localeCompare(obterDataChave(b)));
      setAgendamentos(lista);
      setCarregando(false);
    }

    const qClienteId = query(
      collection(db, 'agendamentos'),
      where('clienteId', '==', usuarioAtual.uid)
    );
    const qIdCliente = query(
      collection(db, 'agendamentos'),
      where('idCliente', '==', usuarioAtual.uid)
    );

    const unsub1 = onSnapshot(
      qClienteId,
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            docsMap.delete(change.doc.id);
          } else {
            docsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
          }
        });
        atualizarAgendamentos();
      },
      (error) => {
        console.error('Erro ao carregar agendamentos do cliente:', error);
        setCarregando(false);
      }
    );

    const unsub2 = onSnapshot(
      qIdCliente,
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            if (!snap.docs.some((d) => d.id === change.doc.id)) {
              docsMap.delete(change.doc.id);
            }
          } else if (!docsMap.has(change.doc.id)) {
            docsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
          }
        });
        atualizarAgendamentos();
      },
      () => {}
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [usuarioAtual?.uid]);

  const proximoAgendamento = useMemo(() => {
    const agora = new Date();
    const yyyy = String(agora.getFullYear());
    const mm = String(agora.getMonth() + 1).padStart(2, '0');
    const dd = String(agora.getDate()).padStart(2, '0');
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(
      agora.getMinutes()
    ).padStart(2, '0')}`;
    const chaveAtual = `${yyyy}-${mm}-${dd}T${horaAtual}`;

    const futuros = agendamentos.filter(
      (item) => statusValidoParaProximo(item.status) && obterDataChave(item) >= chaveAtual
    );

    if (futuros.length > 0) return futuros[0];
    return agendamentos.find((item) => statusValidoParaProximo(item.status)) || null;
  }, [agendamentos]);

  const profissionalFavorito = useMemo(() => {
    if (agendamentos.length === 0) return null;

    const contagem = new Map();
    agendamentos.forEach((item) => {
      const status = String(item.status || '').toLowerCase();
      if (status === 'cancelado') return;
      const nome = item.profissionalNome || item.nomeProfissional;
      if (!nome) return;
      const id = item.profissionalId || item.idProfissional || nome;
      const atual = contagem.get(id) || { id, nome, total: 0 };
      atual.total += 1;
      contagem.set(id, atual);
    });

    const ordenados = Array.from(contagem.values()).sort((a, b) => b.total - a.total);
    return ordenados[0] || null;
  }, [agendamentos]);

  function abrirMenuLateral() {
    if (typeof navigation?.openDrawer === 'function') {
      navigation.openDrawer();
      return;
    }
    const parent = navigation?.getParent?.();
    if (typeof parent?.openDrawer === 'function') {
      parent.openDrawer();
    }
  }

  function abrirPacoteParaAgendar(pacote) {
    router.push({
      pathname: '/(cliente)/agendar',
      params: {
        pacoteId: pacote.id,
        nomePacote: pacote.nome,
        preco: String(pacote.preco || 0),
        frequenciaSemanal: '1_por_semana',
      },
    });
  }

  return (
    <LinearGradient
      colors={
        config.altoContraste
          ? [tema.bgPrimary, tema.bgPrimary]
          : ['#1E201E', '#434643', '#1A1C1A']
      }
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu lateral"
            onPress={abrirMenuLateral}
            style={[
              styles.menuButton,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                minWidth: tema.minTouchHeight,
                minHeight: tema.minTouchHeight,
              },
            ]}
          >
            <Ionicons name="menu" size={22} color={tema.accent} accessible={false} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              style={[
                styles.saudacao,
                { color: tema.accent, fontSize: tema.fontSize(19) },
              ]}
            >
              Olá, {nomeCliente}!
            </Text>
            {!config.modoCalmo && (
              <Text
                style={[
                  styles.subtitulo,
                  { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                ]}
              >
                Lirium Esmalteria
              </Text>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: 96 + tema.espacoExtra, gap: 16 + tema.espacoExtra },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Explorar Serviços e realizar agendamento"
            onPress={() => router.push('/(cliente)/explorar')}
            style={[
              styles.atalhoPrincipal,
              {
                backgroundColor: tema.accent,
                minHeight: tema.minTouchHeight,
              },
            ]}
          >
            <View style={styles.atalhoEsquerda}>
              <Ionicons name="sparkles-outline" size={22} color={tema.textOnAccent} accessible={false} />
              <View>
                <Text
                  style={[
                    styles.atalhoPrincipalTitulo,
                    { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Explorar Serviços
                </Text>
                {!config.modoCalmo && (
                  <Text
                    style={[
                      styles.atalhoPrincipalSub,
                      { color: tema.textOnAccent, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    Escolha seus serviços e agende seu horário
                  </Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={tema.textOnAccent} accessible={false} />
          </TouchableOpacity>

          <View
            accessible
            accessibilityLabel={
              proximoAgendamento
                ? `Próximo agendamento: ${
                    proximoAgendamento.servicoNome || proximoAgendamento.nomeServico || 'Serviço'
                  } em ${
                    proximoAgendamento.dataFormatada ||
                    proximoAgendamento.data ||
                    proximoAgendamento.dataAgendamento ||
                    ''
                  } às ${proximoAgendamento.horario || '--:--'} com ${
                    proximoAgendamento.profissionalNome ||
                    proximoAgendamento.nomeProfissional ||
                    'Profissional'
                  }`
                : 'Próximo agendamento: nenhum horário marcado'
            }
            style={[
              styles.cardInfo,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <View style={styles.cardTopoRow}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.secaoTitulo,
                  { color: tema.accent, fontSize: tema.fontSize(14) },
                ]}
              >
                Próximo Agendamento
              </Text>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Ver todos os meus agendamentos"
                onPress={() => router.push('/(cliente)/agenda')}
                style={{ minHeight: tema.minTouchHeight, justifyContent: 'center' }}
              >
                <Text
                  style={[
                    styles.linkAcao,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Ver agenda
                </Text>
              </TouchableOpacity>
            </View>

            {carregando ? (
              <ActivityIndicator color={tema.accent} style={{ marginVertical: 10 }} />
            ) : proximoAgendamento ? (
              <View style={{ gap: 4 }}>
                <Text
                  style={[
                    styles.destaqueTexto,
                    { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                  ]}
                >
                  {proximoAgendamento.servicoNome ||
                    proximoAgendamento.nomeServico ||
                    'Serviço agendado'}
                </Text>
                <Text
                  style={[
                    styles.detalheTexto,
                    { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                  ]}
                >
                  {(proximoAgendamento.dataFormatada ||
                    proximoAgendamento.data ||
                    proximoAgendamento.dataAgendamento ||
                    'Data a confirmar')}{' '}
                  às {proximoAgendamento.horario || '--:--'}
                </Text>
                <Text
                  style={[
                    styles.detalheTexto,
                    { color: tema.textMuted, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Profissional:{' '}
                  {proximoAgendamento.profissionalNome ||
                    proximoAgendamento.nomeProfissional ||
                    'A definir'}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <Text
                  style={[
                    styles.detalheTexto,
                    { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                  ]}
                >
                  Você não possui agendamento futuro marcado.
                </Text>
                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel="Agendar um serviço agora"
                  onPress={() => router.push('/(cliente)/explorar')}
                  style={[
                    styles.btnSecundario,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: tema.accentBorder,
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnSecundarioTexto,
                      { color: tema.accent, fontSize: tema.fontSize(13) },
                    ]}
                  >
                    Agendar agora
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View
            accessible
            accessibilityLabel={
              profissionalFavorito
                ? `Profissional favorito: ${profissionalFavorito.nome}, com ${profissionalFavorito.total} atendimento(s)`
                : 'Profissional favorito: ainda sem atendimentos registrados'
            }
            style={[
              styles.cardInfo,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <View style={styles.cardTopoRow}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.secaoTitulo,
                  { color: tema.accent, fontSize: tema.fontSize(14) },
                ]}
              >
                Profissional Favorito
              </Text>
              <Ionicons name="heart" size={18} color={tema.accent} accessible={false} />
            </View>

            {profissionalFavorito ? (
              <View style={styles.favoritoRow}>
                <View style={[styles.iconeCirculo, { backgroundColor: tema.bgElevated }]}>
                  <Ionicons name="person-outline" size={20} color={tema.accent} accessible={false} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.destaqueTexto,
                      { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                    ]}
                  >
                    {profissionalFavorito.nome}
                  </Text>
                  <Text
                    style={[
                      styles.detalheTexto,
                      { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                    ]}
                  >
                    {profissionalFavorito.total}{' '}
                    {profissionalFavorito.total === 1 ? 'atendimento' : 'atendimentos'} com você
                  </Text>
                </View>
              </View>
            ) : (
              <Text
                style={[
                  styles.detalheTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                Seu profissional favorito aparecerá aqui após seus atendimentos.
              </Text>
            )}
          </View>

          <View
            style={[
              styles.cardInfo,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <View style={styles.cardTopoRow}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.secaoTitulo,
                  { color: tema.accent, fontSize: tema.fontSize(14) },
                ]}
              >
                Notificações de Promoções
              </Text>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Ver todas as notificações"
                onPress={() => router.push('/(cliente)/notificacoes')}
                style={{ minHeight: tema.minTouchHeight, justifyContent: 'center' }}
              >
                <Text
                  style={[
                    styles.linkAcao,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Notificações
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10 + tema.espacoExtra }}>
              {promocoesDestaque.map((promo) => (
                <TouchableOpacity
                  key={promo.id}
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`${promo.titulo}: ${promo.descricao}`}
                  onPress={() => router.push('/(cliente)/pacotes')}
                  style={[
                    styles.promoItem,
                    {
                      backgroundColor: tema.bgElevated,
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={18}
                    color={tema.accent}
                    accessible={false}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.promoTitulo,
                        { color: tema.textPrimary, fontSize: tema.fontSize(14) },
                      ]}
                    >
                      {promo.titulo}
                    </Text>
                    {!config.modoCalmo && (
                      <Text
                        style={[
                          styles.detalheTexto,
                          { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                        ]}
                      >
                        {promo.descricao}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={tema.textSecondary}
                    accessible={false}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.cardInfo,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <View style={styles.cardTopoRow}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.secaoTitulo,
                  { color: tema.accent, fontSize: tema.fontSize(14) },
                ]}
              >
                Pacotes Promocionais
              </Text>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Ver todos os pacotes promocionais"
                onPress={() => router.push('/(cliente)/pacotes')}
                style={{ minHeight: tema.minTouchHeight, justifyContent: 'center' }}
              >
                <Text
                  style={[
                    styles.linkAcao,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Ver todos
                </Text>
              </TouchableOpacity>
            </View>

            {pacotes.length === 0 ? (
              <Text
                style={[
                  styles.detalheTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                Pacotes com até 4 sessões (1 sessão por semana) disponíveis na aba de pacotes.
              </Text>
            ) : (
              <View style={{ gap: 12 + tema.espacoExtra }}>
                {pacotes.map((pacote) => {
                  const precoFormatado = formatarMoeda(pacote.preco);
                  const regiaoTexto =
                    pacote.sessoes === 4 || /4\s*sess/i.test(pacote.nome || '')
                      ? '1 sessão por semana (4 semanas)'
                      : 'Pacote promocional';

                  return (
                    <View
                      key={pacote.id}
                      style={[
                        styles.pacoteBox,
                        {
                          backgroundColor: tema.bgElevated,
                          borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                        },
                      ]}
                    >
                      <View style={styles.pacoteTopo}>
                        <Text
                          style={[
                            styles.destaqueTexto,
                            { color: tema.textPrimary, fontSize: tema.fontSize(15), flex: 1 },
                          ]}
                        >
                          {pacote.nome}
                        </Text>
                        <Text
                          style={[
                            styles.precoDestaque,
                            { color: tema.accent, fontSize: tema.fontSize(15) },
                          ]}
                        >
                          {precoFormatado}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.regraSemanal,
                          { color: tema.accent, fontSize: tema.fontSize(12) },
                        ]}
                      >
                        {regiaoTexto}
                      </Text>

                      {Boolean(pacote.descricao) && !config.modoCalmo && (
                        <Text
                          style={[
                            styles.detalheTexto,
                            { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                          ]}
                        >
                          {pacote.descricao}
                        </Text>
                      )}

                      <TouchableOpacity
                        hitSlop={tema.hitSlopPadrao}
                        accessibilityRole="button"
                        accessibilityLabel={`Comprar e agendar ${pacote.nome}, ${precoFormatado}, ${regiaoTexto}`}
                        onPress={() => abrirPacoteParaAgendar(pacote)}
                        style={[
                          styles.btnComprarAgendar,
                          {
                            backgroundColor: tema.accent,
                            minHeight: tema.minTouchHeight,
                          },
                        ]}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={tema.textOnAccent}
                          accessible={false}
                        />
                        <Text
                          style={[
                            styles.btnComprarAgendarTexto,
                            { color: tema.textOnAccent, fontSize: tema.fontSize(13) },
                          ]}
                        >
                          Comprar e Agendar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  menuButton: {
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saudacao: { fontWeight: 'bold' },
  subtitulo: { marginTop: 2 },
  scrollContainer: { paddingTop: 6 },
  atalhoPrincipal: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  atalhoEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  atalhoPrincipalTitulo: { fontWeight: 'bold' },
  atalhoPrincipalSub: { marginTop: 2 },
  cardInfo: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  cardTopoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  secaoTitulo: { fontWeight: 'bold' },
  linkAcao: { fontWeight: 'bold' },
  destaqueTexto: { fontWeight: 'bold' },
  detalheTexto: { marginTop: 2 },
  favoritoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconeCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecundario: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnSecundarioTexto: { fontWeight: 'bold' },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  promoTitulo: { fontWeight: 'bold' },
  pacoteBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  pacoteTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  precoDestaque: { fontWeight: 'bold' },
  regraSemanal: { fontWeight: '600' },
  btnComprarAgendar: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  btnComprarAgendarTexto: { fontWeight: 'bold' },
});
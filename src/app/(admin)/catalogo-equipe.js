import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function parsePreco(texto) {
  const limpo = String(texto || '')
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(',', '.');
  const num = Number(limpo);
  return Number.isFinite(num) && num >= 0 ? num : NaN;
}

function parseComissao(texto) {
  const limpo = String(texto || '').replace('%', '').replace(',', '.').trim();
  const num = Number(limpo);
  if (!Number.isFinite(num) || num < 0 || num > 100) return NaN;
  return num;
}

export default function CatalogoEquipeAdminScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();

  const [abaAtiva, setAbaAtiva] = useState('servicos');
  const [busca, setBusca] = useState('');

  const [servicos, setServicos] = useState([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [modalServicoVisivel, setModalServicoVisivel] = useState(false);
  const [servicoEditando, setServicoEditando] = useState(null);
  const [nomeServico, setNomeServico] = useState('');
  const [precoServico, setPrecoServico] = useState('');
  const [duracaoServico, setDuracaoServico] = useState('45');
  const [categoriaServico, setCategoriaServico] = useState('Esmalteria');
  const [ativoServico, setAtivoServico] = useState(true);
  const [salvandoServico, setSalvandoServico] = useState(false);

  const [profissionais, setProfissionais] = useState([]);
  const [carregandoProfissionais, setCarregandoProfissionais] = useState(true);
  const [modalProfVisivel, setModalProfVisivel] = useState(false);
  const [profEditando, setProfEditando] = useState(null);
  const [nomeProf, setNomeProf] = useState('');
  const [emailProf, setEmailProf] = useState('');
  const [telefoneProf, setTelefoneProf] = useState('');
  const [especialidadeProf, setEspecialidadeProf] = useState('');
  const [comissaoProf, setComissaoProf] = useState('50');
  const [ativoProf, setAtivoProf] = useState(true);
  const [salvandoProf, setSalvandoProf] = useState(false);

  const [excluindoId, setExcluindoId] = useState(null);

  useEffect(() => {
    setCarregandoServicos(true);
    const unsubServicos = onSnapshot(
      collection(db, 'servicos'),
      (snapshot) => {
        const lista = [];
        snapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        setServicos(lista);
        setCarregandoServicos(false);
      },
      (error) => {
        console.error('Erro ao carregar serviços:', error);
        Alert.alert('Erro', 'Não foi possível carregar os serviços.');
        setCarregandoServicos(false);
      }
    );

    setCarregandoProfissionais(true);
    const qProf = query(
      collection(db, 'usuarios'),
      where('nivelAcesso', '==', 'profissional')
    );

    const unsubProf = onSnapshot(
      qProf,
      (snapshot) => {
        const lista = [];
        snapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        setProfissionais(lista);
        setCarregandoProfissionais(false);
      },
      (error) => {
        console.error('Erro ao carregar profissionais:', error);
        Alert.alert('Erro', 'Não foi possível carregar a equipe de profissionais.');
        setCarregandoProfissionais(false);
      }
    );

    return () => {
      unsubServicos();
      unsubProf();
    };
  }, []);

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return servicos;
    return servicos.filter((s) => {
      const alvo = `${s.nome || ''} ${s.categoria || ''}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [servicos, busca]);

  const profissionaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return profissionais;
    return profissionais.filter((p) => {
      const alvo = `${p.nome || ''} ${p.especialidade || ''} ${p.email || ''}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [profissionais, busca]);

  function abrirModalNovoServico() {
    setServicoEditando(null);
    setNomeServico('');
    setPrecoServico('');
    setDuracaoServico('45');
    setCategoriaServico('Esmalteria');
    setAtivoServico(true);
    setModalServicoVisivel(true);
  }

  function abrirModalEditarServico(item) {
    setServicoEditando(item);
    setNomeServico(item.nome || '');
    setPrecoServico(item.preco !== undefined ? String(item.preco) : '');
    setDuracaoServico(item.duracaoMin !== undefined ? String(item.duracaoMin) : '45');
    setCategoriaServico(item.categoria || 'Esmalteria');
    setAtivoServico(item.ativo !== false);
    setModalServicoVisivel(true);
  }

  async function salvarServico() {
    const nomeLimpo = nomeServico.trim();
    const precoNum = parsePreco(precoServico);
    const duracaoNum = Number(duracaoServico) || 30;
    const categoriaLimpa = categoriaServico.trim() || 'Geral';

    if (!nomeLimpo) {
      Alert.alert('Atenção', 'Informe o nome do serviço.');
      return;
    }
    if (Number.isNaN(precoNum)) {
      Alert.alert('Atenção', 'Informe um preço válido (ex.: 45 ou 45,00).');
      return;
    }

    setSalvandoServico(true);
    try {
      const payload = {
        nome: nomeLimpo,
        preco: precoNum,
        duracaoMin: duracaoNum > 0 ? duracaoNum : 30,
        categoria: categoriaLimpa,
        ativo: ativoServico,
        atualizadoEm: serverTimestamp(),
      };

      if (servicoEditando?.id) {
        await updateDoc(doc(db, 'servicos', servicoEditando.id), payload);
      } else {
        await addDoc(collection(db, 'servicos'), {
          ...payload,
          criadoEm: serverTimestamp(),
        });
      }

      setModalServicoVisivel(false);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', 'Não foi possível salvar o serviço.');
    } finally {
      setSalvandoServico(false);
    }
  }

  function confirmarExcluirServico(item) {
    Alert.alert(
      'Excluir Serviço',
      `Deseja remover "${item.nome || 'Serviço'}" do catálogo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setExcluindoId(item.id);
            try {
              await deleteDoc(doc(db, 'servicos', item.id));
            } catch (error) {
              console.error('Erro ao excluir serviço:', error);
              Alert.alert('Erro', 'Não foi possível excluir o serviço.');
            } finally {
              setExcluindoId(null);
            }
          },
        },
      ]
    );
  }

  function abrirModalNovoProfissional() {
    setProfEditando(null);
    setNomeProf('');
    setEmailProf('');
    setTelefoneProf('');
    setEspecialidadeProf('Manicure & Pedicure');
    setComissaoProf('50');
    setAtivoProf(true);
    setModalProfVisivel(true);
  }

  function abrirModalEditarProfissional(item) {
    setProfEditando(item);
    setNomeProf(item.nome || '');
    setEmailProf(item.email || '');
    setTelefoneProf(item.telefone || '');
    setEspecialidadeProf(item.especialidade || '');
    const comissaoAtual = item.percentualComissao ?? item.comissao ?? 50;
    setComissaoProf(String(comissaoAtual));
    setAtivoProf(item.ativo !== false);
    setModalProfVisivel(true);
  }

  async function salvarProfissional() {
    const nomeLimpo = nomeProf.trim();
    const emailLimpo = emailProf.trim().toLowerCase();
    const telefoneLimpo = telefoneProf.trim();
    const especialidadeLimpa = especialidadeProf.trim() || 'Profissional de Beleza';
    const comissaoNum = parseComissao(comissaoProf);

    if (!nomeLimpo) {
      Alert.alert('Atenção', 'Informe o nome da profissional.');
      return;
    }
    if (Number.isNaN(comissaoNum)) {
      Alert.alert('Atenção', 'Informe uma comissão válida entre 0 e 100%.');
      return;
    }

    setSalvandoProf(true);
    try {
      const payload = {
        nome: nomeLimpo,
        email: emailLimpo,
        telefone: telefoneLimpo,
        especialidade: especialidadeLimpa,
        percentualComissao: comissaoNum,
        comissao: comissaoNum,
        nivelAcesso: 'profissional',
        ativo: ativoProf,
        atualizadoEm: serverTimestamp(),
      };

      if (profEditando?.id) {
        await updateDoc(doc(db, 'usuarios', profEditando.id), payload);
      } else {
        await addDoc(collection(db, 'usuarios'), {
          ...payload,
          criadoEm: serverTimestamp(),
        });
      }

      setModalProfVisivel(false);
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados da profissional.');
    } finally {
      setSalvandoProf(false);
    }
  }

  function confirmarExcluirProfissional(item) {
    Alert.alert(
      'Remover Profissional',
      `Deseja excluir "${item.nome || 'Profissional'}" da equipe?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setExcluindoId(item.id);
            try {
              await deleteDoc(doc(db, 'usuarios', item.id));
            } catch (error) {
              console.error('Erro ao excluir profissional:', error);
              Alert.alert('Erro', 'Não foi possível excluir a profissional.');
            } finally {
              setExcluindoId(null);
            }
          },
        },
      ]
    );
  }

  const carregandoAtual =
    abaAtiva === 'servicos' ? carregandoServicos : carregandoProfissionais;

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
          onPress={() => router.back()}
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          style={[
            styles.backButton,
            {
              backgroundColor: tema.bgSurface,
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              borderWidth: config.altoContraste ? 1 : 0,
              borderColor: tema.borderSubtle,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={tema.accent} />
        </TouchableOpacity>

        <Text
          accessibilityRole="header"
          style={[
            styles.topTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Catálogo e Equipe
        </Text>

        <TouchableOpacity
          onPress={
            abaAtiva === 'servicos'
              ? abrirModalNovoServico
              : abrirModalNovoProfissional
          }
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel={
            abaAtiva === 'servicos'
              ? 'Adicionar novo serviço'
              : 'Adicionar nova profissional'
          }
          style={[
            styles.addButton,
            {
              backgroundColor: tema.accent,
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
            },
          ]}
        >
          <Ionicons name="add" size={22} color={tema.textOnAccent} />
        </TouchableOpacity>
      </View>

      <View style={[styles.abasRow, { gap: 10 + tema.espacoExtra }]}>
        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="tab"
          accessibilityLabel={`Aba Serviços, ${servicos.length} cadastrados`}
          accessibilityState={{ selected: abaAtiva === 'servicos' }}
          style={[
            styles.abaBtn,
            {
              minHeight: tema.minTouchHeight,
              backgroundColor:
                abaAtiva === 'servicos' ? tema.accent : tema.bgSurface,
              borderColor:
                abaAtiva === 'servicos' ? tema.accent : tema.borderSubtle,
            },
          ]}
          onPress={() => setAbaAtiva('servicos')}
        >
          <Ionicons
            name="sparkles-outline"
            size={16}
            color={abaAtiva === 'servicos' ? tema.textOnAccent : tema.textSecondary}
          />
          <Text
            style={[
              styles.abaTexto,
              {
                fontSize: tema.fontSize(13),
                color:
                  abaAtiva === 'servicos'
                    ? tema.textOnAccent
                    : tema.textSecondary,
                fontWeight: abaAtiva === 'servicos' ? 'bold' : '600',
              },
            ]}
          >
            Serviços ({servicos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="tab"
          accessibilityLabel={`Aba Profissionais, ${profissionais.length} cadastradas`}
          accessibilityState={{ selected: abaAtiva === 'profissionais' }}
          style={[
            styles.abaBtn,
            {
              minHeight: tema.minTouchHeight,
              backgroundColor:
                abaAtiva === 'profissionais' ? tema.accent : tema.bgSurface,
              borderColor:
                abaAtiva === 'profissionais' ? tema.accent : tema.borderSubtle,
            },
          ]}
          onPress={() => setAbaAtiva('profissionais')}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={
              abaAtiva === 'profissionais'
                ? tema.textOnAccent
                : tema.textSecondary
            }
          />
          <Text
            style={[
              styles.abaTexto,
              {
                fontSize: tema.fontSize(13),
                color:
                  abaAtiva === 'profissionais'
                    ? tema.textOnAccent
                    : tema.textSecondary,
                fontWeight: abaAtiva === 'profissionais' ? 'bold' : '600',
              },
            ]}
          >
            Profissionais ({profissionais.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.buscaBox,
          {
            backgroundColor: tema.bgElevated,
            borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
            minHeight: tema.minTouchHeight,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={tema.textMuted} accessible={false} />
        <TextInput
          accessibilityLabel={
            abaAtiva === 'servicos'
              ? 'Buscar serviço ou categoria'
              : 'Buscar profissional ou especialidade'
          }
          style={[
            styles.buscaInput,
            { color: tema.textPrimary, fontSize: tema.fontSize(14) },
          ]}
          value={busca}
          onChangeText={setBusca}
          placeholder={
            abaAtiva === 'servicos'
              ? 'Buscar serviço ou categoria...'
              : 'Buscar profissional ou especialidade...'
          }
          placeholderTextColor={tema.textMuted}
        />
        {busca.length > 0 && (
          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            onPress={() => setBusca('')}
          >
            <Ionicons name="close-circle" size={18} color={tema.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 88 + tema.espacoExtra },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {carregandoAtual ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={tema.accent} />
            <Text
              style={[
                styles.estadoTexto,
                { color: tema.textSecondary, fontSize: tema.fontSize(13) },
              ]}
            >
              Carregando registros...
            </Text>
          </View>
        ) : abaAtiva === 'servicos' ? (
          servicosFiltrados.length === 0 ? (
            <View style={styles.centro}>
              <Ionicons name="sparkles-outline" size={42} color={tema.textMuted} accessible={false} />
              <Text
                style={[
                  styles.estadoTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                ]}
              >
                Nenhum serviço encontrado
              </Text>
              {!config.modoCalmo && (
                <Text
                  style={[
                    styles.estadoTexto,
                    { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                  ]}
                >
                  Toque no botão "+" no topo para cadastrar um novo serviço.
                </Text>
              )}
            </View>
          ) : (
            <View style={[styles.lista, { gap: 12 + tema.espacoExtra }]}>
              {servicosFiltrados.map((item) => {
                const estaAtivo = item.ativo !== false;
                const estaExcluindo = excluindoId === item.id;
                const nomeItem = item.nome || 'Serviço';

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.card,
                      {
                        backgroundColor: tema.bgSurface,
                        borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.cardTopo}>
                      <View style={{ flex: 1 }}>
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
                          {item.categoria || 'Geral'} • {item.duracaoMin || 30} min
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: estaAtivo ? tema.successSoft : tema.dangerSoft,
                            borderColor: estaAtivo
                              ? config.altoContraste
                                ? tema.success
                                : 'rgba(165, 214, 167, 0.35)'
                              : config.altoContraste
                              ? tema.danger
                              : 'rgba(255, 123, 123, 0.35)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTexto,
                            {
                              fontSize: tema.fontSize(11),
                              color: estaAtivo ? tema.success : tema.danger,
                            },
                          ]}
                        >
                          {estaAtivo ? 'Ativo' : 'Inativo'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.cardRodape,
                        { borderTopColor: tema.borderSubtle },
                      ]}
                    >
                      <Text
                        style={[
                          styles.precoDestaque,
                          { color: tema.accent, fontSize: tema.fontSize(16) },
                        ]}
                      >
                        {formatarMoeda(item.preco)}
                      </Text>

                      <View style={[styles.acoesRow, { gap: 8 + tema.espacoExtra }]}>
                        <TouchableOpacity
                          hitSlop={tema.hitSlopPadrao}
                          accessibilityRole="button"
                          accessibilityLabel={`Editar serviço ${nomeItem}`}
                          style={[
                            styles.btnEditar,
                            {
                              minHeight: tema.minTouchHeight,
                              backgroundColor: tema.accentSoft,
                              borderColor: tema.accentBorder,
                            },
                          ]}
                          onPress={() => abrirModalEditarServico(item)}
                          disabled={estaExcluindo}
                        >
                          <Ionicons name="create-outline" size={16} color={tema.accent} />
                          <Text
                            style={[
                              styles.btnEditarTexto,
                              { color: tema.accent, fontSize: tema.fontSize(12) },
                            ]}
                          >
                            Editar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          hitSlop={tema.hitSlopPadrao}
                          accessibilityRole="button"
                          accessibilityLabel={`Excluir serviço ${nomeItem}`}
                          style={[
                            styles.btnExcluir,
                            {
                              minWidth: tema.minTouchHeight,
                              minHeight: tema.minTouchHeight,
                              backgroundColor: tema.dangerSoft,
                              borderColor: config.altoContraste
                                ? tema.danger
                                : 'rgba(255, 123, 123, 0.35)',
                            },
                          ]}
                          onPress={() => confirmarExcluirServico(item)}
                          disabled={estaExcluindo}
                        >
                          {estaExcluindo ? (
                            <ActivityIndicator size="small" color={tema.danger} />
                          ) : (
                            <Ionicons name="trash-outline" size={16} color={tema.danger} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        ) : profissionaisFiltrados.length === 0 ? (
          <View style={styles.centro}>
            <Ionicons name="people-outline" size={42} color={tema.textMuted} accessible={false} />
            <Text
              style={[
                styles.estadoTitulo,
                { color: tema.textPrimary, fontSize: tema.fontSize(16) },
              ]}
            >
              Nenhuma profissional encontrada
            </Text>
            {!config.modoCalmo && (
              <Text
                style={[
                  styles.estadoTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                Toque no botão "+" no topo para adicionar uma profissional à equipe.
              </Text>
            )}
          </View>
        ) : (
          <View style={[styles.lista, { gap: 12 + tema.espacoExtra }]}>
            {profissionaisFiltrados.map((prof) => {
              const estaAtivo = prof.ativo !== false;
              const comissao = prof.percentualComissao ?? prof.comissao ?? 50;
              const estaExcluindo = excluindoId === prof.id;
              const nomeItem = prof.nome || 'Profissional';

              return (
                <View
                  key={prof.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: tema.bgSurface,
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    },
                  ]}
                >
                  <View style={styles.cardTopo}>
                    <View style={{ flex: 1 }}>
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
                        {prof.especialidade || 'Especialidade não informada'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: estaAtivo ? tema.successSoft : tema.dangerSoft,
                          borderColor: estaAtivo
                            ? config.altoContraste
                              ? tema.success
                              : 'rgba(165, 214, 167, 0.35)'
                            : config.altoContraste
                            ? tema.danger
                            : 'rgba(255, 123, 123, 0.35)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTexto,
                          {
                            fontSize: tema.fontSize(11),
                            color: estaAtivo ? tema.success : tema.danger,
                          },
                        ]}
                      >
                        {estaAtivo ? 'Ativa' : 'Inativa'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.infoLinhaTexto,
                      { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                    ]}
                  >
                    Comissão:{' '}
                    <Text style={[styles.destaqueRosa, { color: tema.accent }]}>
                      {comissao}%
                    </Text>
                    {prof.telefone ? ` • ${prof.telefone}` : ''}
                  </Text>
                  {prof.email ? (
                    <Text
                      style={[
                        styles.infoSecundariaTexto,
                        { color: tema.textMuted, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {prof.email}
                    </Text>
                  ) : null}

                  <View
                    style={[
                      styles.cardRodape,
                      { borderTopColor: tema.borderSubtle },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagPapel,
                        { color: tema.textMuted, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      Nível: Profissional
                    </Text>

                    <View style={[styles.acoesRow, { gap: 8 + tema.espacoExtra }]}>
                      <TouchableOpacity
                        hitSlop={tema.hitSlopPadrao}
                        accessibilityRole="button"
                        accessibilityLabel={`Editar profissional ${nomeItem}`}
                        style={[
                          styles.btnEditar,
                          {
                            minHeight: tema.minTouchHeight,
                            backgroundColor: tema.accentSoft,
                            borderColor: tema.accentBorder,
                          },
                        ]}
                        onPress={() => abrirModalEditarProfissional(prof)}
                        disabled={estaExcluindo}
                      >
                        <Ionicons name="create-outline" size={16} color={tema.accent} />
                        <Text
                          style={[
                            styles.btnEditarTexto,
                            { color: tema.accent, fontSize: tema.fontSize(12) },
                          ]}
                        >
                          Editar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        hitSlop={tema.hitSlopPadrao}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover profissional ${nomeItem}`}
                        style={[
                          styles.btnExcluir,
                          {
                            minWidth: tema.minTouchHeight,
                            minHeight: tema.minTouchHeight,
                            backgroundColor: tema.dangerSoft,
                            borderColor: config.altoContraste
                              ? tema.danger
                              : 'rgba(255, 123, 123, 0.35)',
                          },
                        ]}
                        onPress={() => confirmarExcluirProfissional(prof)}
                        disabled={estaExcluindo}
                      >
                        {estaExcluindo ? (
                          <ActivityIndicator size="small" color={tema.danger} />
                        ) : (
                          <Ionicons name="trash-outline" size={16} color={tema.danger} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalServicoVisivel}
        transparent
        animationType="fade"
        accessibilityViewIsModal
        onRequestClose={() => setModalServicoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.modalTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(18) },
                ]}
              >
                {servicoEditando ? 'Editar Serviço' : 'Novo Serviço'}
              </Text>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Fechar janela de serviço"
                style={{
                  minWidth: tema.minTouchHeight,
                  minHeight: tema.minTouchHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setModalServicoVisivel(false)}
              >
                <Ionicons name="close" size={22} color={tema.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.label,
                { color: tema.accent, fontSize: tema.fontSize(12) },
              ]}
            >
              Nome do Serviço
            </Text>
            <TextInput
              accessibilityLabel="Nome do Serviço"
              style={[
                styles.input,
                {
                  backgroundColor: tema.bgElevated,
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(14),
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              value={nomeServico}
              onChangeText={setNomeServico}
              placeholder="Ex.: Alongamento em Gel"
              placeholderTextColor={tema.textMuted}
            />

            <View style={[styles.linhaInputs, { gap: 10 + tema.espacoExtra }]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.label,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Preço (R$)
                </Text>
                <TextInput
                  accessibilityLabel="Preço em Reais"
                  style={[
                    styles.input,
                    {
                      backgroundColor: tema.bgElevated,
                      color: tema.textPrimary,
                      fontSize: tema.fontSize(14),
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                  value={precoServico}
                  onChangeText={setPrecoServico}
                  placeholder="85,00"
                  placeholderTextColor={tema.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.label,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Duração (min)
                </Text>
                <TextInput
                  accessibilityLabel="Duração em minutos"
                  style={[
                    styles.input,
                    {
                      backgroundColor: tema.bgElevated,
                      color: tema.textPrimary,
                      fontSize: tema.fontSize(14),
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                  value={duracaoServico}
                  onChangeText={setDuracaoServico}
                  placeholder="45"
                  placeholderTextColor={tema.textMuted}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text
              style={[
                styles.label,
                { color: tema.accent, fontSize: tema.fontSize(12) },
              ]}
            >
              Categoria
            </Text>
            <TextInput
              accessibilityLabel="Categoria do serviço"
              style={[
                styles.input,
                {
                  backgroundColor: tema.bgElevated,
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(14),
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              value={categoriaServico}
              onChangeText={setCategoriaServico}
              placeholder="Esmalteria, Spa dos Pés, Alongamento..."
              placeholderTextColor={tema.textMuted}
            />

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="checkbox"
              accessibilityLabel="Serviço disponível para agendamento"
              accessibilityState={{ checked: ativoServico }}
              style={[
                styles.toggleLinha,
                { minHeight: tema.minTouchHeight },
              ]}
              onPress={() => setAtivoServico((v) => !v)}
            >
              <Ionicons
                name={ativoServico ? 'checkbox' : 'square-outline'}
                size={20}
                color={tema.accent}
              />
              <Text
                style={[
                  styles.toggleTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                Serviço disponível para agendamento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Salvar serviço"
              style={[
                styles.btnSalvarModal,
                {
                  backgroundColor: tema.accent,
                  minHeight: tema.minTouchHeight,
                  justifyContent: 'center',
                },
                salvandoServico && { opacity: 0.6 },
              ]}
              onPress={salvarServico}
              disabled={salvandoServico}
            >
              {salvandoServico ? (
                <ActivityIndicator color={tema.textOnAccent} />
              ) : (
                <Text
                  style={[
                    styles.btnSalvarTexto,
                    { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Salvar Serviço
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalProfVisivel}
        transparent
        animationType="fade"
        accessibilityViewIsModal
        onRequestClose={() => setModalProfVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.modalTitulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(18) },
                ]}
              >
                {profEditando ? 'Editar Profissional' : 'Nova Profissional'}
              </Text>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Fechar janela de profissional"
                style={{
                  minWidth: tema.minTouchHeight,
                  minHeight: tema.minTouchHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setModalProfVisivel(false)}
              >
                <Ionicons name="close" size={22} color={tema.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.label,
                { color: tema.accent, fontSize: tema.fontSize(12) },
              ]}
            >
              Nome completo
            </Text>
            <TextInput
              accessibilityLabel="Nome completo da profissional"
              style={[
                styles.input,
                {
                  backgroundColor: tema.bgElevated,
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(14),
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              value={nomeProf}
              onChangeText={setNomeProf}
              placeholder="Ex.: Jo"
              placeholderTextColor={tema.textMuted}
            />

            <Text
              style={[
                styles.label,
                { color: tema.accent, fontSize: tema.fontSize(12) },
              ]}
            >
              Especialidade
            </Text>
            <TextInput
              accessibilityLabel="Especialidade da profissional"
              style={[
                styles.input,
                {
                  backgroundColor: tema.bgElevated,
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(14),
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              value={especialidadeProf}
              onChangeText={setEspecialidadeProf}
              placeholder="Ex.: Nail Designer / Manicure"
              placeholderTextColor={tema.textMuted}
            />

            <View style={[styles.linhaInputs, { gap: 10 + tema.espacoExtra }]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.label,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Comissão (%)
                </Text>
                <TextInput
                  accessibilityLabel="Percentual de comissão"
                  style={[
                    styles.input,
                    {
                      backgroundColor: tema.bgElevated,
                      color: tema.textPrimary,
                      fontSize: tema.fontSize(14),
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                  value={comissaoProf}
                  onChangeText={setComissaoProf}
                  placeholder="50"
                  placeholderTextColor={tema.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.label,
                    { color: tema.accent, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Telefone
                </Text>
                <TextInput
                  accessibilityLabel="Telefone da profissional"
                  style={[
                    styles.input,
                    {
                      backgroundColor: tema.bgElevated,
                      color: tema.textPrimary,
                      fontSize: tema.fontSize(14),
                      borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                      minHeight: tema.minTouchHeight,
                    },
                  ]}
                  value={telefoneProf}
                  onChangeText={setTelefoneProf}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={tema.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <Text
              style={[
                styles.label,
                { color: tema.accent, fontSize: tema.fontSize(12) },
              ]}
            >
              E-mail
            </Text>
            <TextInput
              accessibilityLabel="E-mail da profissional"
              style={[
                styles.input,
                {
                  backgroundColor: tema.bgElevated,
                  color: tema.textPrimary,
                  fontSize: tema.fontSize(14),
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              value={emailProf}
              onChangeText={setEmailProf}
              placeholder="profissional@lirium.com"
              placeholderTextColor={tema.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="checkbox"
              accessibilityLabel="Profissional ativa na agenda"
              accessibilityState={{ checked: ativoProf }}
              style={[
                styles.toggleLinha,
                { minHeight: tema.minTouchHeight },
              ]}
              onPress={() => setAtivoProf((v) => !v)}
            >
              <Ionicons
                name={ativoProf ? 'checkbox' : 'square-outline'}
                size={20}
                color={tema.accent}
              />
              <Text
                style={[
                  styles.toggleTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                Profissional ativa na agenda
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Salvar profissional"
              style={[
                styles.btnSalvarModal,
                {
                  backgroundColor: tema.accent,
                  minHeight: tema.minTouchHeight,
                  justifyContent: 'center',
                },
                salvandoProf && { opacity: 0.6 },
              ]}
              onPress={salvarProfissional}
              disabled={salvandoProf}
            >
              {salvandoProf ? (
                <ActivityIndicator color={tema.textOnAccent} />
              ) : (
                <Text
                  style={[
                    styles.btnSalvarTexto,
                    { color: tema.textOnAccent, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Salvar Profissional
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topTitle: {
    fontWeight: 'bold',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abasRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  abaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  abaTexto: {
    fontWeight: '600',
  },
  buscaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  buscaInput: {
    flex: 1,
    paddingVertical: 10,
  },
  content: {
    paddingHorizontal: 20,
  },
  lista: {},
  card: {
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  cardTitulo: {
    fontWeight: 'bold',
  },
  cardSub: {
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusTexto: {
    fontWeight: 'bold',
  },
  infoLinhaTexto: {
    marginBottom: 4,
  },
  destaqueRosa: {
    fontWeight: 'bold',
  },
  infoSecundariaTexto: {
    marginBottom: 6,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
  },
  precoDestaque: {
    fontWeight: 'bold',
  },
  tagPapel: {
    fontWeight: '600',
  },
  acoesRow: {
    flexDirection: 'row',
  },
  btnEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnEditarTexto: {
    fontWeight: 'bold',
  },
  btnExcluir: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  estadoTitulo: {
    fontWeight: 'bold',
  },
  estadoTexto: {
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitulo: {
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  linhaInputs: {
    flexDirection: 'row',
  },
  toggleLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  toggleTexto: {},
  btnSalvarModal: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSalvarTexto: {
    fontWeight: 'bold',
  },
});
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

const COLORS = {
  bgPrimary: '#1E201E',
  bgSurface: '#2A2D2A',
  bgElevated: '#343834',
  bgDark: '#161816',
  borderSubtle: 'rgba(255,255,255,0.08)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.15)',
  accentBorder: 'rgba(255, 152, 185, 0.42)',
  textPrimary: '#FFFFFF',
  textSecondary: '#C8CCC8',
  textMuted: '#8E938E',
  textOnAccent: '#1E201E',
  success: '#A5D6A7',
  successSoft: 'rgba(165, 214, 167, 0.14)',
  danger: '#FF7B7B',
  dangerSoft: 'rgba(255, 123, 123, 0.14)',
};

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

  const [abaAtiva, setAbaAtiva] = useState('servicos'); // 'servicos' | 'profissionais'
  const [busca, setBusca] = useState('');

  // Estados de Serviços
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

  // Estados de Profissionais
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

  // --- CRUD SERVIÇOS ---
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

  // --- CRUD PROFISSIONAIS ---
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
    const comissaoAtual =
      item.percentualComissao ?? item.comissao ?? 50;
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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Catálogo e Equipe</Text>

        <TouchableOpacity
          onPress={
            abaAtiva === 'servicos'
              ? abrirModalNovoServico
              : abrirModalNovoProfissional
          }
          style={styles.addButton}
          accessibilityLabel="Adicionar novo item"
        >
          <Ionicons name="add" size={22} color={COLORS.textOnAccent} />
        </TouchableOpacity>
      </View>

      {/* Alternador de abas */}
      <View style={styles.abasRow}>
        <TouchableOpacity
          style={[styles.abaBtn, abaAtiva === 'servicos' && styles.abaBtnAtiva]}
          onPress={() => setAbaAtiva('servicos')}
        >
          <Ionicons
            name="sparkles-outline"
            size={16}
            color={abaAtiva === 'servicos' ? COLORS.textOnAccent : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.abaTexto,
              abaAtiva === 'servicos' && styles.abaTextoAtiva,
            ]}
          >
            Serviços ({servicos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.abaBtn, abaAtiva === 'profissionais' && styles.abaBtnAtiva]}
          onPress={() => setAbaAtiva('profissionais')}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={
              abaAtiva === 'profissionais' ? COLORS.textOnAccent : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.abaTexto,
              abaAtiva === 'profissionais' && styles.abaTextoAtiva,
            ]}
          >
            Profissionais ({profissionais.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.buscaBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.buscaInput}
          value={busca}
          onChangeText={setBusca}
          placeholder={
            abaAtiva === 'servicos'
              ? 'Buscar serviço ou categoria...'
              : 'Buscar profissional ou especialidade...'
          }
          placeholderTextColor={COLORS.textMuted}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {carregandoAtual ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.estadoTexto}>Carregando registros...</Text>
          </View>
        ) : abaAtiva === 'servicos' ? (
          servicosFiltrados.length === 0 ? (
            <View style={styles.centro}>
              <Ionicons name="sparkles-outline" size={42} color={COLORS.textMuted} />
              <Text style={styles.estadoTitulo}>Nenhum serviço encontrado</Text>
              <Text style={styles.estadoTexto}>
                Toque no botão "+" no topo para cadastrar um novo serviço.
              </Text>
            </View>
          ) : (
            <View style={styles.lista}>
              {servicosFiltrados.map((item) => {
                const estaAtivo = item.ativo !== false;
                const estaExcluindo = excluindoId === item.id;

                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardTopo}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitulo}>{item.nome || 'Serviço'}</Text>
                        <Text style={styles.cardSub}>
                          {item.categoria || 'Geral'} • {item.duracaoMin || 30} min
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          estaAtivo ? styles.pillAtivo : styles.pillInativo,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTexto,
                            estaAtivo ? styles.textoAtivo : styles.textoInativo,
                          ]}
                        >
                          {estaAtivo ? 'Ativo' : 'Inativo'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardRodape}>
                      <Text style={styles.precoDestaque}>{formatarMoeda(item.preco)}</Text>

                      <View style={styles.acoesRow}>
                        <TouchableOpacity
                          style={styles.btnEditar}
                          onPress={() => abrirModalEditarServico(item)}
                          disabled={estaExcluindo}
                        >
                          <Ionicons name="create-outline" size={16} color={COLORS.accent} />
                          <Text style={styles.btnEditarTexto}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.btnExcluir}
                          onPress={() => confirmarExcluirServico(item)}
                          disabled={estaExcluindo}
                        >
                          {estaExcluindo ? (
                            <ActivityIndicator size="small" color={COLORS.danger} />
                          ) : (
                            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
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
            <Ionicons name="people-outline" size={42} color={COLORS.textMuted} />
            <Text style={styles.estadoTitulo}>Nenhuma profissional encontrada</Text>
            <Text style={styles.estadoTexto}>
              Toque no botão "+" no topo para adicionar uma profissional à equipe.
            </Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {profissionaisFiltrados.map((prof) => {
              const estaAtivo = prof.ativo !== false;
              const comissao = prof.percentualComissao ?? prof.comissao ?? 50;
              const estaExcluindo = excluindoId === prof.id;

              return (
                <View key={prof.id} style={styles.card}>
                  <View style={styles.cardTopo}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitulo}>{prof.nome || 'Profissional'}</Text>
                      <Text style={styles.cardSub}>
                        {prof.especialidade || 'Especialidade não informada'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        estaAtivo ? styles.pillAtivo : styles.pillInativo,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTexto,
                          estaAtivo ? styles.textoAtivo : styles.textoInativo,
                        ]}
                      >
                        {estaAtivo ? 'Ativa' : 'Inativa'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.infoLinhaTexto}>
                    Comissão: <Text style={styles.destaqueRosa}>{comissao}%</Text>
                    {prof.telefone ? ` • ${prof.telefone}` : ''}
                  </Text>
                  {prof.email ? (
                    <Text style={styles.infoSecundariaTexto}>{prof.email}</Text>
                  ) : null}

                  <View style={styles.cardRodape}>
                    <Text style={styles.tagPapel}>Nível: Profissional</Text>

                    <View style={styles.acoesRow}>
                      <TouchableOpacity
                        style={styles.btnEditar}
                        onPress={() => abrirModalEditarProfissional(prof)}
                        disabled={estaExcluindo}
                      >
                        <Ionicons name="create-outline" size={16} color={COLORS.accent} />
                        <Text style={styles.btnEditarTexto}>Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnExcluir}
                        onPress={() => confirmarExcluirProfissional(prof)}
                        disabled={estaExcluindo}
                      >
                        {estaExcluindo ? (
                          <ActivityIndicator size="small" color={COLORS.danger} />
                        ) : (
                          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
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

      {/* Modal Criar/Editar Serviço */}
      <Modal
        visible={modalServicoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalServicoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {servicoEditando ? 'Editar Serviço' : 'Novo Serviço'}
              </Text>
              <TouchableOpacity onPress={() => setModalServicoVisivel(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nome do Serviço</Text>
            <TextInput
              style={styles.input}
              value={nomeServico}
              onChangeText={setNomeServico}
              placeholder="Ex.: Alongamento em Gel"
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.linhaInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Preço (R$)</Text>
                <TextInput
                  style={styles.input}
                  value={precoServico}
                  onChangeText={setPrecoServico}
                  placeholder="85,00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Duração (min)</Text>
                <TextInput
                  style={styles.input}
                  value={duracaoServico}
                  onChangeText={setDuracaoServico}
                  placeholder="45"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.label}>Categoria</Text>
            <TextInput
              style={styles.input}
              value={categoriaServico}
              onChangeText={setCategoriaServico}
              placeholder="Esmalteria, Spa dos Pés, Alongamento..."
              placeholderTextColor={COLORS.textMuted}
            />

            <TouchableOpacity
              style={styles.toggleLinha}
              onPress={() => setAtivoServico((v) => !v)}
            >
              <Ionicons
                name={ativoServico ? 'checkbox' : 'square-outline'}
                size={20}
                color={COLORS.accent}
              />
              <Text style={styles.toggleTexto}>Serviço disponível para agendamento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSalvarModal, salvandoServico && { opacity: 0.6 }]}
              onPress={salvarServico}
              disabled={salvandoServico}
            >
              {salvandoServico ? (
                <ActivityIndicator color={COLORS.textOnAccent} />
              ) : (
                <Text style={styles.btnSalvarTexto}>Salvar Serviço</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Criar/Editar Profissional */}
      <Modal
        visible={modalProfVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalProfVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {profEditando ? 'Editar Profissional' : 'Nova Profissional'}
              </Text>
              <TouchableOpacity onPress={() => setModalProfVisivel(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={nomeProf}
              onChangeText={setNomeProf}
              placeholder="Ex.: Jo"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.label}>Especialidade</Text>
            <TextInput
              style={styles.input}
              value={especialidadeProf}
              onChangeText={setEspecialidadeProf}
              placeholder="Ex.: Nail Designer / Manicure"
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.linhaInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Comissão (%)</Text>
                <TextInput
                  style={styles.input}
                  value={comissaoProf}
                  onChangeText={setComissaoProf}
                  placeholder="50"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={telefoneProf}
                  onChangeText={setTelefoneProf}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={emailProf}
              onChangeText={setEmailProf}
              placeholder="profissional@lirium.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.toggleLinha}
              onPress={() => setAtivoProf((v) => !v)}
            >
              <Ionicons
                name={ativoProf ? 'checkbox' : 'square-outline'}
                size={20}
                color={COLORS.accent}
              />
              <Text style={styles.toggleTexto}>Profissional ativa na agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSalvarModal, salvandoProf && { opacity: 0.6 }]}
              onPress={salvarProfissional}
              disabled={salvandoProf}
            >
              {salvandoProf ? (
                <ActivityIndicator color={COLORS.textOnAccent} />
              ) : (
                <Text style={styles.btnSalvarTexto}>Salvar Profissional</Text>
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
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abasRow: {
    flexDirection: 'row',
    gap: 10,
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
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  abaBtnAtiva: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  abaTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  abaTextoAtiva: {
    color: COLORS.textOnAccent,
    fontWeight: 'bold',
  },
  buscaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  buscaInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lista: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  cardTitulo: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillAtivo: {
    backgroundColor: COLORS.successSoft,
    borderColor: 'rgba(165, 214, 167, 0.35)',
  },
  pillInativo: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: 'rgba(255, 123, 123, 0.35)',
  },
  statusTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textoAtivo: {
    color: COLORS.success,
  },
  textoInativo: {
    color: COLORS.danger,
  },
  infoLinhaTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  destaqueRosa: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  infoSecundariaTexto: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  precoDestaque: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagPapel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  acoesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnEditarTexto: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnExcluir: {
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 123, 0.35)',
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
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  estadoTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitulo: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.bgElevated,
    color: COLORS.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 10,
  },
  linhaInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  toggleTexto: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  btnSalvarModal: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSalvarTexto: {
    color: COLORS.textOnAccent,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
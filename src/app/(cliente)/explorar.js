import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

const SERVICOS_PADRAO = [
  {
    id: 'srv-manicure-tradicional',
    nome: 'Manicure Tradicional',
    categoria: 'Unhas & Mãos',
    descricao: 'Cutilagem, lixamento, esmaltação clássica e finalização hidratante.',
    duracao: '45 min',
    preco: 45,
  },
  {
    id: 'srv-pedicure-tradicional',
    nome: 'Pedicure Tradicional',
    categoria: 'Unhas & Pés',
    descricao: 'Cuidados completos para os pés com esfoliação leve e esmaltação.',
    duracao: '50 min',
    preco: 55,
  },
  {
    id: 'srv-esmaltação-gel',
    nome: 'Esmaltação em Gel',
    categoria: 'Unhas & Mãos',
    descricao: 'Brilho intenso de longa duração com secagem em cabine LED/UV.',
    duracao: '60 min',
    preco: 75,
  },
  {
    id: 'srv-alongamento-fibra',
    nome: 'Alongamento em Fibra de Vidro',
    categoria: 'Unhas & Mãos',
    descricao: 'Estrutura resistente, formato personalizado e acabamento natural.',
    duracao: '120 min',
    preco: 150,
  },
  {
    id: 'srv-spa-pes',
    nome: 'Spa dos Pés Relaxante',
    categoria: 'Spa & Bem-Estar',
    descricao: 'Imersão aromática, esfoliação renovadora, máscara e massagem.',
    duracao: '60 min',
    preco: 90,
  },
  {
    id: 'srv-spa-maos',
    nome: 'Spa das Mãos & Hidratação',
    categoria: 'Spa & Bem-Estar',
    descricao: 'Tratamento nutritivo profundo com massagem relaxante nas mãos.',
    duracao: '40 min',
    preco: 60,
  },
  {
    id: 'srv-design-sobrancelhas',
    nome: 'Design de Sobrancelhas',
    categoria: 'Sobrancelhas & Facial',
    descricao: 'Mapeamento facial, alinhamento preciso e acabamento suave.',
    duracao: '35 min',
    preco: 50,
  },
  {
    id: 'srv-sobrancelha-henna',
    nome: 'Design com Henna',
    categoria: 'Sobrancelhas & Facial',
    descricao: 'Coloração temporária com efeito preenchido e simetria natural.',
    duracao: '45 min',
    preco: 65,
  },
];

function formatarMoeda(valor) {
  return `R$ ${(Number(valor) || 0).toFixed(2).replace('.', ',')}`;
}

export default function ExplorarServicosScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();

  const [servicosFirestore, setServicosFirestore] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [selecionadosIds, setSelecionadosIds] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'servicos'),
      (snap) => {
        const lista = [];
        snap.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        setServicosFirestore(lista);
        setCarregando(false);
      },
      (error) => {
        console.error('Erro ao carregar serviços:', error);
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const catalogoBase = useMemo(() => {
    if (servicosFirestore.length > 0) {
      return servicosFirestore.map((item, index) => ({
        id: item.id,
        nome: item.nome || `Serviço ${index + 1}`,
        categoria: item.categoria || 'Serviços',
        descricao: item.descricao || '',
        duracao: item.duracao ? `${item.duracao} min` : '',
        preco: Number(item.preco) || 0,
      }));
    }
    return SERVICOS_PADRAO;
  }, [servicosFirestore]);

  const categorias = useMemo(() => {
    const setCats = new Set(['Todos']);
    catalogoBase.forEach((s) => {
      if (s.categoria) setCats.add(s.categoria);
    });
    return Array.from(setCats);
  }, [catalogoBase]);

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return catalogoBase.filter((item) => {
      const bateCategoria =
        categoriaAtiva === 'Todos' || item.categoria === categoriaAtiva;
      if (!bateCategoria) return false;
      if (!termo) return true;
      return (
        String(item.nome).toLowerCase().includes(termo) ||
        String(item.categoria).toLowerCase().includes(termo) ||
        String(item.descricao).toLowerCase().includes(termo)
      );
    });
  }, [catalogoBase, busca, categoriaAtiva]);

  const gruposPorCategoria = useMemo(() => {
    const mapa = new Map();
    servicosFiltrados.forEach((item) => {
      const cat = item.categoria || 'Outros Serviços';
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat).push(item);
    });
    return Array.from(mapa.entries()).map(([categoria, itens]) => ({
      categoria,
      itens,
    }));
  }, [servicosFiltrados]);

  const servicosSelecionados = useMemo(
    () => catalogoBase.filter((s) => selecionadosIds.includes(s.id)),
    [catalogoBase, selecionadosIds]
  );

  const totalSelecionado = useMemo(
    () =>
      servicosSelecionados.reduce((acc, item) => acc + (Number(item.preco) || 0), 0),
    [servicosSelecionados]
  );

  function toggleServico(id) {
    setSelecionadosIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleContinuarAgendamento() {
    if (selecionadosIds.length === 0) return;
    router.push({
      pathname: '/(cliente)/agendar',
      params: {
        ids: selecionadosIds.join(','),
      },
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <View
        style={[
          styles.header,
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
            styles.backBtn,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={tema.textPrimary} accessible={false} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            accessibilityRole="header"
            style={[
              styles.headerTitulo,
              { color: tema.textPrimary, fontSize: tema.fontSize(20) },
            ]}
          >
            Explorar Serviços
          </Text>
          {!config.modoCalmo && (
            <Text
              style={[
                styles.headerSub,
                { color: tema.textSecondary, fontSize: tema.fontSize(12) },
              ]}
            >
              Selecione um ou mais serviços para agendar
            </Text>
          )}
        </View>
      </View>

      <View style={styles.filtrosArea}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
              minHeight: tema.minTouchHeight,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={tema.textMuted} accessible={false} />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar serviço ou categoria..."
            placeholderTextColor={tema.textMuted}
            accessibilityLabel="Buscar serviço ou categoria"
            style={[
              styles.searchInput,
              { color: tema.textPrimary, fontSize: tema.fontSize(14) },
            ]}
          />
          {busca.length > 0 && (
            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              onPress={() => setBusca('')}
            >
              <Ionicons name="close-circle" size={20} color={tema.textMuted} accessible={false} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsRow, { gap: 8 + tema.espacoExtra }]}
        >
          {categorias.map((cat) => {
            const ativa = categoriaAtiva === cat;
            return (
              <TouchableOpacity
                key={cat}
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel={`Categoria ${cat}`}
                accessibilityState={{ selected: ativa }}
                onPress={() => setCategoriaAtiva(cat)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: ativa ? tema.accent : tema.bgSurface,
                    borderColor: ativa
                      ? tema.accent
                      : config.altoContraste
                        ? tema.accentBorder
                        : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipTexto,
                    {
                      color: ativa ? tema.textOnAccent : tema.textSecondary,
                      fontSize: tema.fontSize(13),
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color={tema.accent}
          accessibilityLabel="Carregando serviços"
          style={{ marginTop: 40 }}
        />
      ) : gruposPorCategoria.length === 0 ? (
        <View style={styles.vazioBox}>
          <Ionicons name="sparkles-outline" size={44} color={tema.textMuted} accessible={false} />
          <Text
            style={[
              styles.vazioTexto,
              { color: tema.textSecondary, fontSize: tema.fontSize(15) },
            ]}
          >
            Nenhum serviço encontrado.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listaContent,
            {
              paddingBottom:
                (selecionadosIds.length > 0 ? 156 : 96) + tema.espacoExtra,
              gap: 20 + tema.espacoExtra,
            },
          ]}
        >
          {gruposPorCategoria.map((grupo) => (
            <View key={grupo.categoria} style={{ gap: 10 + tema.espacoExtra }}>
              <View style={styles.grupoHeader}>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.grupoTitulo,
                    { color: tema.accent, fontSize: tema.fontSize(15) },
                  ]}
                >
                  {grupo.categoria}
                </Text>
                <Text
                  style={[
                    styles.grupoQtd,
                    { color: tema.textMuted, fontSize: tema.fontSize(12) },
                  ]}
                >
                  {grupo.itens.length} {grupo.itens.length === 1 ? 'opção' : 'opções'}
                </Text>
              </View>

              {grupo.itens.map((item) => {
                const selecionada = selecionadosIds.includes(item.id);
                const precoFmt = formatarMoeda(item.preco);

                return (
                  <TouchableOpacity
                    key={item.id}
                    hitSlop={tema.hitSlopPadrao}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.nome}, ${item.categoria}, ${precoFmt}${item.duracao ? `, duração ${item.duracao}` : ''}`}
                    accessibilityState={{ selected: selecionada }}
                    onPress={() => toggleServico(item.id)}
                    style={[
                      styles.cardServico,
                      {
                        backgroundColor: selecionada ? tema.accentSoft : tema.bgSurface,
                        borderColor: selecionada
                          ? tema.accent
                          : config.altoContraste
                            ? tema.accentBorder
                            : tema.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.cardTopo}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text
                          style={[
                            styles.servicoNome,
                            { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                          ]}
                        >
                          {item.nome}
                        </Text>
                        {Boolean(item.descricao) && !config.modoCalmo && (
                          <Text
                            style={[
                              styles.servicoDesc,
                              { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                            ]}
                          >
                            {item.descricao}
                          </Text>
                        )}
                      </View>

                      <Ionicons
                        name={selecionada ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={selecionada ? tema.accent : tema.textMuted}
                        accessible={false}
                      />
                    </View>

                    <View
                      style={[
                        styles.cardRodape,
                        { borderTopColor: tema.borderSubtle },
                      ]}
                    >
                      <View style={styles.metaRow}>
                        <Text
                          style={[
                            styles.precoTexto,
                            { color: tema.accent, fontSize: tema.fontSize(15) },
                          ]}
                        >
                          {precoFmt}
                        </Text>
                        {Boolean(item.duracao) && (
                          <Text
                            style={[
                              styles.duracaoTexto,
                              { color: tema.textMuted, fontSize: tema.fontSize(12) },
                            ]}
                          >
                            • {item.duracao}
                          </Text>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.acaoTag,
                          {
                            color: selecionada ? tema.accent : tema.textSecondary,
                            fontSize: tema.fontSize(12),
                          },
                        ]}
                      >
                        {selecionada ? 'Selecionado' : 'Toque para selecionar'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {selecionadosIds.length > 0 && (
        <View
          style={[
            styles.barraAgendar,
            {
              backgroundColor: tema.bgElevated,
              borderTopColor: tema.accentBorder,
            },
          ]}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={[
                styles.barraQtd,
                { color: tema.textSecondary, fontSize: tema.fontSize(12) },
              ]}
            >
              {selecionadosIds.length}{' '}
              {selecionadosIds.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}
            </Text>
            <Text
              style={[
                styles.barraTotal,
                { color: tema.textPrimary, fontSize: tema.fontSize(17) },
              ]}
            >
              Total: {formatarMoeda(totalSelecionado)}
            </Text>
          </View>

          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel={`Continuar para agendamento com ${selecionadosIds.length} serviço(s), total ${formatarMoeda(totalSelecionado)}`}
            onPress={handleContinuarAgendamento}
            style={[
              styles.btnAgendar,
              {
                backgroundColor: tema.accent,
                minHeight: tema.minTouchHeight,
              },
            ]}
          >
            <Text
              style={[
                styles.btnAgendarTexto,
                { color: tema.textOnAccent, fontSize: tema.fontSize(14) },
              ]}
            >
              Agendar
            </Text>
            <Ionicons name="arrow-forward" size={18} color={tema.textOnAccent} accessible={false} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitulo: { fontWeight: 'bold' },
  headerSub: { marginTop: 2 },
  filtrosArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
  chipsRow: {
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipTexto: { fontWeight: '700' },
  vazioBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  vazioTexto: { textAlign: 'center' },
  listaContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  grupoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grupoTitulo: { fontWeight: 'bold' },
  grupoQtd: { fontWeight: '600' },
  cardServico: {
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    gap: 12,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  servicoNome: { fontWeight: 'bold' },
  servicoDesc: { marginTop: 4, lineHeight: 18 },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  precoTexto: { fontWeight: 'bold' },
  duracaoTexto: { fontWeight: '600' },
  acaoTag: { fontWeight: '600' },
  barraAgendar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  barraQtd: { fontWeight: '600' },
  barraTotal: { fontWeight: 'bold', marginTop: 2 },
  btnAgendar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnAgendarTexto: { fontWeight: 'bold' },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function PacotesClienteScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [pacotes, setPacotes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPacotes() {
      try {
        const snap = await getDocs(collection(db, 'pacotes'));
        const lista = [];
        snap.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        setPacotes(lista);
      } catch (error) {
        console.error('Erro ao carregar pacotes:', error);
      } finally {
        setCarregando(false);
      }
    }
    carregarPacotes();
  }, []);

  function handleComprarEAgendar(item) {
    router.push({
      pathname: '/(cliente)/agendar',
      params: {
        pacoteId: item.id,
        nomePacote: item.nome,
        preco: String(item.preco || 0),
        frequenciaSemanal: '1_por_semana',
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
        <Text
          accessibilityRole="header"
          style={[
            styles.headerTitulo,
            { color: tema.textPrimary, fontSize: tema.fontSize(20) },
          ]}
        >
          Pacotes Promocionais
        </Text>
        {!config.modoCalmo && (
          <Text
            style={[
              styles.headerSub,
              { color: tema.accent, fontSize: tema.fontSize(13) },
            ]}
          >
            Pacotes de 4 sessões equivalem a 1 sessão por semana
          </Text>
        )}
      </View>

      {carregando ? (
        <ActivityIndicator
          color={tema.accent}
          accessibilityLabel="Carregando pacotes promocionais"
          style={{ marginTop: 40 }}
          size="large"
        />
      ) : (
        <FlatList
          data={pacotes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 88 + tema.espacoExtra,
            gap: 12 + tema.espacoExtra,
          }}
          ListEmptyComponent={
            <Text
              style={[
                styles.textoVazio,
                { color: tema.textSecondary, fontSize: tema.fontSize(14) },
              ]}
            >
              Nenhum pacote disponível no momento.
            </Text>
          }
          renderItem={({ item }) => {
            const precoFormatado = `R$ ${Number(item.preco || 0).toFixed(2).replace('.', ',')}`;
            const regraSemanal =
              item.sessoes === 4 || /4\s*sess/i.test(item.nome || '')
                ? '1 sessão por semana (4 semanas)'
                : 'Pacote promocional';

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
                <View style={styles.cardTopo}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cardTitulo,
                        { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                      ]}
                    >
                      {item.nome}
                    </Text>
                    <Text
                      style={[
                        styles.regraTexto,
                        { color: tema.accent, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {regraSemanal}
                    </Text>
                    {Boolean(item.descricao) && (
                      <Text
                        style={[
                          styles.cardSub,
                          { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                        ]}
                      >
                        {item.descricao}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                    <Text
                      style={[
                        styles.cardValor,
                        { color: tema.accent, fontSize: tema.fontSize(16) },
                      ]}
                    >
                      {precoFormatado}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  hitSlop={tema.hitSlopPadrao}
                  accessibilityRole="button"
                  accessibilityLabel={`Comprar e agendar ${item.nome}, valor ${precoFormatado}, ${regraSemanal}`}
                  onPress={() => handleComprarEAgendar(item)}
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
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  headerTitulo: { fontWeight: 'bold' },
  headerSub: { marginTop: 2 },
  textoVazio: { textAlign: 'center', marginTop: 40 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitulo: { fontWeight: 'bold' },
  regraTexto: { fontWeight: '600', marginTop: 3 },
  cardSub: { marginTop: 4 },
  cardValor: { fontWeight: 'bold' },
  btnComprarAgendar: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnComprarAgendarTexto: { fontWeight: 'bold' },
});
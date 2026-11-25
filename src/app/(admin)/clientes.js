import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

export default function AdminClientesScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    setCarregando(true);
    try {
      const q = query(collection(db, 'usuarios'), where('nivelAcesso', '==', 'cliente'));
      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });
      setClientes(lista);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setCarregando(false);
    }
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

          <View style={styles.headerTextos}>
        <Text
          accessibilityRole="header"
          style={[
            styles.headerTitulo,
            { color: tema.textPrimary, fontSize: tema.fontSize(20) },
          ]}
        >
          Contatos de Clientes
        </Text>
        {!config.modoCalmo && (
          <Text
            style={[
              styles.headerSub,
              { color: tema.accent, fontSize: tema.fontSize(13) },
            ]}
          >
            Lista de clientes registados na plataforma
          </Text>
        )}
        </View>
      </View>

      {carregando ? (
        <ActivityIndicator
          color={tema.accent}
          accessibilityLabel="Carregando lista de clientes"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={clientes}
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
              Nenhum cliente encontrado.
            </Text>
          }
          renderItem={({ item }) => {
            const inicial = item.nome ? item.nome.charAt(0).toUpperCase() : 'C';
            const nomeExibicao = item.nome || 'Cliente sem nome';
            const emailExibicao = item.email || 'E-mail não informado';
            const telefoneExibicao = item.telefone || 'Sem telefone';

            return (
              <View
                accessible
                accessibilityLabel={`Cliente ${nomeExibicao}, e-mail ${emailExibicao}, telefone ${telefoneExibicao}`}
                style={[
                  styles.cardCliente,
                  {
                    backgroundColor: tema.bgSurface,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  },
                ]}
              >
                <View
                  style={[
                    styles.avatarContainer,
                    { backgroundColor: tema.accent },
                  ]}
                >
                  {item.fotoPerfil ? (
                    <Image
                      source={{ uri: item.fotoPerfil }}
                      accessibilityLabel={`Foto de perfil de ${nomeExibicao}`}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.avatarText,
                        { color: tema.textOnAccent, fontSize: tema.fontSize(20) },
                      ]}
                    >
                      {inicial}
                    </Text>
                  )}
                </View>

                <View style={styles.infoBox}>
                  <Text
                    style={[
                      styles.nomeCliente,
                      { color: tema.textPrimary, fontSize: tema.fontSize(16) },
                    ]}
                  >
                    {nomeExibicao}
                  </Text>
                  <Text
                    style={[
                      styles.emailCliente,
                      { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                    ]}
                  >
                    {emailExibicao}
                  </Text>
                  <View style={styles.telefoneRow}>
                    <Ionicons
                      name="call-outline"
                      size={13}
                      color={tema.accent}
                      accessible={false}
                    />
                    <Text
                      style={[
                        styles.telefoneCliente,
                        { color: tema.accent, fontSize: tema.fontSize(12) },
                      ]}
                    >
                      {telefoneExibicao}
                    </Text>
                  </View>
                </View>
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
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    gap: 12, 
  },
  headerTextos: { flex: 1, justifyContent: 'center'},
  headerTitulo: { fontWeight: 'bold' },
  headerSub: { marginTop: 2 },
  textoVazio: { textAlign: 'center', marginTop: 40 },
  cardCliente: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarImage: { width: 50, height: 50, borderRadius: 25 },
  avatarText: { fontWeight: 'bold' },
  infoBox: { flex: 1 },
  nomeCliente: { fontWeight: 'bold' },
  emailCliente: { marginTop: 2 },
  telefoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  telefoneCliente: {},
  
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  }
});
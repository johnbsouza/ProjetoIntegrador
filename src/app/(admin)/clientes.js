import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function AdminClientesScreen() {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Contatos de Clientes</Text>
        <Text style={styles.headerSub}>Lista de clientes registados na plataforma</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.textoVazio}>Nenhum cliente encontrado.</Text>
          }
          renderItem={({ item }) => {
            const inicial = item.nome ? item.nome.charAt(0).toUpperCase() : 'C';

            return (
              <View style={styles.cardCliente}>
                <View style={styles.avatarContainer}>
                  {item.fotoPerfil ? (
                    <Image source={{ uri: item.fotoPerfil }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{inicial}</Text>
                  )}
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.nomeCliente}>{item.nome || 'Cliente sem nome'}</Text>
                  <Text style={styles.emailCliente}>{item.email || 'E-mail não informado'}</Text>
                  <Text style={styles.telefoneCliente}>
                    <Ionicons name="call-outline" size={13} color="#FF98B9" /> {item.telefone || 'Sem telefone'}
                  </Text>
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
  container: { flex: 1, backgroundColor: '#434643' },
  header: { padding: 20, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerTitulo: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#FF98B9', fontSize: 13, marginTop: 2 },
  textoVazio: { color: '#D1D1D1', textAlign: 'center', marginTop: 40, fontSize: 14 },
  cardCliente: {
    backgroundColor: '#595959',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF98B9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarImage: { width: 50, height: 50, borderRadius: 25 },
  avatarText: { color: '#434643', fontSize: 20, fontWeight: 'bold' },
  infoBox: { flex: 1 },
  nomeCliente: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  emailCliente: { color: '#D1D1D1', fontSize: 13, marginTop: 2 },
  telefoneCliente: { color: '#FF98B9', fontSize: 12, marginTop: 4 },
});
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

export default function ListaContatosClientesScreen() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    async function buscarClientes() {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        const lista = [];
        querySnapshot.forEach((doc) => {
          const dados = doc.data();
          if (dados.nivelAcesso === 'cliente' || !dados.nivelAcesso) {
            lista.push({ id: doc.id, ...dados });
          }
        });
        setClientes(lista);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    }
    buscarClientes();
  }, []);

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={styles.tituloTopo}>Contatos de Clientes</Text>
        </View>

        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{item.nome ? item.nome[0] : 'C'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo}>{item.nome}</Text>
                <Text style={styles.cardSub}>{item.email}</Text>
                <Text style={styles.cardSub}>Tel: {item.telefone || 'Não informado'}</Text>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 20, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  lista: { paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  avatarBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#595959', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#FF98B9' },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: 'rgba(209, 209, 209, 0.6)', fontSize: 12, marginTop: 2 }
});
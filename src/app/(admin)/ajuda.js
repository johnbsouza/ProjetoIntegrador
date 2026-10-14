import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TelaAjuda() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.tela}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={styles.tituloTopo}>Ajuda & Suporte</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Ionicons name="book-outline" size={24} color="#FF98B9" style={{ marginBottom: 10 }} />
            <Text style={styles.cardTitulo}>Como utilizar a plataforma?</Text>
            <Text style={styles.cardTexto}>
              O sistema Lirium Esmalteria & Spa foi desenvolvido para gerir agendamentos, serviços, pacotes e comissões de forma integrada e segura através do painel administrativo.
            </Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="call-outline" size={24} color="#FF98B9" style={{ marginBottom: 10 }} />
            <Text style={styles.cardTitulo}>Suporte Técnico</Text>
            <Text style={styles.cardTexto}>
              Em caso de dúvidas com o acesso ou relatórios financeiros, entre em contacto com o suporte administrativo através do e-mail suporte@lirium.com.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  tituloTopo: { fontSize: 22, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
  scroll: { paddingBottom: 30 },
  card: { backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardTexto: { color: 'rgba(209, 209, 209, 0.8)', fontSize: 14, lineHeight: 20 }
});
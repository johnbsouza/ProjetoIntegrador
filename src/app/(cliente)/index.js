import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteIndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#434643" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CABEÇALHO */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Olá, Cliente</Text>
            <Text style={styles.subtitle}>Bem-vinda à Lirium Esmalteria & Spa</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF4C4C" />
          </TouchableOpacity>
        </View>

        {/* CARTÃO DE PRÓXIMO AGENDAMENTO */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Próximo Agendamento</Text>
          <Text style={styles.bannerService}>Spa dos Pés</Text>
          <Text style={styles.bannerInfo}>
            <Ionicons name="calendar-outline" size={14} /> Quinta-feira, 08/10 às 14:30
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        
        {/* BOTÃO DE AÇÃO RÁPIDA */}
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(cliente)/explorar')}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconBox}>
            <Ionicons name="sparkles" size={22} color="#FF98B9" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Agendar Novo Serviço</Text>
            <Text style={styles.actionSub}>Escolha entre manicures, spa e alongamentos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(209, 209, 209, 0.6)" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#434643' 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: 15,
    paddingBottom: 30,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', // Centraliza o bloco de texto
    alignItems: 'center', 
    marginBottom: 30,
    position: 'relative', // Permite o posicionamento absoluto do botão
    minHeight: 50, // Garante altura suficiente para o botão
  },
  headerTextContainer: {
    alignItems: 'center', // Centraliza o texto dentro do seu próprio bloco
  },
  greeting: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#FF98B9', 
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 13, 
    color: 'rgba(209, 209, 209, 0.8)', 
    marginTop: 4,
    textAlign: 'center',
  },
  logoutButton: { 
    position: 'absolute', // Fixa o botão à direita sem afetar o centro
    right: 0,
    width: 44, 
    height: 44, 
    borderRadius: 15, 
    backgroundColor: 'rgba(255, 76, 76, 0.15)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 76, 76, 0.3)' 
  },
  bannerCard: { 
    backgroundColor: '#434643', 
    borderRadius: 24, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#595959', 
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerTitle: { 
    fontSize: 12, 
    color: 'rgba(209, 209, 209, 0.8)', 
    marginBottom: 8, 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  bannerService: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 8 
  },
  bannerInfo: { 
    fontSize: 14, 
    color: '#FF98B9',
    fontWeight: '500'
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 16,
    letterSpacing: 0.5
  },
  actionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#434643', 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#595959',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: 'rgba(67, 70, 67, 0.8)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 110, 107, 0.5)',
  },
  actionInfo: { 
    flex: 1 
  },
  actionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 4 
  },
  actionSub: { 
    fontSize: 13, 
    color: 'rgba(209, 209, 209, 0.7)',
    lineHeight: 18
  },
});
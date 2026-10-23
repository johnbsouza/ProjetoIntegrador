import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const funcoes = [
  {
    icone: 'calendar-outline',
    titulo: 'Agenda',
    texto: 'Visualize e gerencie os agendamentos das profissionais, com data, horário e cliente.',
    rota: '/agenda',
  },
  {
    icone: 'people-outline',
    titulo: 'Clientes',
    texto: 'Consulte e cadastre as clientes do estúdio e acompanhe o histórico de cada uma.',
    rota: '/clientes',
  },
  {
    icone: 'ribbon-outline',
    titulo: 'Equipe e Profissionais',
    texto: 'Cadastre, edite e acompanhe as profissionais e suas comissões.',
    rota: '/lista-profissionais',
  },
  {
    icone: 'color-palette-outline',
    titulo: 'Catálogo de Serviços',
    texto: 'Cadastre e edite os serviços oferecidos, com preço e tempo de duração.',
    rota: '/servicos',
  },
  {
    icone: 'gift-outline',
    titulo: 'Pacotes',
    texto: 'Gerencie os pacotes de serviços, como o 4 Mãos e suas variações.',
    rota: '/pacotes',
  },
  {
    icone: 'cash-outline',
    titulo: 'Caixa',
    texto: 'Registre pagamentos e acompanhe a movimentação financeira do dia.',
    rota: '/caixa',
  },
  {
    icone: 'bar-chart-outline',
    titulo: 'Relatórios',
    texto: 'Veja relatórios financeiros e de desempenho para acompanhar os resultados.',
    rota: '/relatorios',
  },
  {
    icone: 'shield-checkmark-outline',
    titulo: 'Controle de Acessos',
    texto: 'Gerencie os usuários do sistema e defina o perfil de cada um (admin, cliente, profissional).',
    rota: '/gerenciar-usuarios',
  },
  {
    icone: 'help-circle-outline',
    titulo: 'Ajuda & Suporte',
    texto: 'Acesse este guia e o contacto com o suporte técnico.',
    rota: '/ajuda',
  },
];

export default function TelaGuia() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#1E201E', '#434643', '#1A1C1A']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF98B9" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Guia da Plataforma</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {funcoes.map((f) => (
            <View key={f.titulo} style={styles.card}>
              <View style={styles.cardTopo}>
                <Ionicons name={f.icone} size={22} color="#FF98B9" />
                <Text style={styles.cardTitulo}>{f.titulo}</Text>
              </View>
              <Text style={styles.cardTexto}>{f.texto}</Text>
              {f.rota && (
                <TouchableOpacity style={styles.botao} onPress={() => router.push(f.rota)}>
                  <Text style={styles.botaoTexto}>Abrir</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FF98B9" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(89, 89, 89, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(107, 110, 107, 0.5)' },
  titulo: { fontSize: 22, color: '#FF98B9', fontWeight: 'bold', marginLeft: 15 },
  card: { backgroundColor: 'rgba(67, 70, 67, 0.8)', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardTexto: { color: 'rgba(209, 209, 209, 0.8)', fontSize: 14, lineHeight: 20 },
  botao: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 12 },
  botaoTexto: { color: '#FF98B9', fontWeight: 'bold', fontSize: 14 },
});
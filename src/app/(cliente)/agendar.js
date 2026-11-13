import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

const HORARIOS_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function AgendarTela() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Recebe { servicoId, nomeServico, preco, idProfissional, nomeProfissional }

  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Busca os horários que já foram agendados para esta profissional nesta data
  useEffect(() => {
    buscarHorariosOcupados();
  }, [dataSelecionada, params.idProfissional]);

  async function buscarHorariosOcupados() {
    setCarregandoHorarios(true);
    try {
      const q = query(
        collection(db, 'agendamentos'),
        where('idProfissional', '==', params.idProfissional || 'prof_default'),
        where('data', '==', dataSelecionada),
        where('status', 'in', ['confirmado', 'concluido'])
      );

      const querySnapshot = await getDocs(q);
      const ocupados = [];
      querySnapshot.forEach((docSnap) => {
        ocupados.push(docSnap.data().horario);
      });

      setHorariosOcupados(ocupados);
    } catch (error) {
      console.error('Erro ao buscar horários ocupados:', error);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  async function handleConfirmarAgendamento() {
    if (!horarioSelecionado) {
      Alert.alert('Atenção', 'Selecione um horário disponível.');
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;

      await addDoc(collection(db, 'agendamentos'), {
        idCliente: user ? user.uid : 'anonimo',
        nomeCliente: user?.displayName || user?.email || 'Cliente',
        idProfissional: params.idProfissional || 'prof_default',
        nomeProfissional: params.nomeProfissional || 'Profissional',
        servicoId: params.servicoId || '',
        nomeServico: params.nomeServico || 'Serviço de Esmalteria',
        preco: parseFloat(params.preco) || 0,
        data: dataSelecionada,
        horario: horarioSelecionado,
        status: 'confirmado',
        criadoEm: serverTimestamp(),
      });

      Alert.alert('Sucesso!', 'Seu agendamento foi realizado.', [
        { text: 'OK', onPress: () => router.replace('/(cliente)/agenda') }
      ]);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível concluir o agendamento.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Resumo do Serviço */}
        <View style={styles.cardResumo}>
          <Text style={styles.labelHeader}>SERVIÇO SELECIONADO</Text>
          <Text style={styles.tituloServico}>{params.nomeServico || 'Manicure & Pedicure'}</Text>
          <Text style={styles.precoServico}>R$ {parseFloat(params.preco || 0).toFixed(2)}</Text>
        </View>

        {/* Seleção de Horários */}
        <Text style={styles.seccaoTitulo}>Horários Disponíveis ({dataSelecionada})</Text>

        {carregandoHorarios ? (
          <ActivityIndicator color="#FF98B9" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.gridHorarios}>
            {HORARIOS_DISPONIVEIS.map((horario) => {
              const estaOcupado = horariosOcupados.includes(horario);
              const estaSelecionado = horarioSelecionado === horario;

              return (
                <TouchableOpacity
                  key={horario}
                  disabled={estaOcupado}
                  style={[
                    styles.botaoHorario,
                    estaOcupado && styles.horarioOcupado,
                    estaSelecionado && styles.horarioSelecionado,
                  ]}
                  onPress={() => setHorarioSelecionado(horario)}
                >
                  <Text
                    style={[
                      styles.textoHorario,
                      estaOcupado && styles.textoOcupado,
                      estaSelecionado && styles.textoSelecionado,
                    ]}
                  >
                    {horario} {estaOcupado ? '(Ocupado)' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Botão de Confirmação */}
        <TouchableOpacity
          style={[styles.btnConfirmar, salvando && { opacity: 0.6 }]}
          onPress={handleConfirmarAgendamento}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#1E201E" />
          ) : (
            <Text style={styles.btnTexto}>Confirmar Agendamento</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  content: { padding: 20 },
  cardResumo: {
    backgroundColor: '#595959',
    padding: 20,
    borderRadius: 14,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#FF98B9',
  },
  labelHeader: { color: '#D1D1D1', fontSize: 12, fontWeight: 'bold' },
  tituloServico: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  precoServico: { color: '#FF98B9', fontSize: 18, fontWeight: 'bold', marginTop: 6 },
  seccaoTitulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  gridHorarios: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  botaoHorario: {
    width: '48%',
    backgroundColor: '#595959',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  horarioOcupado: { backgroundColor: '#333', opacity: 0.4, borderColor: 'transparent' },
  horarioSelecionado: { backgroundColor: '#FF98B9', borderColor: '#FF98B9' },
  textoHorario: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  textoOcupado: { color: '#888', textDecorationLine: 'line-through' },
  textoSelecionado: { color: '#1E201E', fontWeight: 'bold' },
  btnConfirmar: {
    backgroundColor: '#FF98B9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnTexto: { color: '#1E201E', fontWeight: 'bold', fontSize: 16 },
});
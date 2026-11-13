import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function BotaoAcessibilidade() {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados locais para simular as configurações (Numa app completa, usarias React Context para aplicar globalmente)
  const [altoContraste, setAltoContraste] = useState(false);
  const [textoGrande, setTextoGrande] = useState(false);
  const [alertasVisuais, setAlertasVisuais] = useState(true);

  const toggleModal = () => setModalVisible(!modalVisible);

  return (
    <>
      {/* 
        Botão Flutuante
        As props "accessible", "accessibilityRole", "accessibilityLabel" e "accessibilityHint" 
        são cruciais para que o TalkBack (Android) e VoiceOver (iOS) leiam o botão para pessoas cegas.
      */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleModal}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Menu de Acessibilidade"
        accessibilityHint="Toque duas vezes para abrir as opções de contraste, tamanho de texto e alertas visuais."
      >
        <Ionicons name="accessibility" size={28} color="#1E201E" />
      </TouchableOpacity>

      {/* Modal de Configurações */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, altoContraste && styles.modalContentContraste]}>
            
            <View style={styles.modalHeader}>
              <Text 
                style={[styles.modalTitle, altoContraste && styles.textContraste, textoGrande && styles.textoGrandeTitulo]}
                accessible={true}
                accessibilityRole="header"
              >
                Acessibilidade
              </Text>
              <TouchableOpacity
                onPress={toggleModal}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
              >
                <Ionicons name="close-circle" size={32} color={altoContraste ? "#FFF" : "#FF98B9"} />
              </TouchableOpacity>
            </View>

            {/* Opção: Baixa Visão - Alto Contraste */}
            <View style={styles.optionRow}>
              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, altoContraste && styles.textContraste, textoGrande && styles.textoGrande]}>Alto Contraste</Text>
                <Text style={[styles.optionDesc, altoContraste && styles.textContraste]}>Aumenta o contraste das cores para melhor leitura.</Text>
              </View>
              <Switch 
                value={altoContraste} 
                onValueChange={setAltoContraste} 
                trackColor={{ false: "#595959", true: "#FF98B9" }}
                accessibilityLabel="Ativar modo de alto contraste"
              />
            </View>

            {/* Opção: Baixa Visão - Texto Grande */}
            <View style={styles.optionRow}>
              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, altoContraste && styles.textContraste, textoGrande && styles.textoGrande]}>Texto Maior</Text>
                <Text style={[styles.optionDesc, altoContraste && styles.textContraste]}>Aumenta o tamanho das fontes no ecrã.</Text>
              </View>
              <Switch 
                value={textoGrande} 
                onValueChange={setTextoGrande}
                trackColor={{ false: "#595959", true: "#FF98B9" }}
                accessibilityLabel="Ativar fontes maiores"
              />
            </View>

            {/* Opção: Deficiência Auditiva - Alertas Visuais/Vibração */}
            <View style={styles.optionRow}>
              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, altoContraste && styles.textContraste, textoGrande && styles.textoGrande]}>Alertas Visuais e Vibração</Text>
                <Text style={[styles.optionDesc, altoContraste && styles.textContraste]}>Substitui sons de notificação por vibração e alertas no ecrã.</Text>
              </View>
              <Switch 
                value={alertasVisuais} 
                onValueChange={setAlertasVisuais}
                trackColor={{ false: "#595959", true: "#FF98B9" }}
                accessibilityLabel="Ativar alertas visuais em vez de sonoros"
              />
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FF98B9',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999, // Garante que fica por cima de tudo
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E201E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: '#434643',
  },
  modalContentContraste: {
    backgroundColor: '#000', // Fundo preto absoluto para alto contraste
    borderColor: '#FFF',
    borderWidth: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF98B9',
  },
  textContraste: {
    color: '#FFF', // Texto branco absoluto para alto contraste
  },
  textoGrandeTitulo: {
    fontSize: 28,
  },
  textoGrande: {
    fontSize: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(89, 89, 89, 0.3)',
    padding: 15,
    borderRadius: 15,
  },
  textContainer: {
    flex: 1,
    paddingRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  optionDesc: {
    fontSize: 13,
    color: '#D1D1D1',
  }
});
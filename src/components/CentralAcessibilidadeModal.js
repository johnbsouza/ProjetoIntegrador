import { Ionicons } from '@expo/vector-icons';
import {
    AccessibilityInfo,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAcessibilidade } from '../context/AcessibilidadeContext';

const OPCOES_FONTE = [
  { label: 'Padrão (100%)', valor: 1 },
  { label: 'Ampliada (115%)', valor: 1.15 },
  { label: 'Máxima (130%)', valor: 1.3 },
];

export default function CentralAcessibilidadeModal({ visible, onClose }) {
  const { config, tema, atualizarConfig, restaurarPadrao } = useAcessibilidade();

  function anunciarMudanca(mensagem) {
    if (config.leitorTelaAtivo) {
      AccessibilityInfo.announceForAccessibility(mensagem);
    }
  }

  function toggleOpcao(chave, rotulo) {
    const proximoValor = !config[chave];
    atualizarConfig({ [chave]: proximoValor });
    anunciarMudanca(`${rotulo} ${proximoValor ? 'ativado' : 'desativado'}`);
  }

  function selecionarFonte(valor, rotulo) {
    atualizarConfig({ escalaFonte: valor });
    anunciarMudanca(`Tamanho do texto alterado para ${rotulo}`);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: tema.bgSurface,
              borderColor: tema.borderSoft,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: tema.borderSubtle }]}>
            <View style={styles.headerTituloBox}>
              <Ionicons name="accessibility" size={24} color={tema.accent} />
              <Text
                style={[
                  styles.titulo,
                  { color: tema.textPrimary, fontSize: tema.fontSize(18) },
                ]}
              >
                Acessibilidade
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.fecharBtn,
                {
                  backgroundColor: tema.bgElevated,
                  minHeight: tema.minTouchHeight,
                  minWidth: tema.minTouchHeight,
                },
              ]}
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Fechar central de acessibilidade"
            >
              <Ionicons name="close" size={22} color={tema.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Baixa visão: Tamanho do texto */}
            <Text
              style={[
                styles.secaoLabel,
                { color: tema.accent, fontSize: tema.fontSize(13) },
              ]}
            >
              Baixa Visão — Tamanho da Fonte
            </Text>

            <View style={styles.fonteRow}>
              {OPCOES_FONTE.map((op) => {
                const selecionada = config.escalaFonte === op.valor;
                return (
                  <TouchableOpacity
                    key={op.valor}
                    style={[
                      styles.fonteChip,
                      {
                        minHeight: tema.minTouchHeight,
                        backgroundColor: selecionada ? tema.accent : tema.bgElevated,
                        borderColor: selecionada ? tema.accent : tema.borderSoft,
                      },
                    ]}
                    onPress={() => selecionarFonte(op.valor, op.label)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selecionada }}
                    accessibilityLabel={op.label}
                  >
                    <Text
                      style={[
                        styles.fonteTexto,
                        {
                          color: selecionada ? tema.textOnAccent : tema.textPrimary,
                          fontSize: tema.fontSize(12),
                        },
                      ]}
                    >
                      {op.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Alto contraste / Daltonismo */}
            <View
              style={[
                styles.opcaoCard,
                {
                  backgroundColor: tema.bgElevated,
                  borderColor: tema.borderSoft,
                  paddingVertical: 14 + tema.espacoExtra,
                },
              ]}
            >
              <View style={styles.opcaoTextoBox}>
                <Text
                  style={[
                    styles.opcaoTitulo,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Alto Contraste e Bordas Nítidas
                </Text>
                <Text
                  style={[
                    styles.opcaoDesc,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Aumenta contraste e realça contornos para baixa visão e daltonismo.
                </Text>
              </View>
              <Switch
                value={config.altoContraste}
                onValueChange={() =>
                  toggleOpcao('altoContraste', 'Alto contraste e bordas nítidas')
                }
                trackColor={{ false: tema.bgDark, true: tema.accent }}
                thumbColor={config.altoContraste ? tema.textOnAccent : tema.textPrimary}
                accessibilityLabel="Ativar alto contraste e bordas nítidas"
              />
            </View>

            {/* Deficiência motora */}
            <View
              style={[
                styles.opcaoCard,
                {
                  backgroundColor: tema.bgElevated,
                  borderColor: tema.borderSoft,
                  paddingVertical: 14 + tema.espacoExtra,
                },
              ]}
            >
              <View style={styles.opcaoTextoBox}>
                <Text
                  style={[
                    styles.opcaoTitulo,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Toque Facilitado (Motor)
                </Text>
                <Text
                  style={[
                    styles.opcaoDesc,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Amplia áreas de toque e espaçamento entre botões e cartões.
                </Text>
              </View>
              <Switch
                value={config.toqueFacilitado}
                onValueChange={() =>
                  toggleOpcao('toqueFacilitado', 'Toque facilitado')
                }
                trackColor={{ false: tema.bgDark, true: tema.accent }}
                thumbColor={config.toqueFacilitado ? tema.textOnAccent : tema.textPrimary}
                accessibilityLabel="Ativar toque facilitado para coordenação motora"
              />
            </View>

            {/* Sobrecarga cognitiva / sensorial */}
            <View
              style={[
                styles.opcaoCard,
                {
                  backgroundColor: tema.bgElevated,
                  borderColor: tema.borderSoft,
                  paddingVertical: 14 + tema.espacoExtra,
                },
              ]}
            >
              <View style={styles.opcaoTextoBox}>
                <Text
                  style={[
                    styles.opcaoTitulo,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Modo Calmo (Cognitivo / Sensorial)
                </Text>
                <Text
                  style={[
                    styles.opcaoDesc,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Simplifica informações secundárias para reduzir sobrecarga visual.
                </Text>
              </View>
              <Switch
                value={config.modoCalmo}
                onValueChange={() => toggleOpcao('modoCalmo', 'Modo calmo')}
                trackColor={{ false: tema.bgDark, true: tema.accent }}
                thumbColor={config.modoCalmo ? tema.textOnAccent : tema.textPrimary}
                accessibilityLabel="Ativar modo calmo para sobrecarga cognitiva"
              />
            </View>

            {/* Leitor de tela */}
            <View
              style={[
                styles.opcaoCard,
                {
                  backgroundColor: tema.bgElevated,
                  borderColor: tema.borderSoft,
                  paddingVertical: 14 + tema.espacoExtra,
                },
              ]}
            >
              <View style={styles.opcaoTextoBox}>
                <Text
                  style={[
                    styles.opcaoTitulo,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                >
                  Avisos para Leitor de Tela
                </Text>
                <Text
                  style={[
                    styles.opcaoDesc,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Envia anúncios de voz ao TalkBack / VoiceOver ao alterar modos.
                </Text>
              </View>
              <Switch
                value={config.leitorTelaAtivo}
                onValueChange={() =>
                  toggleOpcao('leitorTelaAtivo', 'Avisos para leitor de tela')
                }
                trackColor={{ false: tema.bgDark, true: tema.accent }}
                thumbColor={config.leitorTelaAtivo ? tema.textOnAccent : tema.textPrimary}
                accessibilityLabel="Ativar avisos para leitor de tela"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.resetBtn,
                {
                  borderColor: tema.borderSubtle,
                  minHeight: tema.minTouchHeight,
                },
              ]}
              onPress={() => {
                restaurarPadrao();
                anunciarMudanca('Configurações de acessibilidade restauradas para o padrão');
              }}
              accessibilityRole="button"
              accessibilityLabel="Restaurar configurações padrão de acessibilidade"
            >
              <Ionicons name="refresh-outline" size={18} color={tema.textSecondary} />
              <Text
                style={[
                  styles.resetTexto,
                  { color: tema.textSecondary, fontSize: tema.fontSize(13) },
                ]}
              >
                Restaurar Padrão
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTituloBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titulo: {
    fontWeight: 'bold',
  },
  fecharBtn: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    paddingBottom: 34,
    gap: 12,
  },
  secaoLabel: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  fonteRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  fonteChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fonteTexto: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  opcaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  opcaoTextoBox: {
    flex: 1,
    gap: 3,
  },
  opcaoTitulo: {
    fontWeight: 'bold',
  },
  opcaoDesc: {
    lineHeight: 17,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
  },
  resetTexto: {
    fontWeight: 'bold',
  },
});
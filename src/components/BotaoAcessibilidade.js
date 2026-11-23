import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAcessibilidade } from '../context/AcessibilidadeContext';
import CentralAcessibilidadeModal from './CentralAcessibilidadeModal';

export default function BotaoAcessibilidade({ style }) {
  const { tema, config } = useAcessibilidade();
  const [modalVisivel, setModalVisivel] = useState(false);

  const tamanhoBotao = config.toqueFacilitado ? 58 : 50;

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisivel(true)}
        activeOpacity={0.85}
        hitSlop={tema.hitSlopPadrao}
        accessibilityRole="button"
        accessibilityLabel="Acessibilidade"
        accessibilityHint="Abre as opções de tamanho de fonte, contraste, toque facilitado e modo calmo"
        style={[
          styles.botao,
          {
            width: tamanhoBotao,
            height: tamanhoBotao,
            borderRadius: tamanhoBotao / 2,
            backgroundColor: tema.accent,
            borderColor: tema.borderSubtle,
          },
          style,
        ]}
      >
        <Ionicons
          name="accessibility"
          size={config.toqueFacilitado ? 28 : 24}
          color={tema.textOnAccent}
        />
      </TouchableOpacity>

      <CentralAcessibilidadeModal
        visible={modalVisivel}
        onClose={() => setModalVisivel(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  botao: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    zIndex: 50,
    elevation: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
});
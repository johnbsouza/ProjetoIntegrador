import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = '@lirium_acessibilidade_v1';

const CONFIG_PADRAO = {
  escalaFonte: 1, // 1 | 1.15 | 1.3
  altoContraste: false, // reforça contrastes e bordas para baixa visão / daltonismo
  toqueFacilitado: false, // amplia áreas de toque e espaçamento motor
  modoCalmo: false, // reduz elementos decorativos/secundários para sobrecarga cognitiva
  leitorTelaAtivo: false, // anuncia mudanças importantes via AccessibilityInfo
};

const PALETA_BASE = {
  bgPrimary: '#434643',
  bgSurface: '#595959',
  bgElevated: '#383B38',
  bgDark: '#2B2D2B',
  borderSubtle: '#6B6E6B',
  borderSoft: 'rgba(255,255,255,0.12)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.16)',
  accentBorder: 'rgba(255, 152, 185, 0.45)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D8DCD8',
  textMuted: '#B0B5B0',
  textOnAccent: '#1E201E',
  success: '#A5D6A7',
  danger: '#FF8A80',
  info: '#90CAF9',
  warning: '#FFE082',
};

const PALETA_ALTO_CONTRASTE = {
  bgPrimary: '#141614',
  bgSurface: '#222522',
  bgElevated: '#2D312D',
  bgDark: '#0D0E0D',
  borderSubtle: '#FFFFFF',
  borderSoft: '#FF98B9',
  accent: '#FFB3CC',
  accentSoft: 'rgba(255, 179, 204, 0.24)',
  accentBorder: '#FFB3CC',
  textPrimary: '#FFFFFF',
  textSecondary: '#FFFFFF',
  textMuted: '#E0E4E0',
  textOnAccent: '#000000',
  success: '#B9F6CA',
  danger: '#FF8A80',
  info: '#82B1FF',
  warning: '#FFFF8D',
};

const AcessibilidadeContext = createContext(null);

export function AcessibilidadeProvider({ children }) {
  const [config, setConfig] = useState(CONFIG_PADRAO);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregarPreferencias() {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (ativo && salvo) {
          const parsed = JSON.parse(salvo);
          setConfig((prev) => ({
            ...prev,
            ...parsed,
            escalaFonte: [1, 1.15, 1.3].includes(Number(parsed.escalaFonte))
              ? Number(parsed.escalaFonte)
              : 1,
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar preferências de acessibilidade:', error);
      } finally {
        if (ativo) setCarregado(true);
      }
    }
    carregarPreferencias();
    return () => {
      ativo = false;
    };
  }, []);

  const persistirConfig = useCallback(async (novoEstado) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novoEstado));
    } catch (error) {
      console.error('Erro ao salvar preferências de acessibilidade:', error);
    }
  }, []);

  const atualizarConfig = useCallback(
    (parcial) => {
      setConfig((prev) => {
        const atualizado = { ...prev, ...parcial };
        persistirConfig(atualizado);
        return atualizado;
      });
    },
    [persistirConfig]
  );

  const restaurarPadrao = useCallback(() => {
    setConfig(CONFIG_PADRAO);
    persistirConfig(CONFIG_PADRAO);
  }, [persistirConfig]);

  const tema = useMemo(() => {
    const base = config.altoContraste ? PALETA_ALTO_CONTRASTE : PALETA_BASE;
    const minTouchHeight = config.toqueFacilitado ? 52 : 44;
    const espacoExtra = config.toqueFacilitado ? 6 : 0;

    return {
      ...base,
      escalaFonte: config.escalaFonte,
      minTouchHeight,
      espacoExtra,
      hitSlopPadrao: config.toqueFacilitado
        ? { top: 12, bottom: 12, left: 12, right: 12 }
        : { top: 8, bottom: 8, left: 8, right: 8 },
      fontSize: (tamanhoBase) => Math.round(tamanhoBase * config.escalaFonte),
    };
  }, [config.altoContraste, config.escalaFonte, config.toqueFacilitado]);

  const value = useMemo(
    () => ({
      config,
      tema,
      carregado,
      atualizarConfig,
      restaurarPadrao,
    }),
    [config, tema, carregado, atualizarConfig, restaurarPadrao]
  );

  return (
    <AcessibilidadeContext.Provider value={value}>
      {children}
    </AcessibilidadeContext.Provider>
  );
}

export function useAcessibilidade() {
  const ctx = useContext(AcessibilidadeContext);
  if (!ctx) {
    throw new Error('useAcessibilidade deve ser usado dentro de AcessibilidadeProvider');
  }
  return ctx;
}
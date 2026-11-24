import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { useAcessibilidade } from '../../context/AcessibilidadeContext';

const MAX_BASE64_CHARS = 750000;

function formatarTelefoneInput(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function montarDataUriBase64(base64Str) {
  if (!base64Str) return '';
  if (base64Str.startsWith('data:image/')) return base64Str;
  return `data:image/jpeg;base64,${base64Str}`;
}

export default function EditarPerfilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tema, config } = useAcessibilidade();
  const usuarioAtual = auth.currentUser;

  const [nome, setNome] = useState(typeof params.nome === 'string' ? params.nome : '');
  const [telefone, setTelefone] = useState(
    typeof params.telefone === 'string' ? formatarTelefoneInput(params.telefone) : ''
  );
  const [email, setEmail] = useState(
    typeof params.email === 'string' ? params.email : usuarioAtual?.email || ''
  );
  const [fotoPerfil, setFotoPerfil] = useState(
    typeof params.fotoPerfil === 'string' ? params.fotoPerfil : usuarioAtual?.photoURL || ''
  );

  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarDadosAtuais() {
      if (!usuarioAtual?.uid) {
        setCarregandoInicial(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'usuarios', usuarioAtual.uid));
        if (ativo && snap.exists()) {
          const dados = snap.data();
          setNome((prev) => dados.nome ?? prev);
          setTelefone((prev) =>
            dados.telefone !== undefined
              ? formatarTelefoneInput(String(dados.telefone))
              : prev
          );
          setEmail((prev) => dados.email ?? prev ?? usuarioAtual.email ?? '');
          setFotoPerfil((prev) => dados.fotoPerfil ?? prev ?? '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
      } finally {
        if (ativo) setCarregandoInicial(false);
      }
    }

    carregarDadosAtuais();
    return () => {
      ativo = false;
    };
  }, [usuarioAtual?.uid, usuarioAtual?.email]);

  async function escolherFotoGaleria() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à galeria para escolher sua foto de perfil.'
        );
        return;
      }

      const mediaTypeImages = ImagePicker.MediaType?.Images ?? 'images';

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [mediaTypeImages],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.25,
        base64: true,
      });

      const asset = !resultado.canceled ? resultado.assets?.[0] : null;
      if (!asset) return;

      if (asset.base64) {
        const dataUri = montarDataUriBase64(asset.base64);
        if (dataUri.length > MAX_BASE64_CHARS) {
          Alert.alert(
            'Imagem muito grande',
            'Escolha uma foto menor ou recorte uma área mais fechada para caber no perfil.'
          );
          return;
        }
        setFotoPerfil(dataUri);
      } else if (asset.uri) {
        setFotoPerfil(asset.uri);
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  async function handleSalvarAlteracoes() {
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo) {
      Alert.alert('Atenção', 'Por favor, informe o seu nome.');
      return;
    }

    if (!emailLimpo || !validarEmail(emailLimpo)) {
      Alert.alert('Atenção', 'Por favor, informe um e-mail válido.');
      return;
    }

    const digitosTelefone = telefoneLimpo.replace(/\D/g, '');
    if (telefoneLimpo && digitosTelefone.length < 10) {
      Alert.alert('Atenção', 'Informe um telefone válido com DDD.');
      return;
    }

    if (!usuarioAtual?.uid) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (fotoPerfil.startsWith('data:image/') && fotoPerfil.length > MAX_BASE64_CHARS) {
      Alert.alert(
        'Imagem muito grande',
        'A imagem selecionada excede o limite de tamanho para salvar no perfil.'
      );
      return;
    }

    setSalvando(true);
    try {
      const userRef = doc(db, 'usuarios', usuarioAtual.uid);

      await updateDoc(userRef, {
        nome: nomeLimpo,
        telefone: telefoneLimpo,
        email: emailLimpo,
        fotoPerfil: fotoPerfil || '',
        atualizadoEm: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível salvar as alterações do perfil.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.bgPrimary }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: tema.bgSurface,
            borderBottomColor: tema.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={tema.textPrimary} />
        </TouchableOpacity>
        <Text
          accessibilityRole="header"
          style={[
            styles.topTitle,
            { color: tema.textPrimary, fontSize: tema.fontSize(18) },
          ]}
        >
          Editar Perfil
        </Text>
        <View style={{ width: Math.max(24, tema.minTouchHeight) }} />
      </View>

      {carregandoInicial ? (
        <View style={styles.centro}>
          <ActivityIndicator
            size="large"
            color={tema.accent}
            accessibilityLabel="Carregando dados do perfil"
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: 88 + tema.espacoExtra },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.avatarSection, { marginBottom: 20 + tema.espacoExtra }]}>
              <TouchableOpacity
                hitSlop={tema.hitSlopPadrao}
                accessibilityRole="button"
                accessibilityLabel="Alterar foto de perfil"
                style={styles.avatarWrapper}
                onPress={escolherFotoGaleria}
                activeOpacity={0.85}
              >
                {fotoPerfil ? (
                  <Image
                    source={{ uri: fotoPerfil }}
                    style={[styles.avatarImagem, { borderColor: tema.accent }]}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      {
                        backgroundColor: tema.bgSurface,
                        borderColor: tema.accent,
                      },
                    ]}
                  >
                    <Ionicons name="person" size={42} color={tema.accent} accessible={false} />
                  </View>
                )}
                <View
                  style={[
                    styles.cameraBadge,
                    {
                      backgroundColor: tema.accent,
                      borderColor: tema.bgPrimary,
                    },
                  ]}
                >
                  <Ionicons name="camera" size={16} color={tema.textOnAccent} accessible={false} />
                </View>
              </TouchableOpacity>
              {!config.modoCalmo && (
                <Text
                  style={[
                    styles.avatarDica,
                    { color: tema.textSecondary, fontSize: tema.fontSize(12) },
                  ]}
                >
                  Toque para alterar a foto
                </Text>
              )}
            </View>

            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: tema.bgSurface,
                  borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                  marginBottom: 22 + tema.espacoExtra,
                },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: tema.accent, fontSize: tema.fontSize(13) },
                ]}
              >
                Nome
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: tema.bgElevated,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                    marginBottom: 14 + tema.espacoExtra,
                  },
                ]}
              >
                <Ionicons name="person-outline" size={18} color={tema.accent} accessible={false} />
                <TextInput
                  accessibilityLabel="Nome completo"
                  style={[
                    styles.input,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor={tema.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <Text
                style={[
                  styles.label,
                  { color: tema.accent, fontSize: tema.fontSize(13) },
                ]}
              >
                Telefone
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: tema.bgElevated,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                    marginBottom: 14 + tema.espacoExtra,
                  },
                ]}
              >
                <Ionicons name="call-outline" size={18} color={tema.accent} accessible={false} />
                <TextInput
                  accessibilityLabel="Telefone com DDD"
                  style={[
                    styles.input,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                  value={telefone}
                  onChangeText={(texto) => setTelefone(formatarTelefoneInput(texto))}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={tema.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <Text
                style={[
                  styles.label,
                  { color: tema.accent, fontSize: tema.fontSize(13) },
                ]}
              >
                E-mail
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: tema.bgElevated,
                    borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                    minHeight: tema.minTouchHeight,
                    marginBottom: 14 + tema.espacoExtra,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={tema.accent} accessible={false} />
                <TextInput
                  accessibilityLabel="E-mail"
                  style={[
                    styles.input,
                    { color: tema.textPrimary, fontSize: tema.fontSize(15) },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={tema.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel={salvando ? 'Salvando alterações' : 'Salvar Alterações'}
              accessibilityState={{ disabled: salvando, busy: salvando }}
              style={[
                styles.botaoSalvar,
                {
                  backgroundColor: tema.accent,
                  minHeight: tema.minTouchHeight,
                  justifyContent: 'center',
                },
                salvando && styles.botaoDesabilitado,
              ]}
              onPress={handleSalvarAlteracoes}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color={tema.textOnAccent} />
              ) : (
                <Text
                  style={[
                    styles.textoBotaoSalvar,
                    { color: tema.textOnAccent, fontSize: tema.fontSize(16) },
                  ]}
                >
                  Salvar Alterações
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topTitle: {
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImagem: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarDica: {
    marginTop: 8,
  },
  formCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  botaoSalvar: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotaoSalvar: {
    fontWeight: 'bold',
  },
});
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

const COLORS = {
  bgPrimary: '#434643',
  bgSurface: '#595959',
  bgElevated: '#383B38',
  bgDark: '#2B2D2B',
  borderSubtle: 'rgba(255,255,255,0.12)',
  accent: '#FF98B9',
  accentSoft: 'rgba(255, 152, 185, 0.14)',
  accentBorder: 'rgba(255, 152, 185, 0.45)',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D1D1',
  textMuted: '#A0A3A0',
  textOnAccent: '#1E201E',
};

const MAX_BASE64_CHARS = 750000; // Margem segura abaixo do limite de 1 MB do documento Firestore

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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      {carregandoInicial ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={escolherFotoGaleria}
                activeOpacity={0.85}
              >
                {fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.avatarImagem} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={42} color={COLORS.accent} />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color={COLORS.textOnAccent} />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarDica}>Toque para alterar a foto</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color={COLORS.accent} />
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={18} color={COLORS.accent} />
                <TextInput
                  style={styles.input}
                  value={telefone}
                  onChangeText={(texto) => setTelefone(formatarTelefoneInput(texto))}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color={COLORS.accent} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
              onPress={handleSalvarAlteracoes}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color={COLORS.textOnAccent} />
              ) : (
                <Text style={styles.textoBotaoSalvar}>Salvar Alterações</Text>
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
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#6B6E6B',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
    paddingBottom: 36,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImagem: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 2,
    borderColor: COLORS.accent,
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
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgPrimary,
  },
  avatarDica: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 22,
  },
  label: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 12,
  },
  botaoSalvar: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotaoSalvar: {
    color: COLORS.textOnAccent,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
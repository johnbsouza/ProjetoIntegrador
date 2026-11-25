import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function EditarPerfilAdminScreen() {
  const router = useRouter();
  const { tema, config } = useAcessibilidade();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [fotoBase64, setFotoBase64] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email || '');
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNome(data.nome || '');
          setTelefone(data.telefone || '');
          setFotoBase64(data.fotoPerfil || null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  }

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para definir a foto de perfil.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!resultado.canceled && resultado.assets[0].base64) {
      const imagemUri = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      setFotoBase64(imagemUri);
    }
  }

  async function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O campo Nome Completo não pode estar em branco.');
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          nome: nome.trim(),
          telefone: telefone.trim(),
          fotoPerfil: fotoBase64 || '',
        });

        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível guardar as alterações. A imagem pode ser muito pesada.');
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
          onPress={() => router.navigate('/(admin)/perfil')}
          hitSlop={tema.hitSlopPadrao}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          style={[
            styles.backButton,
            {
              minWidth: tema.minTouchHeight,
              minHeight: tema.minTouchHeight,
              backgroundColor: tema.bgSurface,
              borderColor: config.altoContraste
              ? tema.accentBorder
              : tema.borderSubtle,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={tema.accent} />
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
        <View style={{ width: tema.minTouchHeight }} />
      </View>

      {carregando ? (
        <ActivityIndicator
          color={tema.accent}
          accessibilityLabel="Carregando dados do perfil"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 88 + tema.espacoExtra },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={escolherFoto}
              hitSlop={tema.hitSlopPadrao}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto de perfil"
              style={styles.avatarWrapper}
            >
              {fotoBase64 ? (
                <Image
                  source={{ uri: fotoBase64 }}
                  accessibilityLabel="Foto de perfil atual"
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: tema.accent },
                  ]}
                >
                  <Ionicons name="camera" size={28} color={tema.textOnAccent} accessible={false} />
                </View>
              )}
              <View
                style={[
                  styles.cameraIconBadge,
                  {
                    backgroundColor: tema.bgDark,
                    borderColor: tema.bgSurface,
                  },
                ]}
              >
                <Ionicons name="pencil" size={14} color={tema.textPrimary} accessible={false} />
              </View>
            </TouchableOpacity>
            <Text
              style={[
                styles.mudarFotoText,
                { color: tema.accent, fontSize: tema.fontSize(13) },
              ]}
            >
              Alterar foto de perfil
            </Text>
          </View>

          <Text
            style={[
              styles.label,
              {
                color: tema.textPrimary,
                fontSize: tema.fontSize(14),
                marginTop: 15 + tema.espacoExtra,
              },
            ]}
          >
            Nome Completo
          </Text>
          <TextInput
            accessibilityLabel="Nome Completo"
            style={[
              styles.input,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                fontSize: tema.fontSize(16),
                color: tema.textPrimary,
                minHeight: tema.minTouchHeight,
              },
            ]}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome completo"
            placeholderTextColor={tema.textMuted}
          />

          <Text
            style={[
              styles.label,
              {
                color: tema.textPrimary,
                fontSize: tema.fontSize(14),
                marginTop: 15 + tema.espacoExtra,
              },
            ]}
          >
            E-mail (Leitura)
          </Text>
          <TextInput
            accessibilityLabel="E-mail somente leitura"
            accessibilityState={{ disabled: true }}
            style={[
              styles.input,
              {
                backgroundColor: tema.bgSurface,
                borderColor: tema.borderSubtle,
                fontSize: tema.fontSize(16),
                color: tema.textSecondary,
                minHeight: tema.minTouchHeight,
                opacity: 0.7,
              },
            ]}
            value={email}
            editable={false}
            keyboardType="email-address"
            placeholderTextColor={tema.textMuted}
          />

          <Text
            style={[
              styles.label,
              {
                color: tema.textPrimary,
                fontSize: tema.fontSize(14),
                marginTop: 15 + tema.espacoExtra,
              },
            ]}
          >
            Telefone
          </Text>
          <TextInput
            accessibilityLabel="Telefone"
            style={[
              styles.input,
              {
                backgroundColor: tema.bgSurface,
                borderColor: config.altoContraste ? tema.accentBorder : tema.borderSubtle,
                fontSize: tema.fontSize(16),
                color: tema.textPrimary,
                minHeight: tema.minTouchHeight,
              },
            ]}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="(11) 99999-9999"
            placeholderTextColor={tema.textMuted}
          />

          <TouchableOpacity
            hitSlop={tema.hitSlopPadrao}
            accessibilityRole="button"
            accessibilityLabel={salvando ? 'A guardar alterações' : 'Guardar alterações'}
            accessibilityState={{ disabled: salvando, busy: salvando }}
            style={[
              styles.saveButton,
              {
                backgroundColor: tema.accent,
                minHeight: tema.minTouchHeight,
                justifyContent: 'center',
              },
              salvando && { opacity: 0.6 },
            ]}
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color={tema.textOnAccent} />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  { color: tema.textOnAccent, fontSize: tema.fontSize(16) },
                ]}
              >
                Guardar Alterações
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  topTitle: { fontWeight: 'bold' },
  backButton: {
    padding: 4,
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative', width: 90, height: 90, borderRadius: 45 },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  mudarFotoText: { fontWeight: 'bold', marginTop: 8 },
  label: { fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 35,
  },
  saveButtonText: { fontWeight: 'bold' },
});
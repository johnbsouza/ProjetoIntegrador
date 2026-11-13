import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function EditarPerfilAdminScreen() {
  const router = useRouter();
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
  mediaTypes: ['images'], // <--- Utilizar array de strings
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
          { text: 'OK', onPress: () => router.back() }
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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      {carregando ? (
        <ActivityIndicator color="#FF98B9" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={escolherFoto} style={styles.avatarWrapper}>
              {fotoBase64 ? (
                <Image source={{ uri: fotoBase64 }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="camera" size={28} color="#434643" />
                </View>
              )}
              <View style={styles.cameraIconBadge}>
                <Ionicons name="pencil" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.mudarFotoText}>Alterar foto de perfil</Text>
          </View>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput 
            style={styles.input} 
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#A0A3A0"
          />

          <Text style={styles.label}>E-mail (Leitura)</Text>
          <TextInput 
            style={[styles.input, { opacity: 0.6 }]} 
            value={email}
            editable={false}
            keyboardType="email-address"
            placeholderTextColor="#A0A3A0"
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput 
            style={styles.input} 
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="(11) 99999-9999"
            placeholderTextColor="#A0A3A0"
          />

          <TouchableOpacity 
            style={[styles.saveButton, salvando && { opacity: 0.6 }]} 
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#434643" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#434643' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#595959', borderBottomWidth: 1, borderBottomColor: '#6B6E6B' },
  topTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  backButton: { padding: 4 },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative', width: 90, height: 90, borderRadius: 45 },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FF98B9', justifyContent: 'center', alignItems: 'center' },
  cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1E201E', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#595959' },
  mudarFotoText: { color: '#FF98B9', fontSize: 13, fontWeight: 'bold', marginTop: 8 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#595959', borderWidth: 1, borderColor: '#6B6E6B', borderRadius: 12, padding: 15, fontSize: 16, color: '#FFFFFF' },
  saveButton: { backgroundColor: '#FF98B9', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 35 },
  saveButtonText: { color: '#434643', fontSize: 16, fontWeight: 'bold' },
});
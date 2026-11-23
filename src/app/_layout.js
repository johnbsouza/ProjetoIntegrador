import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth, db } from '../config/firebase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [carregando, setCarregando] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [grupoAcesso, setGrupoAcesso] = useState(null);

  // Verifica a autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

          let nivelAcesso = 'cliente';

          if (userDoc.exists()) {
            nivelAcesso = userDoc.data().nivelAcesso || 'cliente';
          }

          let grupo = '(cliente)';

          if (nivelAcesso === 'admin') {
            grupo = '(admin)';
          } else if (nivelAcesso === 'profissional') {
            grupo = '(profissional)';
          }

          setGrupoAcesso(grupo);
          setUsuarioLogado(true);

        } catch (error) {
          console.error('Erro ao verificar usuário:', error);
          setGrupoAcesso('(cliente)');
          setUsuarioLogado(true);
        }

      } else {
        setUsuarioLogado(false);
        setGrupoAcesso(null);
      }

      setCarregando(false);
    });

    return unsubscribe;
  }, []);

  // Controla o redirecionamento
  useEffect(() => {
    if (carregando) return;

    const rotaAtual = segments[0];

    if (!usuarioLogado) {
       if (rotaAtual !== 'index') {
        router.replace('/');
      }
      return;
    }

    if (grupoAcesso && rotaAtual !== grupoAcesso) {
      router.replace('/' + grupoAcesso);
    }

  }, [carregando, usuarioLogado, grupoAcesso, segments]);

  // Tela de carregamento
  if (carregando) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E201E'
      }}>
        <ActivityIndicator size="large" color="#FF98B9" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" />
    </Stack>
  );
}
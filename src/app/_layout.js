import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { AcessibilidadeProvider, useAcessibilidade, } from '../context/AcessibilidadeContext';

function ConteudoRaizApp() {
  const router = useRouter();
  const segments = useSegments();
  const { tema } = useAcessibilidade();

  const [carregando, setCarregando] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [grupoAcesso, setGrupoAcesso] = useState(null);

  // Verifica a autenticação do usuário e seu nível de acesso no Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

          let nivelAcesso = 'cliente';
          if (userDoc.exists()) {
            nivelAcesso = String(userDoc.data()?.nivelAcesso || 'cliente')
              .trim()
              .toLowerCase();
          }

          let grupo = '(cliente)';
          if (nivelAcesso === 'admin' || nivelAcesso === 'administrador') {
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

  // Controla o redirecionamento conforme estado de autenticação e grupo de acesso
  useEffect(() => {
    if (carregando) return;

    const rotaAtual = segments[0];

    if (!usuarioLogado) {
      if (
        rotaAtual !== undefined &&
        rotaAtual !== 'index' &&
        rotaAtual !== 'cadastro' &&
        rotaAtual !== 'esqueci-senha'
      ) {
        router.replace('/');
      }
      return;
    }

    if (grupoAcesso && rotaAtual !== grupoAcesso) {
      router.replace('/' + grupoAcesso);
    }
  }, [carregando, usuarioLogado, grupoAcesso, segments, router]);

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: tema?.bgDark || '#1E201E',
        }}
      >
        <ActivityIndicator size="large" color={tema?.accent || '#FF98B9'} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="esqueci-senha" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(cliente)" />
      <Stack.Screen name="(profissional)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AcessibilidadeProvider>
      <ConteudoRaizApp />
    </AcessibilidadeProvider>
  );
}
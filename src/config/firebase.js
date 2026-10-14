import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Importações corretas para Autenticação no React Native:
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC_5QFMiGeN_9UHV3dJUfC3FbEYNwSKM5M",
  authDomain: "lirium-esmalteria.firebaseapp.com",
  projectId: "lirium-esmalteria",
  storageBucket: "lirium-esmalteria.firebasestorage.app",
  messagingSenderId: "325700777806",
  appId: "1:325700777806:web:1ffd747514afbba508d01f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Inicializamos a Autenticação usando o AsyncStorage para manter o utilizador logado
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
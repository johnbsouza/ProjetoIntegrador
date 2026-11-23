import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC_5QFMiGeN_9UHV3dJUfC3FbEYNwSKM5M',
  authDomain: 'lirium-esmalteria.firebaseapp.com',
  projectId: 'lirium-esmalteria',
  storageBucket: 'lirium-esmalteria.firebasestorage.app',
  messagingSenderId: '325700777806',
  appId: '1:325700777806:web:1ffd747514afbba508d01f',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const storage = getStorage(app);

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export default app;
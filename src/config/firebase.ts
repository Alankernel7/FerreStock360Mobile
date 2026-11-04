import "react-native-url-polyfill/auto";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  // @ts-ignore - getReactNativePersistence solo existe en el build React Native de firebase
  getReactNativePersistence,
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Configuración centralizada de Firebase.
 * Los valores provienen de las variables de entorno EXPO_PUBLIC_* definidas
 * en el archivo `.env` (ver `.env.example`).
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** true cuando el proyecto Firebase está configurado mediante variables de entorno. */
export const firebaseConfigurado =
  firebaseConfig.apiKey !== "" && firebaseConfig.projectId !== "" && firebaseConfig.appId !== "";

export const mensajeConfigFirebase = firebaseConfigurado
  ? null
  : "Firebase no está configurado. Copia .env.example a .env y completa los valores de tu proyecto en Firebase Console.";

let appFirebase: FirebaseApp | null = null;
let authFirebase: Auth | null = null;
let dbFirestore: Firestore | null = null;

if (firebaseConfigurado) {
  appFirebase = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  try {
    // Persistencia de sesión en AsyncStorage: el usuario no vuelve a
    // iniciar sesión mientras la sesión siga vigente.
    authFirebase = initializeAuth(appFirebase, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth lanza si ya fue inicializado (p. ej. recarga en desarrollo).
    authFirebase = getAuth(appFirebase);
  }

  dbFirestore = getFirestore(appFirebase);
}

export { appFirebase, authFirebase, dbFirestore };

/**
 * Tipos de las variables de entorno Expo (EXPO_PUBLIC_*).
 * Expo inyecta estas variables en tiempo de compilación con Metro.
 */
declare const process: {
  env: {
    EXPO_PUBLIC_FIREBASE_API_KEY?: string;
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
    EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
    EXPO_PUBLIC_FIREBASE_APP_ID?: string;
    [clave: string]: string | undefined;
  };
};

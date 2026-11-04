/**
 * Client IDs de OAuth de Google para iniciar sesión con Google
 * (proveedor de Firebase Authentication).
 *
 * Se obtienen de Google Cloud Console > APIs & Services > Credentials:
 *  - Web client (obligatorio, funciona en Expo Go a través del proxy de Expo)
 *  - Android client / iOS client (opcionales, para builds de desarrollo o producción)
 */
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

export const GOOGLE_CLIENT_IDS = {
  web: webClientId,
  android: androidClientId,
  ios: iosClientId,
};

/** true si al menos un Client ID de Google está configurado. */
export const googleConfigurado =
  webClientId !== "" || androidClientId !== "" || iosClientId !== "";

export const mensajeConfigGoogle = googleConfigurado
  ? null
  : "Inicio de sesión con Google no está configurado. Agrega EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en .env (ver .env.example).";

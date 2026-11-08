import { FirebaseError } from "firebase/app";

const MENSAJES_FIREBASE: Record<string, string> = {
  "auth/invalid-email": "El correo electrónico no es válido.",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
  "auth/user-not-found": "No existe una cuenta con este correo electrónico.",
  "auth/wrong-password": "La contraseña es incorrecta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-login-credentials": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta registrada con este correo electrónico.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests":
    "Demasiados intentos fallidos. Intenta nuevamente en unos minutos.",
  "auth/network-request-failed":
    "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
  "auth/operation-not-allowed":
    "Este método de inicio de sesión no está habilitado en Firebase Console.",
  "auth/requires-recent-login":
    "Por seguridad, vuelve a iniciar sesión para continuar.",
  "auth/timeout": "La operación tardó demasiado. Intenta nuevamente.",
  "auth/unauthorized-domain":
    "Este dominio no está autorizado en Firebase Console.",
  "auth/quota-exceeded": "Se superó la cuota de Firebase. Intenta más tarde.",
  "auth/internal-error": "Error interno de Firebase. Intenta nuevamente.",
};

/**
 * Convierte un error de Firebase (o cualquier error) en un mensaje
 * comprensible para el usuario.
 */
export function mensajeErrorFirebase(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      MENSAJES_FIREBASE[error.code] ??
      "Ocurrió un error con Firebase. Intenta nuevamente."
    );
  }
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

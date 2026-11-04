import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { authFirebase, firebaseConfigurado } from "../config/firebase";
import {
  asegurarPerfilUsuario,
  actualizarPerfilUsuario,
  crearPerfilUsuario,
  registrarActividad,
} from "./firestoreService";

function obtenerAuth() {
  if (!authFirebase) {
    throw new Error(
      "Firebase no está configurado. Completa las variables de entorno en .env (ver .env.example)."
    );
  }
  return authFirebase;
}

function requerirConfiguracion() {
  if (!firebaseConfigurado) {
    throw new Error(
      "Firebase no está configurado. Copia .env.example a .env y completa los valores de Firebase Console."
    );
  }
}

/**
 * Registra un usuario con correo y contraseña y crea su documento de perfil
 * en Firestore con rol inicial "usuario".
 */
export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string
): Promise<User> {
  requerirConfiguracion();
  const auth = obtenerAuth();

  const credencial = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );

  try {
    await updateProfile(credencial.user, { displayName: nombre.trim() });
  } catch (error) {
    console.warn("[auth] No se pudo actualizar el displayName:", error);
  }

  try {
    await crearPerfilUsuario(credencial.user, {
      nombre: nombre.trim(),
      proveedor: "password",
    });
  } catch (error) {
    // La autenticación ya fue creada; el AuthContext completa el perfil
    // en local si Firestore no permite la escritura (reglas pendientes).
    console.warn("[auth] No se pudo crear el documento de perfil:", error);
  }

  await registrarActividad(
    credencial.user.uid,
    "registro",
    `Cuenta creada con correo ${email.trim()}`
  );

  return credencial.user;
}

/** Devuelve el usuario autenticado actual, o null si no hay sesión. */
export function obtenerUsuarioActual(): User | null {
  return obtenerAuth().currentUser;
}

/**
 * Escucha los cambios del estado de autenticación (inicio, cierre y
 * restauración de sesión). Devuelve la función de desuscripción.
 */
export function escucharCambiosAuth(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(obtenerAuth(), callback);
}

/** Inicia sesión con correo y contraseña (real, no simulado). */
export async function iniciarSesion(
  email: string,
  password: string
): Promise<User> {
  requerirConfiguracion();
  const auth = obtenerAuth();

  const credencial = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );

  await asegurarPerfilUsuario(credencial.user, { proveedor: "password" });
  await registrarActividad(
    credencial.user.uid,
    "login",
    "Inicio de sesión con correo y contraseña"
  );

  return credencial.user;
}

/**
 * Inicia sesión con Google a partir del id_token obtenido con
 * expo-auth-session (Google.useIdTokenAuthRequest).
 */
export async function iniciarSesionConGoogle(idToken: string): Promise<User> {
  requerirConfiguracion();
  const auth = obtenerAuth();

  const credencial = GoogleAuthProvider.credential(idToken);
  const resultado = await signInWithCredential(auth, credencial);

  await asegurarPerfilUsuario(resultado.user, { proveedor: "google" });
  await registrarActividad(
    resultado.user.uid,
    "login_google",
    "Inicio de sesión con Google"
  );

  return resultado.user;
}

/** Envía un correo de recuperación de contraseña. */
export async function recuperarPassword(email: string): Promise<void> {
  requerirConfiguracion();
  const auth = obtenerAuth();
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

/**
 * Cierra la sesión: registra la actividad (best-effort) y limpia
 * el estado de autenticación; el AuthContext limpia el estado local.
 */
export async function cerrarSesion(): Promise<void> {
  const auth = obtenerAuth();
  const actual = auth.currentUser;
  if (actual) {
    await registrarActividad(actual.uid, "logout", "Cierre de sesión");
  }
  await signOut(auth);
}

/** Actualiza el nombre del perfil en Authentication y en Firestore. */
export async function actualizarNombrePerfil(
  uid: string,
  nombre: string
): Promise<void> {
  requerirConfiguracion();
  const auth = obtenerAuth();
  const limpio = nombre.trim();

  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: limpio });
    } catch (error) {
      console.warn("[auth] No se pudo actualizar el displayName:", error);
    }
  }

  await actualizarPerfilUsuario(uid, { nombre: limpio });
  await registrarActividad(uid, "perfil_actualizado", `Nombre actualizado a "${limpio}"`);
}

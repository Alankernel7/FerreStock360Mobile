import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { firebaseConfigurado } from "../config/firebase";
import * as authService from "../services/authService";
import {
  asegurarPerfilUsuario,
  obtenerPerfilUsuario,
} from "../services/firestoreService";
import type { PerfilUsuario } from "../types";

type AuthContextValue = {
  /** Perfil del usuario autenticado (Firestore), o null si no hay sesión. */
  usuario: PerfilUsuario | null;
  /** true mientras se detecta el estado inicial de autenticación. */
  cargandoSesion: boolean;
  /** true mientras se está creando una cuenta (evita redirecciones prematuras). */
  registrando: boolean;
  /** false si faltan variables de entorno de Firebase. */
  firebaseListo: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarUsuario: (
    nombre: string,
    email: string,
    password: string
  ) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  recuperarPassword: (email: string) => Promise<void>;
  actualizarNombre: (nombre: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Perfil local de respaldo cuando Firestore no responde
 * (p. ej. reglas de seguridad aún no desplegadas).
 */
function perfilLocal(user: User): PerfilUsuario {
  return {
    uid: user.uid,
    nombre:
      user.displayName?.trim() || user.email?.split("@")[0] || "Usuario",
    email: user.email ?? "",
    rol: "usuario",
    estado: "activo",
    fecha_creacion:
      user.metadata.creationTime ?? new Date().toISOString(),
    proveedor: user.providerData.some((p) => p.providerId === "google.com")
      ? "google"
      : "password",
    foto_url: user.photoURL ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    if (!firebaseConfigurado) {
      // Sin Firebase configurado no hay sesión que detectar.
      setCargandoSesion(false);
      return;
    }

    // Persistencia: onAuthStateChanged restablece la sesión desde AsyncStorage.
    const unsubscribe = authService.escucharCambiosAuth(async (user) => {
      try {
        if (!user) {
          setUsuario(null);
          return;
        }
        let perfil = await obtenerPerfilUsuario(user.uid).catch(() => null);
        if (!perfil) {
          perfil = await asegurarPerfilUsuario(user);
        }
        setUsuario(perfil ?? perfilLocal(user));
      } finally {
        setCargandoSesion(false);
      }
    });

    return unsubscribe;
  }, []);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    await authService.iniciarSesion(email, password);
  }, []);

  const registrar = useCallback(
    async (nombre: string, email: string, password: string) => {
      setRegistrando(true);
      try {
        await authService.registrarUsuario(nombre, email, password);
      } finally {
        setRegistrando(false);
      }
    },
    []
  );

  const cerrarSesion = useCallback(async () => {
    await authService.cerrarSesion();
    // Limpieza inmediata del estado local (además de onAuthStateChanged).
    setUsuario(null);
  }, []);

  const recuperarPassword = useCallback(async (email: string) => {
    await authService.recuperarPassword(email);
  }, []);

  const actualizarNombre = useCallback(async (nombre: string) => {
    const usuarioActual = authService.obtenerUsuarioActual();
    if (!usuarioActual) {
      throw new Error("No hay una sesión activa.");
    }
    await authService.actualizarNombrePerfil(usuarioActual.uid, nombre);
    setUsuario((actual) =>
      actual ? { ...actual, nombre: nombre.trim() } : actual
    );
  }, []);

  const valor: AuthContextValue = {
    usuario,
    cargandoSesion,
    registrando,
    firebaseListo: firebaseConfigurado,
    iniciarSesion,
    registrarUsuario: registrar,
    cerrarSesion,
    recuperarPassword,
    actualizarNombre,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return contexto;
}

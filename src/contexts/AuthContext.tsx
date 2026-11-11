
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

  /** true mientras se está creando una cuenta. */
  registrando: boolean;

  /** false si faltan variables de entorno de Firebase. */
  firebaseListo: boolean;

  /** Autenticación con correo y contraseña. */
  iniciarSesion: (email: string, password: string) => Promise<void>;

  /** Autenticación mediante Google. */
  iniciarSesionGoogle: () => Promise<boolean>;

  /** Registro de usuario con correo y contraseña. */
  registrarUsuario: (
    nombre: string,
    email: string,
    password: string
  ) => Promise<void>;

  /** Cierre de sesión. */
  cerrarSesion: () => Promise<void>;

  /** Recuperación de contraseña. */
  recuperarPassword: (email: string) => Promise<void>;

  /** Actualización del nombre del usuario. */
  actualizarNombre: (nombre: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Determina el proveedor de autenticación del usuario.
 */
function obtenerProveedor(user: User): "google" | "password" {
  return user.providerData.some(
    (p) => p.providerId === "google.com"
  )
    ? "google"
    : "password";
}

/**
 * Perfil local de respaldo cuando Firestore no responde.
 */
function perfilLocal(user: User): PerfilUsuario {
  return {
    uid: user.uid,
    nombre:
      user.displayName?.trim() ||
      user.email?.split("@")[0] ||
      "Usuario",
    email: user.email ?? "",
    rol: "usuario",
    estado: "activo",
    fecha_creacion:
      user.metadata.creationTime ??
      new Date().toISOString(),
    proveedor: obtenerProveedor(user),
    foto_url: user.photoURL ?? null,
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  /**
   * Detecta cambios en Firebase Authentication.
   * Restaura sesiones y obtiene perfiles desde Firestore.
   */
  useEffect(() => {
    if (!firebaseConfigurado) {
      setCargandoSesion(false);
      return;
    }

    let activo = true;

    const unsubscribe = authService.escucharCambiosAuth(
      async (user) => {
        try {
          if (!user) {
            if (activo) {
              setUsuario(null);
            }
            return;
          }

          // Consultar primero el perfil existente.
          let perfil = await obtenerPerfilUsuario(
            user.uid
          ).catch(() => null);

          // Si no existe, intentar crearlo en Firestore.
          if (!perfil) {
            perfil = await asegurarPerfilUsuario(user, {
              proveedor: obtenerProveedor(user),
            });
          }

          // Evitar actualizar una sesión que ya cambió.
          if (
            activo &&
            authService.obtenerUsuarioActual()?.uid === user.uid
          ) {
            setUsuario(perfil ?? perfilLocal(user));
          }
        } catch (error) {
          console.error(
            "[AuthContext] Error al recuperar la sesión:",
            error
          );

          if (activo) {
            if (
              user &&
              authService.obtenerUsuarioActual()?.uid === user.uid
            ) {
              setUsuario(perfilLocal(user));
            } else if (!user) {
              setUsuario(null);
            }
          }
        } finally {
          if (activo) {
            setCargandoSesion(false);
          }
        }
      }
    );

    return () => {
      activo = false;
      unsubscribe();
    };
  }, []);

  /**
   * Inicio de sesión mediante correo y contraseña.
   */
  const iniciarSesion = useCallback(
    async (email: string, password: string) => {
      await authService.iniciarSesion(email, password);
    },
    []
  );

  /**
   * Inicio de sesión mediante Google.
   * Devuelve false si el usuario cancela el proceso.
   */
  const iniciarSesionGoogle = useCallback(
    async (): Promise<boolean> => {
      return await authService.iniciarSesionGoogle();
    },
    []
  );

  /**
   * Registro tradicional con correo y contraseña.
   */
  const registrar = useCallback(
    async (
      nombre: string,
      email: string,
      password: string
    ) => {
      setRegistrando(true);

      try {
        await authService.registrarUsuario(
          nombre,
          email,
          password
        );
      } finally {
        setRegistrando(false);
      }
    },
    []
  );

  /**
   * Cierre de sesión.
   */
  const cerrarSesion = useCallback(async () => {
    await authService.cerrarSesion();
    setUsuario(null);
  }, []);

  /**
   * Recuperación de contraseña.
   */
  const recuperarPassword = useCallback(
    async (email: string) => {
      await authService.recuperarPassword(email);
    },
    []
  );

  /**
   * Actualiza el nombre en Authentication y Firestore.
   */
  const actualizarNombre = useCallback(
    async (nombre: string) => {
      const usuarioActual =
        authService.obtenerUsuarioActual();

      if (!usuarioActual) {
        throw new Error(
          "No hay una sesión activa."
        );
      }

      await authService.actualizarNombrePerfil(
        usuarioActual.uid,
        nombre
      );

      setUsuario((actual) =>
        actual
          ? {
              ...actual,
              nombre: nombre.trim(),
            }
          : actual
      );
    },
    []
  );

  /**
   * Valores disponibles para todas las pantallas.
   */
  const valor: AuthContextValue = {
    usuario,
    cargandoSesion,
    registrando,
    firebaseListo: firebaseConfigurado,
    iniciarSesion,
    iniciarSesionGoogle,
    registrarUsuario: registrar,
    cerrarSesion,
    recuperarPassword,
    actualizarNombre,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación.
 */
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe usarse dentro de <AuthProvider>."
    );
  }

  return contexto;
}

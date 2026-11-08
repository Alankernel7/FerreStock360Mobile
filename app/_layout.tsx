import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { colors } from "../src/constants/colors";

/** Rutas públicas de autenticación (fuera de los tabs). */
const RUTAS_AUTH = ["login", "register"];

/** Rutas privadas que requieren sesión activa. */
const RUTAS_PRIVADAS = ["favoritos", "perfil", "historial"];

function NavegadorRaiz() {
  const { usuario, cargandoSesion, registrando } = useAuth();
  // Los segmentos se leen como lista genérica para cubrir rutas de tabs y stack.
  const segments = useSegments() as string[];

  useEffect(() => {
    if (cargandoSesion || registrando) return;

    const primero = segments[0] as string | undefined;

    // Panel administrativo: solo para administradores autenticados.
    if (primero === "admin") {
      if (!usuario) {
        router.replace("/login");
      } else if (usuario.rol !== "admin") {
        router.replace("/");
      }
      return;
    }

    const dentroTabs = primero === "(tabs)";
    const rutaActual = dentroTabs
      ? ((segments[1] as string | undefined) ?? "index")
      : (primero ?? "index");

    const esPrivada = RUTAS_PRIVADAS.includes(rutaActual);
    const esAuth = RUTAS_AUTH.includes(rutaActual);

    if (!usuario && esPrivada) {
      // Pantalla privada sin sesión → login.
      router.replace("/login");
    } else if (usuario && esAuth) {
      // Sesión activa dentro de login/registro → destino según el rol.
      // Un rol distinto de "admin" (p. ej. "usuario" o "empleado") va al
      // catálogo público, por lo que un rol desconocido nunca obtiene
      // acceso administrativo.
      router.replace(usuario.rol === "admin" ? "/admin" : "/catalogo");
    }
  }, [usuario, cargandoSesion, segments, registrando]);

  if (cargandoSesion) {
    // Evita parpadeos mientras se restaura la sesión desde AsyncStorage.
    return (
      <View style={styles.carga}>
        <ActivityIndicator size="large" color={colors.yellow} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.white },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ animation: "slide_from_right" }} />
        <Stack.Screen
          name="register"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="historial"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="admin"
          options={{ animation: "slide_from_right" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavegadorRaiz />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  carga: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});

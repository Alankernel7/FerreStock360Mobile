import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Brand from "../src/components/Brand";
import PrimaryButton from "../src/components/PrimaryButton";
import TextField from "../src/components/TextField";
import { colors } from "../src/constants/colors";
import { espaciado, radio, tipografia } from "../src/constants/theme";

type Errores = { email?: string; password?: string };

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = () => {
    const nuevos: Errores = {};
    if (!email.trim()) nuevos.email = "Ingresa tu correo electrónico.";
    if (!password) nuevos.password = "Ingresa tu contraseña.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      Alert.alert(
        "Modo demo",
        "Inicio de sesión simulado: el backend aún no está conectado en esta fase.",
        [{ text: "Continuar", onPress: () => router.replace("/catalogo") }]
      );
    }, 900);
  };

  return (
    <SafeAreaView style={styles.seguro} edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.marca}>
            <Brand variante="sobreClaro" tamano={24} />
          </View>

          <View style={styles.formulario}>
            <View style={styles.encabezado}>
              <Text style={styles.titulo}>Bienvenido</Text>
              <Text style={styles.subtitulo}>Inicia sesión en tu cuenta</Text>
            </View>

            <TextField
              etiqueta="Correo electrónico"
              valor={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errores.email)
                  setErrores({ ...errores, email: undefined });
              }}
              placeholder="usuario@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errores.email}
            />

            <TextField
              etiqueta="Contraseña"
              valor={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errores.password)
                  setErrores({ ...errores, password: undefined });
              }}
              placeholder="••••••••"
              seguridad
              error={errores.password}
            />

            <View style={styles.opciones}>
              <Pressable
                style={styles.recordarme}
                onPress={() => setRecordarme((v) => !v)}
                hitSlop={6}
              >
                <View
                  style={[styles.checkbox, recordarme && styles.checkboxOn]}
                >
                  {recordarme && (
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={colors.black}
                    />
                  )}
                </View>
                <Text style={styles.recordarmeTexto}>Recordarme</Text>
              </Pressable>

              <Pressable
                hitSlop={6}
                onPress={() =>
                  Alert.alert(
                    "Recuperar contraseña",
                    "Esta función estará disponible al conectar el backend."
                  )
                }
              >
                <Text style={styles.olvide}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            </View>

            <PrimaryButton
              titulo={cargando ? "Iniciando sesión..." : "Iniciar sesión"}
              onPress={iniciarSesion}
              cargando={cargando}
            />

            <Pressable
              style={styles.footerLink}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.footerTexto}>
                ¿No tienes una cuenta?{" "}
                <Text style={styles.footerNegrita}>Regístrate</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: espaciado.xxl,
    paddingVertical: espaciado.xl,
  },
  marca: {
    alignItems: "center",
    marginBottom: espaciado.xl,
  },
  formulario: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: espaciado.lg,
  },
  encabezado: {
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.xl + 4,
    fontWeight: "700",
    color: colors.black,
  },
  subtitulo: {
    fontSize: tipografia.sm + 1,
    color: colors.textoSecundario,
  },
  opciones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
  },
  recordarme: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.sm - 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  recordarmeTexto: {
    fontSize: tipografia.sm + 1,
    color: colors.texto,
  },
  olvide: {
    fontSize: tipografia.sm,
    color: colors.yellowDark,
    fontWeight: "600",
  },
  footerLink: {
    alignItems: "center",
    paddingVertical: espaciado.sm,
  },
  footerTexto: {
    fontSize: tipografia.sm + 1,
    color: colors.textoSecundario,
  },
  footerNegrita: {
    color: colors.yellowDark,
    fontWeight: "700",
  },
});

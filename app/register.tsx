import { useState } from "react";
import {
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
import Brand from "../src/components/Brand";
import PrimaryButton from "../src/components/PrimaryButton";
import TextField from "../src/components/TextField";
import { colors } from "../src/constants/colors";
import { espaciado, radio, tipografia } from "../src/constants/theme";

type Errores = {
  nombre?: string;
  email?: string;
  password?: string;
  confirmar?: string;
};

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  const limpiarError = (campo: keyof Errores) => {
    if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
  };

  const registrar = () => {
    const nuevos: Errores = {};
    if (!nombre.trim()) nuevos.nombre = "Ingresa tu nombre.";
    if (!email.trim()) nuevos.email = "Ingresa tu correo electrónico.";
    if (password.length < 6)
      nuevos.password = "La contraseña debe tener al menos 6 caracteres.";
    if (confirmar !== password || !confirmar)
      nuevos.confirmar = "Las contraseñas no coinciden.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      setExito(
        "Cuenta creada correctamente. Redirigiendo al inicio de sesión..."
      );
      setTimeout(() => router.replace("/login"), 1500);
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
              <Text style={styles.titulo}>Crea tu cuenta</Text>
              <Text style={styles.subtitulo}>
                Únete y gestiona tu inventario
              </Text>
            </View>

            {!!exito && (
              <View style={styles.bannerExito}>
                <Text style={styles.bannerExitoTexto}>{exito}</Text>
              </View>
            )}

            <TextField
              etiqueta="Nombre completo"
              valor={nombre}
              onChangeText={(t) => {
                setNombre(t);
                limpiarError("nombre");
              }}
              placeholder="Tu nombre"
              error={errores.nombre}
            />

            <TextField
              etiqueta="Correo electrónico"
              valor={email}
              onChangeText={(t) => {
                setEmail(t);
                limpiarError("email");
              }}
              placeholder="tu@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errores.email}
            />

            <TextField
              etiqueta="Contraseña"
              valor={password}
              onChangeText={(t) => {
                setPassword(t);
                limpiarError("password");
              }}
              placeholder="Mínimo 6 caracteres"
              seguridad
              error={errores.password}
            />

            <TextField
              etiqueta="Confirmar contraseña"
              valor={confirmar}
              onChangeText={(t) => {
                setConfirmar(t);
                limpiarError("confirmar");
              }}
              placeholder="Confirma tu contraseña"
              seguridad
              error={errores.confirmar}
            />

            <PrimaryButton
              titulo={cargando ? "Creando cuenta..." : "Registrarse"}
              onPress={registrar}
              cargando={cargando}
              deshabilitado={!!exito}
            />

            <Pressable
              style={styles.footerLink}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.footerTexto}>
                ¿Ya tienes cuenta?{" "}
                <Text style={styles.footerNegrita}>Inicia sesión</Text>
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
    marginBottom: espaciado.lg,
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
  bannerExito: {
    backgroundColor: colors.exitoBg,
    borderWidth: 1,
    borderColor: colors.exitoBorde,
    borderRadius: radio.sm,
    padding: espaciado.md,
  },
  bannerExitoTexto: {
    color: colors.exitoTexto,
    fontSize: tipografia.sm,
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

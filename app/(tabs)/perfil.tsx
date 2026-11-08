import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../src/components/AppHeader";
import Banner from "../../src/components/Banner";
import PrimaryButton from "../../src/components/PrimaryButton";
import TextField from "../../src/components/TextField";
import { colors } from "../../src/constants/colors";
import { espaciado, radio, tipografia } from "../../src/constants/theme";
import { useAuth } from "../../src/contexts/AuthContext";
import { formatearFecha } from "../../src/utils/fechas";
import { mensajeErrorFirebase } from "../../src/utils/firebaseErrors";

const ETIQUETA_ROL: Record<string, string> = {
  admin: "Administrador",
  empleado: "Empleado",
  usuario: "Usuario",
};

export default function PerfilScreen() {
  const { usuario, cerrarSesion, actualizarNombre, firebaseListo } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nombreEditado, setNombreEditado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  if (!usuario) {
    // El AuthContext redirige a login; mientras tanto no hay datos que mostrar.
    return (
      <View style={styles.pantalla}>
        <AppHeader />
      </View>
    );
  }

  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || "U";

  const guardarNombre = async () => {
    if (!nombreEditado.trim()) {
      setMensajeError("El nombre no puede estar vacío.");
      return;
    }
    setGuardando(true);
    setMensajeError(null);
    try {
      await actualizarNombre(nombreEditado);
      setEditando(false);
    } catch (e) {
      setMensajeError(mensajeErrorFirebase(e));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarCierre = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar tu sesión en FerreStock360?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            setCerrando(true);
            try {
              await cerrarSesion();
              // La redirección la gestiona el AuthContext (sin sesión → login).
            } catch (e) {
              setCerrando(false);
              Alert.alert("Cerrar sesión", mensajeErrorFirebase(e));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.pantalla}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.circulo}>
          <Text style={styles.inicial}>{inicial}</Text>
        </View>

        <Text style={styles.titulo}>{usuario.nombre}</Text>
        <View style={styles.badgeRol}>
          <Text style={styles.badgeRolTexto}>
            {ETIQUETA_ROL[usuario.rol] ?? usuario.rol}
          </Text>
        </View>

        <View style={styles.tarjeta}>
          {!firebaseListo && (
            <Banner
              tipo="error"
              texto="Firebase no está configurado: los datos mostrados pueden estar incompletos."
            />
          )}

          {!!mensajeError && (
            <Banner
              tipo="error"
              texto={mensajeError}
              onCerrar={() => setMensajeError(null)}
            />
          )}

          {editando ? (
            <View style={styles.bloqueEdicion}>
              <TextField
                etiqueta="Nombre completo"
                valor={nombreEditado}
                onChangeText={setNombreEditado}
                placeholder="Tu nombre"
              />
              <View style={styles.filaBotones}>
                <PrimaryButton
                  titulo="Cancelar"
                  variante="contorno"
                  onPress={() => {
                    setEditando(false);
                    setMensajeError(null);
                  }}
                  deshabilitado={guardando}
                  estilo={styles.botonMedio}
                />
                <PrimaryButton
                  titulo={guardando ? "Guardando..." : "Guardar"}
                  onPress={guardarNombre}
                  cargando={guardando}
                  estilo={styles.botonMedio}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.filaDato}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.textoSuave}
                />
                <View style={styles.datoTexto}>
                  <Text style={styles.datoEtiqueta}>Correo electrónico</Text>
                  <Text style={styles.datoValor}>{usuario.email}</Text>
                </View>
              </View>

              <View style={styles.filaDato}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.textoSuave}
                />
                <View style={styles.datoTexto}>
                  <Text style={styles.datoEtiqueta}>Miembro desde</Text>
                  <Text style={styles.datoValor}>
                    {formatearFecha(usuario.fecha_creacion)}
                  </Text>
                </View>
              </View>

              <View style={styles.filaDato}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.textoSuave}
                />
                <View style={styles.datoTexto}>
                  <Text style={styles.datoEtiqueta}>Estado</Text>
                  <Text style={styles.datoValor}>
                    {usuario.estado === "activo" ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>

              <PrimaryButton
                titulo="Editar nombre"
                icono="create-outline"
                variante="contorno"
                onPress={() => {
                  setNombreEditado(usuario.nombre);
                  setMensajeError(null);
                  setEditando(true);
                }}
              />
            </>
          )}
        </View>

        {usuario.rol === "admin" && (
          <View style={styles.tarjeta}>
            <Pressable
              style={styles.filaAccion}
              onPress={() => router.push("/admin")}
            >
              <View style={styles.filaAccionIzq}>
                <Ionicons
                  name="construct-outline"
                  size={20}
                  color={colors.black}
                />
                <Text style={styles.filaAccionTexto}>Panel administrativo</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textoSuave}
              />
            </Pressable>
          </View>
        )}

        <View style={styles.tarjeta}>
          <Pressable
            style={styles.filaAccion}
            onPress={() => router.push("/historial")}
          >
            <View style={styles.filaAccionIzq}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.black}
              />
              <Text style={styles.filaAccionTexto}>Historial de actividad</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textoSuave}
            />
          </Pressable>
        </View>

        <PrimaryButton
          titulo={cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
          icono="log-out-outline"
          variante="contorno"
          onPress={confirmarCierre}
          cargando={cerrando}
          estilo={styles.botonSalir}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contenido: {
    padding: espaciado.xl,
    paddingBottom: espaciado.xxl,
    gap: espaciado.md,
    alignItems: "stretch",
  },
  circulo: {
    width: 88,
    height: 88,
    borderRadius: radio.pill,
    backgroundColor: "rgba(245, 197, 24, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: espaciado.sm,
  },
  inicial: {
    fontSize: tipografia.xxl,
    fontWeight: "700",
    color: colors.yellowDark,
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
  },
  badgeRol: {
    alignSelf: "center",
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.pill,
    paddingHorizontal: espaciado.md,
    paddingVertical: 4,
  },
  badgeRolTexto: {
    fontSize: tipografia.xs + 1,
    fontWeight: "600",
    color: colors.gray,
  },
  tarjeta: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.bordeClaro,
    borderRadius: radio.md,
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  filaDato: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },
  datoTexto: {
    flex: 1,
    gap: 2,
  },
  datoEtiqueta: {
    fontSize: tipografia.xs + 1,
    color: colors.textoSuave,
  },
  datoValor: {
    fontSize: tipografia.sm + 1,
    color: colors.black,
    fontWeight: "500",
  },
  bloqueEdicion: {
    gap: espaciado.md,
  },
  filaBotones: {
    flexDirection: "row",
    gap: espaciado.md,
  },
  botonMedio: {
    flex: 1,
  },
  filaAccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: espaciado.xs,
  },
  filaAccionIzq: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },
  filaAccionTexto: {
    fontSize: tipografia.sm + 1,
    fontWeight: "600",
    color: colors.black,
  },
  botonSalir: {
    marginTop: espaciado.sm,
  },
});

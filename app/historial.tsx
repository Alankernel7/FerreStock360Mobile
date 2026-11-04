import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppFooter from "../src/components/AppFooter";
import AppHeader from "../src/components/AppHeader";
import EstadoVacio from "../src/components/EstadoVacio";
import { colors } from "../src/constants/colors";
import { espaciado, radio, tipografia } from "../src/constants/theme";
import { useAuth } from "../src/contexts/AuthContext";
import { useHistorial } from "../src/hooks/useHistorial";
import type { TipoActividad } from "../src/types";
import { formatearFecha } from "../src/utils/fechas";

const ICONOS: Record<TipoActividad, keyof typeof Ionicons.glyphMap> = {
  registro: "person-add-outline",
  login: "log-in-outline",
  login_google: "logo-google",
  logout: "log-out-outline",
  perfil_actualizado: "create-outline",
  favorito_agregado: "heart",
  favorito_quitado: "heart-dislike-outline",
};

const ETIQUETAS: Record<TipoActividad, string> = {
  registro: "Registro",
  login: "Inicio de sesión",
  login_google: "Inicio con Google",
  logout: "Cierre de sesión",
  perfil_actualizado: "Perfil actualizado",
  favorito_agregado: "Favorito agregado",
  favorito_quitado: "Favorito quitado",
};

export default function HistorialScreen() {
  const { usuario } = useAuth();
  const { actividades, cargando, error, recargar } = useHistorial(
    usuario?.uid ?? null
  );

  return (
    <View style={styles.pantalla}>
      <AppHeader onVolver={() => router.back()} />
      <FlatList
        data={cargando ? [] : actividades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const icono = ICONOS[item.tipo] ?? "time-outline";
          const etiqueta = ETIQUETAS[item.tipo] ?? "Actividad";
          return (
            <View style={styles.item}>
              <View style={styles.iconoCaja}>
                <Ionicons name={icono} size={18} color={colors.yellowDark} />
              </View>
              <View style={styles.itemTexto}>
                <Text style={styles.itemTipo}>{etiqueta}</Text>
                <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
                <Text style={styles.itemFecha}>
                  {formatearFecha(item.fecha)}
                </Text>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.cabecera}>
            <Text style={styles.titulo}>Historial de actividad</Text>
            <Text style={styles.subtitulo}>
              Registros de tus acciones en FerreStock360
            </Text>
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <EstadoVacio tipo="carga" texto="Cargando historial..." />
          ) : error ? (
            <EstadoVacio tipo="error" texto={error} />
          ) : (
            <EstadoVacio
              icono="time-outline"
              texto="No hay registros de actividad todavía."
            />
          )
        }
        ListFooterComponent={
          <View style={styles.pie}>
            {!cargando && !error && actividades.length > 0 && (
              <Text style={styles.reintentar} onPress={recargar}>
                Actualizar
              </Text>
            )}
            <AppFooter />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.white,
  },
  lista: {
    paddingBottom: espaciado.xl,
    flexGrow: 1,
  },
  cabecera: {
    padding: espaciado.lg,
    paddingBottom: espaciado.md,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.xl + 3,
    fontWeight: "700",
    color: colors.black,
  },
  subtitulo: {
    fontSize: tipografia.sm + 1,
    color: colors.textoSecundario,
  },
  item: {
    flexDirection: "row",
    gap: espaciado.md,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.sm,
  },
  iconoCaja: {
    width: 38,
    height: 38,
    borderRadius: radio.pill,
    backgroundColor: "rgba(245, 197, 24, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTexto: {
    flex: 1,
    gap: 2,
    paddingBottom: espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bordeClaro,
  },
  itemTipo: {
    fontSize: tipografia.sm + 1,
    fontWeight: "600",
    color: colors.black,
  },
  itemDescripcion: {
    fontSize: tipografia.sm,
    color: colors.texto,
    lineHeight: 18,
  },
  itemFecha: {
    fontSize: tipografia.xs + 1,
    color: colors.textoSuave,
    marginTop: 2,
  },
  pie: {
    alignItems: "center",
    gap: espaciado.sm,
    paddingTop: espaciado.md,
  },
  reintentar: {
    fontSize: tipografia.sm,
    fontWeight: "600",
    color: colors.yellowDark,
  },
});

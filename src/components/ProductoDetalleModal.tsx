import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { espaciado, radio, sombra, tipografia } from "../constants/theme";
import type { Producto } from "../types";
import PrimaryButton from "./PrimaryButton";

type Props = {
  /** Producto a mostrar (viene del catálogo cargado desde Firestore). */
  producto: Producto | null;
  visible: boolean;
  /** Nombre de la categoría resuelto por el contenedor; vacío si no aplica. */
  categoriaNombre?: string;
  favorito?: boolean;
  /** Si se omite, el botón de favoritos no se muestra. */
  onAlternarFavorito?: () => void;
  onCerrar: () => void;
};

type Disponibilidad = { texto: string; fondo: string; color: string };

function calcularDisponibilidad(producto: Producto): Disponibilidad {
  if (producto.stock_actual <= 0) {
    return {
      texto: "Agotado",
      fondo: colors.badgeRojoBg,
      color: colors.dangerTexto,
    };
  }
  if (producto.stock_actual <= producto.stock_minimo) {
    return {
      texto: "Stock bajo",
      fondo: colors.badgeRojoBg,
      color: colors.dangerTexto,
    };
  }
  return {
    texto: "Disponible",
    fondo: colors.badgeVerdeBg,
    color: colors.badgeVerdeTexto,
  };
}

function Dato({
  icono,
  etiqueta,
  valor,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  etiqueta: string;
  valor: string;
}) {
  return (
    <View style={styles.fila}>
      <Ionicons
        name={icono}
        size={16}
        color={colors.textoSecundario}
        style={styles.filaIcono}
      />
      <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.filaValor} numberOfLines={2}>
        {valor}
      </Text>
    </View>
  );
}

/**
 * Modal de detalle de producto. Muestra la información del producto
 * seleccionado en el catálogo (cargado desde Firestore) y permite
 * agregarlo o quitarlo de favoritos sin modificar sus datos.
 */
export default function ProductoDetalleModal({
  producto,
  visible,
  categoriaNombre = "",
  favorito = false,
  onAlternarFavorito,
  onCerrar,
}: Props) {
  const descripcion = producto?.descripcion?.trim() ?? "";
  const codigo = producto?.codigo?.trim() ?? "";
  const categoria = categoriaNombre.trim();
  const disponibilidad = producto ? calcularDisponibilidad(producto) : null;

  return (
    <Modal
      visible={visible && !!producto}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
      statusBarTranslucent
    >
      <View style={styles.contenedor}>
        <Pressable
          style={styles.fondo}
          onPress={onCerrar}
          accessibilityLabel="Cerrar detalle del producto"
        />
        <View style={styles.hoja}>
          {producto && (
            <>
              <View style={styles.imagen}>
                {producto.imagen_url ? (
                  <Image
                    source={{ uri: producto.imagen_url }}
                    style={styles.foto}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons
                      name="cube-outline"
                      size={48}
                      color={colors.gray}
                    />
                    <Text style={styles.placeholderTexto}>
                      Este producto no tiene imagen
                    </Text>
                  </View>
                )}
                <Pressable
                  onPress={onCerrar}
                  hitSlop={8}
                  style={styles.cerrar}
                  accessibilityLabel="Cerrar"
                >
                  <Ionicons name="close" size={20} color={colors.black} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.contenido}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.badges}>
                  {disponibilidad && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: disponibilidad.fondo },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeTexto,
                          { color: disponibilidad.color },
                        ]}
                      >
                        {disponibilidad.texto}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: producto.estado
                          ? colors.badgeVerdeBg
                          : colors.badgeRojoBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeTexto,
                        {
                          color: producto.estado
                            ? colors.badgeVerdeTexto
                            : colors.dangerTexto,
                        },
                      ]}
                    >
                      {producto.estado ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                  {!!categoria && (
                    <View style={[styles.badge, { backgroundColor: colors.light }]}>
                      <Text style={[styles.badgeTexto, { color: colors.gray }]}>
                        {categoria}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.nombre}>{producto.nombre}</Text>
                <Text style={styles.precio}>${producto.precio.toFixed(2)}</Text>

                <View style={styles.tabla}>
                  {!!codigo && (
                    <Dato
                      icono="barcode-outline"
                      etiqueta="Código"
                      valor={codigo}
                    />
                  )}
                  {!!categoria && (
                    <Dato
                      icono="pricetags-outline"
                      etiqueta="Categoría"
                      valor={categoria}
                    />
                  )}
                  <Dato
                    icono="cube-outline"
                    etiqueta="Stock actual"
                    valor={String(producto.stock_actual)}
                  />
                  <Dato
                    icono="alert-circle-outline"
                    etiqueta="Stock mínimo"
                    valor={String(producto.stock_minimo)}
                  />
                  <Dato
                    icono="checkmark-circle-outline"
                    etiqueta="Estado"
                    valor={producto.estado ? "Activo" : "Inactivo"}
                  />
                </View>

                {descripcion !== "" && (
                  <View style={styles.descripcionBloque}>
                    <Text style={styles.seccion}>Descripción</Text>
                    <Text style={styles.descripcion}>{descripcion}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.acciones}>
                {!!onAlternarFavorito && (
                  <PrimaryButton
                    titulo={
                      favorito ? "Quitar de favoritos" : "Agregar a favoritos"
                    }
                    variante="contorno"
                    icono={favorito ? "heart" : "heart-outline"}
                    onPress={onAlternarFavorito}
                  />
                )}
                <PrimaryButton titulo="Cerrar" onPress={onCerrar} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "flex-end",
  },
  fondo: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  hoja: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radio.lg,
    borderTopRightRadius: radio.lg,
    maxHeight: "90%",
    overflow: "hidden",
    ...sombra.suave,
  },
  imagen: {
    height: 210,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: espaciado.lg,
  },
  foto: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
    gap: espaciado.sm,
  },
  placeholderTexto: {
    fontSize: tipografia.sm,
    color: colors.textoSecundario,
  },
  cerrar: {
    position: "absolute",
    top: espaciado.md,
    right: espaciado.md,
    width: 34,
    height: 34,
    borderRadius: radio.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    zIndex: 1,
  },
  contenido: {
    padding: espaciado.lg,
    gap: espaciado.sm,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.sm,
  },
  badge: {
    borderRadius: radio.sm,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 4,
  },
  badgeTexto: {
    fontSize: tipografia.xs,
    fontWeight: "700",
  },
  nombre: {
    fontSize: tipografia.xl,
    fontWeight: "700",
    color: colors.black,
  },
  precio: {
    fontSize: tipografia.xxl,
    fontWeight: "700",
    color: colors.yellowDark,
  },
  tabla: {
    marginTop: espaciado.sm,
    borderWidth: 1,
    borderColor: colors.bordeClaro,
    borderRadius: radio.md,
    overflow: "hidden",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    paddingHorizontal: espaciado.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.bordeClaro,
  },
  filaIcono: {
    width: 18,
  },
  filaEtiqueta: {
    flex: 1,
    fontSize: tipografia.sm,
    color: colors.textoSecundario,
  },
  filaValor: {
    fontSize: tipografia.sm + 1,
    fontWeight: "600",
    color: colors.black,
    flexShrink: 1,
    textAlign: "right",
  },
  descripcionBloque: {
    marginTop: espaciado.sm,
    gap: espaciado.xs,
  },
  seccion: {
    fontSize: tipografia.md,
    fontWeight: "700",
    color: colors.black,
  },
  descripcion: {
    fontSize: tipografia.sm + 1,
    lineHeight: 21,
    color: colors.texto,
  },
  acciones: {
    padding: espaciado.lg,
    paddingTop: espaciado.md,
    gap: espaciado.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bordeClaro,
  },
});

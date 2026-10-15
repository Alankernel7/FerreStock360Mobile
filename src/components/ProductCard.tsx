import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radio, sombra, tipografia } from "../constants/theme";
import { Producto } from "../types";

type Props = {
  producto: Producto;
  ancho?: number;
};

const disponibilidad = (producto: Producto) => {
  if (producto.stock_actual <= 0) {
    return { texto: "Agotado", fondo: colors.badgeRojoBg, textoColor: colors.dangerTexto };
  }
  if (producto.stock_actual <= producto.stock_minimo) {
    return { texto: "Stock bajo", fondo: colors.badgeRojoBg, textoColor: colors.dangerTexto };
  }
  return { texto: "Disponible", fondo: colors.badgeVerdeBg, textoColor: colors.badgeVerdeTexto };
};

export default function ProductCard({ producto, ancho }: Props) {
  const estado = disponibilidad(producto);

  const contenedor: ViewStyle =
    ancho !== undefined ? { width: ancho } : { flex: 1 };

  return (
    <View style={[styles.tarjeta, contenedor]}>
      <View style={styles.imagen}>
        <View style={[styles.badge, { backgroundColor: estado.fondo }]}>
          <Text style={[styles.badgeTexto, { color: estado.textoColor }]}>
            {estado.texto}
          </Text>
        </View>
        {producto.imagen_url ? (
          <Image
            source={{ uri: producto.imagen_url }}
            style={styles.foto}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="cube-outline" size={32} color={colors.gray} />
          </View>
        )}
      </View>
      <View style={styles.cuerpo}>
        <Text style={styles.nombre} numberOfLines={2}>
          {producto.nombre}
        </Text>
        <Text style={styles.precio}>${producto.precio.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.white,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.bordeClaro,
    ...sombra.suave,
    overflow: "hidden",
  },
  imagen: {
    backgroundColor: colors.light,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: radio.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  badgeTexto: {
    fontSize: tipografia.xs,
    fontWeight: "700",
  },
  foto: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: radio.sm,
    backgroundColor: "rgba(74, 74, 74, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cuerpo: {
    padding: 12,
    gap: 6,
  },
  nombre: {
    fontSize: tipografia.sm + 1,
    fontWeight: "500",
    color: colors.black,
  },
  precio: {
    fontSize: tipografia.lg,
    fontWeight: "700",
    color: colors.yellow,
  },
});

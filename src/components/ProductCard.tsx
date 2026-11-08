import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radio, sombra, tipografia } from "../constants/theme";
import { Producto } from "../types";

type Props = {
  producto: Producto;
  ancho?: number;
  favorito?: boolean;
  onAlternarFavorito?: () => void;
  onPress?: () => void;
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

export default function ProductCard({
  producto,
  ancho,
  favorito = false,
  onAlternarFavorito,
  onPress,
}: Props) {
  const estado = disponibilidad(producto);

  const contenedor: ViewStyle =
    ancho !== undefined ? { width: ancho } : { flex: 1 };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `Ver detalle de ${producto.nombre}` : undefined}
      style={({ pressed }) => [
        styles.tarjeta,
        contenedor,
        pressed && !!onPress ? styles.tarjetaPresionada : null,
      ]}
    >
      <View style={styles.imagen}>
        <View style={[styles.badge, { backgroundColor: estado.fondo }]}>
          <Text style={[styles.badgeTexto, { color: estado.textoColor }]}>
            {estado.texto}
          </Text>
        </View>
        {!!onAlternarFavorito && (
          <Pressable
            onPress={onAlternarFavorito}
            hitSlop={8}
            style={styles.corazon}
            accessibilityLabel={
              favorito ? "Quitar de favoritos" : "Agregar a favoritos"
            }
          >
            <Ionicons
              name={favorito ? "heart" : "heart-outline"}
              size={21}
              color={favorito ? colors.danger : colors.gray}
            />
          </Pressable>
        )}
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
    </Pressable>
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
  tarjetaPresionada: {
    opacity: 0.92,
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
  corazon: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: radio.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
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

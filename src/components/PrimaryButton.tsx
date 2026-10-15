import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { ALTURA_TOQUE, radio, tipografia } from "../constants/theme";

type Variante = "primario" | "contorno" | "oscuro";

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icono?: keyof typeof Ionicons.glyphMap;
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: ViewStyle;
};

export default function PrimaryButton({
  titulo,
  onPress,
  variante = "primario",
  icono,
  cargando = false,
  deshabilitado = false,
  estilo,
}: Props) {
  const inactivo = cargando || deshabilitado;

  const fondo = variante === "primario" ? colors.yellow : "transparent";
  const texto =
    variante === "primario"
      ? colors.black
      : variante === "oscuro"
        ? colors.white
        : colors.black;
  const borde =
    variante === "contorno"
      ? colors.borde
      : variante === "oscuro"
        ? colors.gray
        : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        {
          backgroundColor: fondo,
          borderColor: borde,
          borderWidth: borde === "transparent" ? 0 : 1,
          opacity: inactivo ? 0.5 : pressed ? 0.85 : 1,
        },
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator size="small" color={texto} />
      ) : (
        <>
          {!!icono && (
            <Ionicons name={icono} size={18} color={texto} style={styles.icono} />
          )}
          <Text style={[styles.texto, { color: texto }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    borderRadius: radio.sm,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: ALTURA_TOQUE,
  },
  icono: {
    marginRight: 8,
  },
  texto: {
    fontSize: tipografia.md,
    fontWeight: "600",
  },
});

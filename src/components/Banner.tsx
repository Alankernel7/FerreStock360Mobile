import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radio, tipografia } from "../constants/theme";

type Tipo = "error" | "exito" | "info" | "demo";

type Props = {
  tipo?: Tipo;
  texto: string;
  onCerrar?: () => void;
};

const ESTILOS: Record<
  Tipo,
  { fondo: string; borde: string; texto: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  error: {
    fondo: colors.errorBg,
    borde: colors.errorBorde,
    texto: colors.errorTexto,
    icono: "alert-circle-outline",
  },
  exito: {
    fondo: colors.exitoBg,
    borde: colors.exitoBorde,
    texto: colors.exitoTexto,
    icono: "checkmark-circle-outline",
  },
  info: {
    fondo: colors.light,
    borde: colors.borde,
    texto: colors.texto,
    icono: "information-circle-outline",
  },
  demo: {
    fondo: "rgba(245, 197, 24, 0.16)",
    borde: "rgba(245, 197, 24, 0.55)",
    texto: colors.gray,
    icono: "flask-outline",
  },
};

/**
 * Banner inline para mensajes de error, éxito o datos de demostración.
 * Conserva la identidad visual de FerreStock360.
 */
export default function Banner({ tipo = "info", texto, onCerrar }: Props) {
  const estilo = ESTILOS[tipo];

  return (
    <View style={[styles.banner, { backgroundColor: estilo.fondo, borderColor: estilo.borde }]}>
      <Ionicons name={estilo.icono} size={17} color={estilo.texto} style={styles.icono} />
      <Text style={[styles.texto, { color: estilo.texto }]}>{texto}</Text>
      {!!onCerrar && (
        <Pressable onPress={onCerrar} hitSlop={8} style={styles.cerrar}>
          <Ionicons name="close" size={16} color={estilo.texto} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: radio.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  icono: {
    marginTop: 1,
  },
  texto: {
    flex: 1,
    fontSize: tipografia.sm,
    lineHeight: 18,
  },
  cerrar: {
    paddingLeft: 4,
  },
});

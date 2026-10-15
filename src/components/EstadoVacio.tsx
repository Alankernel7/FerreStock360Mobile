import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radio, tipografia } from "../constants/theme";

type Tipo = "carga" | "vacio" | "error";

type Props = {
  tipo?: Tipo;
  texto: string;
  icono?: keyof typeof Ionicons.glyphMap;
};

export default function EstadoVacio({
  tipo = "vacio",
  texto,
  icono,
}: Props) {
  const nombreIcono =
    icono ?? (tipo === "error" ? "alert-circle-outline" : "cube-outline");

  return (
    <View style={styles.contenedor}>
      <View
        style={[
          styles.circulo,
          tipo === "error" && { backgroundColor: colors.errorBg },
        ]}
      >
        {tipo === "carga" ? (
          <ActivityIndicator size="small" color={colors.yellow} />
        ) : (
          <Ionicons
            name={nombreIcono}
            size={32}
            color={tipo === "error" ? colors.errorTexto : colors.textoSuave}
          />
        )}
      </View>
      <Text
        style={[
          styles.texto,
          tipo === "error" && { color: colors.errorTexto },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: radio.pill,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    fontSize: tipografia.sm,
    color: colors.textoSecundario,
    textAlign: "center",
  },
});

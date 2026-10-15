import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import { espaciado, tipografia } from "../constants/theme";

type Props = {
  titulo: string;
  accion?: string;
  onPressAccion?: () => void;
};

export default function SectionTitle({ titulo, accion, onPressAccion }: Props) {
  return (
    <View style={styles.fila}>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!accion && (
        <Pressable onPress={onPressAccion} hitSlop={8}>
          <Text style={styles.accion}>{accion}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: "700",
    color: colors.black,
  },
  accion: {
    fontSize: tipografia.sm,
    color: colors.yellowDark,
    fontWeight: "600",
  },
});

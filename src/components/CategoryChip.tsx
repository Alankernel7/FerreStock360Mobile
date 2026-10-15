import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";
import { radio, tipografia } from "../constants/theme";

type Props = {
  etiqueta: string;
  activa?: boolean;
  onPress: () => void;
};

export default function CategoryChip({ etiqueta, activa = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={[styles.chip, activa && styles.chipActiva]}
    >
      <Text style={[styles.texto, activa && styles.textoActivo]}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  chipActiva: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  texto: {
    fontSize: tipografia.sm,
    color: colors.gray,
    fontWeight: "500",
  },
  textoActivo: {
    color: colors.black,
    fontWeight: "700",
  },
});

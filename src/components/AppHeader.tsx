import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Brand from "./Brand";
import { colors } from "../constants/colors";
import { espaciado, radio } from "../constants/theme";

type Props = {
  children?: ReactNode;
  /** Si se provee, muestra un botón de volver a la izquierda. */
  onVolver?: () => void;
};

export default function AppHeader({ children, onVolver }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.seguro}>
      <View style={styles.barra}>
        <View style={styles.izquierda}>
          {!!onVolver && (
            <Pressable
              onPress={onVolver}
              hitSlop={8}
              style={styles.botonVolver}
              accessibilityLabel="Volver"
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
          )}
          <Brand variante="sobreOscuro" tamano={19} />
        </View>
        {!!children && <View style={styles.derecha}>{children}</View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    backgroundColor: colors.black,
  },
  barra: {
    height: 54,
    paddingHorizontal: espaciado.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  izquierda: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },
  botonVolver: {
    width: 34,
    height: 34,
    borderRadius: radio.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dark,
  },
  derecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },
});

import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Brand from "./Brand";
import { colors } from "../constants/colors";
import { espaciado } from "../constants/theme";

type Props = {
  children?: ReactNode;
};

export default function AppHeader({ children }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.seguro}>
      <View style={styles.barra}>
        <Brand variante="sobreOscuro" tamano={19} />
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
  derecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },
});

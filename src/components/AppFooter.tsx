import { StyleSheet, Text, View } from "react-native";
import Brand from "./Brand";
import { colors } from "../constants/colors";
import { espaciado, radio, tipografia } from "../constants/theme";

export default function AppFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.caja}>
        <Brand variante="sobreOscuro" tamano={16} />
        <Text style={styles.linea}>
          © 2026 FerreStock 360. Todos los derechos reservados.
        </Text>
        <Text style={styles.chica}>
          Calle Principal #123 · 01-123-456-7890 · info@ferrestock.com
        </Text>
        <Text style={styles.chica}>Lun - Sáb: 8:00 Am - 6:00 Pm</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.black,
    padding: espaciado.xl,
    marginTop: espaciado.xl,
  },
  caja: {
    gap: espaciado.xs + 2,
    alignItems: "center",
  },
  linea: {
    color: colors.textoSuave,
    fontSize: tipografia.sm,
    textAlign: "center",
    marginTop: espaciado.xs,
  },
  chica: {
    color: colors.gray,
    fontSize: tipografia.xs + 1,
    textAlign: "center",
  },
});

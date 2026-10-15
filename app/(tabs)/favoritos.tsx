import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../src/components/AppHeader";
import { colors } from "../../src/constants/colors";
import { espaciado, radio, tipografia } from "../../src/constants/theme";

export default function FavoritosScreen() {
  return (
    <View style={styles.pantalla}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.circulo}>
          <Ionicons name="heart-outline" size={36} color={colors.yellow} />
        </View>
        <Text style={styles.titulo}>Favoritos</Text>
        <Text style={styles.texto}>
          Esta sección estará disponible en una próxima versión.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contenido: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: espaciado.xxl,
    gap: espaciado.md,
  },
  circulo: {
    width: 88,
    height: 88,
    borderRadius: radio.pill,
    backgroundColor: "rgba(245, 197, 24, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: "700",
    color: colors.black,
  },
  texto: {
    fontSize: tipografia.sm + 1,
    color: colors.textoSecundario,
    textAlign: "center",
  },
});

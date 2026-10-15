import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { radio } from "../constants/theme";

type Props = {
  nombre: keyof typeof Ionicons.glyphMap;
  nombreActivo: keyof typeof Ionicons.glyphMap;
  enfocado: boolean;
  tamano?: number;
};

export default function TabBarIcon({
  nombre,
  nombreActivo,
  enfocado,
  tamano = 18,
}: Props) {
  if (enfocado) {
    return (
      <View style={styles.activo}>
        <Ionicons name={nombreActivo} size={tamano} color={colors.black} />
      </View>
    );
  }

  return <Ionicons name={nombre} size={tamano + 2} color={colors.textoSuave} />;
}

const styles = StyleSheet.create({
  activo: {
    backgroundColor: colors.yellow,
    borderRadius: radio.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

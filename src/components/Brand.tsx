import { StyleSheet, Text, View } from "react-native";

type Variante = "sobreOscuro" | "sobreClaro";

type Props = {
  variante?: Variante;
  tamano?: number;
};

export default function Brand({ variante = "sobreOscuro", tamano = 20 }: Props) {
  const principal = variante === "sobreOscuro" ? "#F5C518" : "#1A1A1A";
  const secundario = variante === "sobreOscuro" ? "#FFFFFF" : "#F5C518";

  return (
    <View style={styles.fila}>
      <Text style={[styles.texto, { color: principal, fontSize: tamano }]}>
        FerreStock
      </Text>
      <Text style={[styles.texto, { color: secundario, fontSize: tamano }]}>
        360
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
  },
  texto: {
    fontWeight: "700",
  },
});

import { useState } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { ALTURA_TOQUE, espaciado, radio, tipografia } from "../constants/theme";

type Props = {
  etiqueta: string;
  valor: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  seguridad?: boolean;
  error?: string | null;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export default function TextField({
  etiqueta,
  valor,
  onChangeText,
  placeholder,
  keyboardType,
  seguridad = false,
  error,
  autoCapitalize = "sentences",
}: Props) {
  const [enFoco, setEnFoco] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View
        style={[
          styles.caja,
          enFoco && styles.cajaFoco,
          !!error && styles.cajaError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textoSuave}
          keyboardType={keyboardType}
          secureTextEntry={seguridad && !visible}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          selectionColor={colors.yellowDark}
          onFocus={() => setEnFoco(true)}
          onBlur={() => setEnFoco(false)}
        />
        {seguridad && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={styles.ojo}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.gray}
            />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs + 2,
  },
  etiqueta: {
    fontSize: tipografia.sm + 1,
    fontWeight: "500",
    color: colors.texto,
  },
  caja: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.sm,
    backgroundColor: colors.white,
    paddingHorizontal: espaciado.md,
    minHeight: ALTURA_TOQUE,
  },
  cajaFoco: {
    borderColor: colors.yellow,
    borderWidth: 2,
    paddingHorizontal: espaciado.md - 1,
  },
  cajaError: {
    borderColor: colors.errorBorde,
  },
  input: {
    flex: 1,
    fontSize: tipografia.md,
    color: colors.black,
    paddingVertical: 10,
  },
  ojo: {
    paddingLeft: espaciado.sm,
  },
  error: {
    fontSize: tipografia.sm,
    color: colors.errorTexto,
  },
});

import { Stack } from "expo-router";
import { colors } from "../../src/constants/colors";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="productos"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="categorias"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="usuarios"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

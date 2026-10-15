import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/constants/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.white },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ animation: "slide_from_right" }} />
        <Stack.Screen
          name="register"
          options={{ animation: "slide_from_right" }}
        />
      </Stack>
    </>
  );
}

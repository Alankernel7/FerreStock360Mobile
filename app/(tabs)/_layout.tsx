import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router/js-tabs";
import TabBarIcon from "../../src/components/TabBarIcon";
import { colors } from "../../src/constants/colors";
import { tipografia } from "../../src/constants/theme";

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.black,
          tabBarInactiveTintColor: colors.textoSuave,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.bordeClaro,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: tipografia.xs,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                nombre="home-outline"
                nombreActivo="home"
                enfocado={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="catalogo"
          options={{
            title: "Catálogo",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                nombre="grid-outline"
                nombreActivo="grid"
                enfocado={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="favoritos"
          options={{
            title: "Favoritos",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                nombre="heart-outline"
                nombreActivo="heart"
                enfocado={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                nombre="person-outline"
                nombreActivo="person"
                enfocado={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

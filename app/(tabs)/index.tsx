import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppFooter from "../../src/components/AppFooter";
import AppHeader from "../../src/components/AppHeader";
import Brand from "../../src/components/Brand";
import CategoryChip from "../../src/components/CategoryChip";
import PrimaryButton from "../../src/components/PrimaryButton";
import ProductCard from "../../src/components/ProductCard";
import SectionTitle from "../../src/components/SectionTitle";
import { colors } from "../../src/constants/colors";
import { espaciado, radio, tipografia } from "../../src/constants/theme";
import { CATEGORIAS, PRODUCTOS } from "../../src/data/mockProducts";

const DESTACADOS = PRODUCTOS.slice(0, 5);

export default function InicioScreen() {
  const irACatalogo = (categoria?: number) =>
    router.push({
      pathname: "/catalogo",
      params: categoria !== undefined ? { categoria: String(categoria) } : {},
    });

  return (
    <View style={styles.pantalla}>
      <AppHeader>
        <Pressable
          onPress={() => router.push("/login")}
          hitSlop={8}
          style={styles.botonHeader}
        >
          <Ionicons name="person-outline" size={22} color={colors.white} />
        </Pressable>
      </AppHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.hero}>
          <Brand variante="sobreOscuro" tamano={26} />
          <Text style={styles.heroTexto}>
            Tu ferretería, siempre contigo. Encuentra las mejores herramientas y
            materiales.
          </Text>
          <Text style={styles.heroDatos}>
            {PRODUCTOS.length} productos · {CATEGORIAS.length} categorías
          </Text>
          <PrimaryButton
            titulo="Ver catálogo"
            icono="pricetags-outline"
            onPress={() => irACatalogo()}
            estilo={styles.heroBoton}
          />
        </View>

        <View style={styles.seccion}>
          <SectionTitle titulo="Categorías" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filaScroll}
          >
            {CATEGORIAS.map((c) => (
              <CategoryChip
                key={c.id_categoria}
                etiqueta={c.nombre}
                onPress={() => irACatalogo(c.id_categoria)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.seccion}>
          <SectionTitle
            titulo="Destacados"
            accion="Ver todos"
            onPressAccion={() => irACatalogo()}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filaScroll}
          >
            {DESTACADOS.map((p) => (
              <ProductCard
                key={p.id_producto}
                producto={p}
                ancho={160}
              />
            ))}
          </ScrollView>
        </View>

        <AppFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.white,
  },
  botonHeader: {
    width: 40,
    height: 40,
    borderRadius: radio.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dark,
  },
  contenido: {
    paddingBottom: espaciado.xl,
  },
  hero: {
    backgroundColor: colors.black,
    marginHorizontal: espaciado.lg,
    marginTop: espaciado.lg,
    borderRadius: radio.lg,
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  heroTexto: {
    color: colors.textoSuave,
    fontSize: tipografia.sm + 1,
    lineHeight: 20,
  },
  heroDatos: {
    color: colors.gray,
    fontSize: tipografia.xs + 1,
    fontWeight: "500",
  },
  heroBoton: {
    marginTop: espaciado.xs,
  },
  seccion: {
    marginTop: espaciado.xl,
    gap: espaciado.md,
  },
  filaScroll: {
    paddingHorizontal: espaciado.lg,
    gap: espaciado.md,
    paddingVertical: espaciado.xs,
  },
});

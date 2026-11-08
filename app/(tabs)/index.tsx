import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppFooter from "../../src/components/AppFooter";
import AppHeader from "../../src/components/AppHeader";
import Banner from "../../src/components/Banner";
import Brand from "../../src/components/Brand";
import CategoryChip from "../../src/components/CategoryChip";
import EstadoVacio from "../../src/components/EstadoVacio";
import PrimaryButton from "../../src/components/PrimaryButton";
import ProductCard from "../../src/components/ProductCard";
import SectionTitle from "../../src/components/SectionTitle";
import { colors } from "../../src/constants/colors";
import { espaciado, radio, tipografia } from "../../src/constants/theme";
import { useAuth } from "../../src/contexts/AuthContext";
import { useProductos } from "../../src/hooks/useProductos";

export default function InicioScreen() {
  const { usuario } = useAuth();
  const { productos, categorias, cargando, error } = useProductos();

  const destacados = productos.slice(0, 5);
  const nombreCorto = usuario?.nombre.trim().split(" ")[0];

  const irACatalogo = (categoria?: number) =>
    router.push({
      pathname: "/catalogo",
      params: categoria !== undefined ? { categoria: String(categoria) } : {},
    });

  return (
    <View style={styles.pantalla}>
      <AppHeader>
        <Pressable
          onPress={() => router.push(usuario ? "/perfil" : "/login")}
          hitSlop={8}
          style={styles.botonHeader}
          accessibilityLabel={usuario ? "Mi perfil" : "Iniciar sesión"}
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
          {!!nombreCorto && (
            <Text style={styles.saludo}>Hola, {nombreCorto}</Text>
          )}
          <Text style={styles.heroTexto}>
            Tu ferretería, siempre contigo. Encuentra las mejores herramientas y
            materiales.
          </Text>
          <Text style={styles.heroDatos}>
            {cargando
              ? "Cargando productos..."
              : `${productos.length} productos · ${categorias.length} categorías`}
          </Text>
          <PrimaryButton
            titulo="Ver catálogo"
            icono="pricetags-outline"
            onPress={() => irACatalogo()}
            estilo={styles.heroBoton}
          />
        </View>

        {!!error && (
          <View style={styles.zonaAvisos}>
            <Banner tipo="error" texto={error} />
          </View>
        )}

        {cargando ? (
          <EstadoVacio tipo="carga" texto="Cargando categorías y destacados..." />
        ) : (
          <>
            <View style={styles.seccion}>
              <SectionTitle titulo="Categorías" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filaScroll}
              >
                {categorias.map((c) => (
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
              {destacados.length === 0 ? (
                <EstadoVacio texto="No hay productos destacados." />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filaScroll}
                >
                  {destacados.map((p) => (
                    <ProductCard
                      key={String(p.id_producto)}
                      producto={p}
                      ancho={160}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}

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
  saludo: {
    color: colors.yellow,
    fontSize: tipografia.md,
    fontWeight: "700",
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
  zonaAvisos: {
    marginHorizontal: espaciado.lg,
    marginTop: espaciado.md,
    gap: espaciado.sm,
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

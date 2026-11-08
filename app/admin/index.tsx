import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppFooter from "../../src/components/AppFooter";
import AppHeader from "../../src/components/AppHeader";
import Banner from "../../src/components/Banner";
import EstadoVacio from "../../src/components/EstadoVacio";
import PrimaryButton from "../../src/components/PrimaryButton";
import { colors } from "../../src/constants/colors";
import { espaciado, radio, tipografia } from "../../src/constants/theme";
import { useAuth } from "../../src/contexts/AuthContext";
import { useAdminCatalogo } from "../../src/hooks/useAdminCatalogo";
import { mensajeErrorFirebase } from "../../src/utils/firebaseErrors";

type Resumen = {
  etiqueta: string;
  valor: number;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function AdminDashboardScreen() {
  const { usuario, cerrarSesion } = useAuth();
  const { productos, categorias, totalUsuarios, cargando, error } =
    useAdminCatalogo();

  const activos = productos.filter((p) => p.estado).length;
  const inactivos = productos.filter((p) => !p.estado).length;

  const resumen: Resumen[] = [
    {
      etiqueta: "Productos",
      valor: productos.length,
      icono: "cube-outline",
      color: colors.yellowDark,
    },
    {
      etiqueta: "Categorías",
      valor: categorias.length,
      icono: "pricetags-outline",
      color: colors.yellowDark,
    },
    {
      etiqueta: "Usuarios",
      valor: totalUsuarios,
      icono: "people-outline",
      color: colors.yellowDark,
    },
    {
      etiqueta: "Productos activos",
      valor: activos,
      icono: "checkmark-circle-outline",
      color: colors.badgeVerdeTexto,
    },
    {
      etiqueta: "Productos inactivos",
      valor: inactivos,
      icono: "alert-circle-outline",
      color: colors.dangerTexto,
    },
  ];

  const volver = () =>
    router.canGoBack() ? router.back() : router.replace("/perfil");

  const confirmarCierre = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar tu sesión en FerreStock360?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await cerrarSesion();
            } catch (e) {
              Alert.alert("Cerrar sesión", mensajeErrorFirebase(e));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.pantalla}>
      <AppHeader onVolver={volver} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.heroTitulo}>Panel administrativo</Text>
            <Text style={styles.heroSubtitulo}>
              {usuario ? `Hola, ${usuario.nombre}` : "Gestión de FerreStock360"}
            </Text>
          </View>
          <View style={styles.badgeRol}>
            <Text style={styles.badgeRolTexto}>Admin</Text>
          </View>
        </View>

        {!!error && (
          <View style={styles.avisos}>
            <Banner tipo="error" texto={error} />
          </View>
        )}

        <Text style={styles.seccionTitulo}>Resumen general</Text>

        {cargando ? (
          <EstadoVacio tipo="carga" texto="Cargando resumen..." />
        ) : (
          <View style={styles.cuadricula}>
            {resumen.map((item) => (
              <View key={item.etiqueta} style={styles.tarjetaResumen}>
                <View style={styles.iconoCirculo}>
                  <Ionicons name={item.icono} size={20} color={item.color} />
                </View>
                <Text style={styles.valor}>{item.valor}</Text>
                <Text style={styles.etiqueta}>{item.etiqueta}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.seccionTitulo}>Gestión</Text>

        <View style={styles.menu}>
          <FilaMenu
            icono="cube-outline"
            texto="Gestión de productos"
            onPress={() => router.push("/admin/productos")}
          />
          <FilaMenu
            icono="pricetags-outline"
            texto="Gestión de categorías"
            onPress={() => router.push("/admin/categorias")}
          />
          <FilaMenu
            icono="people-outline"
            texto="Gestión de usuarios"
            onPress={() => router.push("/admin/usuarios")}
          />
        </View>

        <PrimaryButton
          titulo="Ver catálogo"
          icono="storefront-outline"
          variante="contorno"
          onPress={() => router.push("/catalogo")}
        />

        <Pressable style={styles.filaSalir} onPress={confirmarCierre}>
          <Ionicons name="log-out-outline" size={20} color={colors.dangerTexto} />
          <Text style={styles.salirTexto}>Cerrar sesión</Text>
        </Pressable>

        <AppFooter />
      </ScrollView>
    </View>
  );
}

function FilaMenu({
  icono,
  texto,
  onPress,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  texto: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.filaMenu} onPress={onPress}>
      <View style={styles.filaMenuIzq}>
        <View style={styles.iconoCirculo}>
          <Ionicons name={icono} size={20} color={colors.yellowDark} />
        </View>
        <Text style={styles.filaMenuTexto}>{texto}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textoSuave} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contenido: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xl,
    gap: espaciado.lg,
  },
  hero: {
    backgroundColor: colors.black,
    borderRadius: radio.lg,
    padding: espaciado.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
  },
  heroTitulo: {
    color: colors.white,
    fontSize: tipografia.lg,
    fontWeight: "700",
  },
  heroSubtitulo: {
    color: colors.textoSuave,
    fontSize: tipografia.sm,
    marginTop: 2,
  },
  badgeRol: {
    backgroundColor: colors.yellow,
    borderRadius: radio.pill,
    paddingHorizontal: espaciado.md,
    paddingVertical: 4,
  },
  badgeRolTexto: {
    color: colors.black,
    fontSize: tipografia.xs + 1,
    fontWeight: "700",
  },
  avisos: {
    gap: espaciado.sm,
  },
  seccionTitulo: {
    fontSize: tipografia.md,
    fontWeight: "700",
    color: colors.black,
  },
  cuadricula: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.md,
  },
  tarjetaResumen: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.bordeClaro,
    borderRadius: radio.md,
    padding: espaciado.lg,
    gap: espaciado.xs,
  },
  iconoCirculo: {
    width: 38,
    height: 38,
    borderRadius: radio.pill,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
  },
  valor: {
    fontSize: tipografia.xxl,
    fontWeight: "700",
    color: colors.black,
    marginTop: espaciado.xs,
  },
  etiqueta: {
    fontSize: tipografia.sm,
    color: colors.textoSecundario,
  },
  menu: {
    borderWidth: 1,
    borderColor: colors.bordeClaro,
    borderRadius: radio.md,
    overflow: "hidden",
  },
  filaMenu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bordeClaro,
    backgroundColor: colors.white,
  },
  filaMenuIzq: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },
  filaMenuTexto: {
    fontSize: tipografia.sm + 1,
    fontWeight: "600",
    color: colors.black,
  },
  filaSalir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.sm,
    borderWidth: 1,
    borderColor: colors.errorBorde,
    backgroundColor: colors.errorBg,
    borderRadius: radio.md,
    paddingVertical: espaciado.md,
  },
  salirTexto: {
    fontSize: tipografia.sm + 1,
    fontWeight: "700",
    color: colors.dangerTexto,
  },
});

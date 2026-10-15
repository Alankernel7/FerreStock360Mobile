import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppFooter from "../../src/components/AppFooter";
import AppHeader from "../../src/components/AppHeader";
import CategoryChip from "../../src/components/CategoryChip";
import EstadoVacio from "../../src/components/EstadoVacio";
import ProductCard from "../../src/components/ProductCard";
import { colors } from "../../src/constants/colors";
import {
  ALTURA_TOQUE,
  espaciado,
  radio,
  tipografia,
} from "../../src/constants/theme";
import { CATEGORIAS, PRODUCTOS } from "../../src/data/mockProducts";
import { Producto } from "../../src/types";

type Orden = "default" | "precioAsc" | "precioDesc";

const ETIQUETAS_ORDEN: Record<Orden, string> = {
  default: "Orden predeterminado",
  precioAsc: "Precio: menor a mayor",
  precioDesc: "Precio: mayor a menor",
};

const sinTildes = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function CatalogoScreen() {
  const params = useLocalSearchParams<{ categoria?: string }>();

  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<number | null>(
    params.categoria !== undefined ? Number(params.categoria) : null
  );
  const [orden, setOrden] = useState<Orden>("default");
  const [modalOrden, setModalOrden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (params.categoria !== undefined) {
      setCategoria(Number(params.categoria));
    }
  }, [params.categoria]);

  const productos = useMemo(() => {
    const texto = sinTildes(busqueda.trim());

    let lista: Producto[] = PRODUCTOS.filter((p) => {
      const coincideCategoria =
        categoria === null || p.id_categoria === categoria;
      const coincideBusqueda =
        texto === "" ||
        sinTildes(p.nombre).includes(texto) ||
        sinTildes(p.codigo).includes(texto);
      return coincideCategoria && coincideBusqueda;
    });

    if (orden === "precioAsc") {
      lista = [...lista].sort((a, b) => a.precio - b.precio);
    } else if (orden === "precioDesc") {
      lista = [...lista].sort((a, b) => b.precio - a.precio);
    }

    return lista;
  }, [busqueda, categoria, orden]);

  const hayFiltro = busqueda.trim() !== "" || categoria !== null;

  const cabecera = (
    <View style={styles.zonaControles}>
      <Text style={styles.titulo}>Catálogo</Text>

      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={18} color={colors.textoSuave} />
        <TextInput
          style={styles.buscadorInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre o código..."
          placeholderTextColor={colors.textoSuave}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={colors.yellowDark}
          returnKeyType="search"
        />
        {busqueda !== "" && (
          <Pressable onPress={() => setBusqueda("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textoSuave}
            />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <CategoryChip
          etiqueta="Todas"
          activa={categoria === null}
          onPress={() => setCategoria(null)}
        />
        {CATEGORIAS.map((c) => (
          <CategoryChip
            key={c.id_categoria}
            etiqueta={c.nombre}
            activa={categoria === c.id_categoria}
            onPress={() =>
              setCategoria((actual) =>
                actual === c.id_categoria ? null : c.id_categoria
              )
            }
          />
        ))}
      </ScrollView>

      <View style={styles.barra}>
        <Text style={styles.contador}>
          {productos.length} productos encontrados
        </Text>
        <Pressable
          style={styles.botonOrden}
          onPress={() => setModalOrden(true)}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={16}
            color={colors.black}
          />
          <Text style={styles.botonOrdenTexto}>Ordenar</Text>
        </Pressable>
      </View>
    </View>
  );

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

      <FlatList
        data={cargando ? [] : productos}
        keyExtractor={(item) => String(item.id_producto)}
        numColumns={2}
        columnWrapperStyle={styles.filaLista}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => <ProductCard producto={item} />}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={
          cargando ? (
            <EstadoVacio tipo="carga" texto="Cargando productos..." />
          ) : (
            <EstadoVacio
              texto={
                hayFiltro
                  ? "No se encontraron productos."
                  : "No hay productos disponibles."
              }
            />
          )
        }
        ListFooterComponent={<AppFooter />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalOrden}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOrden(false)}
      >
        <Pressable
          style={styles.modalFondo}
          onPress={() => setModalOrden(false)}
        >
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Ordenar por</Text>
            {(Object.keys(ETIQUETAS_ORDEN) as Orden[]).map((opcion) => (
              <Pressable
                key={opcion}
                style={styles.modalOpcion}
                onPress={() => {
                  setOrden(opcion);
                  setModalOrden(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOpcionTexto,
                    orden === opcion && styles.modalOpcionActiva,
                  ]}
                >
                  {ETIQUETAS_ORDEN[opcion]}
                </Text>
                {orden === opcion && (
                  <Ionicons name="checkmark" size={18} color={colors.black} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  lista: {
    paddingBottom: 0,
  },
  filaLista: {
    gap: espaciado.md,
    paddingHorizontal: espaciado.lg,
    marginBottom: espaciado.md,
  },
  zonaControles: {
    padding: espaciado.lg,
    gap: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bordeClaro,
  },
  titulo: {
    fontSize: tipografia.xl + 3,
    fontWeight: "700",
    color: colors.black,
  },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.sm,
    paddingHorizontal: espaciado.md,
    minHeight: ALTURA_TOQUE - 4,
    backgroundColor: colors.white,
  },
  buscadorInput: {
    flex: 1,
    fontSize: tipografia.sm + 1,
    color: colors.black,
    paddingVertical: 10,
  },
  chips: {
    gap: espaciado.sm,
    paddingRight: espaciado.sm,
  },
  barra: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
  },
  contador: {
    fontSize: tipografia.sm,
    color: colors.textoSecundario,
    flexShrink: 1,
  },
  botonOrden: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.sm,
    paddingVertical: 9,
    paddingHorizontal: espaciado.md,
    backgroundColor: colors.white,
  },
  botonOrdenTexto: {
    fontSize: tipografia.sm,
    color: colors.black,
    fontWeight: "600",
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalCaja: {
    backgroundColor: colors.white,
    borderRadius: radio.md,
    padding: espaciado.xl,
    gap: espaciado.xs,
  },
  modalTitulo: {
    fontSize: tipografia.md + 1,
    fontWeight: "700",
    color: colors.black,
    marginBottom: espaciado.sm,
  },
  modalOpcion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.bordeClaro,
  },
  modalOpcionTexto: {
    fontSize: tipografia.sm + 1,
    color: colors.textoSecundario,
  },
  modalOpcionActiva: {
    color: colors.black,
    fontWeight: "600",
  },
});

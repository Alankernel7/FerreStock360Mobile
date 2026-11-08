import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AppFooter from "../../src/components/AppFooter";
import AppHeader from "../../src/components/AppHeader";
import EstadoVacio from "../../src/components/EstadoVacio";
import ProductCard from "../../src/components/ProductCard";
import { colors } from "../../src/constants/colors";
import { espaciado, radio, tipografia } from "../../src/constants/theme";
import { useAuth } from "../../src/contexts/AuthContext";
import { useFavoritos } from "../../src/hooks/useFavoritos";
import type { Producto } from "../../src/types";
import { mensajeErrorFirebase } from "../../src/utils/firebaseErrors";

/** Convierte el snapshot de Firestore a un Producto para la tarjeta. */
function aProductoDelFavorito(favorito: {
  producto_id: string | number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  stock_actual: number;
  stock_minimo: number;
  categoria: string;
}): Producto {
  return {
    id_producto: favorito.producto_id,
    nombre: favorito.nombre,
    descripcion: null,
    codigo: "",
    precio: favorito.precio,
    imagen_url: favorito.imagen_url,
    stock_actual: favorito.stock_actual,
    stock_minimo: favorito.stock_minimo,
    id_categoria: 0,
    estado: true,
    fecha_creacion: "",
  };
}

export default function FavoritosScreen() {
  const { usuario } = useAuth();
  const { favoritos, cargando, error, recargar, alternar } = useFavoritos(
    usuario?.uid ?? null
  );

  const productos = favoritos.map((f) => ({
    id: f.id,
    producto: aProductoDelFavorito(f),
  }));

  const quitarFavorito = async (id: string) => {
    try {
      const favorito = favoritos.find((f) => f.id === id);
      if (!favorito) return;
      await alternar(aProductoDelFavorito(favorito));
    } catch (e) {
      Alert.alert("Favoritos", mensajeErrorFirebase(e));
    }
  };

  return (
    <View style={styles.pantalla}>
      <AppHeader />
      <FlatList
        data={cargando ? [] : productos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.filaLista}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <ProductCard
            producto={item.producto}
            favorito
            onAlternarFavorito={() => quitarFavorito(item.id)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.cabecera}>
            <Text style={styles.titulo}>Favoritos</Text>
            <Text style={styles.subtitulo}>
              {cargando
                ? "Cargando tus favoritos..."
                : `${favoritos.length} producto${favoritos.length === 1 ? "" : "s"} guardado${favoritos.length === 1 ? "" : "s"}`}
            </Text>
            {!!error && (
              <View style={styles.zonaAviso}>
                <EstadoVacio
                  tipo="error"
                  texto={error}
                />
                <Pressable onPress={recargar} hitSlop={8}>
                  <Text style={styles.reintentar}>Reintentar</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <EstadoVacio tipo="carga" texto="Cargando favoritos..." />
          ) : error ? undefined : (
            <EstadoVacio
              icono="heart-outline"
              texto="Aún no tienes favoritos. Toca el corazón de un producto en el catálogo para guardarlo."
            />
          )
        }
        ListFooterComponent={<AppFooter />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.white,
  },
  lista: {
    paddingBottom: espaciado.xl,
  },
  cabecera: {
    padding: espaciado.lg,
    paddingBottom: espaciado.md,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.xl + 3,
    fontWeight: "700",
    color: colors.black,
  },
  subtitulo: {
    fontSize: tipografia.sm + 1,
    color: colors.textoSecundario,
  },
  zonaAviso: {
    alignItems: "center",
    gap: espaciado.sm,
    marginTop: espaciado.sm,
  },
  reintentar: {
    fontSize: tipografia.sm,
    fontWeight: "600",
    color: colors.yellowDark,
  },
  filaLista: {
    gap: espaciado.md,
    paddingHorizontal: espaciado.lg,
    marginBottom: espaciado.md,
  },
});

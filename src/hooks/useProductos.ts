import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { obtenerCategorias, obtenerProductos } from "../services/firestoreService";
import type { Categoria, Producto } from "../types";

type Resultado = {
  productos: Producto[];
  categorias: Categoria[];
  cargando: boolean;
  /** Mensaje de error si la consulta a Firestore falló. */
  error: string | null;
  recargar: () => Promise<void>;
};

/**
 * Carga productos y categorías desde Firestore (fuente de verdad del catálogo).
 * Se recarga al recibir el foco para reflejar los cambios del administrador
 * sin reiniciar la aplicación.
 */
export function useProductos(): Resultado {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    const [resultadoProductos, resultadoCategorias] = await Promise.all([
      obtenerProductos(),
      obtenerCategorias(),
    ]);
    setProductos(resultadoProductos.productos);
    setError(resultadoProductos.error ?? resultadoCategorias.error);
    setCategorias(resultadoCategorias.categorias);
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar])
  );

  return { productos, categorias, cargando, error, recargar };
}

import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  contarUsuarios,
  obtenerCategorias,
  obtenerProductos,
} from "../services/firestoreService";
import type { Categoria, Producto } from "../types";

type Resultado = {
  /** Todos los productos, incluidos los inactivos (vista administrativa). */
  productos: Producto[];
  categorias: Categoria[];
  /** Total de usuarios registrados en Firestore. */
  totalUsuarios: number;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
};

/**
 * Catálogo completo para el panel administrativo (productos inactivos incluidos).
 * Se recarga al recibir el foco para mantener el resumen actualizado.
 */
export function useAdminCatalogo(): Resultado {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    const [resultadoProductos, resultadoCategorias, usuarios] =
      await Promise.all([
        obtenerProductos(true),
        obtenerCategorias(),
        // El conteo es informativo: si falla no debe romper el resumen.
        contarUsuarios().catch(() => 0),
      ]);
    setProductos(resultadoProductos.productos);
    setError(resultadoProductos.error ?? resultadoCategorias.error);
    setCategorias(resultadoCategorias.categorias);
    setTotalUsuarios(usuarios);
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar])
  );

  return { productos, categorias, totalUsuarios, cargando, error, recargar };
}

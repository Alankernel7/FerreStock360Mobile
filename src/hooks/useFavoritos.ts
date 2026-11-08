import { useCallback, useEffect, useMemo, useState } from "react";
import { alternarFavorito, obtenerFavoritos } from "../services/firestoreService";
import type { Favorito, Producto } from "../types";

type Resultado = {
  favoritos: Favorito[];
  /** Conjunto de ids de producto (como string) marcados como favoritos. */
  idsFavoritos: Set<string>;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  /** Agrega o quita el producto; devuelve true si quedó agregado. */
  alternar: (producto: Producto, categoriaNombre?: string) => Promise<boolean>;
};

/**
 * Favoritos del usuario autenticado, persistidos en Firestore
 * y separados por usuario.
 */
export function useFavoritos(uid: string | null | undefined): Resultado {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [cargando, setCargando] = useState(Boolean(uid));
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!uid) {
      setFavoritos([]);
      setCargando(false);
      setError(null);
      return;
    }
    setCargando(true);
    try {
      const lista = await obtenerFavoritos(uid);
      setFavoritos(lista);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "No se pudieron cargar tus favoritos."
      );
    } finally {
      setCargando(false);
    }
  }, [uid]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const idsFavoritos = useMemo(
    () => new Set(favoritos.map((f) => String(f.producto_id))),
    [favoritos]
  );

  const alternar = useCallback(
    async (producto: Producto, categoriaNombre = ""): Promise<boolean> => {
      if (!uid) {
        throw new Error("Inicia sesión para guardar favoritos.");
      }
      const resultado = await alternarFavorito(uid, producto, categoriaNombre);
      await recargar();
      return resultado.agregado;
    },
    [uid, recargar]
  );

  return { favoritos, idsFavoritos, cargando, error, recargar, alternar };
}

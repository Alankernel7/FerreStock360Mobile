import { useCallback, useEffect, useState } from "react";
import { obtenerHistorial } from "../services/firestoreService";
import type { Actividad } from "../types";

type Resultado = {
  actividades: Actividad[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
};

/**
 * Historial de acciones del usuario autenticado (colección activity_history).
 */
export function useHistorial(uid: string | null | undefined): Resultado {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(Boolean(uid));
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!uid) {
      setActividades([]);
      setCargando(false);
      setError(null);
      return;
    }
    setCargando(true);
    try {
      const lista = await obtenerHistorial(uid);
      setActividades(lista);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "No se pudo cargar el historial."
      );
    } finally {
      setCargando(false);
    }
  }, [uid]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { actividades, cargando, error, recargar };
}

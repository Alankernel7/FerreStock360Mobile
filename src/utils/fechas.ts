const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const rellenar = (n: number): string => String(n).padStart(2, "0");

/**
 * Formatea una fecha ISO como "12 mar 2026, 14:35".
 * Evita depender de Intl (Hermes puede tener soporte limitado).
 */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}, ${rellenar(
    fecha.getHours()
  )}:${rellenar(fecha.getMinutes())}`;
}

/**
 * Pobla Firestore con categorías y productos de DEMOSTRACIÓN de FerreStock360.
 *
 * Uso:
 *   npm run seed -- --cuenta=C:\ruta\a\tu-service-account.json
 *   (o definiendo la variable de entorno GOOGLE_APPLICATION_CREDENTIALS)
 *
 * Los documentos se escriben con `fuente: "demo"` para identificarlos
 * claramente como datos de demostración. Ejecutarlo es idempotente:
 * sobrescribe los mismos documentos si se vuelve a correr.
 *
 * NOTA: requiere permisos de escritura (Service Account o reglas abiertas
 * temporalmente). No commitear el archivo de credenciales al repositorio.
 */
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const FUENTE = "demo";

const CATEGORIAS = [
  { id_categoria: 1, nombre: "Herramientas", descripcion: "Herramientas manuales y eléctricas" },
  { id_categoria: 2, nombre: "Pintura", descripcion: "Pinturas y accesorios" },
  { id_categoria: 3, nombre: "Plomería", descripcion: "Tuberías y accesorios de plomería" },
  { id_categoria: 4, nombre: "Electricidad", descripcion: "Cables e instalaciones eléctricas" },
  { id_categoria: 5, nombre: "Construcción", descripcion: "Materiales de construcción" },
  { id_categoria: 6, nombre: "Jardín", descripcion: "Herramientas y accesorios de jardín" },
];

const PRODUCTOS = [
  { codigo: "HER-010", nombre: "Taladro inalámbrico", descripcion: "Taladro inalámbrico 18V con batería y maletín.", precio: 1299.0, categoria_id: 1, stock_actual: 15, stock_minimo: 5, fecha: "2026-01-10" },
  { codigo: "HER-011", nombre: "Martillo profesional", descripcion: "Martillo de uña con mango de fibra.", precio: 249.5, categoria_id: 1, stock_actual: 30, stock_minimo: 10, fecha: "2026-01-10" },
  { codigo: "HER-012", nombre: "Sierra circular", descripcion: "Sierra circular 7-1/4 pulgadas, 1500W.", precio: 1899.0, categoria_id: 1, stock_actual: 8, stock_minimo: 3, fecha: "2026-01-12" },
  { codigo: "HER-013", nombre: "Juego de destornilladores", descripcion: "Set de 6 destornilladores Phillips y planos.", precio: 189.9, categoria_id: 1, stock_actual: 45, stock_minimo: 15, fecha: "2026-01-12" },
  { codigo: "PIN-020", nombre: "Pintura blanca 1L", descripcion: "Pintura vinílica blanca interior/exterior.", precio: 159.0, categoria_id: 2, stock_actual: 60, stock_minimo: 20, fecha: "2026-01-15" },
  { codigo: "PIN-021", nombre: "Rodillo para pintura", descripcion: "Rodillo de lana 9 pulgadas con soporte.", precio: 79.9, categoria_id: 2, stock_actual: 4, stock_minimo: 10, fecha: "2026-01-15" },
  { codigo: "PLO-030", nombre: 'Tubo PVC 1/2" (2m)', descripcion: "Tubo de PVC hidráulico de 2 metros.", precio: 65.0, categoria_id: 3, stock_actual: 80, stock_minimo: 25, fecha: "2026-01-18" },
  { codigo: "ELE-040", nombre: "Cable eléctrico 2.5mm (100m)", descripcion: "Bobina de cable calibre 2.5mm.", precio: 420.0, categoria_id: 4, stock_actual: 22, stock_minimo: 8, fecha: "2026-01-20" },
  { codigo: "CON-050", nombre: "Cemento gris 25kg", descripcion: "Saco de cemento gris estructural.", precio: 120.0, categoria_id: 5, stock_actual: 100, stock_minimo: 30, fecha: "2026-01-22" },
  { codigo: "JAR-060", nombre: "Pala de jardín", descripcion: "Pala recta con mango de madera.", precio: 210.0, categoria_id: 6, stock_actual: 18, stock_minimo: 6, fecha: "2026-01-25" },
];

function rutaCuenta() {
  const argumento = process.argv.find((a) => a.startsWith("--cuenta="));
  if (argumento) return argumento.slice("--cuenta=".length);
  return process.env.GOOGLE_APPLICATION_CREDENTIALS ?? null;
}

async function main() {
  const ruta = rutaCuenta();

  if (ruta) {
    const cuenta = JSON.parse(readFileSync(ruta, "utf8"));
    initializeApp({ credential: cert(cuenta) });
    console.log(`Credenciales: ${ruta}`);
  } else {
    // Application Default Credentials (variable GOOGLE_APPLICATION_CREDENTIALS
    // o configuración de gcloud).
    initializeApp();
    console.log("Usando Application Default Credentials.");
  }

  const db = getFirestore();

  const lote = db.batch();

  for (const categoria of CATEGORIAS) {
    const referencia = db.collection("categories").doc(String(categoria.id_categoria));
    lote.set(referencia, { ...categoria, fuente: FUENTE, actualizado_en: Timestamp.now() });
  }

  for (const producto of PRODUCTOS) {
    const categoria = CATEGORIAS.find((c) => c.id_categoria === producto.categoria_id);
    const referencia = db.collection("products").doc(producto.codigo);
    lote.set(referencia, {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      codigo: producto.codigo,
      precio: producto.precio,
      categoria: categoria?.nombre ?? "Sin categoría",
      categoria_id: producto.categoria_id,
      imagen_url: null,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      estado: true,
      fecha_creacion: Timestamp.fromDate(new Date(producto.fecha)),
      fuente: FUENTE,
      actualizado_en: Timestamp.now(),
    });
  }

  await lote.commit();

  console.log(
    `Listo: ${CATEGORIAS.length} categorías y ${PRODUCTOS.length} productos (fuente: "${FUENTE}") escritos en Firestore.`
  );
}

main().catch((error) => {
  console.error("Error al poblar Firestore:", error);
  process.exitCode = 1;
});

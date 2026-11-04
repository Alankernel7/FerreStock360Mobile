import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { dbFirestore, firebaseConfigurado } from "../config/firebase";
import { CATEGORIAS, PRODUCTOS } from "../data/mockProducts";
import type {
  Actividad,
  Categoria,
  Favorito,
  PerfilUsuario,
  Producto,
  ProductoId,
  ProveedorAuth,
  Rol,
  TipoActividad,
} from "../types";

const COLECCIONES = {
  usuarios: "users",
  productos: "products",
  categorias: "categories",
  favoritos: "favorites",
  historial: "activity_history",
} as const;

const ROL_INICIAL: Rol = "usuario";

function obtenerDb() {
  if (!dbFirestore) {
    throw new Error(
      "Firebase no está configurado. Completa las variables de entorno en .env (ver .env.example)."
    );
  }
  return dbFirestore;
}

/** Convierte Timestamp de Firestore (o string) a fecha ISO 8601. */
function aISO(valor: unknown, respaldo?: string): string {
  if (
    valor &&
    typeof valor === "object" &&
    "toDate" in valor &&
    typeof (valor as { toDate: () => Date }).toDate === "function"
  ) {
    return (valor as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof valor === "string" && valor.trim() !== "") {
    const fecha = new Date(valor);
    if (!Number.isNaN(fecha.getTime())) return fecha.toISOString();
  }
  return respaldo ?? new Date().toISOString();
}

function aNumero(valor: unknown, respaldo = 0): number {
  return typeof valor === "number" && !Number.isNaN(valor) ? valor : respaldo;
}

function aTexto(valor: unknown, respaldo = ""): string {
  return typeof valor === "string" ? valor : respaldo;
}

function aBooleano(valor: unknown, respaldo = true): boolean {
  return typeof valor === "boolean" ? valor : respaldo;
}

function mapearPerfil(snapshot: QueryDocumentSnapshot<DocumentData>): PerfilUsuario {
  const data = snapshot.data();
  return {
    uid: snapshot.id,
    nombre: aTexto(data.nombre),
    email: aTexto(data.email),
    rol: (data.rol as Rol) ?? ROL_INICIAL,
    estado: data.estado === "inactivo" ? "inactivo" : "activo",
    fecha_creacion: aISO(data.fecha_creacion),
    proveedor: data.proveedor === "google" ? "google" : "password",
    foto_url: typeof data.foto_url === "string" ? data.foto_url : null,
  };
}

function mapearProducto(snapshot: QueryDocumentSnapshot<DocumentData>): Producto {
  const data = snapshot.data();
  const nombreCategoria = aTexto(data.categoria);
  const idCategoria = aNumero(
    data.categoria_id,
    CATEGORIAS.find((c) => c.nombre.toLowerCase() === nombreCategoria.toLowerCase())
      ?.id_categoria ?? 0
  );
  return {
    id_producto: snapshot.id,
    nombre: aTexto(data.nombre, "Sin nombre"),
    descripcion: typeof data.descripcion === "string" ? data.descripcion : null,
    codigo: aTexto(data.codigo),
    precio: aNumero(data.precio),
    imagen_url: typeof data.imagen_url === "string" ? data.imagen_url : null,
    stock_actual: aNumero(data.stock_actual),
    stock_minimo: aNumero(data.stock_minimo),
    id_categoria: idCategoria,
    estado: aBooleano(data.estado, true),
    fecha_creacion: aISO(data.fecha_creacion),
  };
}

function mapearCategoria(snapshot: QueryDocumentSnapshot<DocumentData>): Categoria {
  const data = snapshot.data();
  return {
    id_categoria: aNumero(data.id_categoria, Number(snapshot.id) || 0),
    nombre: aTexto(data.nombre, "Sin nombre"),
    descripcion: typeof data.descripcion === "string" ? data.descripcion : null,
  };
}

function mapearFavorito(snapshot: QueryDocumentSnapshot<DocumentData>): Favorito {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    uid: aTexto(data.uid),
    producto_id: (data.producto_id as ProductoId) ?? "",
    nombre: aTexto(data.nombre),
    precio: aNumero(data.precio),
    imagen_url: typeof data.imagen_url === "string" ? data.imagen_url : null,
    stock_actual: aNumero(data.stock_actual),
    stock_minimo: aNumero(data.stock_minimo),
    categoria: aTexto(data.categoria),
    creado_en: aISO(data.creado_en),
  };
}

function mapearActividad(snapshot: QueryDocumentSnapshot<DocumentData>): Actividad {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    uid: aTexto(data.uid),
    tipo: (data.tipo as TipoActividad) ?? "login",
    descripcion: aTexto(data.descripcion),
    fecha: aISO(data.fecha),
  };
}

// ---------------------------------------------------------------------------
// Usuarios (perfil)
// ---------------------------------------------------------------------------

export async function obtenerPerfilUsuario(uid: string): Promise<PerfilUsuario | null> {
  const db = obtenerDb();
  const snapshot = await getDoc(doc(db, COLECCIONES.usuarios, uid));
  if (!snapshot.exists()) return null;
  return mapearPerfil(snapshot as QueryDocumentSnapshot<DocumentData>);
}

/**
 * Crea (o sobrescribe con merge) el documento de perfil del usuario.
 * Se usa al registrarse y al iniciar sesión con Google.
 */
export async function crearPerfilUsuario(
  user: User,
  opciones?: { nombre?: string; proveedor?: ProveedorAuth; rol?: Rol }
): Promise<PerfilUsuario> {
  const db = obtenerDb();
  const nombre =
    opciones?.nombre?.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "Usuario";

  const perfil: PerfilUsuario = {
    uid: user.uid,
    nombre,
    email: user.email ?? "",
    rol: opciones?.rol ?? ROL_INICIAL,
    estado: "activo",
    fecha_creacion: new Date().toISOString(),
    proveedor: opciones?.proveedor ?? "password",
    foto_url: user.photoURL ?? null,
  };

  await setDoc(
    doc(db, COLECCIONES.usuarios, user.uid),
    {
      ...perfil,
      fecha_creacion: serverTimestamp(),
      actualizado_en: serverTimestamp(),
    },
    { merge: true }
  );

  return perfil;
}

/**
 * Garantiza que el usuario autenticado tenga documento de perfil en Firestore.
 * Si no existe, lo crea con la información de Firebase Authentication.
 */
export async function asegurarPerfilUsuario(
  user: User,
  opciones?: { proveedor?: ProveedorAuth }
): Promise<PerfilUsuario | null> {
  try {
    const existente = await obtenerPerfilUsuario(user.uid);
    if (existente) return existente;
    return await crearPerfilUsuario(user, { proveedor: opciones?.proveedor });
  } catch (error) {
    console.warn("[firestore] No se pudo asegurar el perfil del usuario:", error);
    return null;
  }
}

export async function actualizarPerfilUsuario(
  uid: string,
  datos: Partial<Pick<PerfilUsuario, "nombre" | "foto_url">>
): Promise<void> {
  const db = obtenerDb();
  const cambios: DocumentData = { actualizado_en: serverTimestamp() };
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre.trim();
  if (datos.foto_url !== undefined) cambios.foto_url = datos.foto_url;
  await updateDoc(doc(db, COLECCIONES.usuarios, uid), cambios);
}

// ---------------------------------------------------------------------------
// Productos y categorías (catálogo público)
// ---------------------------------------------------------------------------

export type ResultadoCatalogo = {
  productos: Producto[];
  /** true cuando se muestran datos de demostración en lugar de Firestore. */
  esDemo: boolean;
  /** Mensaje de error si la consulta a Firestore falló. */
  error: string | null;
};

/**
 * Consulta los productos activos en Firestore.
 * Si Firestore no está configurado, está vacío o la consulta falla,
 * devuelve los datos de demostración claramente identificados.
 */
export async function obtenerProductos(): Promise<ResultadoCatalogo> {
  if (!firebaseConfigurado || !dbFirestore) {
    return { productos: PRODUCTOS, esDemo: true, error: null };
  }
  try {
    const db = obtenerDb();
    const consulta = query(
      collection(db, COLECCIONES.productos),
      where("estado", "==", true)
    );
    const snapshot = await getDocs(consulta);
    const productos = snapshot.docs.map(mapearProducto);
    if (productos.length === 0) {
      return { productos: PRODUCTOS, esDemo: true, error: null };
    }
    return { productos, esDemo: false, error: null };
  } catch (error) {
    console.warn("[firestore] Error al consultar productos:", error);
    return {
      productos: PRODUCTOS,
      esDemo: true,
      error: "No se pudo consultar Firestore. Mostrando datos de demostración.",
    };
  }
}

/**
 * Consulta las categorías en Firestore; si no hay datos, usa las de demostración.
 */
export async function obtenerCategorias(): Promise<{
  categorias: Categoria[];
  esDemo: boolean;
}> {
  if (!firebaseConfigurado || !dbFirestore) {
    return { categorias: CATEGORIAS, esDemo: true };
  }
  try {
    const db = obtenerDb();
    const snapshot = await getDocs(collection(db, COLECCIONES.categorias));
    if (snapshot.empty) return { categorias: CATEGORIAS, esDemo: true };
    return { categorias: snapshot.docs.map(mapearCategoria), esDemo: false };
  } catch (error) {
    console.warn("[firestore] Error al consultar categorías:", error);
    return { categorias: CATEGORIAS, esDemo: true };
  }
}

// ---------------------------------------------------------------------------
// Favoritos (privados por usuario)
// ---------------------------------------------------------------------------

function idFavorito(uid: string, productoId: ProductoId): string {
  return `${uid}_${String(productoId)}`;
}

/** Consulta los favoritos del usuario autenticado. */
export async function obtenerFavoritos(uid: string): Promise<Favorito[]> {
  const db = obtenerDb();
  const consulta = query(
    collection(db, COLECCIONES.favoritos),
    where("uid", "==", uid)
  );
  const snapshot = await getDocs(consulta);
  return snapshot.docs
    .map(mapearFavorito)
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en));
}

/**
 * Agrega o quita un producto de los favoritos del usuario.
 * Devuelve true si el producto quedó agregado, false si se quitó.
 */
export async function alternarFavorito(
  uid: string,
  producto: Producto
): Promise<{ agregado: boolean }> {
  const db = obtenerDb();
  const referencia = doc(
    db,
    COLECCIONES.favoritos,
    idFavorito(uid, producto.id_producto)
  );
  const snapshot = await getDoc(referencia);

  if (snapshot.exists()) {
    await deleteDoc(referencia);
    return { agregado: false };
  }

  await setDoc(referencia, {
    uid,
    producto_id: String(producto.id_producto),
    nombre: producto.nombre,
    precio: producto.precio,
    imagen_url: producto.imagen_url,
    stock_actual: producto.stock_actual,
    stock_minimo: producto.stock_minimo,
    categoria: categoriaDeProducto(producto),
    creado_en: serverTimestamp(),
  });
  return { agregado: true };
}

function categoriaDeProducto(producto: Producto): string {
  return (
    CATEGORIAS.find((c) => c.id_categoria === producto.id_categoria)?.nombre ??
    "Sin categoría"
  );
}

// ---------------------------------------------------------------------------
// Historial de actividad (privado por usuario)
// ---------------------------------------------------------------------------

/**
 * Registra una acción del usuario en `activity_history`.
 * Es una operación best-effort: un fallo aquí no interrumpe el flujo principal.
 */
export async function registrarActividad(
  uid: string,
  tipo: TipoActividad,
  descripcion: string
): Promise<void> {
  if (!firebaseConfigurado || !dbFirestore) return;
  try {
    const db = obtenerDb();
    await addDoc(collection(db, COLECCIONES.historial), {
      uid,
      tipo,
      descripcion,
      fecha: serverTimestamp(),
    });
  } catch (error) {
    console.warn("[firestore] No se pudo registrar la actividad:", error);
  }
}

/** Consulta el historial de acciones del usuario autenticado. */
export async function obtenerHistorial(uid: string): Promise<Actividad[]> {
  const db = obtenerDb();
  const consulta = query(
    collection(db, COLECCIONES.historial),
    where("uid", "==", uid)
  );
  const snapshot = await getDocs(consulta);
  return snapshot.docs
    .map(mapearActividad)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

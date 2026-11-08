import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
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
import {
  dbFirestore,
  firebaseConfigurado,
  mensajeConfigFirebase,
} from "../config/firebase";
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
  return {
    id_producto: snapshot.id,
    nombre: aTexto(data.nombre, "Sin nombre"),
    descripcion: typeof data.descripcion === "string" ? data.descripcion : null,
    codigo: aTexto(data.codigo),
    precio: aNumero(data.precio),
    imagen_url: typeof data.imagen_url === "string" ? data.imagen_url : null,
    stock_actual: aNumero(data.stock_actual),
    stock_minimo: aNumero(data.stock_minimo),
    id_categoria: aNumero(data.categoria_id),
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
 * Se usa al registrarse y al iniciar sesión con correo y contraseña.
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

export type ResultadoProductos = {
  productos: Producto[];
  /** Mensaje de error si la consulta a Firestore falló. */
  error: string | null;
};

/**
 * Consulta los productos en Firestore (fuente de verdad del catálogo).
 * `incluirInactivos` permite que el panel administrativo vea también los
 * productos con estado inactivo.
 */
export async function obtenerProductos(
  incluirInactivos = false
): Promise<ResultadoProductos> {
  if (!firebaseConfigurado || !dbFirestore) {
    return { productos: [], error: mensajeConfigFirebase };
  }
  try {
    const db = obtenerDb();
    const base = collection(db, COLECCIONES.productos);
    const consulta = incluirInactivos
      ? query(base)
      : query(base, where("estado", "==", true));
    const snapshot = await getDocs(consulta);
    return { productos: snapshot.docs.map(mapearProducto), error: null };
  } catch (error) {
    console.warn("[firestore] Error al consultar productos:", error);
    return {
      productos: [],
      error: "No se pudieron cargar los productos. Revisa tu conexión e intenta de nuevo.",
    };
  }
}

export type ResultadoCategorias = {
  categorias: Categoria[];
  error: string | null;
};

/** Consulta las categorías en Firestore (fuente de verdad del catálogo). */
export async function obtenerCategorias(): Promise<ResultadoCategorias> {
  if (!firebaseConfigurado || !dbFirestore) {
    return { categorias: [], error: mensajeConfigFirebase };
  }
  try {
    const db = obtenerDb();
    const snapshot = await getDocs(collection(db, COLECCIONES.categorias));
    const categorias = snapshot.docs
      .map(mapearCategoria)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    return { categorias, error: null };
  } catch (error) {
    console.warn("[firestore] Error al consultar categorías:", error);
    return {
      categorias: [],
      error: "No se pudieron cargar las categorías. Revisa tu conexión e intenta de nuevo.",
    };
  }
}

/** Campos editables de un producto (los que escribe el administrador). */
export type DatosProducto = {
  nombre: string;
  descripcion: string | null;
  codigo: string;
  precio: number;
  imagen_url: string | null;
  stock_actual: number;
  stock_minimo: number;
  id_categoria: number;
  estado: boolean;
};

/** Crea un producto en Firestore (solo administradores por reglas). */
export async function crearProducto(datos: DatosProducto): Promise<void> {
  const db = obtenerDb();
  await addDoc(collection(db, COLECCIONES.productos), {
    ...datos,
    fecha_creacion: serverTimestamp(),
    actualizado_en: serverTimestamp(),
  });
}

/** Actualiza un producto existente en Firestore. */
export async function actualizarProducto(
  id: ProductoId,
  datos: DatosProducto
): Promise<void> {
  const db = obtenerDb();
  await updateDoc(doc(db, COLECCIONES.productos, String(id)), {
    ...datos,
    actualizado_en: serverTimestamp(),
  });
}

/** Elimina un producto de Firestore. */
export async function eliminarProducto(id: ProductoId): Promise<void> {
  const db = obtenerDb();
  await deleteDoc(doc(db, COLECCIONES.productos, String(id)));
}

/** Campos editables de una categoría. */
export type DatosCategoria = {
  nombre: string;
  descripcion: string | null;
};

/**
 * Crea una categoría con el siguiente `id_categoria` disponible.
 * El id del documento es `String(id_categoria)`, igual que los datos existentes.
 */
export async function crearCategoria(datos: DatosCategoria): Promise<void> {
  const db = obtenerDb();
  const snapshot = await getDocs(collection(db, COLECCIONES.categorias));
  const ids = snapshot.docs
    .map((documento) => Number(documento.id))
    .filter((n) => !Number.isNaN(n));
  const siguiente = (ids.length > 0 ? Math.max(...ids) : 0) + 1;

  await setDoc(doc(db, COLECCIONES.categorias, String(siguiente)), {
    id_categoria: siguiente,
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion,
    actualizado_en: serverTimestamp(),
  });
}

/** Actualiza una categoría existente. */
export async function actualizarCategoria(
  id: number,
  datos: DatosCategoria
): Promise<void> {
  const db = obtenerDb();
  await updateDoc(doc(db, COLECCIONES.categorias, String(id)), {
    id_categoria: id,
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion,
    actualizado_en: serverTimestamp(),
  });
}

/** Elimina una categoría de Firestore. */
export async function eliminarCategoria(id: number): Promise<void> {
  const db = obtenerDb();
  await deleteDoc(doc(db, COLECCIONES.categorias, String(id)));
}

/** Cuenta los productos asociados a una categoría (para advertir antes de borrar). */
export async function contarProductosDeCategoria(
  idCategoria: number
): Promise<number> {
  const db = obtenerDb();
  const resultado = await getCountFromServer(
    query(
      collection(db, COLECCIONES.productos),
      where("categoria_id", "==", idCategoria)
    )
  );
  return resultado.data().count;
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
 * `categoriaNombre` se guarda como snapshot para mostrar en la lista.
 */
export async function alternarFavorito(
  uid: string,
  producto: Producto,
  categoriaNombre = ""
): Promise<{ agregado: boolean }> {
  const db = obtenerDb();
  const referencia = doc(
    db,
    COLECCIONES.favoritos,
    idFavorito(uid, producto.id_producto)
  );

  // La regla de lectura de `favorites` solo autoriza documentos existentes del
  // propio usuario. Consultar un favorito que todavía no existe produce
  // "permission denied", por lo que se interpreta como "no existe" y se crea.
  let existe = false;
  try {
    existe = (await getDoc(referencia)).exists();
  } catch {
    existe = false;
  }

  if (existe) {
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
    categoria: categoriaNombre,
    creado_en: serverTimestamp(),
  });
  return { agregado: true };
}

// ---------------------------------------------------------------------------
// Usuarios (administración)
// ---------------------------------------------------------------------------

/**
 * Lista todos los perfiles de usuario. Requiere que la regla de Firestore
 * permita la lectura a administradores (`allow read: if esAdmin()`).
 */
export async function obtenerUsuarios(): Promise<PerfilUsuario[]> {
  const db = obtenerDb();
  const snapshot = await getDocs(collection(db, COLECCIONES.usuarios));
  return snapshot.docs
    .map(mapearPerfil)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Cuenta los usuarios registrados sin descargar los documentos
 * (indicador del resumen del panel administrativo).
 */
export async function contarUsuarios(): Promise<number> {
  const db = obtenerDb();
  const resultado = await getCountFromServer(
    collection(db, COLECCIONES.usuarios)
  );
  return resultado.data().count;
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

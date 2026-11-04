export type Rol = "admin" | "empleado" | "usuario";

export type EstadoUsuario = "activo" | "inactivo";

export type ProveedorAuth = "password" | "google";

/**
 * Perfil del usuario persistido en la colección `users` de Firestore.
 */
export interface PerfilUsuario {
  uid: string;
  nombre: string;
  email: string;
  rol: Rol;
  estado: EstadoUsuario;
  /** Fecha de creación en formato ISO 8601. */
  fecha_creacion: string;
  proveedor: ProveedorAuth;
  foto_url?: string | null;
}

export type ProductoId = string | number;

export interface Producto {
  id_producto: ProductoId;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  precio: number;
  imagen_url: string | null;
  stock_actual: number;
  stock_minimo: number;
  id_categoria: number;
  estado: boolean;
  fecha_creacion: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
}

/**
 * Documento de la colección `favorites`: snapshot del producto favorito
 * asociado al usuario autenticado.
 */
export interface Favorito {
  /** Id del documento Firestore (`{uid}_{producto_id}`). */
  id: string;
  uid: string;
  producto_id: ProductoId;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  stock_actual: number;
  stock_minimo: number;
  categoria: string;
  /** Fecha en formato ISO 8601. */
  creado_en: string;
}

export type TipoActividad =
  | "registro"
  | "login"
  | "login_google"
  | "logout"
  | "perfil_actualizado"
  | "favorito_agregado"
  | "favorito_quitado";

/**
 * Documento de la colección `activity_history`.
 */
export interface Actividad {
  id: string;
  uid: string;
  tipo: TipoActividad;
  descripcion: string;
  /** Fecha en formato ISO 8601. */
  fecha: string;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: Rol;
}

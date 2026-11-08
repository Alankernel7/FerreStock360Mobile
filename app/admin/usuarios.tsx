import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../src/components/AppHeader";
import Banner from "../../src/components/Banner";
import CategoryChip from "../../src/components/CategoryChip";
import EstadoVacio from "../../src/components/EstadoVacio";
import { colors } from "../../src/constants/colors";
import {
  ALTURA_TOQUE,
  espaciado,
  radio,
  tipografia,
} from "../../src/constants/theme";
import { obtenerUsuarios } from "../../src/services/firestoreService";
import type { EstadoUsuario, PerfilUsuario, Rol } from "../../src/types";

const sinTildes = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

type FiltroRol = "todos" | Rol;
type FiltroEstado = "todos" | EstadoUsuario;

const ROLES: { valor: FiltroRol; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "admin", etiqueta: "Admin" },
  { valor: "empleado", etiqueta: "Empleado" },
  { valor: "usuario", etiqueta: "Usuario" },
];

const ESTADOS: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "activo", etiqueta: "Activos" },
  { valor: "inactivo", etiqueta: "Inactivos" },
];

const ETIQUETA_ROL: Record<Rol, string> = {
  admin: "Admin",
  empleado: "Empleado",
  usuario: "Usuario",
};

const ETIQUETA_PROVEEDOR: Record<PerfilUsuario["proveedor"], string> = {
  password: "Correo y contraseña",
  google: "Google",
};

/** Formatea una fecha ISO como dd/mm/aaaa. */
const formatearFecha = (iso: string) => {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
};

export default function AdminUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<FiltroRol>("todos");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [detalle, setDetalle] = useState<PerfilUsuario | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const lista = await obtenerUsuarios();
      setUsuarios(lista);
      setError(null);
    } catch (e) {
      setUsuarios([]);
      setError(
        "No se pudo cargar la lista de usuarios. Verifica que la regla de Firestore permita la lectura a administradores (allow read: if esAdmin())."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const filtrados = useMemo(() => {
    const texto = sinTildes(busqueda.trim());
    return usuarios.filter((u) => {
      const coincideTexto =
        texto === "" ||
        sinTildes(u.nombre).includes(texto) ||
        sinTildes(u.email).includes(texto);
      const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
      const coincideEstado =
        filtroEstado === "todos" || u.estado === filtroEstado;
      return coincideTexto && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const hayFiltro =
    busqueda.trim() !== "" || filtroRol !== "todos" || filtroEstado !== "todos";

  const volver = () =>
    router.canGoBack() ? router.back() : router.replace("/admin");

  const cabecera = (
    <View style={styles.zonaControles}>
      <Text style={styles.titulo}>Usuarios</Text>
      <Banner
        tipo="info"
        texto="Vista de solo lectura. Los roles y estados se administran desde Firebase Console para evitar que un usuario se autoasigne permisos."
      />

      {!!error && <Banner tipo="error" texto={error} />}

      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={18} color={colors.textoSuave} />
        <TextInput
          style={styles.buscadorInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre o correo..."
          placeholderTextColor={colors.textoSuave}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={colors.yellowDark}
          returnKeyType="search"
        />
        {busqueda !== "" && (
          <Pressable onPress={() => setBusqueda("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textoSuave} />
          </Pressable>
        )}
      </View>

      <View style={styles.filtros}>
        <Text style={styles.filtroEtiqueta}>Rol</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {ROLES.map((opcion) => (
            <CategoryChip
              key={opcion.valor}
              etiqueta={opcion.etiqueta}
              activa={filtroRol === opcion.valor}
              onPress={() => setFiltroRol(opcion.valor)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtros}>
        <Text style={styles.filtroEtiqueta}>Estado</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {ESTADOS.map((opcion) => (
            <CategoryChip
              key={opcion.valor}
              etiqueta={opcion.etiqueta}
              activa={filtroEstado === opcion.valor}
              onPress={() => setFiltroEstado(opcion.valor)}
            />
          ))}
        </ScrollView>
      </View>

      {filtrados.length > 0 && (
        <Text style={styles.contador}>
          {filtrados.length} usuario{filtrados.length === 1 ? "" : "s"}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <AppHeader onVolver={volver} />

      <FlatList
        data={cargando ? [] : filtrados}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <FilaUsuario perfil={item} onPress={() => setDetalle(item)} />
        )}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={
          cargando ? (
            <EstadoVacio tipo="carga" texto="Cargando usuarios..." />
          ) : error ? (
            <EstadoVacio tipo="error" texto="Sin acceso a la lista de usuarios." />
          ) : (
            <EstadoVacio
              icono="people-outline"
              texto={
                hayFiltro
                  ? "No se encontraron usuarios."
                  : "No hay usuarios registrados."
              }
            />
          )
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={detalle !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDetalle(null)}
      >
        <Pressable style={styles.modalFondo} onPress={() => setDetalle(null)}>
          <View style={styles.modalCaja}>
            <View style={styles.modalEncabezado}>
              <Text style={styles.modalTitulo}>Detalle del usuario</Text>
              <Pressable onPress={() => setDetalle(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.gray} />
              </Pressable>
            </View>

            {!!detalle && (
              <View style={styles.modalContenido}>
                <Dato etiqueta="Nombre" valor={detalle.nombre || "—"} />
                <Dato etiqueta="Correo" valor={detalle.email || "—"} />
                <Dato etiqueta="Rol" valor={ETIQUETA_ROL[detalle.rol]} />
                <Dato
                  etiqueta="Estado"
                  valor={detalle.estado === "activo" ? "Activo" : "Inactivo"}
                />
                <Dato
                  etiqueta="Proveedor"
                  valor={ETIQUETA_PROVEEDOR[detalle.proveedor]}
                />
                <Dato
                  etiqueta="Fecha de registro"
                  valor={formatearFecha(detalle.fecha_creacion)}
                />
                <Dato etiqueta="UID" valor={detalle.uid} />

                <Banner
                  tipo="info"
                  texto="Los roles y estados se administran desde Firebase Console para impedir la autoasignación de privilegios."
                />
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor} selectable>
        {valor}
      </Text>
    </View>
  );
}

function FilaUsuario({
  perfil,
  onPress,
}: {
  perfil: PerfilUsuario;
  onPress: () => void;
}) {
  const esAdmin = perfil.rol === "admin";
  const activo = perfil.estado === "activo";

  return (
    <Pressable
      style={styles.tarjeta}
      onPress={onPress}
      accessibilityLabel={`Ver detalle de ${perfil.nombre}`}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>
          {perfil.nombre.trim().charAt(0).toUpperCase() || "U"}
        </Text>
      </View>

      <View style={styles.tarjetaCuerpo}>
        <Text style={styles.tarjetaNombre} numberOfLines={1}>
          {perfil.nombre}
        </Text>
        <Text style={styles.tarjetaEmail} numberOfLines={1}>
          {perfil.email}
        </Text>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: esAdmin ? colors.black : colors.light },
            ]}
          >
            <Text
              style={[
                styles.badgeTexto,
                { color: esAdmin ? colors.yellow : colors.textoSecundario },
              ]}
            >
              {esAdmin ? "Admin" : perfil.rol === "empleado" ? "Empleado" : "Usuario"}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: activo ? colors.badgeVerdeBg : colors.badgeRojoBg,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeTexto,
                {
                  color: activo ? colors.badgeVerdeTexto : colors.dangerTexto,
                },
              ]}
            >
              {activo ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={19} color={colors.textoSuave} />
    </Pressable>
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
  zonaControles: {
    padding: espaciado.lg,
    gap: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bordeClaro,
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: "700",
    color: colors.black,
  },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.sm,
    paddingHorizontal: espaciado.md,
    minHeight: ALTURA_TOQUE - 4,
    backgroundColor: colors.white,
  },
  buscadorInput: {
    flex: 1,
    fontSize: tipografia.sm + 1,
    color: colors.black,
    paddingVertical: 10,
  },
  contador: {
    fontSize: tipografia.sm,
    color: colors.textoSecundario,
  },
  filtros: {
    gap: espaciado.sm,
  },
  filtroEtiqueta: {
    fontSize: tipografia.xs + 1,
    fontWeight: "700",
    color: colors.textoSecundario,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  chips: {
    gap: espaciado.sm,
    paddingRight: espaciado.sm,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    marginHorizontal: espaciado.lg,
    marginTop: espaciado.md,
    padding: espaciado.md,
    borderWidth: 1,
    borderColor: colors.bordeClaro,
    borderRadius: radio.md,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radio.pill,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: {
    fontSize: tipografia.lg,
    fontWeight: "700",
    color: colors.black,
  },
  tarjetaCuerpo: {
    flex: 1,
    gap: 3,
  },
  tarjetaNombre: {
    fontSize: tipografia.sm + 2,
    fontWeight: "600",
    color: colors.black,
  },
  tarjetaEmail: {
    fontSize: tipografia.xs + 1,
    color: colors.textoSecundario,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.sm,
    marginTop: 4,
  },
  badge: {
    borderRadius: radio.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTexto: {
    fontSize: tipografia.xs,
    fontWeight: "700",
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: espaciado.lg,
  },
  modalCaja: {
    backgroundColor: colors.white,
    borderRadius: radio.lg,
    overflow: "hidden",
  },
  modalEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bordeClaro,
  },
  modalTitulo: {
    fontSize: tipografia.lg,
    fontWeight: "700",
    color: colors.black,
  },
  modalContenido: {
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  dato: {
    gap: 2,
  },
  datoEtiqueta: {
    fontSize: tipografia.xs,
    fontWeight: "700",
    color: colors.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  datoValor: {
    fontSize: tipografia.sm + 1,
    color: colors.black,
  },
});

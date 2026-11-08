import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../src/components/AppHeader";
import Banner from "../../src/components/Banner";
import CategoryChip from "../../src/components/CategoryChip";
import EstadoVacio from "../../src/components/EstadoVacio";
import PrimaryButton from "../../src/components/PrimaryButton";
import TextField from "../../src/components/TextField";
import { colors } from "../../src/constants/colors";
import {
  ALTURA_TOQUE,
  espaciado,
  radio,
  tipografia,
} from "../../src/constants/theme";
import { useAdminCatalogo } from "../../src/hooks/useAdminCatalogo";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  type DatosProducto,
} from "../../src/services/firestoreService";
import type { Producto } from "../../src/types";
import { mensajeErrorFirebase } from "../../src/utils/firebaseErrors";

type Formulario = {
  nombre: string;
  descripcion: string;
  codigo: string;
  precio: string;
  stock_actual: string;
  stock_minimo: string;
  imagen_url: string;
  estado: boolean;
  id_categoria: number | null;
};

type Errores = Partial<Record<keyof Formulario, string>>;

const FORMULARIO_VACIO: Formulario = {
  nombre: "",
  descripcion: "",
  codigo: "",
  precio: "",
  stock_actual: "",
  stock_minimo: "",
  imagen_url: "",
  estado: true,
  id_categoria: null,
};

const sinTildes = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const aEntero = (texto: string) => Number(texto.trim());

type FiltroEstado = "todos" | "activos" | "inactivos";

const ESTADOS: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "activos", etiqueta: "Activos" },
  { valor: "inactivos", etiqueta: "Inactivos" },
];

export default function AdminProductosScreen() {
  const { productos, categorias, cargando, error, recargar } =
    useAdminCatalogo();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<number | "todas">("todas");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const nombreCategoria = (id: number) =>
    categorias.find((c) => c.id_categoria === id)?.nombre ?? "Sin categoría";

  const filtrados = useMemo(() => {
    const texto = sinTildes(busqueda.trim());
    return productos.filter((p) => {
      const coincideTexto =
        texto === "" ||
        sinTildes(p.nombre).includes(texto) ||
        sinTildes(p.codigo).includes(texto);
      const coincideCategoria = filtro === "todas" || p.id_categoria === filtro;
      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" ? p.estado : !p.estado);
      return coincideTexto && coincideCategoria && coincideEstado;
    });
  }, [productos, busqueda, filtro, filtroEstado]);

  const hayFiltro =
    busqueda.trim() !== "" || filtro !== "todas" || filtroEstado !== "todos";

  const abrirNuevo = () => {
    setEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setMensajeError(null);
    setModalVisible(true);
  };

  const abrirEditar = (producto: Producto) => {
    setEditando(producto);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      codigo: producto.codigo,
      precio: String(producto.precio),
      stock_actual: String(producto.stock_actual),
      stock_minimo: String(producto.stock_minimo),
      imagen_url: producto.imagen_url ?? "",
      estado: producto.estado,
      id_categoria: producto.id_categoria || null,
    });
    setErrores({});
    setMensajeError(null);
    setModalVisible(true);
  };

  const cambiar = <K extends keyof Formulario>(
    campo: K,
    valor: Formulario[K]
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    if (errores[campo]) setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const validar = (): Errores => {
    const nuevos: Errores = {};
    const precio = Number(formulario.precio.replace(",", "."));
    const stockActual = aEntero(formulario.stock_actual);
    const stockMinimo =
      formulario.stock_minimo.trim() === "" ? 0 : aEntero(formulario.stock_minimo);

    if (!formulario.nombre.trim())
      nuevos.nombre = "El nombre del producto es obligatorio.";
    if (
      formulario.precio.trim() === "" ||
      Number.isNaN(precio) ||
      precio <= 0
    )
      nuevos.precio = "Ingresa un precio válido mayor que cero.";
    if (
      formulario.stock_actual.trim() === "" ||
      !Number.isInteger(stockActual) ||
      stockActual < 0
    )
      nuevos.stock_actual = "Ingresa existencias válidas (entero mayor o igual a 0).";
    if (!Number.isInteger(stockMinimo) || stockMinimo < 0)
      nuevos.stock_minimo = "Ingresa un stock mínimo válido (entero mayor o igual a 0).";
    if (formulario.id_categoria === null)
      nuevos.id_categoria = "Selecciona una categoría.";
    const urlImagen = formulario.imagen_url.trim();
    if (urlImagen !== "" && !/^https?:\/\/.+/i.test(urlImagen))
      nuevos.imagen_url = "Ingresa una URL válida (http:// o https://).";

    return nuevos;
  };

  const guardar = async () => {
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setGuardando(true);
    setMensajeError(null);
    try {
      const imagenUrl = formulario.imagen_url.trim();

      const datos: DatosProducto = {
        nombre: formulario.nombre.trim(),
        descripcion:
          formulario.descripcion.trim() === ""
            ? null
            : formulario.descripcion.trim(),
        codigo: formulario.codigo.trim(),
        precio: Number(formulario.precio.replace(",", ".")),
        imagen_url: imagenUrl === "" ? null : imagenUrl,
        stock_actual: aEntero(formulario.stock_actual),
        stock_minimo:
          formulario.stock_minimo.trim() === ""
            ? 0
            : aEntero(formulario.stock_minimo),
        id_categoria: formulario.id_categoria as number,
        estado: formulario.estado,
      };

      if (editando) {
        await actualizarProducto(editando.id_producto, datos);
      } else {
        await crearProducto(datos);
      }
      setModalVisible(false);
      await recargar();
      Alert.alert(
        editando ? "Producto actualizado" : "Producto creado",
        `"${datos.nombre}" se guardó correctamente.`
      );
    } catch (e) {
      setMensajeError(mensajeErrorFirebase(e));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (producto: Producto) => {
    Alert.alert(
      "Eliminar producto",
      `¿Deseas eliminar "${producto.nombre}" del catálogo? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarProducto(producto.id_producto);
              await recargar();
            } catch (e) {
              Alert.alert("Eliminar producto", mensajeErrorFirebase(e));
            }
          },
        },
      ]
    );
  };

  const volver = () =>
    router.canGoBack() ? router.back() : router.replace("/admin");

  const cabecera = (
    <View style={styles.zonaControles}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Productos</Text>
        <Pressable style={styles.botonNuevo} onPress={abrirNuevo}>
          <Ionicons name="add" size={18} color={colors.black} />
          <Text style={styles.botonNuevoTexto}>Nuevo</Text>
        </Pressable>
      </View>

      {!!error && <Banner tipo="error" texto={error} />}

      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={18} color={colors.textoSuave} />
        <TextInput
          style={styles.buscadorInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre o código..."
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <CategoryChip
          etiqueta="Todas"
          activa={filtro === "todas"}
          onPress={() => setFiltro("todas")}
        />
        {categorias.map((c) => (
          <CategoryChip
            key={c.id_categoria}
            etiqueta={c.nombre}
            activa={filtro === c.id_categoria}
            onPress={() =>
              setFiltro((actual) =>
                actual === c.id_categoria ? "todas" : c.id_categoria
              )
            }
          />
        ))}
      </ScrollView>

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

      <Text style={styles.contador}>
        {filtrados.length} producto{filtrados.length === 1 ? "" : "s"}
      </Text>
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <AppHeader onVolver={volver} />

      <FlatList
        data={cargando ? [] : filtrados}
        keyExtractor={(item) => String(item.id_producto)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <FilaProducto
            producto={item}
            categoria={nombreCategoria(item.id_categoria)}
            onEditar={() => abrirEditar(item)}
            onEliminar={() => confirmarEliminar(item)}
          />
        )}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={
          cargando ? (
            <EstadoVacio tipo="carga" texto="Cargando productos..." />
          ) : (
            <EstadoVacio
              texto={
                hayFiltro
                  ? "No se encontraron productos."
                  : "Aún no hay productos. Crea el primero con el botón Nuevo."
              }
            />
          )
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalFondo}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCaja}>
            <View style={styles.modalEncabezado}>
              <Text style={styles.modalTitulo}>
                {editando ? "Editar producto" : "Nuevo producto"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.gray} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalContenido}
            >
              {!!mensajeError && (
                <Banner
                  tipo="error"
                  texto={mensajeError}
                  onCerrar={() => setMensajeError(null)}
                />
              )}

              <TextField
                etiqueta="Nombre *"
                valor={formulario.nombre}
                onChangeText={(t) => cambiar("nombre", t)}
                placeholder="Ej. Martillo de acero"
                error={errores.nombre}
              />

              <TextField
                etiqueta="Código"
                valor={formulario.codigo}
                onChangeText={(t) => cambiar("codigo", t)}
                placeholder="Ej. HER-001"
                autoCapitalize="characters"
              />

              <TextField
                etiqueta="Descripción"
                valor={formulario.descripcion}
                onChangeText={(t) => cambiar("descripcion", t)}
                placeholder="Descripción del producto"
              />

              <TextField
                etiqueta="Precio (USD) *"
                valor={formulario.precio}
                onChangeText={(t) => cambiar("precio", t)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errores.precio}
              />

              <View style={styles.filaCampos}>
                <View style={styles.columnaCampo}>
                  <TextField
                    etiqueta="Existencias *"
                    valor={formulario.stock_actual}
                    onChangeText={(t) => cambiar("stock_actual", t)}
                    placeholder="0"
                    keyboardType="number-pad"
                    error={errores.stock_actual}
                  />
                </View>
                <View style={styles.columnaCampo}>
                  <TextField
                    etiqueta="Stock mínimo"
                    valor={formulario.stock_minimo}
                    onChangeText={(t) => cambiar("stock_minimo", t)}
                    placeholder="0"
                    keyboardType="number-pad"
                    error={errores.stock_minimo}
                  />
                </View>
              </View>

              <TextField
                etiqueta="Imagen (URL)"
                valor={formulario.imagen_url}
                onChangeText={(t) => cambiar("imagen_url", t)}
                placeholder="https://ejemplo.com/imagen.jpg"
                keyboardType="url"
                autoCapitalize="none"
                error={errores.imagen_url}
              />

              <View style={styles.grupo}>
                <Text style={styles.grupoEtiqueta}>Categoría *</Text>
                {categorias.length === 0 ? (
                  <Text style={styles.ayuda}>
                    No hay categorías. Crea una en Gestión de categorías.
                  </Text>
                ) : (
                  <View style={styles.chipsWrap}>
                    {categorias.map((c) => (
                      <CategoryChip
                        key={c.id_categoria}
                        etiqueta={c.nombre}
                        activa={formulario.id_categoria === c.id_categoria}
                        onPress={() => cambiar("id_categoria", c.id_categoria)}
                      />
                    ))}
                  </View>
                )}
                {!!errores.id_categoria && (
                  <Text style={styles.error}>{errores.id_categoria}</Text>
                )}
              </View>

              <Pressable
                style={styles.interruptor}
                onPress={() => cambiar("estado", !formulario.estado)}
              >
                <View style={styles.interruptorTexto}>
                  <Text style={styles.grupoEtiqueta}>Producto activo</Text>
                  <Text style={styles.ayuda}>
                    {formulario.estado
                      ? "Visible en el catálogo de los usuarios."
                      : "Oculto para los usuarios del catálogo."}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    formulario.estado && styles.checkboxOn,
                  ]}
                >
                  {formulario.estado && (
                    <Ionicons name="checkmark" size={14} color={colors.black} />
                  )}
                </View>
              </Pressable>

              <View style={styles.modalAcciones}>
                <PrimaryButton
                  titulo="Cancelar"
                  variante="contorno"
                  onPress={() => setModalVisible(false)}
                  estilo={styles.accionMitad}
                />
                <PrimaryButton
                  titulo={editando ? "Guardar cambios" : "Crear producto"}
                  onPress={guardar}
                  cargando={guardando}
                  estilo={styles.accionMitad}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function FilaProducto({
  producto,
  categoria,
  onEditar,
  onEliminar,
}: {
  producto: Producto;
  categoria: string;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const agotado = producto.stock_actual <= 0;
  const inactivo = !producto.estado;

  const estado = agotado
    ? { texto: "Agotado", fondo: colors.badgeRojoBg, color: colors.dangerTexto }
    : producto.stock_actual <= producto.stock_minimo
      ? { texto: "Stock bajo", fondo: colors.badgeRojoBg, color: colors.dangerTexto }
      : {
          texto: "Disponible",
          fondo: colors.badgeVerdeBg,
          color: colors.badgeVerdeTexto,
        };

  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaImagen}>
        {producto.imagen_url ? (
          <Image
            source={{ uri: producto.imagen_url }}
            style={styles.foto}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="cube-outline" size={26} color={colors.gray} />
        )}
      </View>

      <View style={styles.tarjetaCuerpo}>
        <Text style={styles.tarjetaNombre} numberOfLines={2}>
          {producto.nombre}
        </Text>
        <Text style={styles.tarjetaCategoria} numberOfLines={1}>
          {categoria}
        </Text>
        <View style={styles.tarjetaBajas}>
          <Text style={styles.tarjetaPrecio}>${producto.precio.toFixed(2)}</Text>
          <View style={[styles.badge, { backgroundColor: estado.fondo }]}>
            <Text style={[styles.badgeTexto, { color: estado.color }]}>
              {estado.texto}
            </Text>
          </View>
          {inactivo && (
            <View style={[styles.badge, { backgroundColor: colors.light }]}>
              <Text style={[styles.badgeTexto, { color: colors.textoSecundario }]}>
                Inactivo
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.tarjetaStock}>
          Existencias: {producto.stock_actual} · Mínimo: {producto.stock_minimo}
        </Text>
      </View>

      <View style={styles.tarjetaAcciones}>
        <Pressable
          onPress={onEditar}
          hitSlop={6}
          style={styles.botonIcono}
          accessibilityLabel="Editar producto"
        >
          <Ionicons name="create-outline" size={19} color={colors.black} />
        </Pressable>
        <Pressable
          onPress={onEliminar}
          hitSlop={6}
          style={styles.botonIcono}
          accessibilityLabel="Eliminar producto"
        >
          <Ionicons name="trash-outline" size={19} color={colors.dangerTexto} />
        </Pressable>
      </View>
    </View>
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
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: "700",
    color: colors.black,
  },
  botonNuevo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.yellow,
    borderRadius: radio.sm,
    paddingVertical: 9,
    paddingHorizontal: espaciado.md,
  },
  botonNuevoTexto: {
    fontSize: tipografia.sm + 1,
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
  chips: {
    gap: espaciado.sm,
    paddingRight: espaciado.sm,
  },
  contador: {
    fontSize: tipografia.sm,
    color: colors.textoSecundario,
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
  tarjetaImagen: {
    width: 54,
    height: 54,
    borderRadius: radio.sm,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  foto: {
    width: "100%",
    height: "100%",
  },
  tarjetaCuerpo: {
    flex: 1,
    gap: 4,
  },
  tarjetaNombre: {
    fontSize: tipografia.sm + 1,
    fontWeight: "600",
    color: colors.black,
  },
  tarjetaCategoria: {
    fontSize: tipografia.xs + 1,
    color: colors.textoSecundario,
  },
  tarjetaBajas: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: espaciado.sm,
    marginTop: 2,
  },
  tarjetaPrecio: {
    fontSize: tipografia.md,
    fontWeight: "700",
    color: colors.yellowDark,
  },
  badge: {
    borderRadius: radio.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeTexto: {
    fontSize: tipografia.xs,
    fontWeight: "700",
  },
  tarjetaStock: {
    fontSize: tipografia.xs,
    color: colors.textoSuave,
  },
  tarjetaAcciones: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },
  botonIcono: {
    width: 36,
    height: 36,
    borderRadius: radio.sm,
    borderWidth: 1,
    borderColor: colors.borde,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCaja: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radio.lg,
    borderTopRightRadius: radio.lg,
    maxHeight: "92%",
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
    gap: espaciado.lg,
  },
  filaCampos: {
    flexDirection: "row",
    gap: espaciado.md,
  },
  columnaCampo: {
    flex: 1,
  },
  grupo: {
    gap: espaciado.sm,
  },
  grupoEtiqueta: {
    fontSize: tipografia.sm + 1,
    fontWeight: "500",
    color: colors.texto,
  },
  ayuda: {
    fontSize: tipografia.xs + 1,
    color: colors.textoSecundario,
  },
  error: {
    fontSize: tipografia.sm,
    color: colors.errorTexto,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.sm,
  },
  interruptor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.sm,
    padding: espaciado.md,
  },
  interruptorTexto: {
    flex: 1,
    gap: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.sm - 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  modalAcciones: {
    flexDirection: "row",
    gap: espaciado.md,
  },
  accionMitad: {
    flex: 1,
  },
});

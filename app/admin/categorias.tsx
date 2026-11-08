import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
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
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  type DatosCategoria,
} from "../../src/services/firestoreService";
import type { Categoria } from "../../src/types";
import { mensajeErrorFirebase } from "../../src/utils/firebaseErrors";

type Formulario = { nombre: string; descripcion: string };
type Errores = Partial<Record<keyof Formulario, string>>;

const FORMULARIO_VACIO: Formulario = { nombre: "", descripcion: "" };

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export default function AdminCategoriasScreen() {
  const { productos, categorias, cargando, error, recargar } =
    useAdminCatalogo();

  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const productosDeCategoria = (id: number) =>
    productos.filter((p) => p.id_categoria === id).length;

  const filtradas = useMemo(() => {
    const texto = normalizar(busqueda);
    if (texto === "") return categorias;
    return categorias.filter((c) => normalizar(c.nombre).includes(texto));
  }, [categorias, busqueda]);

  const abrirNueva = () => {
    setEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setMensajeError(null);
    setModalVisible(true);
  };

  const abrirEditar = (categoria: Categoria) => {
    setEditando(categoria);
    setFormulario({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
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
    const nombre = formulario.nombre.trim();
    if (!nombre) {
      nuevos.nombre = "El nombre de la categoría es obligatorio.";
      return nuevos;
    }
    const duplicada = categorias.some(
      (c) =>
        c.id_categoria !== editando?.id_categoria &&
        normalizar(c.nombre) === normalizar(nombre)
    );
    if (duplicada)
      nuevos.nombre = "Ya existe una categoría con ese nombre.";
    return nuevos;
  };

  const guardar = async () => {
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    const datos: DatosCategoria = {
      nombre: formulario.nombre.trim(),
      descripcion:
        formulario.descripcion.trim() === ""
          ? null
          : formulario.descripcion.trim(),
    };

    setGuardando(true);
    setMensajeError(null);
    try {
      if (editando) {
        await actualizarCategoria(editando.id_categoria, datos);
      } else {
        await crearCategoria(datos);
      }
      setModalVisible(false);
      await recargar();
    } catch (e) {
      setMensajeError(mensajeErrorFirebase(e));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (categoria: Categoria) => {
    const asociados = productosDeCategoria(categoria.id_categoria);

    // No se permite eliminar una categoría con productos asociados.
    if (asociados > 0) {
      Alert.alert(
        "No se puede eliminar",
        `La categoría "${categoria.nombre}" tiene ${asociados} producto${
          asociados === 1 ? "" : "s"
        } asociado${
          asociados === 1 ? "" : "s"
        }. Reasigna o elimina esos productos antes de borrarla.`
      );
      return;
    }

    Alert.alert(
      `Eliminar "${categoria.nombre}"`,
      "¿Deseas eliminarla? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarCategoria(categoria.id_categoria);
              await recargar();
            } catch (e) {
              Alert.alert("Eliminar categoría", mensajeErrorFirebase(e));
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
        <Text style={styles.titulo}>Categorías</Text>
        <Pressable style={styles.botonNuevo} onPress={abrirNueva}>
          <Ionicons name="add" size={18} color={colors.black} />
          <Text style={styles.botonNuevoTexto}>Nueva</Text>
        </Pressable>
      </View>

      {!!error && <Banner tipo="error" texto={error} />}

      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={18} color={colors.textoSuave} />
        <TextInput
          style={styles.buscadorInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar categoría..."
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
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <AppHeader onVolver={volver} />

      <FlatList
        data={cargando ? [] : filtradas}
        keyExtractor={(item) => String(item.id_categoria)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <FilaCategoria
            categoria={item}
            productos={productosDeCategoria(item.id_categoria)}
            onEditar={() => abrirEditar(item)}
            onEliminar={() => confirmarEliminar(item)}
          />
        )}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={
          cargando ? (
            <EstadoVacio tipo="carga" texto="Cargando categorías..." />
          ) : (
            <EstadoVacio
              icono="pricetags-outline"
              texto={
                busqueda.trim() !== ""
                  ? "No se encontraron categorías."
                  : "Aún no hay categorías. Crea la primera con el botón Nueva."
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
                {editando ? "Editar categoría" : "Nueva categoría"}
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
                placeholder="Ej. Herramientas"
                error={errores.nombre}
              />

              <TextField
                etiqueta="Descripción"
                valor={formulario.descripcion}
                onChangeText={(t) => cambiar("descripcion", t)}
                placeholder="Descripción de la categoría"
              />

              <View style={styles.modalAcciones}>
                <PrimaryButton
                  titulo="Cancelar"
                  variante="contorno"
                  onPress={() => setModalVisible(false)}
                  estilo={styles.accionMitad}
                />
                <PrimaryButton
                  titulo={editando ? "Guardar cambios" : "Crear categoría"}
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

function FilaCategoria({
  categoria,
  productos,
  onEditar,
  onEliminar,
}: {
  categoria: Categoria;
  productos: number;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <View style={styles.tarjeta}>
      <View style={styles.iconoCirculo}>
        <Ionicons name="pricetag-outline" size={20} color={colors.yellowDark} />
      </View>

      <View style={styles.tarjetaCuerpo}>
        <Text style={styles.tarjetaNombre} numberOfLines={2}>
          {categoria.nombre}
        </Text>
        {!!categoria.descripcion && (
          <Text style={styles.tarjetaDescripcion} numberOfLines={2}>
            {categoria.descripcion}
          </Text>
        )}
        <Text style={styles.tarjetaProductos}>
          {productos} producto{productos === 1 ? "" : "s"} asociado
          {productos === 1 ? "" : "s"}
        </Text>
      </View>

      <View style={styles.tarjetaAcciones}>
        <Pressable
          onPress={onEditar}
          hitSlop={6}
          style={styles.botonIcono}
          accessibilityLabel="Editar categoría"
        >
          <Ionicons name="create-outline" size={19} color={colors.black} />
        </Pressable>
        <Pressable
          onPress={onEliminar}
          hitSlop={6}
          style={styles.botonIcono}
          accessibilityLabel="Eliminar categoría"
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
  iconoCirculo: {
    width: 44,
    height: 44,
    borderRadius: radio.pill,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
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
  tarjetaDescripcion: {
    fontSize: tipografia.xs + 1,
    color: colors.textoSecundario,
  },
  tarjetaProductos: {
    fontSize: tipografia.xs,
    color: colors.textoSuave,
    marginTop: 2,
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
  modalAcciones: {
    flexDirection: "row",
    gap: espaciado.md,
  },
  accionMitad: {
    flex: 1,
  },
});

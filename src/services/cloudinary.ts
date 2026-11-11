
import type { ImagePickerAsset } from "expo-image-picker";

export async function subirImagenProducto(
  imagen: ImagePickerAsset
): Promise<string> {

  const cloudName =
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

  const uploadPreset =
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Falta la configuración de Cloudinary en .env."
    );
  }

  if (!imagen.base64) {
    throw new Error(
      "No se pudo obtener la imagen en Base64."
    );
  }

  // Cloudinary acepta imágenes mediante Data URI.
  const imagenBase64 = `data:image/jpeg;base64,${imagen.base64}`;

  const cuerpo = new FormData();

  cuerpo.append("file", imagenBase64);
  cuerpo.append("upload_preset", uploadPreset);

  let respuesta: Response;

  try {
    respuesta = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      {
        method: "POST",
        body: cuerpo,
      }
    );
  } catch (error) {
    console.error("[Cloudinary] Error al enviar:", error);

    throw new Error(
      `Error al enviar la imagen: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }

  let datos: {
    secure_url?: string;
    error?: { message?: string };
  };

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error(
      `Cloudinary devolvió HTTP ${respuesta.status} sin JSON válido.`
    );
  }

  if (!respuesta.ok || !datos.secure_url) {
    const detalle =
      datos.error?.message ??
      respuesta.headers.get("x-cld-error") ??
      "No se pudo subir la imagen.";

    throw new Error(
      `Cloudinary (HTTP ${respuesta.status}): ${detalle}`
    );
  }

  return datos.secure_url.replace(
    "/image/upload/",
    "/image/upload/f_jpg/q_auto/"
  );
}

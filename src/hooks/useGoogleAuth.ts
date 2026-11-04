import { useCallback, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/Google";
import { Prompt, ResponseType } from "expo-auth-session";
import { GOOGLE_CLIENT_IDS, googleConfigurado } from "../config/googleAuth";

// Cierra la sesión web de autenticación cuando vuelve a la app.
WebBrowser.maybeCompleteAuthSession();

type Resultado = {
  /** Abre el flujo de Google y devuelve el id_token, o null si se canceló. */
  solicitarGoogle: () => Promise<string | null>;
  cargando: boolean;
  /** false si no hay Client IDs de Google en las variables de entorno. */
  disponible: boolean;
};

/**
 * Hook de inicio de sesión con Google mediante expo-auth-session.
 * Usa response_type=id_token (flujo implícito) para obtener el id_token
 * que Firebase consume con GoogleAuthProvider.credential().
 */
export function useGoogleAuth(): Resultado {
  const [cargando, setCargando] = useState(false);

  const clientId = useMemo(() => {
    const ids = GOOGLE_CLIENT_IDS;
    return ids.web || ids.android || ids.ios || "client-id-no-configurado";
  }, []);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId,
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
    androidClientId: GOOGLE_CLIENT_IDS.android || undefined,
    iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
    responseType: ResponseType.IdToken,
    // Flujo implícito (id_token): PKCE no aplica y evita parámetros extra.
    usePKCE: false,
    prompt: Prompt.SelectAccount,
    selectAccount: true,
  });

  const solicitarGoogle = useCallback(async (): Promise<string | null> => {
    if (!googleConfigurado || !request) {
      throw new Error(
        "Inicio de sesión con Google no está configurado. Agrega EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en .env (ver .env.example)."
      );
    }

    setCargando(true);
    try {
      const resultado = await promptAsync();
      if (resultado?.type !== "success") {
        return null;
      }
      const idToken = resultado.params.id_token;
      if (!idToken) {
        throw new Error(
          "Google no devolvió un id_token. Verifica los Client IDs y los dominios autorizados en Google Cloud Console."
        );
      }
      return idToken;
    } finally {
      setCargando(false);
    }
  }, [promptAsync, request]);

  // `response` queda disponible para diagnóstico; el id_token se toma
  // directamente de resultado.params en solicitarGoogle.
  void response;

  return {
    solicitarGoogle,
    cargando: cargando || (googleConfigurado && request === null),
    disponible: googleConfigurado,
  };
}

# FerreStock 360 Mobile

App móvil independiente de FerreStock 360 (React Native + Expo + TypeScript).

> Proyecto **separado** de `FerreStock360` (web + backend). Conecta a **Firebase Authentication** y **Cloud Firestore** mediante variables de entorno. Sin configurar `.env`, funciona con datos de demostración claramente identificados.

## Requisitos

- Node.js 20 o superior
- npm
- App **Expo Go** en tu celular (Play Store / App Store)
- Proyecto en **Firebase Console** (Authentication + Cloud Firestore)

## Configuración de Firebase

1. Copia el archivo de ejemplo y complétalo con los datos de tu proyecto:

   ```bash
   copy .env.example .env
   ```

2. En **Firebase Console → Configuración del proyecto → Tus apps**, registra una app Web y copia los valores a `.env`:

   | Variable | Origen |
   |---|---|
   | `EXPO_PUBLIC_FIREBASE_API_KEY` | SDK setup (apiKey) |
   | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | SDK setup (authDomain) |
   | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | SDK setup (projectId) |
   | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | SDK setup (storageBucket) |
   | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | SDK setup (messagingSenderId) |
   | `EXPO_PUBLIC_FIREBASE_APP_ID` | SDK setup (appId) |

3. Habilita los proveedores en **Authentication → Sign-in method**: **Correo/contraseña** y **Google**.

4. Crea la base de datos en **Cloud Firestore** y publica las reglas de seguridad:

   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```

   (Requiere `npm install -g firebase-tools` y `firebase login`. Alternativa: pegar el contenido de `firestore.rules` en Firebase Console → Firestore → Reglas.)

5. **Google Sign-In (opcional):** en Google Cloud Console → APIs & Services → Credentials, crea un **Web application** OAuth client y pon su valor en `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Agrega `https://auth.expo.io/@<tu-usuario>/<slug>` a *Authorized redirect URIs* (lo muestra Expo Go al autenticar). En la app usa el **slug** de `app.json` (`ferrestock360-mobile`).

6. **Productos de demostración (opcional):** puebla Firestore con los productos de ejemplo:

   ```bash
   npm run seed -- --cuenta=C:\ruta\a\tu-service-account.json
   ```

   Si no hay productos en Firestore, la app muestra los datos de demostración con un aviso.

## Inicio del desarrollo

```bash
cd C:\Users\alane\OneDrive\Escritorio\FerreStock360Mobile
npm install
npx expo install --fix
npx expo start
```

- `npm install` — instala las dependencias.
- `npx expo install --fix` — alinea las versiones de paquetes al SDK de Expo instalado.
- `npx expo start` — abre el dev server; escanea el **QR** con Expo Go (en la misma red Wi-Fi).

Scripts disponibles:

| Comando | Descripción |
|---|---|
| `npm run typecheck` | Verificación estática de tipos (`tsc --noEmit`) |
| `npm run seed` | Pobla Firestore con productos de demostración |

## Estructura

```
FerreStock360Mobile/
├── app/                    # Pantallas (Expo Router, rutas de archivo)
│   ├── _layout.tsx         # Stack global + AuthProvider + protección de rutas
│   ├── login.tsx           # Iniciar sesión (correo + Google + recuperar contraseña)
│   ├── register.tsx        # Registro con validaciones
│   ├── historial.tsx       # Historial de actividad (Firestore)
│   └── (tabs)/             # Navegación con barra inferior
│       ├── _layout.tsx     # Tabs: Inicio, Catálogo, Favoritos, Perfil
│       ├── index.tsx       # Inicio (productos/categorías reales)
│       ├── catalogo.tsx    # Catálogo (búsqueda, filtros, favoritos)
│       ├── favoritos.tsx   # Favoritos del usuario (Firestore)
│       └── perfil.tsx      # Perfil, edición, historial y cierre de sesión
├── src/
│   ├── components/         # Brand, AppHeader, AppFooter, TextField, PrimaryButton,
│   │                       # ProductCard, CategoryChip, SectionTitle, EstadoVacio,
│   │                       # TabBarIcon, Banner
│   ├── config/             # firebase.ts (init) y googleAuth.ts (Client IDs)
│   ├── constants/          # colors.ts (paleta) + theme.ts (espaciado, radios, tipografía)
│   ├── contexts/           # AuthContext.tsx (sesión global)
│   ├── data/               # mockProducts.ts (datos de demostración de respaldo)
│   ├── hooks/              # useProductos, useFavoritos, useHistorial, useGoogleAuth
│   ├── services/           # authService.ts y firestoreService.ts (acceso a Firebase)
│   ├── types/              # Tipos compartidos + env.d.ts
│   └── utils/              # firebaseErrors.ts (mensajes), fechas.ts
├── scripts/                # seed-firestore.mjs (poblar datos de demostración)
├── firestore.rules         # Reglas de seguridad de Firestore
├── firestore.indexes.json
├── firebase.json           # Configuración de Firebase CLI
├── .env.example            # Plantilla de variables de entorno
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Modelo de datos (Firestore)

| Colección | Contenido | Acceso |
|---|---|---|
| `users` | Perfil: uid, nombre, email, rol, estado, fecha de creación | Dueño (rol solo lectura) |
| `products` | Catálogo: nombre, precio, categoría, imagen, stock, estado | Lectura pública / escritura admin |
| `categories` | Categorías del catálogo | Lectura pública / escritura admin |
| `favorites` | Snapshot de favoritos por usuario (`{uid}_{producto_id}`) | Dueño |
| `activity_history` | Historial de acciones del usuario | Dueño (inmutable) |

## Identidad visual

Paleta tomada de la web (`web/app/globals.css`):

| Token | Hex |
|---|---|
| Amarillo marca | `#F5C518` |
| Amarillo oscuro (hover) | `#D4A813` |
| Negro | `#1A1A1A` |
| Gris oscuro | `#2D2D2D` |
| Gris | `#4A4A4A` |
| Gris claro (fondo) | `#F5F5F5` |
| Blanco | `#FFFFFF` |

## Pendiente (configuración manual)

- Completar `.env` con los valores reales de Firebase Console.
- Habilitar proveedores en Authentication → Sign-in method.
- Publicar `firestore.rules`.
- (Opcional) Configurar Google Sign-In (Web Client ID) y ejecutar `npm run seed`.

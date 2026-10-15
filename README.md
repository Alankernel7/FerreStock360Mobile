# FerreStock 360 Mobile

App móvil independiente de FerreStock 360 (React Native + Expo + TypeScript).

> Proyecto **separado** de `FerreStock360` (web + backend). Esta primera fase es solo UI con datos mock: sin Firebase, sin base de datos y sin conexión al backend.

## Requisitos

- Node.js 20 o superior
- npm
- App **Expo Go** en tu celular (Play Store / App Store)

## Inicio del desarrollo

```bash
cd C:\Users\alane\OneDrive\Escritorio\FerreStock360Mobile
npm install
npx expo install --fix
npx expo start
```

- `npm install` — instala las dependencias.
- `npx expo install --fix` — alinea las versiones de paquetes al SDK de Expo instalado (por si alguna versión quedó desalineada).
- `npx expo start` — abre el dev server; escanea el **QR** con Expo Go (en la misma red Wi-Fi).

## Estructura

```
FerreStock360Mobile/
├── app/                    # Pantallas (Expo Router, rutas de archivo)
│   ├── _layout.tsx         # Stack global ((tabs), login, register)
│   ├── login.tsx           # Iniciar sesión
│   ├── register.tsx        # Registro
│   └── (tabs)/             # Navegación con barra inferior
│       ├── _layout.tsx     # Tabs: Inicio, Catálogo, Favoritos, Perfil
│       ├── index.tsx       # Inicio
│       ├── catalogo.tsx    # Catálogo de productos
│       ├── favoritos.tsx   # Favoritos (estructura visual, pendiente)
│       └── perfil.tsx      # Perfil (estructura visual, pendiente)
├── src/
│   ├── components/         # Brand, AppHeader, AppFooter, TextField, PrimaryButton,
│   │                       # ProductCard, CategoryChip, SectionTitle, EstadoVacio, TabBarIcon
│   ├── constants/          # colors.ts (paleta) + theme.ts (espaciado, radios, tipografía)
│   ├── data/               # mockProducts.ts (datos de ejemplo)
│   └── types/              # Tipos compartidos (Producto, Categoria, Usuario)
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

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

## Pendiente (fases siguientes)

- Secciones **Favoritos** y **Perfil**: solo estructura visual (próximamente).
- Conexión al backend (`http://localhost:3001/api`): login, registro y catálogo real.
- Persistencia de sesión (token JWT).
- Iconos y splash propios en `assets/`.
- Catálogo de imágenes de productos.

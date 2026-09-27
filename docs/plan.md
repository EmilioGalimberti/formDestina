# Plan — Form Primer Contacto (Destina)

## Objetivo

Primer punto de contacto con los clientes de Destina: un formulario interactivo y
divertido que se siente como un juego, para simplificar la toma de información de
Martina y agilizar el 1:1 con todo lo necesario para organizar un viaje:

- Destino
- Transporte
- Cantidad de personas
- Categoría de viaje (fiesta, playas lindas, tranquilidad, etc.)
- Presupuesto estimado

Al final, un botón "¡A viajar!" formatea el formulario en un mensaje de WhatsApp
legible para Martina y lo abre en `wa.me`.

## 1. Stack y por qué

| Capa | Elección | Por qué |
|---|---|---|
| Framework | React 19 + TypeScript (Vite 6) | Componentes aislables por feature (ideal para sesiones por separado), `useGSAP` integra GSAP limpio, ecosistema maduro. |
| Animación | GSAP 3 (core + `useGSAP` + `Draggable` + `Inertia`/`Flip`) | Desde 2025 todos los plugins son gratis. `quickTo()` para que el avión siga al puntero, `timeline` para el zoom, `FLIP` para transiciones entre pasos. |
| Estilos | Tailwind CSS v4 | Iteración rápida, consistente, config trivial con `@tailwindcss/vite`. Mobile-first. |
| Estado | Zustand | Un solo store con el modelo del formulario + selector de paso. Fuente de verdad única que cada feature lee/escribe de forma independiente. |
| Mapa | SVG estilizado custom + util de proyección | Sin API key, look "juego", control total con GSAP. Ciudades en `{lat, lon}` proyectadas a coordenadas SVG con `lib/projection.ts`. |
| WhatsApp | `wa.me` link client-side | Sin backend: `https://wa.me/<num>?text=<mensaje codificado>`. |
| Deploy | Cloudflare Pages (estático) | Proyecto 100% estático (el mensaje se arma en el navegador). Worker opcional más adelante para tracking. |
| Package manager | Bun (1.3.14) | Local con `bun`; deploy con build command `bun install && bun run build`. |

> Verificar el formato del número: `+54 9 3804 62-4385` → `wa.me` usa `543804624385`
> (se omite el `9` de móvil). Confirmar con Martina antes de Feature 6.

## 2. Responsive (mobile + desktop)

- **Pointer Events** (`pointerdown/move/up`) unifican mouse y touch. GSAP `quickTo()`
  funciona igual con punteros.
- Tailwind **mobile-first**: columna en celular; en `md:`/`lg:` más aire (mapa más
  grande, cards en grid).
- Cada paso es una pantalla (`min-h-svh`) con scroll interno si excede; progreso
  sticky arriba.
- Slider de presupuesto nativo táctil con labels grandes (que no tapen el thumb).
- Touch targets ≥ 44px, `viewport` meta y `safe-area` para el CTA final.
- `prefers-reduced-motion` respetado.

### Comportamiento del "mundito" (confirmado)

- **Mobile**: arrastre ligero con un dedo (pan) + zoom; **tap sobre el marcador**
  selecciona el destino específico.
- **Desktop**: el avión sigue al cursor; click selecciona el destino.
- Pinch-to-zoom opcional vía pointer events; botones `+/-` como fallback.

## 3. Features independientes (orden para sesiones)

Cada feature toca su carpeta en `src/features/` y solo lee/escribe el store. Se
pueden hacer en paralelo una vez exista el store.

- **F0 — Harness**: scaffold Vite+React+TS+Tailwind+GSAP+Zustand, alias `@/`,
  `wrangler.toml`, deploy a Pages, `App.tsx` + layout base + design tokens.
  *Entregable: app corre y deploya.*
- **F1 — Store + Wizard shell**: `types.ts`, `store.ts`, definición de pasos, barra
  de progreso, navegación next/back, transiciones entre pasos (GSAP), layout
  responsive. *Entregable: navegar todos los pasos con placeholders.*
- **F2 — Destino (mundito)**: SVG estilizado, avión que sigue al puntero (desktop),
  arrastre ligero + zoom + tap (mobile), marcadores de destinos, selección → guarda
  destino. *La feature más grande.*
- **F3 — Transporte**: cards con imágenes (avión, bus, auto, tren), micro-animaciones
  de selección.
- **F4 — Personas + Categoría**: stepper de cantidad y cards de categoría (fiesta,
  playas lindas, tranquilidad, aventura…).
- **F5 — Presupuesto**: slider min/max; min calculado según destino (México → USD 500),
  usuario define max, display formateado en vivo.
- **F6 — Resultado + WhatsApp**: formatea mensaje legible desde el store, link `wa.me`,
  CTA "¡A viajar!", preview antes de abrir.
- **F7 — Polish**: test en 360px y 1440px, `prefers-reduced-motion`, safe-area, tamaño
  de touch targets, orientación, meta/OG, accesibilidad.

## 4. Estructura de carpetas

```
formPrimerContacto/
├── docs/
│   ├── product.md
│   └── plan.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts          # alias @/, plugin tailwind
├── wrangler.toml
├── .gitignore
├── public/
│   ├── maps/world.svg      # mundo base estilizado
│   ├── images/transport/   # avion.svg, bus.svg, auto.svg, tren.svg
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css           # tailwind + tokens (colores, fonts)
    ├── state/
    │   ├── store.ts        # zustand: form state + currentStep
    │   └── types.ts        # FormState, Destination, Transport, Category
    ├── data/
    │   ├── destinations.ts # {id, name, lat, lon, minBudget}
    │   ├── transports.ts
    │   └── categories.ts
    ├── lib/
    │   ├── projection.ts   # lat/lon -> coordenadas SVG
    │   ├── gsap.ts         # registerPlugin centralizado
    │   └── whatsapp.ts     # buildMessage + buildWaLink
    ├── features/
    │   ├── wizard/         # shell, progreso, transiciones
    │   ├── destination/    # WorldMap, Plane, DestinationMarker
    │   ├── transport/
    │   ├── people/
    │   ├── category/
    │   ├── budget/
    │   └── result/
    └── ui/                 # Button, OptionCard, Stepper (shared)
```

## 5. Modelo del store (fuente de verdad)

```ts
interface FormState {
  destination: Destination | null;
  transport: Transport | null;
  people: number;                          // default 1
  category: Category | null;
  budget: { min: number; max: number };    // min derivado del destino
}
```

## 6. Harness inicial (F0, comandos)

```bash
bun create vite . --template react-ts
bun add gsap zustand
bun add tailwindcss @tailwindcss/vite
bun add -d wrangler
# config vite.config.ts, tailwind, tsconfig paths, wrangler.toml
bun run dev
```

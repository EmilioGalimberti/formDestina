# Log de sesiones

Historial de trabajo por sesiones de agentes. Cada sesión agrega una entrada al
final con: fecha, agente, feature(s), qué se hizo, decisiones y pendientes.

---

## 2026-09-27 — F0 Harness inicial (Kimi K2.7 Code)

**Hecho:**
- Scaffold Vite 8 + React 19 + TypeScript 6 con `bun create vite . --template react-ts --overwrite`.
- Dependencias: `gsap`, `zustand`, `tailwindcss`, `@tailwindcss/vite`, `wrangler` (dev).
- Config: alias `@/ → src/`, plugin Tailwind v4, `tsconfig` strict, `wrangler.toml`
  (`pages_build_output_dir = "dist"`), `.gitignore` (+ `.wrangler`, `.cloudflare`).
- Estructura de carpetas y placeholders vacíos según `docs/plan.md` §4.
- `App.tsx` mínimo mobile-first; tokens de color/tipografía en `src/index.css`.
- Build ✅ (`bun run build`) y dev ✅ (`bun run dev`).

**Pendientes:**
- Deploy a Cloudflare Pages: falta `CLOUDFLARE_API_TOKEN` en el entorno.
- Las features F1–F7 no están implementadas (solo placeholders).

**Siguiente:** F1 — Store + Wizard shell.

---

## 2026-09-27 — Coordinación (opencode)

**Hecho:**
- Recuperados `docs/product.md` y `docs/plan.md` (los borró `bun create vite .`).
- Creados `AGENTS.md`, `feature_list.json` y `agents_sessions.md` para coordinar
  sesiones con agentes externos (Kimi K2.7 Code).

**Pendientes:**
- Ninguno a nivel de coordinación.

**Siguiente:** pasar a Kimi la tarea F1.

---

## 2026-09-27 — Fix deploy Cloudflare Pages (opencode)

**Hecho:**
- Eliminado `wrangler.toml`: Cloudflare Pages (Git) lo interpretaba como Worker y
  corría `npx wrangler deploy` en vez de subir `dist`, fallando el deploy.
- Deploy correcto: dashboard con build command `bun run build`, output `dist` y
  "Deploy command" vacío.

**Pendientes:**
- En el dashboard: vaciar el campo "Deploy command" (Settings → Builds & deployments).
- Redeplegar / pushear para verificar que sube `dist`.

**Siguiente:** verificar deploy OK y pasar a Kimi la tarea F1.

---

## 2026-09-27 — F1 Store + Wizard shell (opencode)

**Hecho:**
- Creado `src/state/types.ts` con `Destination`, `Transport`, `Category`, `BudgetRange`, `FormState`, `StepId`, `WizardState` y `AppState`.
- Creado `src/state/store.ts` con Zustand: estado inicial, setters por campo (`setDestination`, `setTransport`, `setPeople`, `setCategory`, `setBudget`, `setBudgetMax`), navegación (`goToStep`, `nextStep`, `previousStep`) y `reset`. `budget.min` se deriva del destino seleccionado.
- Creado `src/lib/gsap.ts` como punto centralizado para importar `gsap`.
- Creado shell del wizard en `src/features/wizard/`:
  - `Wizard.tsx`: layout responsive sticky header/footer, renderizado del paso actual y transición GSAP `x`/`opacity` con respeto a `prefers-reduced-motion`.
  - `WizardProgress.tsx`: barra de progreso accesible con porcentaje por paso.
  - `WizardNav.tsx`: botones Atrás/Siguiente.
  - `useWizardStep.ts`: configuración de pasos y selector del paso actual.
- Creados placeholders funcionales en cada feature para validar navegación y escritura en el store:
  - `DestinationStep`, `TransportStep`, `PeopleStep`, `CategoryStep`, `BudgetStep`, `ResultStep`.
- Actualizado `App.tsx` para renderizar `<Wizard />`.
- Verificaciones: `bun run build` ✅ (typecheck + dist) y `bun run lint` ✅.

**Decisiones:**
- Los placeholders usan datos dummy locales; las features F2–F6 los reemplazarán por implementaciones reales y datos en `src/data/`.
- El botón "Siguiente" siempre habilitado en F1 para facilitar la navegación de prueba; se puede agregar validación por paso más adelante.
- Transiciones con `useLayoutEffect` + `gsap.fromTo` porque `@gsap/react` no está en el proyecto; se puede migrar a `useGSAP` si se instala más adelante.

**Pendientes:**
- F2 — Destino (mundito): reemplazar placeholder por mapa SVG interactivo.
- F3–F6: reemplazar placeholders por features completas.

**Siguiente:** F2 — Destino (mundito).

---

## 2026-09-27 — F2 Destino (mundito) (opencode)

**Hecho:**
- Creado `src/data/destinations.ts` con 8 destinos reales (México, Brasil, Argentina, EE.UU., España, Italia, Francia, Japón) con `lat`, `lon` y `minBudget`.
- Creado `src/lib/projection.ts` con proyección equirectangular `project()` e `inverseProject()` para el viewBox 1000x500.
- Creado `public/maps/world.svg` con mapa estilizado tipo "juego".
- Implementada feature completa en `src/features/destination/`:
  - `WorldMap.tsx`: mapa interactivo con pan (pointer events), zoom con rueda y botones `+/-`, zoom animado con GSAP al seleccionar un destino, respeto a `prefers-reduced-motion`.
  - `DestinationMarker.tsx`: marcadores clickeables/tocables con label del destino.
  - `Plane.tsx`: avión que sigue al cursor en desktop (`pointer: fine`).
  - `DestinationStep.tsx`: reemplaza el placeholder, muestra el mapa, tarjeta de destino seleccionado y botón para avanzar.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅ (1 warning aceptable por setState en `useLayoutEffect` necesario para centrar el mapa al montar).

**Decisiones:**
- Se usa `<img>` para el SVG del mundo y un `<svg>` overlay para los marcadores, ambos con `preserveAspectRatio="xMidYMid meet"`.
- Zoom centrado en el contenedor; al seleccionar un marcador se anima escala y translate para centrarlo.
- Los marcadores y botones de zoom usan `stopPropagation` en `pointerdown` para no interferir con el pan del contenedor.

**Pendientes:**
- Pinch-to-zoom nativo en mobile (opcional, se puede agregar en F7).
- Ajustar fino del posicionamiento si el contenedor no es 2:1 (actualmente el letterbox se centra y es aceptable).

**Siguiente:** F3 — Transporte.

---

## 2026-09-27 — F3 Transporte (opencode)

**Hecho:**
- Actualizado `src/state/types.ts`: agregado campo `image` a la interfaz `Transport`.
- Creado `src/data/transports.ts` con Avión, Bus, Auto y Tren, cada uno con su SVG en `public/images/transport/`.
- Dibujados 4 SVGs estilizados y simples: `avion.svg`, `bus.svg`, `auto.svg`, `tren.svg`.
- Creado `src/features/transport/TransportCard.tsx`: card con imagen, nombre, check visual al seleccionar y micro-animación GSAP elástica (`elastic.out`) al hacer click, con respeto a `prefers-reduced-motion`.
- Reemplazado `src/features/transport/TransportStep.tsx` por la implementación real usando `TransportCard` y `TRANSPORTS`.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅ (mantiene warning previo de F2).

**Decisiones:**
- Los SVGs se usan como `<img>` desde `public/`, por lo que el color es fijo; la selección se comunica con borde, fondo y check.
- Hover con CSS transitions (`group-hover:scale-110`) y click con GSAP para el rebote.

**Pendientes:**
- Ninguno específico de F3.

**Siguiente:** F4 — Personas + Categoría.

---

## 2026-09-27 — F2 v2 Globo ortográfico con rotación y zoom-reveal (opencode)

**Hecho:**
- Reemplazada la proyección equirectangular por ortográfica en `src/lib/projection.ts` usando `d3-geo` (`geoOrthographic`). Exponen `Rotation` (`lambda`, `phi`), `project()`, `inverseProject()` y `isVisible()`.
- Agregada dependencia `minZoom` al tipo `Destination` en `src/state/types.ts`.
- Actualizado `src/data/destinations.ts` con 11 destinos en 3 niveles de zoom: nivel 0 (Buenos Aires, México, São Paulo), nivel 1.4 (Nueva York, Madrid, París, Roma) y nivel 2.3 (Cancún, Bariloche, Bali, Tokio).
- Reescrito `src/features/destination/WorldMap.tsx`:
  - Globo SVG 500x500 dibujado con `d3-geo` + `world-atlas` + `topojson-client`.
  - Rotación por drag (lambda/phi, phi clamp ±80°), zoom por rueda, pinch (2 dedos) y botones `+/-`.
  - Avión en desktop con `GSAP.quickTo` siguiendo al cursor.
  - Al seleccionar un marcador se anima rotación y zoom para centrarlo.
  - `prefers-reduced-motion` respetado.
- Reescrito `src/features/destination/DestinationMarker.tsx`:
  - Recibe coordenadas proyectadas y flag `visible`.
  - Entrada/salida con fade+scale via GSAP.
  - Hit area de 40 unidades SVG (touch target amplio).
- Actualizado `public/maps/world.svg` a un diseño circular simple.
- Actualizado `src/features/destination/DestinationStep.tsx` con texto acorde al globo.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅ (sin warnings).

**Decisiones:**
- Librerías de proyección: `d3-geo` + `world-atlas` + `topojson-client`.
- `minZoom` es un número de escala; los marcadores aparecen cuando `scale >= destination.minZoom`.
- El avión se renderiza inline en `WorldMap` para poder aplicarle `gsap.quickTo` directamente.

**Pendientes:**
- F4 — Personas + Categoría.

**Siguiente:** F4 — Personas + Categoría.

---

## 2026-09-27 — F2 v2 fix: sentido de arrastre, visibilidad y selección de marcadores (opencode)

**Hecho:**
- Ajustado el sentido del drag en `WorldMap.tsx`: ahora el contenido sigue al dedo (pan natural) tanto horizontal como verticalmente.
- Corregida `isVisible` en `src/lib/projection.ts` para usar el centro de vista real de la proyección ortográfica (`-lambda`, `-phi`) mediante producto escalar en coordenadas esféricas. Agregada `angularDistance`.
- Aplicado umbral de ángulo (`VIEW_ANGLE_THRESHOLD = 70°`) en `WorldMap.tsx` para que al hacer zoom solo aparezcan los destinos cercanos al centro de vista, evitando que aparezcan destinos lejanos (ej. Europa al hacer zoom en Brasil).
- Cambiada la selección de marcadores a `pointerdown` con `stopPropagation` para evitar que el tap inicie drag accidental y mejore la selección en mobile.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅ (sin warnings).

**Siguiente:** F4 — Personas + Categoría.

---

## 2026-09-29 — F2 v3: globo fluido en mobile, marcadores estables y look de juego (opencode)

**Hecho:**
- **Fix mobile (se movía "milímetros")**: el contenedor no tenía `touch-action`, así que el
  browser tomaba el gesto táctil como scroll de página y cancelaba los pointer events a los
  pocos px. Agregado `touch-none` al contenedor, handler `onPointerCancel` (antes faltaba) y
  blindado `setPointerCapture` con try/catch.
- **Inercia tipo juego**: se trackea velocidad del drag (suavizado exponencial) y al soltar se
  anima la rotación con GSAP `power3.out`. Se corta al empezar un nuevo gesto, al hacer zoom o
  al seleccionar. Respetado `prefers-reduced-motion`.
- **Sensibilidad natural**: el factor de rotación ahora escala con el zoom
  (`120 / (scale * ancho)`), sensación de "agarrar la superficie".
- **Fix marcadores bugueados**: GSAP y React escribían el mismo `transform` del `<g>` del
  marcador (React el translate cada frame, GSAP el scale del fade) → se solapaban y los
  marcadores flotaban/parpadeaban al rotar mientras aparecían. Ahora `<g>` externo (translate,
  React) + `<g>` interno (opacity/scale, GSAP).
- **Visibilidad**: eliminado el umbral fijo de 70° (hacía aparecer/desaparecer destinos en
  medio del globo visible). Ahora: hemisferio frontal (`isVisible` ≤90°, evita el espejado de
  la proyección ortográfica) + `minZoom`; el seleccionado siempre visible. Rotación inicial
  centrada en Sudamérica (`lambda 60, phi 15`) para que se vean BA, México y São Paulo.
- **Tap vs drag**: antes el marcador seleccionaba en `pointerdown` con hit area de r=40 →
  empezar un drag cerca de un marcador lo seleccionaba por accidente. Ahora el contenedor
  detecta tap (movimiento < 10px entre down/up sobre un `[data-marker-id]`); arrastrar desde
  un marcador rota el globo sin seleccionar.
- **Fix wheel desktop**: React 17+ registra `onWheel` como pasivo → `preventDefault()` no
  funcionaba y la página scrolleaba al hacer zoom. Listener nativo `{ passive: false }` via ref.
- **Post-pinch**: al soltar un dedo después del pinch se re-ancla el drag (antes el globo
  quedaba trabado hasta soltar ambos dedos).
- **Look de juego**: océano azul con gradiente radial, tierra verde (`#5ecf7c`) con fronteras
  de países (`mesh` de topojson), graticule, halo de atmósfera, sombreado de limbo para
  profundidad esférica, pop elástico (`back.out`) de marcadores, anillo pulsante en el
  seleccionado, labels con halo blanco (`paint-order: stroke`).
- **UX mobile**: como `touch-action: none` bloquea el scroll de página desde el mapa, al
  seleccionar un destino la card hace `scrollIntoView` suave para quedar visible.
- Animación de selección rota por el camino más corto (lambda normalizado a ±180°).
- Verificaciones: `bun run build` ✅, `bun run lint` ✅, smoke test con Playwright (Chrome
  headless, viewport iPhone 13 + desktop): 11/11 OK (drag táctil fluido con inercia, tap
  selecciona, sin espejados al rotar, wheel sin scroll de página, drag sobre marcador no
  selecciona, sin errores JS). Screenshots verificados.

**Decisiones:**
- Inercia manual con `gsap.to` en vez de InertiaPlugin (más simple, mismo resultado).
- La selección se maneja desde el contenedor (tap threshold) y no desde el marcador: elimina
  zonas muertas de drag y selecciones accidentales.

**Pendientes:**
- F4 — Personas + Categoría.

**Siguiente:** F4 — Personas + Categoría.

---

## 2026-10-05 — F4 Personas + Categoría (opencode)

**Hecho:**
- Creado `src/data/categories.ts` con 8 categorías: Playas lindas, Fiesta, Tranquilidad, Aventura, Naturaleza, Cultura, Gastronomía y En familia.
- Creado `src/features/category/CategoryCard.tsx`: card con icono SVG inline por categoría, nombre, check visual al seleccionar y micro-animación GSAP elástica al hacer click, respetando `prefers-reduced-motion`.
- Reemplazado `src/features/category/CategoryStep.tsx` por la implementación real usando `CATEGORIES` y `CategoryCard`, con layout responsive de 2 a 4 columnas.
- Reescrito `src/features/people/PeopleStep.tsx`: stepper de cantidad con subtítulo, botón `-` deshabilitado en 1 persona, botón `+` con color primario y animación GSAP en el número al cambiar.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Los iconos de categoría son SVGs inline (sin assets externos ni emojis) para mantener consistencia con el look del proyecto y facilitar cambios de color por estado.
- `CategoryCard` reutiliza el patrón de `TransportCard` (borde, fondo, check, animación elástica) pero usa el color `secondary` (naranja) para diferenciar visualmente la sección.
- El contador de personas anima solo el número, no toda la pantalla, para no competir con la transición del wizard.

**Pendientes:**
- Ninguno específico de F4.

**Siguiente:** F5 — Presupuesto.

---

## 2026-10-05 — F5 Presupuesto (opencode)

**Hecho:**
- Creado `src/features/budget/BudgetDisplay.tsx`: componente que muestra el rango formateado en USD con animación GSAP suave cada vez que cambia el máximo.
- Reescrito `src/features/budget/BudgetStep.tsx`:
  - Muestra el destino seleccionado y el presupuesto mínimo sugerido derivado de `destination.minBudget`.
  - Slider único para ajustar el máximo, con `min` fijo y `maxLimit = min + 5000`.
  - Botones rápidos `+100`, `+500`, `+1000` para ajustes táctiles.
  - Mensaje claro si no hay destino seleccionado (fallback).
  - Display en vivo formateado con `Intl.NumberFormat`.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- El `min` queda fijo según el destino elegido; el usuario solo ajusta el `max`, simplificando la UX y respetando el modelo "min derivado del destino".
- El rango máximo del slider es `min + 5000`, lo que da suficiente flexibilidad tanto para destinos cercanos (BA, USD 400) como para destinos lejanos (Tokio, USD 1200).
- Los botones de preset usan `setBudgetMax` y se deshabilitan si superan el límite.

**Pendientes:**
- Ninguno específico de F5.

**Siguiente:** F6 — Resultado + WhatsApp.

---

## 2026-10-05 — F6 Resultado + WhatsApp (opencode)

**Hecho:**
- Creado `src/lib/whatsapp.ts` con `buildMessage` (arma mensaje legible para Martina) y `buildWaLink` (genera link `wa.me` con el número `543804624385`).
- Reescrito `src/features/result/ResultStep.tsx`:
  - Resumen visual del viaje (destino, transporte, viajeros, estilo, presupuesto) en una card estilizada.
  - Preview del mensaje de WhatsApp antes de abrir.
  - CTA "¡A viajar!" como link `<a>` que abre `wa.me` en una nueva pestaña.
- Formato del mensaje: saludo, datos del formulario y presupuesto formateado en USD.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se usa un link nativo `<a>` en lugar de `window.open` para mejor accesibilidad y comportamiento en mobile (abre WhatsApp/web según el SO).
- El preview del mensaje se muestra siempre para que el usuario lo revise antes de enviar.
- Sin emojis en el mensaje para mantener consistencia con las convenciones del proyecto; usa texto plano y "¡A viajar!" como CTA.

**Pendientes:**
- Ninguno específico de F6.

**Siguiente:** F7 — Polish.

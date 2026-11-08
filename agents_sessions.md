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

---

## 2026-10-05 — F7 Polish (opencode)

**Hecho:**
- `index.html`: agregados meta tags OG/Twitter, descripción más completa y `theme-color`.
- `Wizard.tsx`: región `aria-live` para anunciar el paso actual, `aria-label` en `<main>` y `focus-visible` en el contenedor del paso.
- `WizardNav.tsx`: `aria-label` en botones de navegación y `focus-visible:ring`.
- `TransportCard.tsx` y `CategoryCard.tsx`: `aria-pressed` para indicar selección y `focus-visible:ring`.
- `PeopleStep.tsx`: `aria-live` en el contador para anunciar cambios y `focus-visible:ring` en botones.
- `BudgetStep.tsx`: touch targets de presets a `min-h-11` (44px), labels de min/max formateados y `focus-visible:ring`.
- `ResultStep.tsx`: `aria-label` descriptivo en el CTA de WhatsApp y `focus-visible:ring`.
- `DestinationStep.tsx` y `WorldMap.tsx`: `role="application"` + `aria-label` en el mapa interactivo, `focus-visible:ring` en botón de confirmar destino.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se priorizó accesibilidad sin romper el look: `focus-visible:ring` solo aparece al navegar con teclado.
- `prefers-reduced-motion` ya estaba respetado en F2–F6; no se agregaron nuevas animaciones en F7.
- `safe-area-inset-bottom` ya estaba en el footer del wizard desde F1.

**Pendientes:**
- Ninguno. MVP completo.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-05 — F8 Seleccionar varios destinos (opencode)

**Hecho:**
- `src/state/types.ts`: reemplazado `destination: Destination | null` por `destinations: Destination[]` y `setDestination` por `toggleDestination`.
- `src/state/store.ts`: `toggleDestination` agrega/quita destinos; el presupuesto mínimo se calcula como la suma de `minBudget` de los destinos seleccionados y el máximo como `min * 2`.
- `src/features/destination/WorldMap.tsx`: prop `selected` ahora es un array; animación al mapa solo cuando se agrega un nuevo destino; marcadores seleccionados detectados por `id`.
- `src/features/destination/DestinationStep.tsx`: lista de destinos seleccionados con botón "Quitar" por cada uno; presupuesto mínimo general; botón "Continuar".
- `src/features/budget/BudgetStep.tsx`: adaptado para mostrar nombres de destinos y presupuesto general.
- `src/features/result/ResultStep.tsx`: muestra "Destino" o "Destinos" según la cantidad seleccionada.
- `src/lib/whatsapp.ts`: mensaje usa "Destino" o "Destinos" y lista los nombres separados por coma.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se mantuvo `onSelect` como nombre de callback en `WorldMap` para minimizar cambios; internamente se comporta como toggle.
- El orden de renderizado de marcadores prioriza los seleccionados (quedan arriba), igual que antes.
- Si se quita un destino, el globo no anima automáticamente; solo anima cuando se agrega uno nuevo.

**Pendientes:**
- Ninguno.

**Siguiente:** F9 — Días por destino.

---

## 2026-10-05 — F9 Días por destino (opencode)

**Hecho:**
- `src/state/types.ts`: agregado `daysByDestination: Record<string, number>` a `FormState`, nuevo `StepId` `'days'` y acción `setDestinationDays` en `AppState`.
- `src/state/store.ts`: agregado `'days'` al `STEP_ORDER` entre `destination` y `transport`; `toggleDestination` inicializa 1 día al agregar un destino y limpia el registro al quitarlo; nueva acción `setDestinationDays` con mínimo 1.
- `src/features/days/DaysStep.tsx`: nueva página con stepper de días para cada destino seleccionado (máximo 30), animación GSAP en el número y fallback si no hay destinos.
- `src/features/days/index.ts`: exporta `DaysStep`.
- `src/features/wizard/useWizardStep.ts`: registrado `DaysStep` en el wizard con título "Días".
- `src/lib/whatsapp.ts`: `formatDestinations` incluye los días de cada destino; mensaje ejemplo: "Destinos: México (5 días), Brasil (10 días)".
- `src/features/result/ResultStep.tsx`: el resumen de destinos muestra nombre + días.
- `feature_list.json`: F9 marcada como `done` y corregida coma faltante tras `updated`.
- Verificaciones: `bun run build` ✅.

**Decisiones:**
- La página de días va inmediatamente después de elegir destinos, antes de transporte, porque la duración define el resto del itinerario.
- Default de 1 día por destino nuevo; se puede incrementar hasta 30, suficiente para la mayoría de los viajes de Destina.
- Se reutilizó el patrón visual y de animación de `PeopleStep` para mantener consistencia.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-05 — Remoción de la sección Transporte (opencode)

**Hecho:**
- `src/state/types.ts`: eliminado `transport` de `FormState`, `setTransport` de `AppState` y `'transport'` de `StepId`. Se conserva la interfaz `Transport` como tipo huérfano.
- `src/state/store.ts`: eliminado `transport` del estado inicial, `setTransport` del store y `'transport'` del `STEP_ORDER`.
- `src/features/wizard/useWizardStep.ts`: eliminada la importación y el registro de `TransportStep`.
- `src/features/result/ResultStep.tsx`: eliminada la línea de transporte del resumen.
- `src/lib/whatsapp.ts`: eliminada la línea `Transporte: ...` del mensaje.
- Eliminados los archivos activos de la feature:
  - `src/features/transport/` (completa)
  - `src/data/transports.ts`
- `feature_list.json`: actualizada la nota de F3 indicando que fue removido por decisión de producto.
- Verificaciones: `bun run build` ✅.

**Decisiones:**
- Se eliminaron los archivos React y de datos de transporte para evitar errores de typecheck, ya que `tsc -b` compila todos los archivos del proyecto aunque no se importen.
- Se conservaron los SVGs en `public/images/transport/` porque no afectan el build y pueden reutilizarse si se vuelve a incluir la feature.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-05 — F10 Editar sección presupuesto (opencode)

**Hecho:**
- `src/state/types.ts`: reemplazado `BudgetRange` por `BudgetCategory` (id, name, description); `FormState.budget` pasó a `budgetCategory: BudgetCategory | null`; `AppState` ahora expone `setBudgetCategory` en lugar de `setBudget`/`setBudgetMax`.
- `src/state/store.ts`: eliminado el cálculo monetario de presupuesto, el estado `budget` y las acciones `setBudget`/`setBudgetMax`; agregada `setBudgetCategory`.
- Creado `src/data/budgetCategories.ts` con las tres categorías: Low-cost, Calidad-precio y Lujo, cada una con descripción.
- Creado `src/features/budget/BudgetCategoryCard.tsx`: card con icono SVG, nombre, descripción, check visual y micro-animación GSAP elástica al seleccionar.
- Reescrito `src/features/budget/BudgetStep.tsx`: muestra las tres cards de categoría en lugar del slider monetario.
- Eliminado `src/features/budget/BudgetDisplay.tsx` (obsoleto).
- `src/features/result/ResultStep.tsx`: el resumen muestra la categoría de presupuesto seleccionada.
- `src/lib/whatsapp.ts`: el mensaje muestra `Categoría: Low-cost` (u otra seleccionada) en lugar del rango en USD.
- `feature_list.json`: F10 marcada como `done`; F5 actualizada con nota indicando que fue reemplazada por F10.
- Verificaciones: `bun run build` ✅.

**Decisiones:**
- Se mantuvo el paso con id `'budget'` y título "Presupuesto" para no alterar la navegación, aunque ahora representa una categoría de gasto en vez de montos.
- Cada card incluye una descripción con bullets implícitos (párrafo explicativo) para ayudar al usuario a elegir.
- Se reutilizó el patrón visual de `CategoryCard` para mantener consistencia.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-07 — F11 Capitales y provincias en el globo (opencode)

**Hecho:**
- Creado `src/data/places.ts` con `Place` (`id`, `name`, `lat`, `lon`, `country`, `kind`, `minZoom`, `maxZoom`) y el array `PLACES` con 24 países, 24 capitales y 30 provincias/ciudades cubriendo los países y lugares listados en F11.
- Creado `src/features/destination/PlaceMarker.tsx`: marcador no seleccionable con el mismo look de los marcadores seleccionables (punto con stroke blanco, glint y label con halo), diferenciando por `kind`: país (teal), capital (celeste), provincia (slate). Fade-in GSAP respetando `prefers-reduced-motion`.
- Modificado `src/features/destination/WorldMap.tsx`:
  - Renderiza la capa de lugares debajo de los marcadores seleccionables.
  - Países visibles por defecto (`minZoom 0`) y se ocultan al pasar el zoom 2.0 (`maxZoom`); capitales y provincias aparecen al hacer zoom (`minZoom 2.3`).
  - Se omiten los lugares que coinciden (<0.6°) con un destino seleccionable para no duplicar marcadores.
  - Decluttering de labels por distancia en pantalla (`MIN_LABEL_GAP 26`), priorizando países > capitales > provincias.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Cambio de enfoque respecto a la primera versión: ya no se muestran todas las capitales a la vez; el globo arranca mostrando países y, al hacer zoom sobre uno, se revelan su capital y provincias, evitando un mapa saturado de etiquetas.
- La capa de lugares es solo de visualización: no es seleccionable ni toca el store, respetando la nota de no romper la selección de destinos.
- Se reutiliza la proyección ortográfica ya creada en el render para proyectar los lugares sin reconstruirla por cada punto.
- Capital de Brasil es Brasilia (agregada aunque no estaba en `lugaresDeBrasil`); Reino Unido/UK se unificaron en `Reino Unido`.

**Ajuste de estilo y flujo (feedback del usuario):**
- Los países ahora usan el mismo círculo amarillo de los destinos seleccionables (mismo look: dot ámbar con stroke blanco, glint y label con halo).
- Los destinos seleccionables pasaron todos a `minZoom 2.3` (`destinations.ts`), de modo que la vista base muestra solo países y las ciudades (destinos, capitales y provincias) aparecen al hacer zoom.
- El decluttering de labels se siembra con las posiciones de los destinos visibles para que los labels de países/ciudades no se superpongan con los destinos seleccionables.
- `DestinationStep.tsx`: subtítulo actualizado para explicar el flujo (países → zoom → destinos).

**Países seleccionables (feedback: "no se puede seleccionar"):**
- Los países ahora son seleccionables como destinos del viaje: agregado `minBudget` a cada país en `places.ts` y exportado `COUNTRY_DESTINATIONS` (`Destination[]`).
- `WorldMap.tsx` renderiza los países con `DestinationMarker` (mismo comportamiento: tap/teclado selecciona, verde + pulso al estar seleccionado), con `showLabel` para mantener el decluttering de labels.
- El tap resuelve por id en un mapa único `DESTINATION_BY_ID` (destinos de ciudad pisan países homónimos, ej. México).
- Países seleccionados quedan visibles a cualquier zoom; los no seleccionados se ocultan al pasar zoom 2.0.
- `DestinationMarker.tsx`: nueva prop opcional `showLabel` (default true).
- Verificado con Playwright: tap en Argentina/Brasil los agrega al viaje, la selección persiste al hacer zoom y sigue funcionando la selección de ciudades.

**Capitales y provincias seleccionables (feedback: "debería poder seleccionarlas"):**
- Agregado `minBudget` a todas las capitales y provincias en `places.ts` y exportado `PLACE_DESTINATIONS` (`Destination[]`).
- `PlaceMarker.tsx`: ahora es interactivo (tap/teclado, `data-marker-id`, `role="button"`) manteniendo su look chiquito; al seleccionar el punto se pone verde, crece levemente y pulsa con anillo verde (igual patrón que `DestinationMarker`).
- `WorldMap.tsx`: `DESTINATION_BY_ID` incluye países, lugares y destinos; los lugares seleccionados quedan visibles a cualquier zoom (como los destinos) y sus labels se siembran en el decluttering para que nada se superponga.
- Verificado con Playwright: tap en Córdoba la agrega al viaje, persiste al alejar el zoom, y siguen pasando los tests de países y destinos de ciudad.

**Destinos destacados con look chiquito azul (feedback del usuario):**
- Madrid, Roma, París, Nueva York, Cancún, México, São Paulo, Buenos Aires, Bariloche, Bali y Tokio ahora se renderizan con el mismo estilo chiquito azul de las capitales en vez del círculo amarillo grande.
- `PlaceMarker.tsx`: refactorizado a props genéricas (`id`, `name`, `kind`) para poder renderizar tanto lugares como destinos destacados; `DestinationMarker` quedó solo para países (amarillo grande).
- `WorldMap.tsx`: los destinos destacados se dibujan como `PlaceMarker` con `kind="capital"` (azul) y solo cuando están visibles; los países quedan debajo en z-order.
- Verificado con Playwright: Buenos Aires se ve/selecta como marcador chiquito y Argentina sigue selectable en la vista base.

**Ajuste: más zoom en el globo (feedback del usuario):**
- `WorldMap.tsx`: `MAX_SCALE` subió de 3.5 a 5, y luego a 11 para que en el celular (y para gente con visión reducida) se pueda acercar mucho más a países y ciudades (radio visible ~5°).
- Verificado con Playwright en viewport mobile: zoom profundo y arrastre sin errores.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-08 — F12 Agrega destino (opencode)

**Hecho:**
- `src/state/types.ts`: agregado campo opcional `custom?: boolean` a `Destination` para distinguir destinos creados por el usuario.
- `src/state/store.ts`: agregada acción `addCustomDestination(name)` que crea un destino con id único, coordenadas neutrales, `minBudget: 0`, `minZoom: 0` y `custom: true`; lo agrega a `destinations` e inicializa `daysByDestination` en 1.
- Creado `src/features/destination/CustomDestinationInput.tsx`:
  - Input con label "¿No encontrás tu destino?" y placeholder "Escribí tu destino".
  - Botón "Agregar destino" al lado del input.
  - Validación: no permite números (filtra dígitos en `onChange`, previene teclas numéricas en `onKeyDown`, valida al enviar).
  - Mensaje de error visual cuando se intenta ingresar un número o enviar vacío.
  - Submit con Enter o click en el botón.
- `src/features/destination/DestinationStep.tsx`: integrado `CustomDestinationInput` debajo del `WorldMap` y del resumen de destinos seleccionados.
- `src/features/destination/WorldMap.tsx`: la animación de centrado al agregar un destino se saltea los destinos `custom` (no tienen coordenadas en el globo).
- `feature_list.json`: F12 marcada como `done` con archivos y acceptance actualizados.
- Verificaciones: `bun run build` ✅.

**Decisiones:**
- Los destinos custom comparten el mismo tipo `Destination` y fluyen por todo el wizard (días, resumen, WhatsApp) sin cambios adicionales.
- Presupuesto mínimo sugerido no se ve afectado porque los destinos custom tienen `minBudget: 0`.
- No se renderizan marcadores custom en el globo porque no pertenecen a `DESTINATIONS` ni `PLACES`.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-08 — Ajuste: selección múltiple de categorías (opencode)

**Hecho:**
- `src/state/types.ts`: cambiado `category: Category | null` por `categories: Category[]`; reemplazada la acción `setCategory` por `toggleCategory`.
- `src/state/store.ts`: estado inicial ahora usa `categories: []`; implementada `toggleCategory` que agrega o quita una categoría del array.
- `src/features/category/CategoryStep.tsx`: ahora usa `categories` y `toggleCategory`; cada card muestra si está seleccionada; el usuario puede elegir varias categorías a la vez. Actualizado el subtítulo a "Elegí una o varias categorías".
- `src/features/category/CategoryCard.tsx`: sin cambios de API, sigue recibiendo `selected` y `onSelect`; el check visual sigue funcionando por categoría.
- `src/features/result/ResultStep.tsx`: el resumen muestra las categorías seleccionadas separadas por coma.
- `src/lib/whatsapp.ts`: agregada función `formatCategories`; el mensaje lista todas las categorías elegidas.
- `feature_list.json`: actualizada nota y acceptance de F4 para reflejar selección múltiple.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se mantuvo el mismo patrón visual de check en cada card; al tocar una categoría ya seleccionada se deselecciona.
- El label del resumen sigue siendo "Estilo" y las categorías se muestran como lista separada por comas.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-25 — F13 Editar colores y agregar logo (Kimi K2.7 Code)

**Hecho:**
- `src/index.css`: color primario y anillo cambiados de `#0d9488` a `#6e1f3c`.
- `index.html`: `theme-color` actualizado a `#6e1f3c`.
- `src/features/destination/PlaceMarker.tsx` y `DestinationMarker.tsx`: color de selección y anillo de pulso cambiados a `#6e1f3c`.
- `src/features/wizard/Wizard.tsx`: header ahora usa fondo blanco y muestra el logo de Destina en lugar del texto "Destina".
- Procesado el logo `DestinaLogo2.png` (redimensionado a 512x512) y guardado en `public/images/logo.png`.
- `feature_list.json`: F13 marcada como `done` con archivos y notas actualizadas.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Ajuste posterior (feedback del usuario):**
- `src/features/wizard/Wizard.tsx`: logo movido a la izquierda del header, junto a la barra de progreso, usando `rounded-full` para recortar el cuadrado blanco del PNG y que se vea solo el círculo vino.
- `index.html`: favicon cambiado de `/favicon.svg` a `/images/logo.png` y luego a `/favicon.png`.
- `public/images/logo.png`: regenerado para que el fondo blanco puro coincida con el header.
- `public/favicon.png`: generado con Pillow como versión circular con fondo transparente (128x128) para que el icono de pestaña se vea redondo.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se usó `DestinaLogo2.png` con fondo blanco y se pintó el header de blanco puro para que el logo encaje.
- `rounded-full` en la imagen elimina las esquinas blancas del PNG y deja visible solo el círculo del logo.
- El logo mide 512x512 y se renderiza a `h-14 w-14` al lado de la barra de progreso.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar deploy en Cloudflare Pages tras el push.

---

## 2026-10-25 — F14 Menores de edad (Kimi K2.7 Code)

**Hecho:**
- `src/state/types.ts`: agregado `minors: number` a `FormState` y `setMinors` a `AppState`.
- `src/state/store.ts`: inicializado `minors: 0`; `setPeople` resetea `minors` a 0 cuando la cantidad de adultos baja a 1; agregada acción `setMinors` con mínimo 0.
- `src/ui/Checkbox.tsx`: nuevo componente accesible con estilo del proyecto (borde redondeado, color primario al marcar, focus ring).
- `src/features/people/PeopleStep.tsx`: reescrito para mostrar el stepper de adultos con label 'adultos'; si hay más de 1 adulto aparece el checkbox 'Viajo con menores de edad' que habilita un segundo stepper para menores, con animación GSAP en ambos números.
- `src/features/result/ResultStep.tsx`: el resumen muestra 'Viajeros' con adultos y menores cuando corresponde.
- `src/lib/whatsapp.ts`: el mensaje incluye adultos y menores (ej. 'Viajeros: 2 adultos y 1 menor').
- `feature_list.json`: F14 marcada como `done` con archivos y notas actualizadas.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se integró la selección de menores dentro del paso existente `people` en lugar de agregar un nuevo paso al wizard, porque la feature pide que sea "en la misma sección".
- El checkbox se renderiza siempre que haya al menos 1 adulto.
- La cantidad de menores es independiente de la cantidad de adultos: siempre hay al menos 1 adulto y los menores se suman por separado sin límite.
- El stepper de menores usa mínimo 1 cuando está visible.

**Corrección (feedback del usuario):**
- `src/state/store.ts`: `setPeople` ya no ajusta `minors` y `setMinors` ya no limita a `people`; los menores son independientes de los adultos.
- `src/features/people/PeopleStep.tsx`: se quitó `max={people}` del stepper de menores para permitir cualquier cantidad de menores.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-25 — F15 Step de calendario (Kimi K2.7 Code)

**Hecho:**
- `src/state/types.ts`: agregado `selectedDates: string[]`, `calendarMonth: { year, month }` e `isFlexible: boolean` a `FormState`; nuevo `StepId` `'calendar'`; acciones `toggleDate`, `setCalendarMonth` y `setFlexible` en `AppState`.
- `src/state/store.ts`: agregado `'calendar'` al `STEP_ORDER` después de `'days'`; estado inicial con mes actual, fechas vacías y flexibilidad en false; implementadas las nuevas acciones.
- `src/features/calendar/CalendarStep.tsx`: calendario mensual navegable con flechas de mes anterior/siguiente, grilla de días seleccionables, límite `totalDays + 2`, mensaje de error temporal al excederse, resumen de fechas seleccionadas y checkbox 'Soy flexible con los días de viaje'.
- `src/features/calendar/index.ts`: exporta `CalendarStep`.
- `src/features/wizard/useWizardStep.ts`: registrado `CalendarStep` con título 'Fechas'.
- `src/features/result/ResultStep.tsx`: el resumen muestra las fechas seleccionadas y la flexibilidad.
- `src/lib/whatsapp.ts`: el mensaje incluye las fechas y una línea 'Soy flexible con los días de viaje.' cuando corresponde.
- `feature_list.json`: F15 marcada como `done` con archivos y notas actualizadas.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Las fechas se guardan como strings `YYYY-MM-DD` para evitar problemas de timezone.
- El calendario arranca en el mes actual y permite navegar libremente hacia atrás o adelante.
- El límite de selección se calcula como la suma de días por destino + 2, contemplando los vuelos de ida y vuelta.
- Se reutilizó el componente `Checkbox` de `src/ui` para mantener consistencia visual.
- El diseño del calendario sigue el lenguaje del proyecto: card blanca redondeada, botones circulares, color primario para días seleccionados y tipografía Inter.

**Corrección (feedback del usuario):**
- La selección pasó de ser día por día a rango con dos toques: el primer toque marca el inicio, el segundo toque completa el rango entre inicio y fin.
- Se agregó `setSelectedDates` al store para reemplazar el rango completo en una sola acción.
- Si se toca un día ya seleccionado, se limpia toda la selección para empezar de nuevo.
- El día de inicio se resalta con fondo primario/20 mientras espera el segundo toque.
- Preview visual al pasar el mouse: los días que formarían parte del rango se muestran en gris (`bg-muted`) antes de confirmar, limitado al máximo de días permitidos.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-25 — Ajuste UI: header y footer más compactos en mobile (Kimi K2.7 Code)

**Hecho:**
- `src/features/wizard/Wizard.tsx`: header más compacto en mobile (`py-2`, logo `h-10`, `px-4`) manteniendo el tamaño desktop; main con menos padding en mobile; footer más chico en mobile.
- `src/features/wizard/WizardNav.tsx`: botones 'Atrás' y 'Siguiente' más pequeños en mobile (`px-4 py-2.5 text-sm`) y tamaño normal en desktop.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se usaron clases responsive `md:` para no afectar la experiencia desktop, donde el espacio vertical es menos crítico.
- Se mantuvo el safe-area-inset-bottom en el footer para iPhones con notch.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-25 — F16: refactor del step resultado como boleto de avión (Kimi K2.7 Code)

**Hecho:**
- `src/features/result/ResultStep.tsx`: nuevo diseño de pasaje/boarding pass vertical (mobile-first). Header primario con ícono de avión y marca Destina, secciones "Desde/Hacia", "Pasajeros", "Fechas", "Estilo", "Categoría", "Flexibilidad" y "Destinos y días", separadores punteados con muescas laterales y código de barras decorativo. Se eliminó el preview del mensaje de WhatsApp.
- `src/lib/whatsapp.ts`: mensaje refactorizado con saludo principal (`✈️ ¡Hola Destina!`), emojis por sección, lista con guiones para destinos y días, negritas con asteriscos y cierre amigable.
- `feature_list.json`: F16 marcada como `done` con archivos y notas actualizadas.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se mantuvo el estilo visual del proyecto: colores primarios, bordes redondeados, tipografía Inter, fondo background.
- El pasaje es vertical para respetar mobile-first; en desktop crece proporcionalmente pero conserva la orientación vertical.
- Se mostraron solo los datos ingresados; "Desde Argentina" como origen por defecto porque el formulario no lo pregunta.
- Corrección post-feedback: se quitaron los emojis del mensaje de WhatsApp porque algunos navegadores/WhatsApp los decodificaban como caracteres corruptos (�). El mensaje sigue siendo legible usando negritas con asteriscos.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar visualmente en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-25 — Ajuste F11: más lugares y marcadores que crecen con el zoom (Kimi K2.7 Code)

**Hecho:**
- `src/data/places.ts`: se separaron los lugares en tres niveles de zoom (capitales 2.3, ciudades grandes 3.3, provincias/ciudades secundarias 5.0) y se agregaron ~25 nuevas ciudades/provincias distribuidas por los países principales.
- `src/features/destination/PlaceMarker.tsx`: ahora recibe `scale` y aumenta el tamaño del punto, stroke y label a medida que crece el zoom para que no se vean diminutos.
- `src/features/destination/DestinationMarker.tsx`: igual ajuste de escala para los marcadores de país.
- `src/features/destination/WorldMap.tsx`: pasa `scale` a ambos tipos de marcadores.
- `feature_list.json`: actualizada la nota de F11.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se prefirió "agregar más provincias" en niveles de zoom progresivos en lugar de solo agrandar los puntos existentes, para mantener la legibilidad y darle al usuario más opciones al acercar.
- El crecimiento del marcador es lineal moderado (`1 + (scale - 2.3) * 0.12`) para no tapar el mapa a zoom alto.
- Se mantuvo el decluttering de labels para evitar saturación visual.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-25 — Fix: botón + de días por destino en mobile (Kimi K2.7 Code)

**Hecho:**
- `src/features/days/DaysStep.tsx`: en mobile cada selector de días ahora se apila verticalmente (nombre arriba, controles abajo centrados) para evitar que el botón `+` se salga de la card con nombres de destino largos. En desktop se mantiene el layout horizontal.
- Se redujo ligeramente el tamaño de los botones y del número en mobile; se agregó `truncate` al nombre.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-25 — F14 ajuste: menores independientes de adultos (Kimi K2.7 Code)

**Hecho:**
- `src/features/people/PeopleStep.tsx`: se quitó `max={people}` del stepper de menores, permitiendo cualquier cantidad de menores sin importar cuántos adultos haya.
- `src/state/store.ts`: `setPeople` ya no reduce `minors` al cambiar la cantidad de adultos; los menores quedan independientes.
- `feature_list.json`: actualizada la nota de F14.
- `agents_sessions.md`: actualizada la entrada de F14 con la nueva regla.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se mantiene el checkbox "Viajo con menores de edad" y el stepper con mínimo 1 cuando está visible.
- Siempre hay al menos 1 adulto (`people >= 1`), pero los menores se suman por separado sin límite superior.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-25 — Fix: setMinors ya no limita a cantidad de adultos (Kimi K2.7 Code)

**Hecho:**
- `src/state/store.ts`: se quitó `Math.min(minors, state.people)` de `setMinors`. Ahora solo limita a `>= 0`.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-26 — F17 Origen del viaje (Kimi K2.7 Code)

**Hecho:**
- `src/state/types.ts`: agregado `origin: string | null` a `FormState` y `setOrigin` a `AppState`.
- `src/state/store.ts`: inicializado `origin: null`; agregada acción `setOrigin` que guarda el valor trimado o `null`.
- `src/features/result/ResultStep.tsx`: al entrar al paso se solicita geolocalización del navegador una sola vez; en caso de éxito se resuelve ciudad/país con BigDataCloud reverse geocode; si el usuario niega, no hay geolocation o falla la API, aparece un input para escribir el origen. El botón '¡A viajar!' valida que haya origen y muestra error si está vacío. También se agregó un link 'Usar mi ubicación actual' para reintentar.
- `src/lib/whatsapp.ts`: el mensaje incluye la línea `*Desde:* ...` con el origen ingresado o resuelto.
- `feature_list.json`: F17 marcada como `done` con archivos y notas actualizados; fecha del proyecto actualizada.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se usó la API gratuita de BigDataCloud para reverse geocoding sin API key. Si falla o no devuelve datos, se muestra el input manual como fallback.
- La geolocalización automática solo se pide al montar el paso resultado; si el usuario borra el origen no se vuelve a pedir automáticamente, evitando ser intrusivo.
- El origen se guarda en el store como string simple para que fluya al resumen y al mensaje de WhatsApp sin cambios mayores.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-26 — F17 ajuste: input de origen siempre editable y mejora de resolución (Kimi K2.7 Code)

**Hecho:**
- `src/features/result/ResultStep.tsx`: el input de origen ahora siempre está visible dentro de la fila 'Desde', es más compacto y permite editar tanto la ubicación detectada como un origen manual. Se corrigió el comportamiento que ocultaba el input al escribir.
- `src/features/result/ResultStep.tsx`: la resolución de ubicación vía BigDataCloud ahora prioriza `locality` sobre `city` para evitar resultados como 'Departamento Capital, Argentina' y mostrar nombres de ciudad más representativos.
- `feature_list.json`: actualizada la nota de F17.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- El input permanece habilitado permanentemente para que el usuario pueda corregir cualquier ubicación, ya sea detectada automáticamente o ingresada manualmente.
- El spinner de carga aparece dentro del input a la derecha, sin tapar el campo.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-26 — F17 fix: permitir espacios en el input de origen (Kimi K2.7 Code)

**Hecho:**
- `src/state/store.ts`: se quitó el `trim()` de `setOrigin` para que el input pueda contener espacios mientras el usuario escribe (por ejemplo, 'La Rioja'). La validación de campo vacío y el mensaje de WhatsApp siguen usando `trim()` en el render/mensaje.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- El store guarda el valor tal cual lo escribe el usuario; el trimming se aplica solo al momento de validar y enviar el mensaje.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-27 — F17 ajuste: botón '¡A viajar!' siempre habilitado y origen marcado como obligatorio (Kimi K2.7 Code)

**Hecho:**
- `src/features/result/ResultStep.tsx`: el botón '¡A viajar!' ahora siempre se ve habilitado. Si se presiona sin origen, se muestra un error claro indicando que el campo 'Desde' es obligatorio.
- `src/features/result/ResultStep.tsx`: el label 'Desde' incluye un asterisco de campo obligatorio, el input recibe borde rojo y `aria-invalid` cuando hay error, y el mensaje de error explica que debe ingresar desde dónde quiere viajar.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se prefirió mantener el CTA siempre activo para que el usuario entienda que puede interactuar, y usar la validación al enviar para guiarlo.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-27 — Ajuste UI: resaltar instrucción de zoom en step destino (Kimi K2.7 Code)

**Hecho:**
- `src/features/destination/DestinationStep.tsx`: la frase 'hacé zoom sobre él para ver y elegir sus ciudades' ahora aparece en negrita y color bordo `#702841` para que los usuarios entiendan que deben acercar el globo para ver ciudades.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se usó `style` inline para el color exacto `#702841` y `font-semibold` para resaltar la acción sin romper el estilo del párrafo.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-27 — F18 Validaciones de steps (Kimi K2.7 Code)

**Hecho:**
- `src/state/types.ts`: agregado `stepError: string | null` a `WizardState` y `setStepError` a `AppState`.
- `src/state/store.ts`: implementada la validación en `nextStep` según el paso actual: destination requiere al menos un destino, calendar al menos un día, category al menos una categoría y budget una categoría de presupuesto. Si falla, se guarda el error y no se avanza; si pasa, se limpia el error y se avanza. `previousStep` y `goToStep` también limpian el error.
- `src/features/destination/DestinationStep.tsx`: muestra el mensaje de error del store y lo limpia al seleccionar o agregar un destino.
- `src/features/calendar/CalendarStep.tsx`: muestra el error de validación y lo limpia al seleccionar un día.
- `src/features/category/CategoryStep.tsx`: muestra el error y lo limpia al seleccionar una categoría.
- `src/features/budget/BudgetStep.tsx`: muestra el error y lo limpia al seleccionar una categoría de presupuesto.
- `feature_list.json`: F18 marcada como `done` con archivos y notas actualizados.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- El botón 'Siguiente' del footer siempre está habilitado; la validación ocurre al hacer click y se muestra el error en el step correspondiente, cumpliendo con lo pedido.
- Se centralizó la lógica de validación en `nextStep` del store para evitar dispersar reglas entre componentes; el mensaje de error se guarda en el store para que cada step lo pueda renderizar donde mejor encaje visualmente.
- Se mantiene el error local del calendario para el límite de días seleccionables, separado del error de validación de 'al menos un día'.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-27 — Ajuste calendario: selección de fecha de ida + rango automático (Kimi K2.7 Code)

**Hecho:**
- `src/features/calendar/CalendarStep.tsx`: reescrito para que el usuario seleccione solo la fecha del vuelo de ida; el calendario completa automáticamente el rango de días según `total de días por destino + 2` (vuelos de ida y vuelta).
- `src/features/calendar/CalendarStep.tsx`: agregado un input de texto arriba del calendario con formato `DD-MM-AAAA`, sincronizado en ambos sentidos: escribir una fecha válida navega el calendario a ese mes y resalta el rango; tocar una fecha en el calendario actualiza el input.
- `src/features/calendar/CalendarStep.tsx`: actualizada la descripción para indicar que se debe seleccionar el día del vuelo de ida.
- `src/features/calendar/CalendarStep.tsx`: el día de ida se resalta con el color primario sólido y el resto del rango calculado con `bg-primary/20`, para que el usuario distinga la fecha de partida.
- `feature_list.json`: actualizada la nota de F15 para reflejar la nueva experiencia del calendario.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se eliminó la selección de rango con dos toques porque no tiene sentido permitir menos días de los configurados en el paso 'Días'.
- El input y el calendario comparten la misma fuente de verdad (`selectedDates`), con estado local para el input que se inicializa desde el store y se actualiza en cada interacción.
- Se mantuvo el checkbox 'Soy flexible con los días de viaje' y el mensaje de error de validación de F18 (al menos un día seleccionado).

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-27 — Ajuste calendario: quitar input, dejar solo calendario (Kimi K2.7 Code)

**Hecho:**
- `src/features/calendar/CalendarStep.tsx`: eliminado el input de texto `DD-MM-AAAA`; el usuario selecciona la fecha de ida directamente desde el calendario.
- `src/features/calendar/CalendarStep.tsx`: actualizada la descripción para indicar que debe tocar el día del vuelo de ida en el calendario.
- `feature_list.json`: actualizada la nota de F15 para reflejar que la selección se hace solo por calendario.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se prefirió la interacción directa con el calendario para simplificar la UI y evitar duplicar controles.
- Se mantiene el rango automático, el resaltado del día de ida y el resto del viaje, y el checkbox de flexibilidad.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-10-27 — F19 Edades de los menores de edad (Kimi K2.7 Code)

**Hecho:**
- `src/state/types.ts`: agregado `minorAges: (number | null)[]` a `FormState` y las acciones `setMinorAges` y `setMinorAge` a `AppState`.
- `src/state/store.ts`: inicializado `minorAges: []`; `setMinors` ajusta el array agregando `null` o truncando según la nueva cantidad; agregadas `setMinorAges` y `setMinorAge`; `nextStep` valida que, si hay menores, todas las edades estén ingresadas entre 0 y 17 antes de avanzar de `people` a `category`.
- `src/features/people/PeopleStep.tsx`: agregada una card con inputs numéricos para cada menor, con aviso de que las edades son al momento del viaje hasta el vuelo de vuelta. Los inputs solo aceptan números enteros entre 0 y 17.
- `src/features/result/ResultStep.tsx`: el resumen de pasajeros muestra las edades de los menores.
- `src/lib/whatsapp.ts`: el mensaje incluye las edades de los menores junto a la cantidad de viajeros.
- `feature_list.json`: F19 marcada como `done` con archivos y notas actualizados.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se integró la carga de edades dentro del paso existente `people` para mantener todo lo relacionado a viajeros en un mismo lugar y no agregar un paso condicional al wizard.
- Se usó `minorAges: (number | null)[]` para distinguir entre una edad no ingresada (`null`) y una edad válida (0 a 17), facilitando la validación de campos obligatorios.
- Se usó `type="number"` con `inputMode="numeric"` para mostrar teclado numérico en mobile y se valida el contenido contra la expresión regular `^\d+$` para rechazar letras, signos o decimales.
- El diseño de la card sigue el lenguaje visual del proyecto: bordes redondeados, fondo blanco, inputs con focus ring y tipografía Inter.

**Corrección (feedback del usuario):**
- `src/features/people/PeopleStep.tsx`: el rango válido ahora es 1 a 17 años; no se permite 0.
- `src/features/people/PeopleStep.tsx`: agregado mensaje de error visual que se muestra cuando el input está vacío, contiene un punto/signo u otro carácter no numérico, o está fuera de rango.
- `src/features/people/PeopleStep.tsx`: `onKeyDown` previene teclas no numéricas y muestra el mensaje de error.
- `src/state/store.ts`: `nextStep` valida que las edades sean entre 1 y 17.
- `feature_list.json`: nota de F19 actualizada.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Ajuste posterior (feedback del usuario):**
- `src/state/store.ts`: al intentar avanzar desde `people` sin completar todas las edades de los menores, ahora se muestra una alerta nativa (`window.alert`) con un mensaje claro: 'Ingresá la edad de todos los menores para continuar.' si falta alguna edad, o 'La edad de los menores debe estar entre 1 y 17 años.' si hay un valor inválido. También se sigue guardando el mensaje en `stepError` para mostrarlo en la UI.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Ajuste de alerta a mensaje de error visual (feedback del usuario):**
- `src/state/store.ts`: eliminada la alerta nativa (`window.alert`) en la validación del paso `people`; ahora solo se guarda el mensaje en `stepError`.
- `src/features/people/PeopleStep.tsx`: agregada la visualización del `stepError` como texto rojo (`text-red-600`), consistente con el resto de validaciones del wizard.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

---

## 2026-11-07 — Actualización de logo a SVG (Kimi K2.7 Code)

**Hecho:**
- `public/images/logo.svg`: agregado nuevo logo de Destina en formato SVG proporcionado por el usuario.
- `src/features/wizard/Wizard.tsx`: actualizada la referencia del logo de `/images/logo.png` a `/images/logo.svg`; se ajustó el estilo a `h-10 md:h-12 w-auto object-contain` y se eliminó el recorte circular (`rounded-full`) para respetar la forma original del SVG.
- `feature_list.json`: actualizada la nota de F13 para reflejar el nuevo archivo SVG.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se mantuvo el logo existente en `public/images/logo.png` por si se necesita fallback, pero la app ahora usa el SVG.
- El SVG tiene fondo blanco propio, por lo que no hace falta forzar un recorte circular ni fondo adicional en el header.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar visualmente en el navegador y hacer push a `main` para deploy automático.

---

## 2026-11-07 — Ajuste de tamaño del logo en header (Kimi K2.7 Code)

**Hecho:**
- `src/features/wizard/Wizard.tsx`: aumentado el tamaño del logo a `h-16 md:h-20` y reducido el padding vertical del header a `py-1 md:py-2` para mantener el header compacto y que siga mostrando principalmente el progreso.
- `src/features/wizard/Wizard.tsx`: reducido ligeramente el gap entre logo y barra de progreso a `gap-2 md:gap-3`.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Al agrandar el logo se redujo el padding del header para que la altura total no crezca demasiado y el progreso siga siendo el elemento principal del header.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar visualmente en el navegador y hacer push a `main` para deploy automático.

---

## 2026-11-07 — Logo como favicon en pestaña del navegador (Kimi K2.7 Code)

**Hecho:**
- `index.html`: agregado `<link rel="icon" type="image/svg+xml" href="/images/logo.svg" />` para usar el mismo logo de Destina como favicon en la pestaña del navegador. Se mantuvo el `<link rel="icon" type="image/png" href="/favicon.png" />` como fallback para navegadores que no soportan SVG favicons.
- `feature_list.json`: actualizada la nota de F13 para reflejar que el mismo SVG se usa como favicon.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se prefirió reutilizar `public/images/logo.svg` en lugar de generar un favicon separado, ya que el usuario pidió "el mismo" logo.
- El fallback PNG sigue siendo el icono anterior; si se quiere que el fallback también sea el logo de Destina, habría que generar un PNG nuevo a partir del SVG.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar visualmente en el navegador y hacer push a `main` para deploy automático.

---

## 2026-11-07 — Favicon con icono de Destina recortado (Kimi K2.7 Code)

**Hecho:**
- `public/favicon.svg`: creado nuevo favicon a partir del icono (flor/dalia) del logo de Destina, recortado y centrado, sin fondo blanco, para que se distinga en la pestaña del navegador.
- `index.html`: actualizada la referencia del favicon SVG a `/favicon.svg`.
- `feature_list.json`: actualizada la nota de F13 para reflejar el favicon recortado.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- El logo completo con texto no se leía como favicon porque el fondo blanco dominaba el cuadrado pequeño. Se extrajo solo el icono del logo para que ocupe todo el espacio del favicon.
- Se mantuvo el fallback PNG para compatibilidad con navegadores que no soportan SVG favicons.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar visualmente en el navegador y hacer push a `main` para deploy automático.

---

## 2026-11-03 — F20 Cambio de días a noches en step days y calendar (Kimi K2.7 Code)

**Hecho:**
- `src/features/days/DaysStep.tsx`: cambiado el título a '¿Cuántas noches en cada destino?', las etiquetas de cada selector a 'noche'/'noches', los `aria-label` a 'Disminuir/Aumentar noches', y el resumen inferior a 'Total de noches'.
- `src/features/calendar/CalendarStep.tsx`: eliminado el cálculo `totalTripDays = totalDays + 2`; ahora el rango automático se calcula sobre `totalNights` (la suma de noches por destino). Se actualizó la descripción para reflejar que se marcan las noches en destinos sin sumar días por vuelos.
- `src/features/result/ResultStep.tsx`: la fila de destinos muestra 'Destinos y noches' y cada destino se formatea con la cantidad de noches.
- `src/lib/whatsapp.ts`: la sección del mensaje cambió a '*Destinos y noches*' y cada destino se formatea con noches.
- `src/features/wizard/useWizardStep.ts`: el título del paso en la barra de progreso cambió de 'Días' a 'Noches'.
- `feature_list.json`: F20 marcada como `done` con archivos y notas actualizados.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅.

**Decisiones:**
- Se mantuvo el nombre interno del estado `daysByDestination` para no propagar un refactor masivo, pero conceptualmente ahora representa noches en toda la UI y en los mensajes.
- El rango del calendario se mantiene como días seleccionados sobre la grilla, pero la cantidad coincide exactamente con el total de noches configurado, cumpliendo con el requerimiento de 'solo reflejar eso y sacar +2'.

**Pendientes:**
- Ninguno.

**Siguiente:** Validar en el navegador y hacer push a `main` para deploy automático.

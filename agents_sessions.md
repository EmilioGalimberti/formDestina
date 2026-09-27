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

## 2026-09-27 — F2 v2 fix: sentido de arrastre y visibilidad de marcadores (opencode)

**Hecho:**
- Corregida `isVisible` en `src/lib/projection.ts` para usar el centro de vista real de la proyección ortográfica (`-lambda`, `-phi`) mediante producto escalar en coordenadas esféricas. Así los marcadores detrás del globo nunca se muestran, evitando que aparezcan destinos del hemisferio opuesto al hacer zoom.
- Ajustado el sentido del drag en `WorldMap.tsx`: ahora el contenido sigue al dedo (pan natural). Arrastrar hacia la izquierda mueve el globo hacia la izquierda.
- Verificaciones: `bun run build` ✅ y `bun run lint` ✅ (sin warnings).

**Siguiente:** F4 — Personas + Categoría.

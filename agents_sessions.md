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

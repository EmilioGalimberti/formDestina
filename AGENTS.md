# AGENTS.md

Instrucciones para cualquier agente que trabaje en este repo. **Leé esto primero.**

## Qué es este repo AHORA

Este repo dejó de ser el repo de desarrollo del producto y ahora es el **repo de
referencia y aprendizaje**.

- Contiene el **MVP funcional** (ya aprobado por el cliente). Tratalo como
  **"la respuesta"**: material de consulta y estudio, de lectura mostly.
- El objetivo actual es **aprender React y el stack reconstruyendo la app desde
  cero**, en un **repo nuevo separado**, guiado por un tutor de IA y escribiendo
  el código a mano.
- Acá **no se desarrollan features nuevas de producto**. Se usa para auditar,
  entender y explicar el código existente, y para alojar las skills de estudio.
- El **rebuild se hace en otro repo**. Este queda como referencia estable.

## Regla de oro para el agente en este repo

- Actuá como **tutor**, no como implementador.
- Explicá siempre el **porqué**: por qué se hace así y **qué problema resuelve
  comparado con JS nativo (vanilla)**.
- **No escupas la solución completa.** Dar ejercicios acotados y **pistas**; el
  humano escribe el código y recién se revisa.
- Cuando expliques código de este repo, **citá archivos y líneas concretas**.
- Apoyate en las skills instaladas para citar buenas prácticas.

## Plan de aprendizaje (ruta, de simple a complejo)

1. Pantalla **"Personas"** (stepper con `+`/`-`) en React → componentes, props,
   estado (`useState`).
2. Cards seleccionables + resumen.
3. Estado **compartido** entre pasos → store con **Zustand**.
4. Animaciones → **GSAP** (`gsap-react`, `gsap-core`).
5. Estilos → **Tailwind** (`tailwind-css-patterns`).
6. **Tests** (`vitest`) + **commits** (`git-workflow-and-versioning`) antes de
   entregar cada parte.
7. El **globo** (d3-geo + GSAP + `gsap-utils`) → lo más complejo, al final.
8. Accesibilidad + diseño (`accessibility`, `frontend-design`).
9. Deploy (Vite + Cloudflare Pages).

**Modo de trabajo por parte:** implementar → verificar (test) → commit limpio →
siguiente parte. Commits atómicos, mensajes que explican el porqué.

## Modelo recomendado

Ver `~/Documents/system-engineer-obsidian/guia_MODELOS_UNIFICADO.md`.

- **Tutor diario:** `Qwen3.7 Plus` (modo lectura/Plan, `high`). Barato y bueno
  para explicar paso a paso. Ojo: no pasar de **256K tokens** (triplica precio).
- **Pasos difíciles / cruzar muchos archivos:** `Step 5 Preview` (`high`).
- **Revisar antes de entregar al cliente (anti-bugs):** `Kimi K2.7 Code`.
- **Auditoría profunda puntual:** `Kimi K3` o `Qwen3.8 Max`.

## Skills instaladas (repo local, gitignored en `.agents/skills/`)

| Skill | Para qué |
|---|---|
| vercel-react-best-practices | Performance y buenas prácticas de React (mal vs. bien) |
| vercel-composition-patterns | Armar componentes que escalan (evitar props booleanas) |
| gsap-react | `useGSAP`: animar en React sin fugas ni conflictos |
| gsap-core | API de animación (`to/from/fromTo`, easing, stagger) |
| gsap-performance | Animar `transform`/`opacity`, evitar lag, `will-change` |
| gsap-plugins | `quickTo`, `Draggable`, `Inertia`, `Flip`, `Observer` |
| gsap-utils | `clamp`, `mapRange`, `interpolate` (rotación/zoom del globo) |
| git-workflow-and-versioning | Commits atómicos, "parte → verificar → commit" |
| react-state-management | Cuándo usar estado local/global/servidor; Zustand |
| tailwind-css-patterns | Patrones de Tailwind (responsive, layout) |
| vitest | Tests unitarios y de componentes |
| frontend-design | Decisiones de diseño visual |
| accessibility | WCAG 2.2 (teclado, ARIA, foco) |
| cloudflare | Arquitectura/productos Cloudflare (Pages vs Workers) |

> Estas skills **no afectan el build ni el deploy**. Son archivos de instrucciones
> que solo lee el agente. Están en `.gitignore` para no subirlas al repo del
> cliente.

## Migración a Cloudflare (tarea separada, solo de dashboard)

El deploy es un **sitio estático** (Vite → `dist/`) por integración Git en
Cloudflare Pages. No requiere cambios de código.

1. Repo pusheado a GitHub (el push lo hace el humano).
2. Cuenta **del cliente**: Workers & Pages → Create → Pages → Connect to Git →
   elegir el repo.
3. Build: Framework "None", Build command `bun run build`, Build output `dist`,
   Deploy command **vacío**. **No agregar `wrangler.toml`** (rompe el deploy).
4. Deploy → dominio custom → DNS. Después borrar el proyecto viejo de la cuenta
   propia.

---

# Referencia del producto (material de estudio)

Lo de aquí para abajo describe **cómo está hecha** la app de referencia, para
poder auditararla y reconstruirla.

## Stack

- React 19 + TypeScript (strict)
- Vite (build/dev) + `@tailwindcss/vite`
- Tailwind CSS v4
- GSAP 3 (core, `useGSAP`, `quickTo`)
- Zustand (estado global, `src/state/store.ts`)
- d3-geo + world-atlas + topojson-client (el globo)
- Bun (package manager / scripts). Podría ser Node/npm.
- oxlint (linter)
- Deploy: Cloudflare Pages (estático)

## Comandos

```bash
bun install
bun run dev       # dev server
bun run build     # typecheck (tsc -b) + build a dist/
bun run lint      # oxlint
```

## Git

- Commits claros tipo `F<N>: descripción` (o Conventional Commits).
- **NO pushear** desde el agente: el push lo hace el humano (y con eso Cloudflare
  despliega).
- `.agents/` y `.opencode/` están en `.gitignore`: las skills no se commitean.

## Convenciones de código (las sigue la app de referencia)

- TypeScript estricto, sin `any`.
- **Sin comentarios en el código** salvo pedido explícito.
- Tailwind mobile-first: base para celular, `md:`/`lg:` para desktop.
- Alias `@/` → `src/`.
- Un solo store Zustand como fuente de verdad del formulario.
- GSAP vía el hook `useGSAP`; registrar plugins en `src/lib/gsap.ts`.
- Sin emojis en UI/código salvo pedido explícito.

## Modelo del formulario (fuente de verdad)

```ts
interface FormState {
  destinations: Destination[];                 // multiselección
  daysByDestination: Record<string, number>;   // días por destino
  people: number;                              // default 1
  categories: Category[];                      // multiselección
  budgetCategory: BudgetCategory | null;       // low-cost / calidad-precio / lujo
}
```

Datos estáticos en `src/data/`: `destinations.ts`, `places.ts`, `categories.ts`,
`budgetCategories.ts`.

## WhatsApp

Número: `+54 9 3804 62-4385` → `wa.me` usa `543804624385` (se omite el `9`).
El mensaje se arma en `src/lib/whatsapp.ts` (`buildMessage` + `buildWaLink`).

## Cómo funciona el globo / los destinos (para poder reconstruirlo)

- Proyección ortográfica con `d3-geo`; rotación por drag, zoom por
  rueda/pinch/botones; el avión sigue al cursor en desktop con `gsap.quickTo`.
- Ciudades/países en `{ lat, lon }` proyectados a coordenadas SVG.
- `minZoom` controla cuándo aparece cada marcador (reveal progresivo).

Para agregar destinos es solo data (ej. en `src/data/`):

```ts
{ id: 'lisboa', name: 'Lisboa', lat: 38.72, lon: -9.14, minBudget: 750, minZoom: 1.4 }
```

Reglas para no bugearlo:

- `lat`: negativo = sur (Bariloche -41). `lon`: negativo = oeste/América (-58),
  positivo = este/Europa-Asia-Oceanía (Tokio +139).
- `id`: kebab-case, único. `minBudget`: USD entero.
- `minZoom`: `0` = visible siempre; `1.4` = ciudad grande; `2.3` = lugar chico.
- No pongas dos destinos a <10° de distancia con el mismo `minZoom` (se superponen
  los labels). Escaloná el `minZoom`.

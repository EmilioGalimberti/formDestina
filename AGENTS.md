# AGENTS.md

Instrucciones para trabajar en este repo (leídas por cualquier agente de código).

## Qué es este proyecto

"Form Primer Contacto" de Destina: formulario interactivo tipo juego para captar
el primer contacto con clientes y armar un viaje (destino, transporte, personas,
categoría, presupuesto) que al final genera un mensaje de WhatsApp para Martina.

- Spec original: `docs/product.md`
- Plan completo: `docs/plan.md`
- Control de features: `feature_list.json`
- Log de sesiones: `agents_sessions.md`

**Antes de tocar código, leé siempre `docs/plan.md` y `feature_list.json`.**

## Stack

- React 19 + TypeScript + Vite (strict)
- Tailwind CSS v4 (mobile-first, import en `src/index.css`)
- GSAP 3 (todos los plugins son gratis desde 2025) vía `src/lib/gsap.ts`
- Zustand para estado global (`src/state/store.ts`)
- Deploy: Cloudflare Pages (estático) vía integración Git con GitHub. Auto-deploy en
  cada push a `main`.

## Deploy (Cloudflare Pages)

No hay `wrangler.toml` en el repo (rompía el deploy: Cloudflare lo interpretaba como
Worker y corría `npx wrangler deploy` en vez de subir `dist`). La config vive en el
dashboard del proyecto Pages:

- Build command: `bun run build`
- Build output directory: `dist`
- Deploy command: **vacío**

El deploy es automático en cada push a `main`. No hace falta `CLOUDFLARE_API_TOKEN`.

## Comandos

```bash
bun install          # instalar deps
bun run dev          # dev server en http://localhost:5173
bun run build        # typecheck (tsc -b) + build a dist/
bun run lint         # oxlint
```

## Git

- El agente **solo hace commits**, con un mensaje claro tipo `F<N>: descripción`.
- **NO pushear.** El usuario hace el `git push` manualmente (y con eso Cloudflare
  despliega). El agente puede sugerir el push pero no ejecutarlo.

## Convenciones de código

- TypeScript estricto, sin `any`.
- **Sin comentarios en el código** salvo que se pidan explícitamente.
- Tailwind mobile-first: base para celular, `md:`/`lg:` para desktop.
- Alias `@/` → `src/`. Importar con `@/...`.
- Un solo store Zustand (`src/state/store.ts`) como fuente de verdad del formulario.
- GSAP se usa vía el hook `useGSAP`; registrar plugins solo en `src/lib/gsap.ts`.
- No commitear secretos ni keys. Nunca loguear `CLOUDFLARE_API_TOKEN`.
- Sin emojis en UI/código salvo pedido explícito.

## Cómo trabajar (una feature por sesión)

1. Leé `docs/plan.md` (sección 3) y `feature_list.json` para saber qué feature sigue
   y su estado.
2. Trabajá **solo** en `src/features/<feature>` y en los archivos compartidos que
   necesites (`src/state/`, `src/data/`, `src/lib/`, `src/ui/`).
3. Respetá el modelo del store (abajo) y las interfaces de `src/state/types.ts`.
4. Verificá con `bun run build` (debe pasar typecheck) antes de dar por terminado.
5. Al terminar, actualizá:
   - `feature_list.json`: marcá la feature como `done`.
   - `agents_sessions.md`: agregá la sesión con lo hecho, decisiones y pendientes.

## Modelo del formulario (fuente de verdad)

```ts
interface FormState {
  destination: Destination | null;
  transport: Transport | null;
  people: number;                          // default 1
  category: Category | null;
  budget: { min: number; max: number };    // min derivado del destino
}
```

Datos estáticos en `src/data/`:
- `destinations.ts`: `{ id, name, lat, lon, minBudget }`
- `transports.ts`, `categories.ts`

## WhatsApp

Número: `+54 9 3804 62-4385` → `wa.me` usa `543804624385` (se omite el `9` de móvil).
El mensaje se arma en `src/lib/whatsapp.ts` (`buildMessage` + `buildWaLink`).

## Cómo agregar destinos

Es solo data: agregar un objeto al array `DESTINATIONS` en `src/data/destinations.ts`.
NO tocar `WorldMap.tsx` ni `projection.ts` (visibilidad, zoom, selección y presupuesto
mínimo se derivan solos).

```ts
{ id: 'lisboa', name: 'Lisboa', lat: 38.72, lon: -9.14, minBudget: 750, minZoom: 1.4 },
```

Reglas para no bugearlo:

- `lat`: negativo = sur (Bariloche -41). `lon`: negativo = oeste/América (-58), positivo =
  este/Europa-Asia-Oceanía (Tokio +139). Signo invertido = marcador del otro lado del mundo.
- `id`: kebab-case, único. `minBudget`: USD entero.
- `minZoom` (a qué zoom aparece el marcador): `0` = hub principal visible siempre (ej. Buenos
  Aires), `1.4` = ciudad grande (ej. Madrid), `2.3` = lugar chico/turístico (ej. Cancún).
- No pongas dos destinos a <10° de distancia con el mismo `minZoom`: los labels se
  superponen. Escaloná el `minZoom` (el más importante en nivel menor).
- Verificá con `bun run build` y, si podés, abrí el dev y rotá hasta el destino nuevo.

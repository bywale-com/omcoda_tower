# Systems Register — State Document

**Project:** Tower  
**Surface:** `/register` — repo-native systems map  
**Status:** In progress (June 2026)  
**Audience:** Product, design, engineering — anyone adding UI holons or register views

---

## 1. What it is

The **Systems Register** is a password-gated route (`/register`) that mirrors the product UI as a **cosmetic systems map**:

- **Components tree** (left) — inventory of registered holons
- **Flow canvas** (right) — draggable view artboards (e.g. Board · Clients, Login · Sign in)

It is **not** the live app. No logic, no data fetching, no auth flows — only layout and holon boundaries so you can read what exists and where it lives in context.

Console (`/` docs mode) highlights holons in the **running app**. The register shows holons **assembled into views** on a zoomable canvas.

---

## 2. What “registering” means

**Registering** a holon means declaring it in metadata so it appears in the **Components tree** and on the **canvas** (for views on the composer) — **without hand-drawing canvas layout**.

Registering is **not**:

- Editing frame JSX on the canvas (legacy hand-built frames — removed)
- Dragging or placing elements manually on the register canvas
- Copying app logic into the register

### The five steps

| Step | What | Where | Feeds |
|------|------|-------|-------|
| **1. Holon definition** | `id`, `label`, `order`, icon | e.g. `src/app/components/docs/loginHolons.ts` | Tree + metadata |
| **2. App** | Wrap real UI in `HolonBoundary` | e.g. `src/app/marketing/components/LoginForm.tsx` | Live app + tree when route mounts |
| **3. Catalog** | Static tree entry for `/register` | `src/app/components/docs/holonCatalogTree.ts` | Components tree when app route is not mounted |
| **4. View metadata** | `views`, `parentId`, `render`, optional `patternInstances` | e.g. `src/app/components/docs/registerMeta/loginRegisterMeta.ts` | Canvas placement (composer) |
| **5. Surface** | Cosmetic renderer for the holon | e.g. `src/app/register/surfaces/loginSurfaces.tsx` + `src/app/register/composer/surfaceRegistry.ts` | How the holon **looks** on the canvas |

After all five steps, a new control (e.g. a Sign up button beside Log In) shows in the tree and on the correct view artboard. You do **not** edit canvas frame layout code.

### What syncs automatically vs manually

| You change… | Components tree | Canvas |
|-------------|-----------------|--------|
| App JSX only | No | No |
| Steps 1–3 | Yes | No |
| Steps 1–5 (view on composer) | Yes | Yes — composer builds the frame |

**Today:** steps 1–5 are separate files. **Target:** derive catalog and register metadata from holon definitions so fewer files drift.

---

## 3. Views and the composer

A **view** is one coherent on-screen scene — e.g. `login-sign-in`, `board-clients`.

| Layer | Job |
|-------|-----|
| **Components tree** | What exists (inventory) |
| **View frame** | What appears together in context (canvas artboard) |
| **Pattern instances** | What must repeat (e.g. `client-row` × 2) |

Holons declare which views include them:

```ts
views: ["login-sign-in"]
parentId: "login-form"
render: "login-email-field"
```

The **composer** (`RegisterViewComposer`) filters holons by view, nests by `parentId`, and renders surfaces inside a layout shell (`login-card`, `board-sidebar`).

**Composer-enabled views:** all current views (`login-sign-in`, `login-verify`, `board-clients`) render via `RegisterViewComposer` and `registerMeta`.

---

## 4. Key file paths

```
src/app/register/
  pages/RegisterPage.tsx          # Gate + layout
  canvas/RegisterViewFrameContent.tsx  # Composer vs legacy per view
  composer/RegisterViewComposer.tsx
  composer/HolonComposerNode.tsx
  composer/surfaceRegistry.ts
  surfaces/loginSurfaces.tsx
  surfaces/boardSurfaces.tsx

src/app/components/docs/
  loginHolons.ts                  # Holon constants
  holonCatalogTree.ts             # Static catalog for /register
  registerMeta/
    loginRegisterMeta.ts
    boardRegisterMeta.ts
    views.ts
    composeViewHolons.ts
```

---

## 5. Console vs Register

| | Console | Register |
|---|---------|----------|
| Route | `/` (docs mode) | `/register` |
| Purpose | Name + highlight live UI | Systems map in view context |
| Tree source | Runtime `HolonBoundary` registry | Catalog bootstrap + runtime |
| Canvas | N/A | View artboards (React Flow) |

Same holon ids; different surfaces. Registering feeds both when catalog and app boundaries are kept in sync.

---

## 6. Roadmap

1. Composer for remaining views (`login-verify`, then `board-clients`)
2. Derive `holonCatalogTree` from holon / registerMeta files
3. Flows, dependencies, tables panels (metadata: purpose, in, via, out)
4. Collapse steps 1–5 toward a single holon definition where possible

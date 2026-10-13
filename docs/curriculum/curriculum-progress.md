# Operator Panel Incremental Reconstruction — Curriculum Progress

## Overview
- **Working Branch:** `ui_recon`
- **Base Commit:** `7c3004b`
- **Primary Starting File:** `src/app/register/prototype-ant/operator/OperatorAntScene.tsx`
- **Preserved Reference Copy:** `docs/curriculum/references/OperatorAntScene.reference.tsx`
- **Local Dev Server:** `npm run dev` (Vite, port 5173)
- **Route to Verify:** `http://localhost:5173/prototype-ant` (Select "Operator" in desk switcher)

---

## Progress Log

### Task 01: Render a bare page from a React component
- **Status:** Complete
- **Construction implemented:** Bare `OperatorAntScene` named export function returning basic JSX.
- **Concepts encountered:**
  - Import vs. render lifecycle: Why a broken/empty file breaks the whole app at module evaluation time before render logic even runs.
  - Named exports (`export function`) vs. Default exports (`export default`): Why curly braces in import contracts matter, searchability, refactoring, tree-shaking.
- **Mutations completed independently:** Solved the blank white screen by switching from default export to named export.
- **Confusions encountered:** Why clearing an inactive desk file crashed the app at `/prototype-ant`.
- **Assistance required:** Explanation of module evaluation vs. runtime rendering, and named vs. default export contract mismatch.
- **Completion-gate result:** Passed. Operator desk renders heading cleanly without errors.

---

### Task 02: Understand the component function and its `return` statement
- **Status:** Complete
- **Construction implemented:** Declared variables (`title`, `version`) in component function body (Zone 1) and evaluated them in JSX (Zone 2) via curly braces `{}`.
- **Concepts encountered:**
  - Component function lifecycle: Code before `return` executes on every render.
  - JSX escape hatch `{}`: Switching between literal text markup and dynamic JS expression evaluation.
  - JavaScript type nuance in expressions: `"1" + 1` concatenates to `"11"` vs. `1 + 1` evaluates to `2`.
- **Mutations completed independently:** Added `const version = "1"` and evaluated `{version + 1}` inside an `<h2>`.
- **Confusions encountered:** None.
- **Assistance required:** None.
- **Completion-gate result:** Passed.

---

### Task 03: Place multiple elements inside a parent & React Fragments
- **Status:** Complete
- **Construction implemented:** Replaced enclosing `<div>` with React Fragment `<>...</>` to hold sibling tags (`<h2>`, `<h1>`, `<p>`). Converted `version` to a numeric literal.
- **Concepts encountered:**
  - Why JSX functions can only return a single root: JSX compiles to JavaScript function calls, which only return one value.
  - React Fragments (`<>...</>`): Grouping multiple sibling children without injecting extraneous `<div>` nodes into the HTML DOM.
- **Mutations completed independently:** Added a third sibling `<p>` element and converted `version` to number.
- **Confusions encountered:** None.
- **Assistance required:** None.
- **Completion-gate result:** Passed.

---

### Task 04: Introduce Ant Design `Layout`
- **Status:** Complete
- **Construction implemented:** Imported `Layout` from `"antd"` and wrapped component in `<Layout style={{ height: "100%", padding: 24 }}>`.
- **Concepts encountered:**
  - Component imports from libraries.
  - Lowercase tags (native HTML) vs. Uppercase tags (React components).
  - React `style` prop with double curly braces `{{}}`: outer JSX escape hatch + inner JS style object literal.
  - How `<Layout>` works under the hood (HTML5 `<section>` with flexbox styling).
- **Mutations completed independently:** Added `padding: 24` inside style object.
- **Confusions encountered:** What `Layout` does under the hood and why double curly braces are used.
- **Assistance required:** Explanation of JSX vs JS object literal, uppercase vs lowercase tag distinction, and `Layout`'s flexbox behavior.
- **Completion-gate result:** Passed.

---

### Task 05: Divide the page into `Sider` and `Content`
- **Status:** In Progress
- **Construction implemented:** Pending
- **Concepts encountered:** Pending
- **Mutations completed independently:** Pending
- **Confusions encountered:** Pending
- **Assistance required:** Pending
- **Completion-gate result:** Pending


---

## Architectural Notes & Reference Log
- **Original Architecture Choices:**
  - `OperatorAntScene` is exported as a named function component `export function OperatorAntScene()`.
  - Mounted by `src/app/register/prototype-ant/PrototypeAntApp.tsx` when `desk === "operator" && isAdmin`.
  - Wraps content in `OperatorNavProvider` and `Surface`.
  - Uses Ant Design `Layout` with a fixed-width `Sider` (200px) and a `Content` area.
  - Sider hosts Ant Design `Menu` inline with three grouped arrays: `House-global`, `Per-tenancy`, and `Support`.
  - Module selection is managed by local `useState<ModuleId>`.
  - Renders active child module via a `switch (module)` statement.

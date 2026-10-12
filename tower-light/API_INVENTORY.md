# API_INVENTORY

Imported libraries and **observed** usage. Icons/widgets are families, not one construction per symbol.

Scan: import graph + identifier/JSX usage. Twilio is a **dynamic import** (see GAPS).

## Package families (authored usage)

| ID | Name | Module | Hits | Form | Location | Contract / purpose | Stage or exclusion |
|---|---|---|---|---|---|---|---|
| `API-REACT-createRoot` | createRoot | react-dom/client | 4 | `createRoot(...).render(<AppRouter />)` | `src/main.tsx:7` | Own a DOM node and render a tree. | BIT-1 |
| `API-REACT-createPortal` | createPortal | react-dom | 2 | `createPortal` | `react-dom` | Render children into another DOM node. | BIT-6 |
| `API-REACT-useState` | useState | react | 2009 | `useState(false)` | `react` | Remember a value across renders; schedule an update. | BIT-2 |
| `API-REACT-useEffect` | useEffect | react | 2009 | `useEffect(() => { ... }, [on])` | `react` | Run a side effect after paint. | BIT-9 |
| `API-REACT-useMemo` | useMemo | react | 2009 | `useMemo` | `react` | Cache a computed value. | BIT-7 |
| `API-REACT-useCallback` | useCallback | react | 2009 | `useCallback` | `react` | Stable function identity. | BIT-3 |
| `API-REACT-useRef` | useRef | react | 2009 | `useRef` | `react` | Mutable box that does not re-render. | BIT-15 |
| `API-REACT-useContext` | useContext | react | 2009 | `useContext(AuthContext)` | `src/app/auth/AuthContext.tsx` | Read a provided value without props. | BIT-11 |
| `API-REACT-createContext` | createContext + Provider | react | 1 | `createContext` | `react` | Broadcast a value down the tree. | BIT-11 |
| `API-RR-BrowserRouter` | BrowserRouter | react-router | 40 | `<BrowserRouter>` | `src/app/Router.tsx:27` | History API routing for the Hub document. | BIT-8 |
| `API-RR-Routes` | Routes / Route | react-router | 40 | `<Route path="/history" element={...} />` | `src/app/Router.tsx` | Declare path → element. | BIT-8 |
| `API-RR-Navigate` | Navigate | react-router | 40 | `<Navigate to="/" replace />` | `src/app/Router.tsx` | Declarative redirect. | BIT-8 |
| `API-RR-useNavigate` | useNavigate | react-router | 40 | `useNavigate()` | `react-router` | Imperative navigation. | BIT-8 |
| `API-RR-useLocation` | useLocation | react-router | 40 | `useLocation()` | `react-router` | Current location object. | BIT-8 |
| `API-ANTD-controls` | antd controls (Button, Input, Select, Modal, Tag, Space, Typography, Table) | antd | 2664 | `<Button>`, `<Typography.Text>` | prototype-ant | Product-face widget set. | BIT-1 |
| `API-ANTD-icons` | @ant-design/icons | @ant-design/icons | 172 | `<PlayCircleOutlined />` | prototype-ant | SVG icon components for Ant. | BIT-1 |
| `API-XYFLOW` | @xyflow/react canvas | @xyflow/react | 224 | `<ReactFlow>`, `<Handle>` | Hub + Ant workbench | Node/edge graph editor (handles = edge ports). | BIT-16 |
| `API-LUCIDE` | lucide-react icons | lucide-react | 560 | `<ChevronDown />` | Hub | Hub/shadcn icon set (94 symbols imported). | EXCLUDE-lucide |
| `API-RADIX-COMPOUND` | Radix compound primitives | @radix-ui/react-dialog | 40 | `import * as Dialog from "@radix-ui/react-dialog"` | src/app/components/ui | Unstyled accessible primitives composed as Root/Trigger/Content. | EXCLUDE-radix |
| `API-CVA` | class-variance-authority | class-variance-authority | 13 | `cva` | ui/button | Named class variants for shadcn. | EXCLUDE-cva |
| `API-CLS-MERGE` | clsx + tailwind-merge | clsx | 2 | `clsx()`, `twMerge()` | src/app/components/ui | Join class names; merge Tailwind conflicts. | BIT-13 |
| `API-RECHARTS` | recharts | recharts | 54 | `<LineChart>` | Hub + Ant client panel | SVG charts. | BIT-7 |
| `API-RHF` | react-hook-form | react-hook-form | 8 | `useForm` (wrapper only) | src/app/components/ui/form.tsx | Form state library. | EXCLUDE-rhf |
| `API-SONNER` | sonner toaster | sonner | 3 | `<Toaster />` | sonner.tsx | Toast UI. | EXCLUDE-sonner |
| `API-NEXT-THEMES` | next-themes | next-themes | 2 | `useTheme()` | sonner.tsx | Theme provider (Next-oriented). | EXCLUDE-next-themes |
| `API-VAUL` | vaul drawer | vaul | 18 | `Drawer.Root` | ui/drawer | Drawer primitive. | EXCLUDE-vaul |
| `API-CMDK` | cmdk | cmdk | 15 | `Command` | ui/command | Command palette. | EXCLUDE-cmdk |
| `API-EMBLA` | embla-carousel-react | embla-carousel-react | 5 | `useEmblaCarousel` | ui/carousel | Carousel. | EXCLUDE-embla |
| `API-OTP` | input-otp | input-otp | 5 | `input-otp` | ui/input-otp | OTP input cells. | BIT-14 |
| `API-DAY-PICKER` | react-day-picker | react-day-picker | 3 | `<DayPicker />` | ui/calendar | Calendar widget. | EXCLUDE-day-picker |
| `API-RESIZABLE` | react-resizable-panels | react-resizable-panels | 8 | react-resizable-panels | ui/resizable | Split panes. | EXCLUDE-resizable |
| `API-PAPAPARSE` | papaparse | papaparse | 4 | `Papa.parse()` | parseCsvPreview.ts | CSV parse in the browser. | EXCLUDE-csv |
| `API-HONO-APP` | Hono app | hono | 11 | `new Hono()` | server/auth-service | HTTP app: route table + context. | BIT-11 |
| `API-HONO-SERVE` | serve (Node adapter) | @hono/node-server | 2 | `serve({ fetch: app.fetch, port })` | `server/auth-service/index.ts:24` | Bind Hono fetch to a Node port. | BIT-11 |
| `API-HONO-COOKIE` | getCookie / setCookie / deleteCookie | hono/cookie | 16 | `getCookie(c, SESSION_COOKIE)` | `server/auth-service/routes.ts` | Read/write Cookie header through Hono context. | BIT-14 |
| `API-HONO-CORS` | cors middleware | hono/cors | 2 | `cors()` | hono/cors | Cross-origin header policy. | BIT-11 |
| `API-PG-POOL` | pg.Pool | pg | 10 | `new Pool({ connectionString })` | `server/auth-service/db.ts:20` | Pooled Postgres clients. | BIT-12 |
| `API-PG-QUERY` | client.query | pg | 10 | `client.query(sql, [id])` | `server/auth-service/db.ts:61` | Run parameterized SQL. | BIT-12 |
| `API-PG-TX` | connect + BEGIN/COMMIT | pg | 10 | `withTransaction` | `server/auth-service/db.ts:33` | Checkout a client for a transaction. | BIT-12 |
| `API-RESEND` | Resend emails | resend | 4 | `new Resend` | server/wire-service/resendClient.ts | HTTP email API. | BIT-18 |
| `API-TWILIO` | Twilio SMS (dynamic import) | twilio | 1 | `await import("twilio")` | `server/wire-service/twilioClient.ts:7` | SMS API; loaded with import() so auth serverless can omit it. | BIT-18 |
| `API-NODE-CRYPTO` | node:crypto | node:crypto | 115 | `createHmac`, `timingSafeEqual` | server/auth-service/crypto.ts | HMAC, UUID, timing-safe compare. | BIT-14 |
| `API-NODE-FS` | node:fs | node:fs | 21 | `readFileSync` | scripts/run-migration.ts | Read migrations/seeds from disk. | BIT-13 |
| `API-NODE-PATH` | node:path | node:path | 28 | `path.join` | scripts | Join filesystem paths. | BIT-13 |
| `API-NODE-DNS` | node:dns ipv4first | node:dns | 4 | `dns.setDefaultResultOrder("ipv4first")` | `server/auth-service/db.ts:5` | Prefer IPv4 for Supabase pooler. | BIT-12 |
| `API-VITE-DEFINE-CONFIG` | defineConfig | vite | 2 | `defineConfig` | `vite.config.ts:19` | Typed Vite config. | BIT-13 |
| `API-VITE-REACT-PLUGIN` | @vitejs/plugin-react | @vitejs/plugin-react | 2 | `react()` | `vite.config.ts:24` | JSX/TS refresh in Vite. | BIT-13 |
| `API-VITE-TAILWIND-PLUGIN` | @tailwindcss/vite | @tailwindcss/vite | 2 | `tailwindcss()` | `vite.config.ts:25` | Tailwind 4 as a Vite plugin (compiler in the toolchain). | BIT-13 |
| `API-ESBUILD-BUNDLE` | esbuild.build | esbuild | 2 | `esbuild.build()` | scripts/bundle-vercel-api.mjs | Bundle serverless API entries. | BIT-21 |
| `EXCLUDE-mui` | MUI + Emotion (declared, zero imports) | @mui/material | 0 | (declared @mui/material) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-mui |
| `EXCLUDE-dnd` | react-dnd (declared, zero imports) | react-dnd | 0 | (declared react-dnd) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-dnd |
| `EXCLUDE-slick` | react-slick (declared, zero imports) | react-slick | 0 | (declared react-slick) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-slick |
| `EXCLUDE-masonry` | react-responsive-masonry (declared, zero imports) | react-responsive-masonry | 0 | (declared react-responsive-masonry) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-masonry |
| `EXCLUDE-popper` | react-popper / @popperjs/core (declared, zero imports) | react-popper | 0 | (declared react-popper) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-popper |
| `EXCLUDE-confetti` | canvas-confetti (declared, zero imports) | canvas-confetti | 0 | (declared canvas-confetti) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-confetti |
| `EXCLUDE-motion` | motion (declared, zero imports) | motion | 0 | (declared motion) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-motion |
| `EXCLUDE-date-fns` | date-fns (declared, zero TS imports) | date-fns | 0 | (declared date-fns) | package.json | Present in package.json; not part of authored construction vocabulary. | EXCLUDE-date-fns |

## Raw package rollup (top)

| Module | API hits | Import hits | Symbols | Top symbols |
|---|---|---|---|---|
| `antd` | 2664 | 408 | 38 | Space, Space<JSX>, Button, Typography.Text, Typography.Text<JSX>, Button<JSX>, Tag, Tag<JSX> |
| `react` | 2009 | 554 | 24 | useState(), *, useEffect(), useMemo(), useState, useCallback(), useEffect, useMemo |
| `lucide-react` | 560 | 262 | 94 | ChevronDown<JSX>, Mail, ChevronDown, ChevronRight<JSX>, Zap, ChevronRight, CheckSquare, MessageSquare |
| `@xyflow/react` | 224 | 161 | 29 | Handle<JSX>, Handle, Position, Position.Bottom, ReactFlow, EdgeLabelRenderer, Position.Top, Background |
| `@ant-design/icons` | 172 | 81 | 58 | PlayCircleOutlined, ArrowDownOutlined<JSX>, ArrowUpOutlined<JSX>, PlayCircleOutlined<JSX>, PlusOutlined<JSX>, BankOutlined, BankOutlined<JSX>, CloseOutlined<JSX> |
| `node:crypto` | 115 | 26 | 6 | randomUUID(), randomUUID, timingSafeEqual(), createHmac, createHmac(), randomBytes, randomBytes(), timingSafeEqual |
| `recharts` | 54 | 20 | 12 | ResponsiveContainer, *, LineChart, Line<JSX>, ResponsiveContainer<JSX>, CartesianGrid, CartesianGrid<JSX>, Line |
| `@radix-ui/react-dialog` | 40 | 2 | 1 | *, *.Close<JSX>, *.Close, *.Content, *.Content<JSX>, *.Description<JSX>, *.Overlay<JSX>, *.Portal<JSX> |
| `react-router` | 40 | 12 | 8 | Route<JSX>, Navigate<JSX>, Navigate, BrowserRouter, Routes, useNavigate, useNavigate(), BrowserRouter<JSX> |
| `@radix-ui/react-context-menu` | 38 | 1 | 1 | *, *.ItemIndicator, *.ItemIndicator<JSX>, *.Portal<JSX>, *.CheckboxItem, *.CheckboxItem<JSX>, *.Content<JSX>, *.Group<JSX> |
| `@radix-ui/react-dropdown-menu` | 38 | 1 | 1 | *, *.ItemIndicator, *.ItemIndicator<JSX>, *.Portal<JSX>, *.CheckboxItem, *.CheckboxItem<JSX>, *.Content<JSX>, *.Group<JSX> |
| `@radix-ui/react-menubar` | 38 | 1 | 1 | *, *.ItemIndicator, *.ItemIndicator<JSX>, *.CheckboxItem, *.CheckboxItem<JSX>, *.Content<JSX>, *.Group<JSX>, *.Item<JSX> |
| `@radix-ui/react-select` | 36 | 1 | 1 | *, *.Content, *.Content<JSX>, *.Group<JSX>, *.Icon, *.Icon<JSX>, *.Item, *.Item<JSX> |
| `node:path` | 28 | 6 | 3 | default.join(), join(), default, default.resolve(), dirname, dirname(), join, default.dirname() |
| `@radix-ui/react-hover-card` | 27 | 3 | 1 | *, *.Content<JSX>, *.Portal, *.Portal<JSX>, *.Root<JSX>, *.Trigger<JSX>, *.Content, *.Root |
| `node:fs` | 21 | 12 | 5 | readFileSync(), readFileSync, default, default.mkdirSync(), default.copyFileSync(), default.readFileSync(), readdirSync, readdirSync() |
| `@radix-ui/react-navigation-menu` | 20 | 1 | 1 | *, *.Content<JSX>, *.Indicator, *.Indicator<JSX>, *.Item<JSX>, *.Link<JSX>, *.List<JSX>, *.Root |
| `@radix-ui/react-alert-dialog` | 19 | 1 | 1 | *, *.Action<JSX>, *.Cancel<JSX>, *.Content<JSX>, *.Description<JSX>, *.Overlay<JSX>, *.Portal<JSX>, *.Root<JSX> |
| `vaul` | 18 | 1 | 1 | Drawer, Drawer.Close<JSX>, Drawer.Content, Drawer.Content<JSX>, Drawer.Description<JSX>, Drawer.Overlay<JSX>, Drawer.Portal<JSX>, Drawer.Root<JSX> |
| `hono/cookie` | 16 | 7 | 3 | getCookie(), getCookie, deleteCookie, deleteCookie(), setCookie, setCookie() |
| `@radix-ui/react-slot` | 15 | 5 | 1 | Slot, Slot<JSX> |
| `cmdk` | 15 | 1 | 1 | Command, Command.Empty<JSX>, Command.Group<JSX>, Command.Input<JSX>, Command.Item<JSX>, Command.List<JSX>, Command.Separator<JSX>, Command<JSX> |
| `@radix-ui/react-accordion` | 13 | 1 | 1 | *, *.Content, *.Content<JSX>, *.Header, *.Header<JSX>, *.Item<JSX>, *.Root<JSX>, *.Trigger |
| `@radix-ui/react-tooltip` | 13 | 1 | 1 | *, *.Arrow<JSX>, *.Content, *.Content<JSX>, *.Portal, *.Portal<JSX>, *.Provider<JSX>, *.Root<JSX> |
| `class-variance-authority` | 13 | 12 | 2 | cva, cva(), VariantProps |
| `@radix-ui/react-popover` | 11 | 1 | 1 | *, *.Anchor<JSX>, *.Content<JSX>, *.Portal, *.Portal<JSX>, *.Root<JSX>, *.Trigger<JSX> |
| `@radix-ui/react-scroll-area` | 11 | 1 | 1 | *, *.Corner<JSX>, *.Root, *.Root<JSX>, *.ScrollAreaScrollbar, *.ScrollAreaScrollbar<JSX>, *.ScrollAreaThumb<JSX>, *.Viewport |
| `hono` | 11 | 18 | 2 | Hono |
| `pg` | 10 | 11 | 3 | default |
| `@radix-ui/react-tabs` | 9 | 1 | 1 | *, *.Content<JSX>, *.List<JSX>, *.Root<JSX>, *.Trigger<JSX> |
| `@radix-ui/react-radio-group` | 8 | 1 | 1 | *, *.Indicator, *.Indicator<JSX>, *.Item, *.Item<JSX>, *.Root<JSX> |
| `@radix-ui/react-slider` | 8 | 1 | 1 | *, *.Range<JSX>, *.Root, *.Root<JSX>, *.Thumb<JSX>, *.Track, *.Track<JSX> |
| `react-hook-form` | 8 | 7 | 7 | FormProvider, Controller, Controller<JSX>, useFormContext, useFormContext(), useFormState, useFormState() |
| `react-resizable-panels` | 8 | 1 | 1 | *, *.Panel<JSX>, *.PanelGroup<JSX>, *.PanelResizeHandle, *.PanelResizeHandle<JSX> |
| `@radix-ui/react-avatar` | 7 | 1 | 1 | *, *.Fallback<JSX>, *.Image<JSX>, *.Root<JSX> |
| `@radix-ui/react-collapsible` | 7 | 1 | 1 | *, *.CollapsibleContent<JSX>, *.CollapsibleTrigger<JSX>, *.Root<JSX> |
| `@radix-ui/react-toggle-group` | 7 | 1 | 1 | *, *.Item, *.Item<JSX>, *.Root, *.Root<JSX> |
| `@radix-ui/react-checkbox` | 6 | 1 | 1 | *, *.Indicator, *.Indicator<JSX>, *.Root, *.Root<JSX> |
| `node:url` | 6 | 3 | 1 | fileURLToPath, fileURLToPath() |
| `path` | 6 | 1 | 1 | default.resolve(), default |

Full rollup: `evidence/packages-brief.json`.

/**
 * Compile pedagogical inventories from evidence JSON + curated overlay.
 * Run from repo: node tower-light/tools/generate-inventories.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const ev = (n) => JSON.parse(fs.readFileSync(path.join(root, "evidence", n), "utf8"));

const syntax = ev("syntax.json");
const types = ev("types.json");
const jsx = ev("jsx.json");
const sql = ev("sql.json");
const css = ev("css.json");
const html = ev("html.json");
const globals = ev("globals.json");
const packages = ev("packages-brief.json");
const summary = ev("summary.json");

const idx = (arr) => Object.fromEntries(arr.map((r) => [r.id, r]));
const S = idx(syntax);
const T = idx(types);
const J = idx(jsx);
const Q = idx(sql);
const C = idx(css);
const H = idx(html);
const G = idx(globals);
const P = Object.fromEntries(packages.map((p) => [p.module, p]));

function evRow(row) {
  if (!row) return { occ: 0, files: 0, form: "(not detected in scanned files)", loc: "—" };
  const ex = row.examples?.[0];
  return {
    occ: row.occurrences,
    files: row.fileCount,
    form: ex ? `\`${ex.excerpt}\`` : "—",
    loc: ex ? `\`${ex.file}:${ex.line}\`` : "—",
  };
}

/** @typedef {{id:string,name:string,cat:string,purpose:string,mechanism:string,inputs:string,outputs:string,deps:string,ctx:string,demo:string,criterion:string,stage:string,note?:string,evidence?:any}} Item */

/** @type {Item[]} */
const items = [];

function add(item) {
  items.push(item);
}

function lang(id, name, purpose, mechanism, demo, stage, extra = {}) {
  const e = evRow(S[id] || extra.row);
  add({
    id,
    name,
    cat: "language",
    purpose,
    mechanism,
    inputs: extra.inputs || "expression / binding",
    outputs: extra.outputs || "value or control transfer",
    deps: extra.deps || "—",
    ctx: extra.ctx || "shared",
    demo,
    criterion: extra.criterion || `Source contains ${name}; behaviour observable in the demo.`,
    stage,
    form: extra.form || e.form,
    loc: extra.loc || e.loc,
    occ: extra.occ ?? e.occ,
    files: extra.files ?? e.files,
  });
}

// —— Language ——
lang("LANG-const", "const binding", "Name a value that is not reassigned.", "Lexical binding; temporal dead zone; block scope.", "Name the light's boolean; changing it requires a new binding or a setter, not `const light = !light` in place.", "BIT-2");
lang("LANG-let", "let binding", "Name a value that may be reassigned.", "Block-scoped mutable binding.", "Loop index or accumulating list before React state exists.", "BIT-4");
lang("LANG-arrow-function", "arrow function", "Pass behaviour as a value.", "Lexical `this`; concise or block body; first-class function.", "Pass `() => setOn(!on)` to a click handler.", "BIT-3");
lang("LANG-async-arrow", "async arrow", "A function value that returns a Promise.", "Marks the function async; enables `await` inside.", "Click handler that `await fetch(...)`.", "BIT-10");
lang("LANG-function-declaration", "function declaration", "Hoisted named function.", "Creates a binding in the enclosing scope; hoisted.", "Extract `function isOn(row)` for a predicate.", "BIT-4");
lang("LANG-async-function", "async function declaration", "Named async function.", "Returns Promise; `await` inside.", "Server route handler `async function toggle(c)`.", "BIT-11");
lang("LANG-function-expression", "function expression", "Unhoisted function value (rare in Tower).", "Expression position function.", "Only if a library requires `function () {}`.", "BIT-3");
lang("LANG-await", "await", "Pause an async function until a Promise settles.", "Unwraps fulfillment; throws on rejection into try/catch.", "Await `pool.query` then return rows.", "BIT-10");
lang("LANG-try", "try", "Guard a region that may throw.", "Transfers to catch/finally.", "Wrap fetch; show error without crashing the light.", "BIT-10");
lang("LANG-catch-binding", "catch binding", "Name the thrown value.", "`catch (err)` binds the rejection/throw.", "Log `err.message` when save fails.", "BIT-10");
lang("LANG-optional-catch", "optional catch binding", "Catch without naming.", "`catch { }` — ES2019.", "Ignore a JSON.parse failure on corrupt localStorage.", "BIT-9");
lang("LANG-finally", "finally", "Run cleanup whether throw or not.", "Always runs on the way out of try.", "Release a pg client after query.", "BIT-12");
lang("LANG-throw", "throw", "Abort with an exception.", "Unwinds to nearest catch.", "Throw if `DATABASE_URL` missing at boot.", "BIT-13");
lang("LANG-if", "if", "Conditional statement.", "Evaluates test; executes one branch.", "If the light is on, record a flip.", "BIT-16");
lang("LANG-else", "else", "Alternate branch.", "Runs when if-test is false.", "Else leave the light off.", "BIT-16");
lang("LANG-switch", "switch", "Multi-way dispatch on a value.", "Strict equality against case labels; fall-through unless break/return.", "Switch on event kind: `turn_on` / `turn_off`.", "BIT-16");
lang("LANG-case", "case", "A switch arm.", "Label matched by ===.", "See LANG-switch.", "BIT-16");
lang("LANG-default-clause", "default clause", "Switch fallback.", "Runs when no case matches.", "Unknown event kind → ignore.", "BIT-16");
lang("LANG-ternary", "conditional expression", "Choose a value, not a statement.", "`test ? a : b` yields a value.", "Button label `{on ? \"ON\" : \"OFF\"}`.", "BIT-2");
lang("LANG-for", "for loop", "Index-driven iteration.", "Init / test / update.", "Rare; prefer for-of. Use only when an index is the point.", "BIT-4");
lang("LANG-for-of", "for...of", "Iterate values of an iterable.", "Calls iterator protocol.", "Walk query rows to build history.", "BIT-7");
lang("LANG-while", "while", "Loop while a test holds.", "Re-evaluates test each iteration.", "Worker `while (running) await tick()`. Prefer `setInterval` in Tower's worker shape.", "BIT-15");
lang("LANG-break", "break", "Leave a loop or switch.", "Transfers out of the innermost loop/switch.", "Stop scanning history at the first ON.", "BIT-7");
lang("LANG-continue", "continue", "Skip to next iteration.", "Transfers to loop increment/test.", "Skip malformed history rows.", "BIT-7");
lang("LANG-return", "return", "Leave a function with a value.", "Completes the call; async return wraps in Promise.", "Return JSX from the Light component.", "BIT-1");
lang("LANG-destructure-object", "object destructuring", "Bind properties by name.", "Pattern match on object keys; rename with `:` .", "`const { on } = state`.", "BIT-4");
lang("LANG-destructure-array", "array destructuring", "Bind by position.", "Including tuple-shaped React hooks.", "`const [on, setOn] = useState(false)`.", "BIT-2");
lang("LANG-spread", "spread (args/array)", "Copy or expand elements.", "Iterator protocol into a new array or argument list.", "`[...history, event]`.", "BIT-4");
lang("LANG-spread-object", "object spread", "Copy enumerable own properties into a new object.", "Shallow copy; later keys win.", "`{ ...row, on: true }`.", "BIT-4");
lang("LANG-rest-param", "rest parameter", "Collect remaining arguments.", "`(...args)` is an array.", "Rare in Tower (1 hit). Demonstrate in a logger `log(kind, ...rest)`.", "BIT-4");
lang("LANG-default-param", "default parameter", "Fill a missing argument.", "Evaluated when argument is `undefined`.", "`function tick(now = new Date())`.", "BIT-4");
lang("LANG-shorthand-property", "shorthand property", "Object key from binding name.", "`{ on }` ≡ `{ on: on }`.", "Return `{ on, at }` from an event.", "BIT-4");
lang("LANG-computed-property", "computed property", "Object key from an expression.", "`{ [kind]: true }`.", "Index events `{ [id]: row }`.", "BIT-4");
lang("LANG-template-literal", "template literal", "String with interpolations.", "Evaluates `${}` to string concat.", "Log `` `light ${on}` ``.", "BIT-2");
lang("LANG-template-literal-plain", "plain template (no subst.)", "Equivalent to a string; often SQL.", "No interpolation.", "SQL query strings in pg.", "BIT-12");
lang("LANG-optional-chain", "optional chaining", "Read a property if receiver is non-nullish.", "Short-circuits to `undefined`.", "`event?.at` when history row may be missing.", "BIT-4");
lang("LANG-optional-call", "optional call", "Call if callee is non-nullish.", "`fn?.(x)`.", "Optional callback `onFlip?.(next)`.", "BIT-3");
lang("LANG-optional-element", "optional element access", "Index if receiver non-nullish.", "`arr?.[0]`.", "`rows?.[0]`.", "BIT-7");
lang("LANG-nullish-coalesce", "nullish coalescing", "Default only for null/undefined.", "Does not trigger on `false`/`0`/`''`.", "`process.env.PORT ?? 3001` — empty string is not defaulted (contrast ||).", "BIT-13");
lang("LANG-logical-and", "logical and", "Short-circuit; JSX guard.", "If left is falsy, skip right.", "`{on && <span>lit</span>}`.", "BIT-2");
lang("LANG-logical-or", "logical or", "First truthy, or last.", "Unlike ??, treats `''`/`0`/`false` as missing.", "Used in Tower; teaching app should contrast with ?? on env flags.", "BIT-13");
lang("LANG-strict-eq", "strict equality", "Compare without coercion.", "`===` / `!==`.", "`on === true`.", "BIT-2");
lang("LANG-strict-neq", "strict inequality", "Negation of ===.", "`!==`.", "`status !== 200`.", "BIT-10");
lang("LANG-loose-eq", "loose equality", "Compare with coercion (Tower uses it).", "`==` / `!=`. Teach that it is a different construction; prefer === in ONE BIT.", "Show `flag == true` vs `===` with string `'true'` from env.", "BIT-13");
lang("LANG-loose-neq", "loose inequality", "Negation of ==.", "`!=`.", "Same demo as loose-eq.", "BIT-13");
lang("LANG-typeof", "typeof", "Runtime type tag string.", "Returns a string; `typeof null === 'object'` trap exists.", "Guard `typeof on === 'boolean'`.", "BIT-5");
lang("LANG-instanceof", "instanceof", "Prototype-chain test.", "Walks [[Prototype]].", "`err instanceof Error`.", "BIT-10");
lang("LANG-in", "in operator", "Property existence (including prototype).", "`\"key\" in obj`.", "Feature-detect localStorage in window.", "BIT-9");
lang("LANG-void", "void operator", "Evaluate and yield undefined.", "Common: `void runTick()` to mark ignored Promise.", "Worker `void runTick()` in setInterval.", "BIT-15");
lang("LANG-delete", "delete", "Remove an object property.", "Mutates the object.", "Prefer immutable spread in React; show once why delete fights React state.", "BIT-4");
lang("LANG-new", "new", "Construct an instance.", "Calls [[Construct]].", "`new Date()`, `new Pool()`.", "BIT-12");
lang("LANG-null", "null", "Intentional empty object value.", "A primitive.", "SQL null vs JS null when a row is missing.", "BIT-12");
lang("LANG-undefined", "undefined", "Uninitialized / missing.", "A primitive; default of missing args.", "Missing env var.", "BIT-13");
lang("LANG-regex-literal", "RegExp literal", "Pattern matching.", "Compiled regex.", "Validate an access token shape.", "BIT-14");
lang("LANG-import-named", "named import", "Bind exported names from a module.", "Live bindings; ESM.", "`import { useState } from \"react\"`.", "BIT-1");
lang("LANG-import-default", "default import", "Bind the default export.", "ESM default slot.", "`import pg from \"pg\"`.", "BIT-12");
lang("LANG-import-namespace", "namespace import", "Bind all exports as an object.", "`import * as Dialog from \"...\"`.", "Radix compound components. Teaching app: skip unless introducing Radix.", "BIT-1");
lang("LANG-import-type-named", "type-only import", "Import erased types.", "`import type { X }` — no runtime.", "Import a Row type without bundling a value.", "BIT-5");
lang("LANG-import-inline-type", "inline type specifier", "`import { type X, y }`.", "Mixed type/value import.", "Same as type-only, mixed form.", "BIT-5");
lang("LANG-import-side-effect", "side-effect import", "Run a module for effects only.", "`import \"./styles.css\"`.", "Load CSS from the entry.", "BIT-0");
lang("LANG-dynamic-import", "dynamic import()", "Load a module at runtime (Promise).", "Code-split / optional native deps.", "Tower: `await import(\"twilio\")` so auth bundle can omit Twilio. Demo: lazy-load a History panel.", "BIT-15");
lang("LANG-export-named", "named export", "Expose a binding.", "`export function Light`.", "Export the Light component.", "BIT-1");
lang("LANG-export-default", "default export", "Expose the default slot.", "`export default`.", "Rare in Tower (7). Prefer named in ONE BIT.", "BIT-1");
lang("LANG-reexport-named", "re-export", "Forward another module's exports.", "`export { x } from \"./x\"`.", "Barrel `wire/reals/index`.", "BIT-11");
lang("LANG-export-star", "export *", "Re-export all names.", "`export * from`.", "One barrel. Don't hide graphs with barrels.", "BIT-11");
lang("LANG-array.map", "Array.prototype.map", "Transform each element to a new array.", "Does not mutate; returns same length.", "Render `{history.map(row => <li key={row.id}>...`.", "BIT-7");
lang("LANG-array.filter", "Array.prototype.filter", "Keep elements that pass a predicate.", "New array, possibly shorter.", "History of ON events only.", "BIT-7");
lang("LANG-array.find", "Array.prototype.find", "First match or undefined.", "Stops early.", "Find the latest ON.", "BIT-7");
lang("LANG-array.some", "Array.prototype.some", "Whether any element matches.", "Boolean; stops early.", "Has the light ever been on?", "BIT-7");
lang("LANG-array.every", "Array.prototype.every", "Whether all match.", "Boolean.", "Are all events valid?", "BIT-7");
lang("LANG-array.reduce", "Array.prototype.reduce", "Fold to one value.", "Accumulator.", "Count ON events.", "BIT-7");
lang("LANG-array.flatMap", "Array.prototype.flatMap", "Map then flatten one level.", "Concat mapped arrays.", "Expand an event into [from, to] chips.", "BIT-7");
lang("LANG-array.includes", "Array.prototype.includes", "Membership.", "SameValueZero.", "`SEND_TEST_COHORT.split(\",\").includes(id)`.", "BIT-14");
lang("LANG-array.slice", "Array.prototype.slice", "Copy a range (non-mutating).", "New array.", "Last 20 history rows.", "BIT-7");
lang("LANG-array.push", "Array.prototype.push", "Mutate by appending.", "Mutates; returns length.", "Avoid on React state; show why spread is required.", "BIT-4");
lang("LANG-array.sort", "Array.prototype.sort", "Reorder (mutates!).", "In-place unless copied first.", "`[...rows].sort((a,b)=>...)`.", "BIT-7");
lang("LANG-array.join", "Array.prototype.join", "Concatenate to string.", "Separator.", "Join tags.", "BIT-4");
lang("LANG-array.forEach", "Array.prototype.forEach", "Visit for side effects.", "No return array.", "Prefer map in JSX; forEach in scripts.", "BIT-13");
lang("LANG-promise.then", "Promise.then", "Register fulfillment (pre-await style).", "Returns a new Promise.", "Tower still has it. Teaching: prefer await, show then as the same chain.", "BIT-10");
lang("LANG-promise.catch", "Promise.catch", "Register rejection.", "Same as then(undefined, onRej).", "Show vs try/catch await.", "BIT-10");
lang("LANG-promise.finally", "Promise.finally", "After settle, no value change.", "Cleanup.", "Clear a loading flag.", "BIT-10");
lang("LANG-class-extends", "class extends", "Constructor + prototype inheritance.", "Rare in Tower (Error subclasses / React leftovers).", "Custom `class WireError extends Error`.", "BIT-10");
lang("LANG-constructor", "constructor", "Instance init.", "Called by `new`.", "See class extends.", "BIT-10");
lang("LANG-super", "super", "Call parent constructor/method.", "Must before `this` in constructor.", "See class extends.", "BIT-10");
lang("LANG-method", "class/object method", "Function as a property.", "Shorthand in class or object.", "Hono-adjacent objects; React class is not the product path.", "BIT-1");
lang("LANG-this", "this", "Receiver of a method call.", "Rare (5 hits). Arrow functions close over lexical this instead.", "Show why arrows are used in handlers.", "BIT-3");
{
  const dyn = ev("dynamic.json");
  const d = dyn.find((r) => r.id === "computed-index");
  lang("LANG-computed-index", "computed index", "Read `obj[expr]`.", "Dynamic key. Flagged as not-statically-resolvable.", "`ports[name]` in the wire registry.", "BIT-11", { row: d });
}

// extra language from globals that are language/runtime
function glob(id, name, purpose, mechanism, demo, stage, extra = {}) {
  const e = evRow(G[id] || extra.row);
  add({
    id: extra.id || `RT-${id.replace(/[^A-Za-z0-9]+/g, "-")}`,
    name,
    cat: "runtime",
    purpose,
    mechanism,
    inputs: extra.inputs || "see form",
    outputs: extra.outputs || "see mechanism",
    deps: extra.deps || "host (browser or Node)",
    ctx: extra.ctx || "varies",
    demo,
    criterion: extra.criterion || `Call is in source and the demo observes the effect.`,
    stage,
    form: extra.form || e.form,
    loc: extra.loc || e.loc,
    occ: extra.occ ?? e.occ,
    files: extra.files ?? e.files,
  });
}

glob("fetch()", "fetch", "HTTP from the browser (or Node 22).", "Returns Promise<Response>; CORS + cookies via credentials.", "POST /light/toggle with credentials include.", "BIT-10", { id: "RT-fetch", ctx: "browser (client); Node (scripts)" });
glob("process.env", "process.env", "Node environment bindings.", "Object of strings; missing keys are undefined.", "Read DATABASE_URL at boot.", "BIT-13", { id: "RT-process-env", ctx: "server/scripts" });
glob("import.meta.env", "import.meta.env", "Vite-injected client env.", "Build-time define; only VITE_* reach the browser.", "Read VITE_WIRE_REAL.", "BIT-13", { id: "RT-import-meta-env", ctx: "browser build" });
glob("import.meta", "import.meta", "Module metadata.", "url, env, etc.", "Resolve files next to the module in scripts.", "BIT-13", { id: "RT-import-meta", ctx: "shared ESM" });
glob("JSON.stringify()", "JSON.stringify", "Value → JSON text.", "Replacer/space optional; throws on cycles.", "Body of fetch; localStorage payload.", "BIT-9", { id: "RT-json-stringify" });
glob("JSON.parse()", "JSON.parse", "JSON text → value.", "Throws SyntaxError.", "Read localStorage; must try/catch.", "BIT-9", { id: "RT-json-parse" });
glob("new Map", "Map", "Keyed collection (any key).", "Reference keys; insertion order.", "Index rows by id without object prototype hazards.", "BIT-4", { id: "RT-map" });
glob("new Set", "Set", "Unique values.", "SameValueZero uniqueness.", "Dedupe flipped-by users.", "BIT-4", { id: "RT-set" });
glob("new Date", "Date", "Instant / calendar.", "Mutable; ISO via toISOString.", "Stamp a flip.", "BIT-7", { id: "RT-date" });
glob("new Error", "Error", "Throwable with message/stack.", "Construct + throw.", "Boot failure.", "BIT-13", { id: "RT-error" });
glob("new URL", "URL", "Parse/build URLs.", "WHATWG URL.", "PUBLIC_APP_URL join.", "BIT-14", { id: "RT-url" });
glob("new URLSearchParams", "URLSearchParams", "Query string map.", "Iterable; toString.", "Parse `?bit=1`.", "BIT-8", { id: "RT-url-search-params" });
glob("new Headers", "Headers", "HTTP header map.", "Used with fetch/Request.", "Set content-type + cookie.", "BIT-10", { id: "RT-headers" });
glob("new Request", "Request", "Fetch input object.", "WHATWG.", "Forward a request into Hono.", "BIT-11", { id: "RT-request" });
glob("new Promise", "Promise constructor", "Manual thenable.", "executor (resolve,reject).", "Wrap a callback API. Prefer async function.", "BIT-10", { id: "RT-promise-new" });
glob("Promise.all()", "Promise.all", "Wait for all; fail fast.", "Rejects on first rejection.", "Parallel reads.", "BIT-10", { id: "RT-promise-all" });
glob("Promise.resolve()", "Promise.resolve", "Lift a value to a Promise.", "Thenables assimilate.", "Stand-in ports returning resolved data.", "BIT-11", { id: "RT-promise-resolve" });
glob("localStorage.getItem()", "localStorage.getItem", "Read a origin-scoped string.", "Sync; strings only.", "Restore last light state.", "BIT-9", { id: "RT-localstorage-get", ctx: "browser" });
glob("localStorage.setItem()", "localStorage.setItem", "Write a origin-scoped string.", "Quota errors possible.", "Persist last light state.", "BIT-9", { id: "RT-localstorage-set", ctx: "browser" });
glob("sessionStorage.getItem()", "sessionStorage.getItem", "Tab-scoped string read.", "Cleared when tab ends.", "Tower: logged-out flag. Demo: 'don't restore this tab'.", "BIT-9", { id: "RT-sessionstorage-get", ctx: "browser" });
glob("sessionStorage.setItem()", "sessionStorage.setItem", "Tab-scoped string write.", "See get.", "See get.", "BIT-9", { id: "RT-sessionstorage-set", ctx: "browser" });
glob("sessionStorage.removeItem()", "sessionStorage.removeItem", "Delete a tab-scoped key.", "See get.", "Clear logged-out flag.", "BIT-9", { id: "RT-sessionstorage-remove", ctx: "browser" });
glob("document.getElementById()", "document.getElementById", "Find #root.", "DOM lookup.", "createRoot(document.getElementById(\"root\")).", "BIT-1", { id: "RT-getelementbyid", ctx: "browser" });
glob("crypto.randomUUID()", "crypto.randomUUID", "Generate a UUID.", "Web Crypto / Node crypto.", "Id for a history row.", "BIT-7", { id: "RT-random-uuid" });
glob("structuredClone()", "structuredClone", "Deep clone structured data.", "Does not clone functions.", "Copy a row before mutate.", "BIT-4", { id: "RT-structured-clone" });
glob("Array.isArray()", "Array.isArray", "True iff Array.", "Not typeof (typeof [] is object).", "Guard JSON payloads.", "BIT-5", { id: "RT-is-array" });
glob("Object.keys()", "Object.keys", "Enumerable own keys.", "Array of strings.", "Iterate a map-like object.", "BIT-4", { id: "RT-object-keys" });
glob("Object.entries()", "Object.entries", "Own [key,value] pairs.", "Array of tuples.", "Build a Select from a record.", "BIT-6", { id: "RT-object-entries" });
glob("Object.fromEntries()", "Object.fromEntries", "Pairs → object.", "Inverse of entries.", "Parse form fields.", "BIT-6", { id: "RT-object-fromentries" });
glob("Object.assign()", "Object.assign", "Mutating merge.", "Target is mutated.", "Prefer object spread in React.", "BIT-4", { id: "RT-object-assign" });
glob("setTimeout()", "setTimeout", "Run later on this event loop.", "Returns a handle; delay ms.", "Debounce a save.", "BIT-15", { id: "RT-settimeout" });
glob("setInterval()", "setInterval", "Repeat on this event loop.", "Worker tick in Tower.", "Worker: interval → tickOnce.", "BIT-15", { id: "RT-setinterval" });
glob("console.log()", "console.log", "Print for humans / logs.", "stdio or browser console.", "Worker JSON log line.", "BIT-15", { id: "RT-console-log" });
glob("window.addEventListener()", "window.addEventListener", "Subscribe to a DOM/window event.", "Capture/bubble.", "storage event to sync two tabs' light.", "BIT-9", { id: "RT-add-event-listener", ctx: "browser" });
glob("encodeURIComponent()", "encodeURIComponent", "Percent-encode a URI component.", "For query/path pieces.", "Encode $ in a password if shown in docs; encode token in /a/:token.", "BIT-14", { id: "RT-encode-uri" });

// —— TypeScript ——
function tsx(id, name, purpose, mechanism, demo, stage) {
  const e = evRow(T[id]);
  add({
    id, name, cat: "typescript", purpose, mechanism,
    inputs: "type positions (erased at emit)",
    outputs: "compile-time checks; no runtime (except enums — unused)",
    deps: "LANG-const + module",
    ctx: "compile time",
    demo, criterion: `A type annotation using this form exists; tsc/bundler accepts it.`,
    stage, form: e.form, loc: e.loc, occ: e.occ, files: e.files,
  });
}
tsx("TS-type-alias", "type alias", "Name a type.", "`type Light = { on: boolean }`. Interfaces are unused in Tower — aliases are the house style.", "Name `type LightState`.", "BIT-5");
tsx("TS-union", "union type", "Value is one of several types.", "`\"on\" | \"off\"`.", "Event kind union.", "BIT-5");
tsx("TS-intersection", "intersection type", "Must satisfy all.", "`A & B`.", "Row & { on: boolean }.", "BIT-5");
tsx("TS-literal-type", "literal type", "Exactly this value.", "`true`, `\"on\"`.", "`as const` events.", "BIT-5");
tsx("TS-type-literal", "object type literal", "Inline shape.", "`{ on: boolean }`.", "Props of Light.", "BIT-5");
tsx("TS-optional-property", "optional property", "Key may be absent.", "`on?: boolean` vs `on: boolean | undefined` (present-undefined).", "Optional note on a flip.", "BIT-5");
tsx("TS-optional-param", "optional parameter", "Argument may be omitted.", "`n?: number`.", "Optional callback param.", "BIT-5");
tsx("TS-array-type", "T[] array type", "Array of T.", "Sugar for Array<T>.", "`Event[]`.", "BIT-5");
tsx("TS-Array-generic", "Array<T>", "Generic array type.", "Same runtime as T[].", "When the generic form is clearer.", "BIT-5");
tsx("TS-type-arguments", "type arguments", "Instantiate a generic.", "`Promise<Light>`, `useState<boolean>`.", "useState<boolean>(false).", "BIT-5");
tsx("TS-function-type", "function type", "Type of a callable.", "`(next: boolean) => void`.", "onFlip: (next: boolean) => void.", "BIT-5");
tsx("TS-void", "void type", "Function returns nothing useful.", "Not JS void operator.", "Click handler type.", "BIT-5");
tsx("TS-unknown", "unknown", "Must narrow before use.", "Safer any.", "JSON.parse result as unknown.", "BIT-5");
tsx("TS-never", "never", "Should not happen.", "Exhaustiveness in switch.", "Default arm of event kind.", "BIT-16");
tsx("TS-any", "any", "Escape hatch (4 hits — almost unused).", "Turns off checking.", "EXCLUDE from teaching app except as a warned anti-pattern.", "EXCLUDE-any");
tsx("TS-as-assertion", "as assertion", "Tell the checker a type.", "Erased; can be wrong.", "`as Light` after JSON.parse — pair with unknown + narrow.", "BIT-5");
tsx("TS-as-const", "as const", "Widen-no: literal + readonly.", "Makes unions of literals.", "`[\"on\",\"off\"] as const`.", "BIT-5");
tsx("TS-satisfies", "satisfies", "Check against a type, keep inferred literals.", "Tower uses it on system-map data.", "Config object satisfies LightConfig.", "BIT-5");
tsx("TS-non-null-assertion", "non-null assertion !", "Assert not nullish.", "Erased; runtime still throws if wrong.", "`getElementById(\"root\")!`.", "BIT-1");
tsx("TS-typeof-type", "typeof type query", "Type from a value.", "`typeof initialLight`.", "Derive props from a sample.", "BIT-5");
tsx("TS-keyof", "keyof", "Union of keys.", "`keyof Light`.", "Pick a field name.", "BIT-5");
tsx("TS-indexed-access", "indexed access type", "`T[K]`.", "Type of a property.", "`Light[\"on\"]`.", "BIT-5");
tsx("TS-utility-Record", "Record<K,V>", "Object of keys K to V.", "Mapped object type.", "`Record<Id, Light>`.", "BIT-5");
tsx("TS-utility-Partial", "Partial<T>", "All properties optional.", "Mapped.", "Patch update.", "BIT-5");
tsx("TS-utility-Pick", "Pick<T,K>", "Subset of keys.", "Mapped.", "List row vs detail row.", "BIT-5");
tsx("TS-utility-Omit", "Omit<T,K>", "All keys except K.", "Mapped.", "Insert without id.", "BIT-5");
tsx("TS-utility-Promise", "Promise<T>", "Async value of T.", "Generic of Promise.", "query(): Promise<Light>.", "BIT-10");
tsx("TS-utility-Extract", "Extract<T,U>", "Keep members assignable to U.", "Distributive.", "Extract event kinds.", "BIT-5");
tsx("TS-utility-Exclude", "Exclude<T,U>", "Drop members assignable to U.", "Distributive.", "Drop 'unknown' from union.", "BIT-5");
tsx("TS-utility-NonNullable", "NonNullable<T>", "Drop null|undefined.", "Exclude.", "After a find().", "BIT-5");
tsx("TS-utility-ReturnType", "ReturnType<T>", "Function's return type.", "infer.", "Type the loader from the function.", "BIT-5");
tsx("TS-utility-Parameters", "Parameters<T>", "Tuple of args.", "infer.", "Reuse a handler's args.", "BIT-5");
tsx("TS-utility-Awaited", "Awaited<T>", "Unwrap Promise.", "Recursive.", "Type of awaited query.", "BIT-10");
tsx("TS-type-predicate", "type predicate", "Narrow a value.", "`x is Light`.", "isOnEvent(row): row is OnEvent.", "BIT-5");
tsx("TS-tuple", "tuple type", "Fixed-length array types.", "`[boolean, number]`.", "useState return type conceptually.", "BIT-5");
tsx("TS-mapped-type", "mapped type", "Transform each property.", "Tower has 1 hit.", "Show `{ [K in Kind]: number }`.", "BIT-5");
tsx("TS-index-signature", "index signature", "`{ [key: string]: V }`.", "1 hit. Prefer Record.", "Dictionary of flags.", "BIT-5");
tsx("TS-generic-alias", "generic type alias", "`type Box<T> = { value: T }`.", "2 hits.", "type Result<T> = { ok: T } | { err: string }.", "BIT-5");
tsx("TS-readonly-type", "readonly type", "Readonly<T> / readonly T[].", "Prevents assignment in checker.", "Freeze event log type.", "BIT-5");
tsx("TS-export-type", "export type", "Re-export a type.", "Erased.", "Share Light type from types.ts.", "BIT-5");

add({
  id: "TS-no-enum",
  name: "enum (absent)",
  cat: "typescript",
  purpose: "TS enums are a runtime object. Tower does not use them.",
  mechanism: "Absence confirmed in scanned TS (no EnumDeclaration).",
  inputs: "—", outputs: "—", deps: "—", ctx: "compile time",
  demo: "Do not introduce enum. Use union + as const.",
  criterion: "Teaching app has zero enum.",
  stage: "EXCLUDE-enum",
  form: "(not found)", loc: "—", occ: 0, files: 0,
});
add({
  id: "TS-no-interface",
  name: "interface (absent as a style)",
  cat: "typescript",
  purpose: "Tower names shapes with `type`, not `interface`.",
  mechanism: "0 InterfaceDeclaration in scan.",
  inputs: "—", outputs: "—", deps: "—", ctx: "compile time",
  demo: "Follow house style: type alias.",
  criterion: "Teaching app does not require interface.",
  stage: "EXCLUDE-interface",
  form: "(not found)", loc: "—", occ: 0, files: 0,
});

// —— JSX ——
function jsxI(id, name, purpose, mechanism, demo, stage) {
  const e = evRow(J[id]);
  add({
    id, name, cat: "jsx", purpose, mechanism,
    inputs: "tag + props + children",
    outputs: "React element (object) → DOM via reconciler",
    deps: "API-REACT-createRoot",
    ctx: "browser",
    demo, criterion: "Element appears in the running page.",
    stage, form: e.form, loc: e.loc, occ: e.occ, files: e.files,
  });
}
jsxI("JSX-element", "JSX element", "Write UI as nested tags.", "Compile to React.createElement / jsx().", "<button>Flip</button>", "BIT-1");
jsxI("JSX-self-closing", "JSX self-closing", "No children.", "<Light on={on} />", "<Light on={on} />", "BIT-1");
jsxI("JSX-fragment", "JSX fragment", "Group without a DOM node.", "<>...</> or <Fragment>.", "Return two children from Light.", "BIT-1");
jsxI("JSX-expression", "JSX expression", "Embed JS in markup.", "{on ? \"ON\" : \"OFF\"}", "Label the bit.", "BIT-2");
jsxI("JSX-spread-props", "JSX spread props", "Forward a props object.", "{...rest}", "Pass through to a Button.", "BIT-1");
jsxI("JSX-component", "JSX component", "Capitalized tag → function.", "Must start with uppercase.", "<Light />", "BIT-1");
jsxI("JSX-intrinsic", "JSX intrinsic", "Lowercase → HTML element.", "div, button, input.", "<button type=\"button\">", "BIT-1");

// —— SQL ——
function sqlI(id, name, purpose, mechanism, demo, stage) {
  const e = evRow(Q[id]);
  add({
    id, name, cat: "sql", purpose, mechanism,
    inputs: extraInputs(id), outputs: "relation / command tag",
    deps: "CFG-postgres", ctx: "postgres",
    demo, criterion: "SQL runs in migrate/seed or query; result visible on the desk.",
    stage, form: e.form, loc: e.loc, occ: e.occ, files: e.files,
  });
}
function extraInputs() { return "SQL text + $n params"; }
sqlI("SQL-create-table", "CREATE TABLE", "Declare a relation.", "Catalog change.", "lights(id, on, updated_at).", "BIT-12");
sqlI("SQL-alter-table", "ALTER TABLE", "Evolve a relation.", "Later migration, not edit-in-place of old files.", "Add last_flipped_by.", "BIT-12");
sqlI("SQL-create-index", "CREATE INDEX", "Accelerate a lookup.", "B-tree (default).", "Index lights.updated_at.", "BIT-12");
sqlI("SQL-insert", "INSERT", "Add rows.", "ON CONFLICT in Tower.", "Insert a flip event.", "BIT-12");
sqlI("SQL-update", "UPDATE", "Change rows.", "SET + WHERE.", "SET on = NOT on.", "BIT-12");
sqlI("SQL-delete", "DELETE", "Remove rows.", "WHERE required in teaching.", "Clear history.", "BIT-12");
sqlI("SQL-select", "SELECT", "Read rows.", "Projection + filter.", "SELECT on FROM lights.", "BIT-12");
sqlI("SQL-join", "JOIN", "Combine relations.", "INNER/LEFT in Tower.", "Join events to users when Access exists.", "BIT-14");
sqlI("SQL-cte", "WITH (CTE)", "Named subquery.", "Readability / recursion.", "Optional; only if a query needs a name.", "BIT-12");
sqlI("SQL-jsonb", "JSONB", "JSON as a column.", "Queryable JSON. Tower stores workflow.graph this way.", "Optional payload JSONB on events — only when a utility needs unstructured extra.", "BIT-16");
sqlI("SQL-uuid", "UUID", "Typed identifier.", "gen_random_uuid() in auth tables; TEXT ids elsewhere (two grains!).", "Use UUID for lights.id in teaching (one grain).", "BIT-12");
sqlI("SQL-rls-enable", "ENABLE ROW LEVEL SECURITY", "Per-row policies.", "Tower enables RLS; the Node app uses a service connection, so policies are not what the SPA currently feels.", "Name it; do not pretend JWT RLS is how the desk is empty. Desk-empty = query returns no rows.", "BIT-12");
sqlI("SQL-policy", "CREATE POLICY", "RLS rule.", "USING / WITH CHECK.", "Document as future/JWT; teaching app stays session-firm in the API.", "BIT-14");
sqlI("SQL-constraint", "constraints", "PK/FK/UNIQUE/CHECK.", "Rejects bad writes.", "PK on lights; FK from events.", "BIT-12");
sqlI("SQL-on-conflict", "ON CONFLICT", "Upsert.", "INSERT ... ON CONFLICT DO UPDATE.", "Ensure a single light row.", "BIT-12");
sqlI("SQL-returning", "RETURNING", "Give back written row.", "INSERT/UPDATE ... RETURNING *.", "Return the new on flag.", "BIT-12");
sqlI("SQL-transaction", "BEGIN/COMMIT/ROLLBACK", "Atomic unit.", "Tower withTransaction.", "Flip + insert event atomically.", "BIT-12");
sqlI("SQL-parameter", "$n parameters", "Bind values; no string concat.", "pg query(text, [values]).", "query(..., [id]).", "BIT-12");
add({
  id: "SQL-no-function",
  name: "CREATE FUNCTION (absent)",
  cat: "sql",
  purpose: "No stored functions in Tower migrations.",
  mechanism: "Scan found 0 CREATE FUNCTION.",
  inputs: "—", outputs: "—", deps: "—", ctx: "postgres",
  demo: "Do not add PL/pgSQL to increase coverage.",
  criterion: "Teaching app has no stored procedures unless a later need appears.",
  stage: "EXCLUDE-sql-fn",
  form: "(not found)", loc: "—", occ: 0, files: 0,
});

// —— CSS ——
function cssI(id, name, purpose, mechanism, demo, stage) {
  const e = evRow(C[id]);
  add({
    id, name, cat: "css", purpose, mechanism,
    inputs: "selectors + declarations", outputs: "used values on boxes",
    deps: "BIT-0 document", ctx: "browser",
    demo, criterion: "Visible on the page / DevTools.",
    stage, form: e.form, loc: e.loc, occ: e.occ, files: e.files,
  });
}
cssI("CSS-at-import", "@import", "Compose stylesheets / Tailwind.", "`@import \"tailwindcss\"`.", "Entry CSS imports Tailwind.", "BIT-13");
cssI("CSS-at-source", "@source", "Tailwind 4 content sources.", "`@source '../**/*.{tsx}'`.", "Tell the compiler where classes live.", "BIT-13");
cssI("CSS-custom-prop", "custom properties", "Theme tokens.", "`--background:`.", "Color the ON/OFF states.", "BIT-0");
cssI("CSS-var", "var()", "Use a token.", "`color: var(--foreground)`.", "Bind the light color to a token.", "BIT-0");
cssI("CSS-at-media", "@media", "Viewport conditions.", "Match media.", "Stack controls on a narrow window.", "BIT-0");
cssI("CSS-flex", "display:flex", "Arrange siblings in a row/column.", "Flex formatting context.", "Row: lamp + button.", "BIT-0");
cssI("CSS-grid", "display:grid", "2D arrangement.", "Grid formatting context.", "History table.", "BIT-7");

add({
  id: "HTML-script-module",
  name: "HTML module script",
  cat: "html",
  purpose: "Boot ESM into the document.",
  mechanism: "<script type=\"module\" src=\"/src/main.tsx\"> — Vite transforms.",
  inputs: "URL", outputs: "module evaluation → createRoot",
  deps: "—", ctx: "browser",
  demo: "index.html mounts #root.",
  criterion: "Page loads the app.",
  stage: "BIT-0",
  ...(() => { const e = evRow(H["HTML-script-module"]); return { form: e.form, loc: e.loc, occ: e.occ, files: e.files }; })(),
});
add({
  id: "HTML-root-div",
  name: "#root mount",
  cat: "html",
  purpose: "Empty node React owns.",
  mechanism: "createRoot(node).render(...)",
  inputs: "DOM node", outputs: "React tree",
  deps: "HTML-script-module", ctx: "browser",
  demo: "div#root in index.html",
  criterion: "React paints into it.",
  stage: "BIT-0",
  ...(() => { const e = evRow(H["HTML-root-div"]); return { form: e.form, loc: e.loc, occ: e.occ, files: e.files }; })(),
});
add({
  id: "HTML-dual-document",
  name: "dual HTML documents (MPA isolation)",
  cat: "architecture",
  purpose: "Two product faces that must not share CSS/JS entry.",
  mechanism: "index.html → main.tsx (Hub); prototype-ant.html → main-prototype-ant.tsx; Vite rollup input + middleware rewrite.",
  inputs: "URL path", outputs: "which bundle runs",
  deps: "CFG-vite-mpa", ctx: "build + browser",
  demo: "ONE BIT stays one document. Teach the dual-entry as a later isolation lesson without adding a second domain.",
  criterion: "Learner can point at vite.config build.rollupOptions.input.",
  stage: "BIT-21",
  form: "`prototype-ant.html` + `index.html`", loc: "`vite.config.ts:96`", occ: 2, files: 2,
});

// —— APIs (families, not every icon) ——
function apiFam(id, name, module, purpose, mechanism, demo, stage, form, loc, extra = {}) {
  const p = P[module];
  add({
    id, name, cat: "api", purpose, mechanism,
    inputs: extra.inputs || "arguments per contract",
    outputs: extra.outputs || "return / render / side effect",
    deps: extra.deps || "LANG-import-named",
    ctx: extra.ctx || "browser",
    demo, criterion: extra.criterion || `The named API is invoked and the demo shows its effect.`,
    stage, form, loc,
    occ: extra.occ ?? p?.apiHits ?? 0,
    files: extra.files ?? p?.symbolCount ?? 0,
    module,
  });
}

apiFam("API-REACT-createRoot", "createRoot", "react-dom/client", "Own a DOM node and render a tree.", "Concurrent root; render(element).", "createRoot(#root).render(<Light />)", "BIT-1", "`createRoot(...).render(<AppRouter />)`", "`src/main.tsx:7`");
apiFam("API-REACT-createPortal", "createPortal", "react-dom", "Render children into another DOM node.", "Keeps React parent, changes DOM parent.", "Optional modal for confirm flip. Skip if a simple dialog suffices.", "BIT-6", "`createPortal`", "`react-dom`", { ctx: "browser" });
apiFam("API-REACT-useState", "useState", "react", "Remember a value across renders; schedule an update.", "Hook; setter → re-render.", "const [on, setOn] = useState(false)", "BIT-2", "`useState(false)`", "`react`");
apiFam("API-REACT-useEffect", "useEffect", "react", "Run a side effect after paint.", "Deps array; cleanup return.", "Subscribe to /light or persist.", "BIT-9", "`useEffect(() => { ... }, [on])`", "`react`");
apiFam("API-REACT-useMemo", "useMemo", "react", "Cache a computed value.", "Recompute when deps change.", "Filter history.", "BIT-7", "`useMemo`", "`react`");
apiFam("API-REACT-useCallback", "useCallback", "react", "Stable function identity.", "Same as useMemo for functions.", "Pass flip to a child.", "BIT-3", "`useCallback`", "`react`");
apiFam("API-REACT-useRef", "useRef", "react", "Mutable box that does not re-render.", "`.current`.", "Focus the button; hold interval id.", "BIT-15", "`useRef`", "`react`");
apiFam("API-REACT-useContext", "useContext", "react", "Read a provided value without props.", "Nearest Provider.", "Session / firm / light store.", "BIT-11", "`useContext(AuthContext)`", "`src/app/auth/AuthContext.tsx`");
apiFam("API-REACT-createContext", "createContext + Provider", "react", "Broadcast a value down the tree.", "Provider value + consumers.", "LightProvider wrapping the app.", "BIT-11", "`createContext`", "`react`", { occ: 1 });
apiFam("API-RR-BrowserRouter", "BrowserRouter", "react-router", "History API routing for the Hub document.", "Listens to popstate; matches Routes.", "ONE BIT: introduce Router when History is a URL, not a tab.", "BIT-8", "`<BrowserRouter>`", "`src/app/Router.tsx:27`");
apiFam("API-RR-Routes", "Routes / Route", "react-router", "Declare path → element.", "Ranked matching; splat *.", "`/` Light, `/history` list.", "BIT-8", "`<Route path=\"/history\" element={...} />`", "`src/app/Router.tsx`");
apiFam("API-RR-Navigate", "Navigate", "react-router", "Declarative redirect.", "Renders a navigation.", "Auth off → home.", "BIT-8", "`<Navigate to=\"/\" replace />`", "`src/app/Router.tsx`");
apiFam("API-RR-useNavigate", "useNavigate", "react-router", "Imperative navigation.", "Returns a function.", "After flip, go to /history.", "BIT-8", "`useNavigate()`", "`react-router`");
apiFam("API-RR-useLocation", "useLocation", "react-router", "Current location object.", "pathname/search/state.", "Highlight the active path.", "BIT-8", "`useLocation()`", "`react-router`");
apiFam("API-ANTD-controls", "antd controls (Button, Input, Select, Modal, Tag, Space, Typography, Table)", "antd", "Product-face widget set.", "Components with Ant tokens; Form is available.", "Use Button + Typography for the switch. Table for history. Do not import the whole catalog.", "BIT-1", "`<Button>`, `<Typography.Text>`", "prototype-ant", { ctx: "browser / product face" });
apiFam("API-ANTD-icons", "@ant-design/icons", "@ant-design/icons", "SVG icon components for Ant.", "Each icon is a component.", "One lamp icon. Not 58 icons.", "BIT-1", "`<PlayCircleOutlined />`", "prototype-ant");
apiFam("API-XYFLOW", "@xyflow/react canvas", "@xyflow/react", "Node/edge graph editor (handles = edge ports).", "ReactFlow + Handle + Position. Tower: automations + system-map.", "A graph of flips is artificial until Automation. Introduce when a rule is a node, not a if-statement.", "BIT-16", "`<ReactFlow>`, `<Handle>`", "Hub + Ant workbench");
apiFam("API-LUCIDE", "lucide-react icons", "lucide-react", "Hub/shadcn icon set (94 symbols imported).", "SVG components.", "EXCLUDE from ONE BIT if Ant icons are in use — second icon pack is not a new mechanism.", "EXCLUDE-lucide", "`<ChevronDown />`", "Hub");
apiFam("API-RADIX-COMPOUND", "Radix compound primitives", "@radix-ui/react-dialog", "Unstyled accessible primitives composed as Root/Trigger/Content.", "Namespace import * as Dialog.", "Hub/shadcn. ONE BIT uses Ant. Contrast lesson: a primitive kit vs a painted kit — do not add Radix to raise coverage.", "EXCLUDE-radix", "`import * as Dialog from \"@radix-ui/react-dialog\"`", "src/app/components/ui");
apiFam("API-CVA", "class-variance-authority", "class-variance-authority", "Named class variants for shadcn.", "`cva({ variants })`.", "EXCLUDE unless not using Ant.", "EXCLUDE-cva", "`cva`", "ui/button");
apiFam("API-CLS-MERGE", "clsx + tailwind-merge", "clsx", "Join class names; merge Tailwind conflicts.", "cn() helper.", "Useful even on Ant? Only if className assembly is real. Optional BIT-13.", "BIT-13", "`clsx()`, `twMerge()`", "src/app/components/ui");
apiFam("API-RECHARTS", "recharts", "recharts", "SVG charts.", "ResponsiveContainer + Line/Pie.", "Count of ON vs OFF over time — optional History polish, not a new domain.", "BIT-7", "`<LineChart>`", "Hub + Ant client panel");
apiFam("API-RHF", "react-hook-form", "react-hook-form", "Form state library.", "register/handleSubmit. Tower: defined in ui/form.tsx, no product importers.", "EXCLUDE until a form is actually wired. Controlled inputs are enough first.", "EXCLUDE-rhf", "`useForm` (wrapper only)", "src/app/components/ui/form.tsx");
apiFam("API-SONNER", "sonner toaster", "sonner", "Toast UI.", "Toaster not mounted on CT path.", "EXCLUDE (dead on product face).", "EXCLUDE-sonner", "`<Toaster />`", "sonner.tsx");
apiFam("API-NEXT-THEMES", "next-themes", "next-themes", "Theme provider (Next-oriented).", "useTheme in sonner wrapper only.", "EXCLUDE. Not Next.js; don't add a Next theme layer.", "EXCLUDE-next-themes", "`useTheme()`", "sonner.tsx");
apiFam("API-VAUL", "vaul drawer", "vaul", "Drawer primitive.", "Hub.", "EXCLUDE with Radix.", "EXCLUDE-vaul", "`Drawer.Root`", "ui/drawer");
apiFam("API-CMDK", "cmdk", "cmdk", "Command palette.", "Hub.", "EXCLUDE.", "EXCLUDE-cmdk", "`Command`", "ui/command");
apiFam("API-EMBLA", "embla-carousel-react", "embla-carousel-react", "Carousel.", "Hub primitive.", "EXCLUDE.", "EXCLUDE-embla", "`useEmblaCarousel`", "ui/carousel");
apiFam("API-OTP", "input-otp", "input-otp", "OTP input cells.", "Hub primitive. Auth OTP is real on the server; this widget may not be the product face.", "BIT-14 if the login UI is built; else EXCLUDE-widget.", "BIT-14", "`input-otp`", "ui/input-otp");
apiFam("API-DAY-PICKER", "react-day-picker", "react-day-picker", "Calendar widget.", "Hub.", "EXCLUDE unless History filters by day.", "EXCLUDE-day-picker", "`<DayPicker />`", "ui/calendar");
apiFam("API-RESIZABLE", "react-resizable-panels", "react-resizable-panels", "Split panes.", "Hub.", "EXCLUDE.", "EXCLUDE-resizable", "react-resizable-panels", "ui/resizable");
apiFam("API-PAPAPARSE", "papaparse", "papaparse", "CSV parse in the browser.", "`Papa.parse`.", "Artificial for a single light. EXCLUDE unless importing a list of switches.", "EXCLUDE-csv", "`Papa.parse()`", "parseCsvPreview.ts");
apiFam("API-HONO-APP", "Hono app", "hono", "HTTP app: route table + context.", "`new Hono()`; `app.get/post`; `c.json`.", "POST /light/toggle.", "BIT-11", "`new Hono()`", "server/auth-service", { ctx: "server" });
apiFam("API-HONO-SERVE", "serve (Node adapter)", "@hono/node-server", "Bind Hono fetch to a Node port.", "`serve({ fetch, port })`.", "Listen :3001.", "BIT-11", "`serve({ fetch: app.fetch, port })`", "`server/auth-service/index.ts:24`", { ctx: "server" });
apiFam("API-HONO-COOKIE", "getCookie / setCookie / deleteCookie", "hono/cookie", "Read/write Cookie header through Hono context.", "Signed/httpOnly options in Tower session.", "Set session after login; read on /light.", "BIT-14", "`getCookie(c, SESSION_COOKIE)`", "`server/auth-service/routes.ts`", { ctx: "server" });
apiFam("API-HONO-CORS", "cors middleware", "hono/cors", "Cross-origin header policy.", "`app.use(cors({ origin }))`.", "Allow the Vite origin.", "BIT-11", "`cors()`", "hono/cors", { ctx: "server" });
apiFam("API-PG-POOL", "pg.Pool", "pg", "Pooled Postgres clients.", "`new Pool({ connectionString, max, ssl })`.", "One pool for the light DB.", "BIT-12", "`new Pool({ connectionString })`", "`server/auth-service/db.ts:20`", { ctx: "server" });
apiFam("API-PG-QUERY", "client.query", "pg", "Run parameterized SQL.", "`query<T>(text, values)` → `{ rows }`.", "SELECT/UPDATE the light.", "BIT-12", "`client.query(sql, [id])`", "`server/auth-service/db.ts:61`", { ctx: "server" });
apiFam("API-PG-TX", "connect + BEGIN/COMMIT", "pg", "Checkout a client for a transaction.", "connect → BEGIN → fn → COMMIT/ROLLBACK → release.", "Flip + event insert.", "BIT-12", "`withTransaction`", "`server/auth-service/db.ts:33`", { ctx: "server" });
apiFam("API-RESEND", "Resend emails", "resend", "HTTP email API.", "`new Resend(key).emails.send`.", "Email 'light turned ON' — artificial unless Access needs mail. Optional BIT-18.", "BIT-18", "`new Resend`", "server/wire-service/resendClient.ts", { ctx: "server" });
apiFam("API-TWILIO", "Twilio SMS (dynamic import)", "twilio", "SMS API; loaded with import() so auth serverless can omit it.", "`await import(\"twilio\"); twilio(sid, token)`.", "SMS on flip — artificial. Same pattern as optional native dep. Teach the dynamic import even if SMS is dry-run.", "BIT-18", "`await import(\"twilio\")`", "`server/wire-service/twilioClient.ts:7`", { ctx: "server", occ: 1 });
apiFam("API-NODE-CRYPTO", "node:crypto", "node:crypto", "HMAC, UUID, timing-safe compare.", "createHmac, timingSafeEqual, randomUUID, randomBytes.", "Session token hash; CSRF-ish compare.", "BIT-14", "`createHmac`, `timingSafeEqual`", "server/auth-service/crypto.ts", { ctx: "server" });
apiFam("API-NODE-FS", "node:fs", "node:fs", "Read migrations/seeds from disk.", "readFileSync, readdirSync.", "Migration runner.", "BIT-13", "`readFileSync`", "scripts/run-migration.ts", { ctx: "scripts" });
apiFam("API-NODE-PATH", "node:path", "node:path", "Join filesystem paths.", "join, resolve, dirname.", "Locate supabase/migrations.", "BIT-13", "`path.join`", "scripts", { ctx: "scripts" });
apiFam("API-NODE-DNS", "node:dns ipv4first", "node:dns", "Prefer IPv4 for Supabase pooler.", "`dns.setDefaultResultOrder(\"ipv4first\")`.", "Keep on the pg helper. Observable as 'connection works on IPv4-only'.", "BIT-12", "`dns.setDefaultResultOrder(\"ipv4first\")`", "`server/auth-service/db.ts:5`", { ctx: "server" });
apiFam("API-VITE-DEFINE-CONFIG", "defineConfig", "vite", "Typed Vite config.", "Plugins, proxy, alias, MPA input, define.", "vite.config.ts for ONE BIT.", "BIT-13", "`defineConfig`", "`vite.config.ts:19`", { ctx: "build" });
apiFam("API-VITE-REACT-PLUGIN", "@vitejs/plugin-react", "@vitejs/plugin-react", "JSX/TS refresh in Vite.", "`react()` plugin.", "Enable JSX.", "BIT-13", "`react()`", "`vite.config.ts:24`", { ctx: "build" });
apiFam("API-VITE-TAILWIND-PLUGIN", "@tailwindcss/vite", "@tailwindcss/vite", "Tailwind 4 as a Vite plugin (compiler in the toolchain).", "`tailwindcss()` — this is Tower's production Tailwind, not the TC-4 standalone CLI.", "utilities on the Light. Point at compiled CSS.", "BIT-13", "`tailwindcss()`", "`vite.config.ts:25`", { ctx: "build" });
apiFam("API-ESBUILD-BUNDLE", "esbuild.build", "esbuild", "Bundle serverless API entries.", "`esbuild.build` in scripts/bundle-vercel-api.mjs.", "Only when introducing Vercel split. Local ONE BIT can skip.", "BIT-21", "`esbuild.build()`", "scripts/bundle-vercel-api.mjs", { ctx: "build" });

// unused declared deps
for (const [id, name, pkg] of [
  ["EXCLUDE-mui", "MUI + Emotion (declared, zero imports)", "@mui/material"],
  ["EXCLUDE-dnd", "react-dnd (declared, zero imports)", "react-dnd"],
  ["EXCLUDE-slick", "react-slick (declared, zero imports)", "react-slick"],
  ["EXCLUDE-masonry", "react-responsive-masonry (declared, zero imports)", "react-responsive-masonry"],
  ["EXCLUDE-popper", "react-popper / @popperjs/core (declared, zero imports)", "react-popper"],
  ["EXCLUDE-confetti", "canvas-confetti (declared, zero imports)", "canvas-confetti"],
  ["EXCLUDE-motion", "motion (declared, zero imports)", "motion"],
  ["EXCLUDE-date-fns", "date-fns (declared, zero TS imports)", "date-fns"],
]) {
  add({
    id, name, cat: "api",
    purpose: "Present in package.json; not part of authored construction vocabulary.",
    mechanism: "No import in scanned TS/TSX.",
    inputs: "—", outputs: "—", deps: "—", ctx: "—",
    demo: "Do not install to raise coverage.",
    criterion: "package.json in ONE BIT does not include this unless a real need appears.",
    stage: id, form: `(declared ${pkg})`, loc: "package.json", occ: 0, files: 0, module: pkg,
  });
}

// —— Config / architecture ——
function cfg(id, name, purpose, mechanism, demo, stage, form, loc, ctx = "build") {
  add({
    id, name, cat: "config", purpose, mechanism,
    inputs: "files / env", outputs: "running topology",
    deps: "—", ctx, demo,
    criterion: `Config exists and the named behaviour is observable.`,
    stage, form, loc, occ: 1, files: 1,
  });
}
cfg("CFG-package-scripts", "package.json scripts as entry points", "Multiple processes: Vite, auth+wire, worker, migrate, seed, verify.", "npm run X → node/tsx/vite.", "scripts: dev, dev:api, db:migrate, worker.", "BIT-13", "`\"dev\": \"vite\"`", "package.json");
cfg("CFG-tsx-env-file", "tsx --env-file=.env", "Load env into a TS process without bundling.", "tsx CLI; not an import.", "Run the API with .env.", "BIT-13", "`tsx --env-file=.env server/...`", "package.json", "scripts");
cfg("CFG-type-module", "\"type\": \"module\"", "Treat .js as ESM.", "Node + Vite.", "All local files ESM.", "BIT-13", "`\"type\": \"module\"`", "package.json");
cfg("CFG-tsconfig", "tsconfig strict ESM bundler", "Checker settings; noEmit.", "target ES2022, moduleResolution bundler, strict.", "Match Tower: strict, noEmit, isolatedModules.", "BIT-5", "`\"strict\": true, \"noEmit\": true`", "tsconfig.json", "compile time");
cfg("CFG-vite-proxy", "Vite proxy /auth /wire", "Browser same-origin; server on :3001.", "http-proxy in vite server.proxy.", "fetch('/light') hits the API.", "BIT-11", "`server.proxy['/wire']`", "vite.config.ts:68");
cfg("CFG-vite-alias", "path alias @ → src", "Short imports.", "`resolve.alias`.", "@/light — optional; relative is fine first.", "BIT-13", "`'@': path.resolve(..., './src')`", "vite.config.ts:85");
cfg("CFG-vite-define", "vite define client flags", "Force VITE_* into the bundle.", "`define: { 'import.meta.env.VITE_...' }`.", "Default AUTH_DISABLED in dev.", "BIT-13", "`define: { import.meta.env.VITE_WIRE_REAL }`", "vite.config.ts:51");
cfg("CFG-vite-mpa", "Vite multi-page input", "Two HTML entries, two bundles.", "rollupOptions.input.", "Isolation lesson BIT-21. ONE BIT uses one input until then.", "BIT-21", "`input: { main, 'prototype-ant' }`", "vite.config.ts:96");
cfg("CFG-vercel-rewrites", "Vercel rewrites", "SPA + API + Ant MPA on one host.", "vercel.json rewrites + functions + cron.", "When deploying.", "BIT-21", "`/prototype-ant` → prototype-ant.html; `/wire` → /api/wire", "vercel.json");
cfg("CFG-vercel-cron", "Vercel cron tick", "HTTP tick when no long worker.", "GET /api/wire/machine/tick daily (plus GH every 5 min).", "Prefer BIT-15 process first; cron is another trigger of the same tick.", "BIT-15", "`crons: [{ path: \"/api/wire/machine/tick\" }]`", "vercel.json:20");
cfg("CFG-docker-worker", "Docker Compose worker", "Long-lived tick process.", "docker-compose.worker.yml + Dockerfile.worker.", "Same tickOnce as `npm run worker`.", "BIT-15", "Dockerfile.worker", "Dockerfile.worker");
cfg("CFG-ci-ship", "GitHub Actions + Postgres service", "CI proves migrate/seed/verify/build.", "postgres:16 service; npm ci; db:migrate; verify; build.", "ONE BIT: migrate + a query test + npm run build.", "BIT-20", "`services: postgres:16`", ".github/workflows/ship.yml");
cfg("CFG-env-database-url", "DATABASE_URL", "Postgres connection string (URL-encode $).", "pg Pool.", "Required for BIT-12.", "BIT-12", "`DATABASE_URL=`", ".env.example", "server");
cfg("CFG-env-send-mode", "SEND_MODE fail-closed", "Missing → dry_run; live needs cohort.", "bootEnv.ts.", "Mail/SMS lessons stay dry_run until a cohort is set.", "BIT-18", "`SEND_MODE` default dry_run", ".env.example");
cfg("CFG-env-auth-disabled", "VITE_AUTH_DISABLED / AUTH_DISABLED", "Skip login gate in craft.", "Vite define + server.", "Start true; turn false when Access is the lesson.", "BIT-14", "`VITE_AUTH_DISABLED=true`", "vite.config.ts");
cfg("CFG-gitignore-env", ".gitignore secrets", ".env not committed; examples are.", "!.env.example", "Keep secrets out of git.", "BIT-13", "`.env` gitignored", ".gitignore");
cfg("CFG-pnpm-workspace", "pnpm-workspace (single package)", "Workspace file present with '.' only.", "Not a real multi-package repo.", "Don't invent packages to look like a monorepo.", "EXCLUDE-monorepo", "`packages: ['.']`", "pnpm-workspace.yaml");

function arch(id, name, purpose, mechanism, demo, stage, form, loc) {
  add({
    id, name, cat: "architecture", purpose, mechanism,
    inputs: "requests / rows / flags", outputs: "who can see/do what",
    deps: "CFG + API", ctx: "shared", demo,
    criterion: "Pattern is named in notes and exercised by a test or visible behaviour.",
    stage, form, loc, occ: 1, files: 1,
  });
}
arch("ARCH-standin-vs-real", "stand-in vs real ports", "Same client ports; swap implementations with a flag.", "registry.ts: VITE_WIRE_REAL chooses reals/* or standins/*.", "Fake light store, then swap to pg without changing the button.", "BIT-11", "`wireRealEnabled()`", "src/app/wire/registry.ts");
arch("ARCH-session-firm", "session cookie binds firm", "No demo-tenant default on the write path.", "getCookie → sessions.token_hash → firm_id; x-firm-id must match.", "A second user cannot flip your light.", "BIT-14", "`requireSessionFirm(c)`", "server/wire-service/sessionFirm.ts");
arch("ARCH-credentials-include", "fetch credentials: include", "Send cookies to same-origin API.", "browser fetch option.", "Login then toggle.", "BIT-14", "`credentials: \"include\"`", "src/app/wire/http.ts:12");
arch("ARCH-write-set", "write-set after a step", "Later steps see every write that run made — not a hard-coded field catalog.", "WalkContext.chainWrites; client authoredNodeOutputs.", "After flip, history reads the write (on, at) rather than a global catalog.", "BIT-16", "`chainWrites` / `previousWrites`", "server/wire-service/workflowWalk.ts");
arch("ARCH-workflow-walk", "validated workflow walk", "Graph in JSONB walked by a single walker (015).", "walkValidatedWorkflow; until-node / configured-break.", "ONE BIT: a two-node graph (when flipped → record). Do not rewrite a second machine.", "BIT-16", "`walkValidatedWorkflow`", "server/wire-service/workflowWalk.ts");
arch("ARCH-worker-tick", "time path vs event path", "Events walk immediately; time escalations tick.", "worker.ts setInterval → tickOnce; also HTTP /machine/tick and cron.", "If ON for N seconds, auto-off. Same tick function from process and HTTP.", "BIT-15", "`tickOnce`", "server/wire-service/cascade.ts");
arch("ARCH-two-id-grains", "UUID firms vs TEXT firm_id", "Auth tables UUID; CT/machine TEXT (firm-cedar).", "Two identifier schemes in one product.", "ONE BIT: pick UUID and stay there. Name the Tower split as a gap, don't reproduce it.", "GAP-two-grains", "`firms.id UUID` vs `firm_id TEXT`", "supabase/migrations/001 vs 003");
arch("ARCH-data-in-tables", "desk shows the query", "Empty table → empty desk. No painted rows in React.", "Seeds populate; UI maps query results.", "Delete the light row; page is empty.", "BIT-12", "seeds + SELECT", "supabase/seeds");
arch("ARCH-boot-env", "boot assertions", "Process refuses to start without required env.", "assertBootEnv('api'|'worker').", "Start API without DATABASE_URL → crash with a named error.", "BIT-13", "`assertBootEnv`", "server/wire-service/bootEnv.ts");
arch("ARCH-verify-scripts", "verify scripts instead of unit runner", "No Vitest/Jest; tsx scripts against real Postgres.", "npm run verify:*.", "ONE BIT: one verify-light.ts that flips and asserts the row.", "BIT-20", "`tsx scripts/verify-*.ts`", "package.json");
arch("ARCH-wire-http-prefix", "same app, two prefixes", "Local: /wire and /api/wire on one process. Vercel: split bundles.", "app.route both prefixes.", "Proxy both or pick one in ONE BIT and name the other.", "BIT-11", "`app.route(\"/wire\")` + `app.route(\"/api/wire\")`", "server/auth-service/index.ts");

const stagesOrder = [
  "BIT-0", "BIT-1", "BIT-2", "BIT-3", "BIT-4", "BIT-5", "BIT-6", "BIT-7", "BIT-8",
  "BIT-9", "BIT-10", "BIT-11", "BIT-12", "BIT-13", "BIT-14", "BIT-15", "BIT-16",
  "BIT-18", "BIT-20", "BIT-21",
];

function mdTable(rows, headers) {
  const h = `| ${headers.join(" | ")} |`;
  const s = `|${headers.map(() => "---").join("|")}|`;
  return [h, s, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

function esc(t) {
  return String(t ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

// SYNTAX_INVENTORY
{
  const cats = ["language", "runtime", "typescript", "jsx", "sql", "css", "html"];
  let md = `# SYNTAX_INVENTORY\n\n`;
  md += `Deduplicated constructions (not every identifier). Evidence: TypeScript AST on 666 JS/TS files plus SQL/CSS/HTML scans of \`origin/main\` @ \`48d4511\`.\n\n`;
  md += `Repeated boilerplate (renamed variables, extra lucide icons, extra antd widgets) is **not** a new construction. Semantic variations (map vs reduce, \`??\` vs \`||\`, type-only import) **are**.\n\n`;
  md += `**Not claimed absent** unless that bucket scanned cleanly. See GAPS.md.\n\n`;
  md += `| Category | Count |\n|---|---|\n`;
  for (const c of [...cats, "api", "config", "architecture"]) {
    md += `| ${c} | ${items.filter((i) => i.cat === c).length} |\n`;
  }
  md += `\nTotal catalogue IDs: **${items.length}**.\n\n`;
  for (const c of cats) {
    md += `## ${c}\n\n`;
    md += mdTable(
      items.filter((i) => i.cat === c).map((i) => [
        `\`${i.id}\``, esc(i.name), esc(i.form), String(i.occ), String(i.files), esc(i.loc),
        esc(i.purpose), esc(i.mechanism), esc(i.demo),
      ]),
      ["ID", "Name", "Exact form", "Occ", "Files", "Location", "Purpose", "Mechanism", "Min demo"],
    );
    md += `\n\n`;
  }
  fs.writeFileSync(path.join(root, "SYNTAX_INVENTORY.md"), md);
}

// API_INVENTORY
{
  let md = `# API_INVENTORY\n\n`;
  md += `Imported libraries and **observed** usage. Icons/widgets are families, not one construction per symbol.\n\n`;
  md += `Scan: import graph + identifier/JSX usage. Twilio is a **dynamic import** (see GAPS).\n\n`;
  md += `## Package families (authored usage)\n\n`;
  md += mdTable(
    items.filter((i) => i.cat === "api").map((i) => [
      `\`${i.id}\``, esc(i.name), esc(i.module || ""), String(i.occ), esc(i.form), esc(i.loc),
      esc(i.purpose), esc(i.stage),
    ]),
    ["ID", "Name", "Module", "Hits", "Form", "Location", "Contract / purpose", "Stage or exclusion"],
  );
  md += `\n\n## Raw package rollup (top)\n\n`;
  md += mdTable(
    packages.filter((p) => !p.module.startsWith("@notion-icons") && !p.module.startsWith(".")).slice(0, 40).map((p) => [
      `\`${p.module}\``, String(p.apiHits), String(p.importHits), String(p.symbols), esc((p.top || []).slice(0, 8).join(", ")),
    ]),
    ["Module", "API hits", "Import hits", "Symbols", "Top symbols"],
  );
  md += `\n\nFull rollup: \`evidence/packages-brief.json\`.\n`;
  fs.writeFileSync(path.join(root, "API_INVENTORY.md"), md);
}

// CONFIG already mixed; write CONFIG_INVENTORY from config+architecture
{
  let md = `# CONFIG_INVENTORY\n\n`;
  md += `Package management, build, TypeScript, environment, tooling, execution, and application architecture patterns that are not a single syntax node.\n\n`;
  md += `## Config\n\n`;
  md += mdTable(
    items.filter((i) => i.cat === "config").map((i) => [
      `\`${i.id}\``, esc(i.name), esc(i.form), esc(i.loc), esc(i.purpose), esc(i.mechanism), esc(i.stage),
    ]),
    ["ID", "Name", "Form", "Location", "Purpose", "Mechanism", "Stage"],
  );
  md += `\n\n## Architecture patterns\n\n`;
  md += mdTable(
    items.filter((i) => i.cat === "architecture").map((i) => [
      `\`${i.id}\``, esc(i.name), esc(i.form), esc(i.loc), esc(i.purpose), esc(i.mechanism), esc(i.stage),
    ]),
    ["ID", "Name", "Form", "Location", "Purpose", "Mechanism", "Stage"],
  );
  md += `\n\n## Execution entry points (Tower package.json)\n\n`;
  md += `| Script | Construction |\n|---|---|\n`;
  md += `| \`dev\` | Vite dev server (BIT-13) |\n`;
  md += `| \`dev:auth\` | tsx + Hono on :3001, mounts /wire and /api/wire (BIT-11) |\n`;
  md += `| \`build\` / \`build:vercel\` | Vite MPA + esbuild API bundles (BIT-21) |\n`;
  md += `| \`db:migrate\` / \`db:seed\` | sequential SQL + manifest seeds (BIT-12) |\n`;
  md += `| \`worker\` / \`worker:once\` | setInterval tick (BIT-15) |\n`;
  md += `| \`verify:*\` | integration scripts, not a unit runner (BIT-20) |\n`;
  md += `\n`;
  fs.writeFileSync(path.join(root, "CONFIG_INVENTORY.md"), md);
}

// COVERAGE_MATRIX
{
  let md = `# COVERAGE_MATRIX\n\n`;
  md += `Every catalogue ID appears exactly once. Stage \`BIT-n\` = proposed ONE BIT lesson. \`EXCLUDE-*\` = explicit exclusion (reason in the row). \`GAP-*\` = named gap, not silent.\n\n`;
  md += `No construction is allowed to vanish from this table.\n\n`;
  md += mdTable(
    items.map((i) => [
      `\`${i.id}\``, esc(i.cat), esc(i.name), esc(i.stage), esc(i.loc), String(i.occ),
      esc(i.demo), esc(i.criterion),
    ]),
    ["ID", "Cat", "Name", "Lesson / exclusion", "Tower evidence", "Occ", "Teaching-app use", "Coverage criterion"],
  );
  md += `\n\n## Counts by stage\n\n`;
  const by = {};
  for (const i of items) by[i.stage] = (by[i.stage] || 0) + 1;
  md += `| Stage | Count |\n|---|---|\n`;
  for (const [k, n] of Object.entries(by).sort()) md += `| ${k} | ${n} |\n`;
  md += `\nCatalogue size: **${items.length}**.\n`;
  fs.writeFileSync(path.join(root, "COVERAGE_MATRIX.md"), md);
}

fs.writeFileSync(path.join(root, "evidence/catalog.json"), JSON.stringify(items, null, 2));
console.log("items", items.length, "written");
console.log("by cat", items.reduce((a, i) => ((a[i.cat] = (a[i.cat] || 0) + 1), a), {}));

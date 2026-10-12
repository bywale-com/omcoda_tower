/**
 * Tower construction-vocabulary AST scan.
 * Reads /tmp/tower-main (origin/main worktree). Does not modify Tower.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.env.TOWER_ROOT || "/tmp/tower-main";
const OUT = process.env.TOWER_SCAN_OUT || "/tmp/tower-scan/out";
const MAX_EXAMPLES = 4;

const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  "dist",
  "dist-api",
  "dist-ssr",
  "coverage",
  ".vite",
  ".vercel",
  ".pnpm-store",
]);

const PARSE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"]);
const SQL_EXT = new Set([".sql"]);
const CSS_EXT = new Set([".css"]);
const HTML_EXT = new Set([".html"]);
const JSON_EXT = new Set([".json"]);
const YAML_EXT = new Set([".yml", ".yaml"]);
const DOC_EXT = new Set([".md", ".mdc"]);
const ASSET_EXT = new Set([".png", ".svg", ".mp4", ".jpg", ".jpeg", ".gif", ".webp", ".woff", ".woff2", ".ico"]);

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function walk(dir, files = []) {
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    files.push({ abs: dir, rel: rel(dir), status: "failed", reason: `readdir: ${e.message}` });
    return files;
  }
  for (const ent of ents) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR.has(ent.name)) continue;
      walk(abs, files);
    } else if (ent.isFile()) {
      files.push({ abs, rel: rel(abs), status: "listed" });
    } else if (ent.isSymbolicLink()) {
      files.push({ abs, rel: rel(abs), status: "excluded", reason: "symlink" });
    }
  }
  return files;
}

function hit(store, id, file, line, excerpt) {
  if (!store[id]) store[id] = { id, occurrences: 0, files: new Set(), examples: [] };
  const rec = store[id];
  rec.occurrences += 1;
  rec.files.add(file);
  if (rec.examples.length < MAX_EXAMPLES) {
    rec.examples.push({ file, line, excerpt: excerpt.slice(0, 180).replace(/\s+/g, " ").trim() });
  }
}

function finalize(store) {
  return Object.values(store)
    .map((r) => ({
      id: r.id,
      occurrences: r.occurrences,
      fileCount: r.files.size,
      files: [...r.files].sort(),
      examples: r.examples,
    }))
    .sort((a, b) => b.occurrences - a.occurrences || a.id.localeCompare(b.id));
}

function lineOf(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

function textOf(sf, node) {
  return node.getText(sf);
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".ts") || file.endsWith(".mts")) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function isTypeOnlyImport(node) {
  return Boolean(node.importClause?.isTypeOnly);
}

function collectImports(sf, file, imports, apis, syntax, typeRefs) {
  const binding = new Map(); // local -> { module, imported, typeOnly }

  const addBinding = (local, module, imported, typeOnly) => {
    binding.set(local, { module, imported, typeOnly });
    const key = `${module}::${imported}`;
    hit(imports, key, file, 1, `${typeOnly ? "type " : ""}${imported} from ${module}`);
  };

  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const module = node.moduleSpecifier.text;
      const typeOnly = isTypeOnlyImport(node);
      if (!node.importClause) {
        hit(syntax, "LANG-import-side-effect", file, lineOf(sf, node), textOf(sf, node));
      } else {
        if (node.importClause.name) {
          hit(syntax, typeOnly ? "LANG-import-type-default" : "LANG-import-default", file, lineOf(sf, node), textOf(sf, node));
          addBinding(node.importClause.name.text, module, "default", typeOnly);
        }
        const nb = node.importClause.namedBindings;
        if (nb && ts.isNamespaceImport(nb)) {
          hit(syntax, "LANG-import-namespace", file, lineOf(sf, node), textOf(sf, node));
          addBinding(nb.name.text, module, "*", typeOnly);
        }
        if (nb && ts.isNamedImports(nb)) {
          hit(syntax, typeOnly ? "LANG-import-type-named" : "LANG-import-named", file, lineOf(sf, node), textOf(sf, node));
          for (const el of nb.elements) {
            const imported = (el.propertyName ?? el.name).text;
            const elType = typeOnly || Boolean(el.isTypeOnly);
            if (el.isTypeOnly) hit(syntax, "LANG-import-inline-type", file, lineOf(sf, el), textOf(sf, el));
            addBinding(el.name.text, module, imported, elType);
          }
        }
      }
    }

    if (ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        hit(syntax, node.exportClause ? "LANG-reexport-named" : "LANG-export-star", file, lineOf(sf, node), textOf(sf, node));
      } else if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        hit(syntax, "LANG-export-named", file, lineOf(sf, node), textOf(sf, node));
      }
      if (node.isTypeOnly) hit(syntax, "TS-export-type", file, lineOf(sf, node), textOf(sf, node));
    }
    if (ts.isExportAssignment(node)) {
      hit(syntax, node.isExportEquals ? "LANG-export-equals" : "LANG-export-default", file, lineOf(sf, node), textOf(sf, node));
    }
    if (ts.canHaveModifiers(node)) {
      const mods = ts.getModifiers(node);
      if (mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        if (mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) {
          hit(syntax, "LANG-export-default", file, lineOf(sf, node), textOf(sf, node).slice(0, 80));
        } else {
          hit(syntax, "LANG-export-named", file, lineOf(sf, node), textOf(sf, node).slice(0, 80));
        }
      }
    }

    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      hit(syntax, "LANG-dynamic-import", file, lineOf(sf, node), textOf(sf, node));
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        hit(imports, `${arg.text}::dynamic()`, file, lineOf(sf, node), textOf(sf, node));
      } else {
        hit(syntax, "GAP-dynamic-import-nonliteral", file, lineOf(sf, node), textOf(sf, node));
      }
    }

    if (ts.isIdentifier(node)) {
      const b = binding.get(node.text);
      if (b) {
        const parent = node.parent;
        const usedAsType =
          (parent && ts.isTypeReferenceNode(parent) && parent.typeName === node) ||
          (parent && ts.isExpressionWithTypeArguments(parent) && parent.expression === node);
        if (usedAsType) {
          hit(typeRefs, `${b.module}::${b.imported}`, file, lineOf(sf, node), textOf(sf, parent));
        } else if (parent && ts.isCallExpression(parent) && parent.expression === node) {
          hit(apis, `${b.module}::${b.imported}()`, file, lineOf(sf, node), textOf(sf, parent).slice(0, 160));
        } else if (parent && ts.isJsxOpeningElement(parent) && parent.tagName === node) {
          hit(apis, `${b.module}::${b.imported}<JSX>`, file, lineOf(sf, node), textOf(sf, parent).slice(0, 160));
        } else if (parent && ts.isJsxSelfClosingElement(parent) && parent.tagName === node) {
          hit(apis, `${b.module}::${b.imported}<JSX>`, file, lineOf(sf, node), textOf(sf, parent).slice(0, 160));
        } else if (parent && ts.isPropertyAccessExpression(parent) && parent.expression === node) {
          const apiName = `${b.module}::${b.imported}.${parent.name.text}`;
          const gp = parent.parent;
          if (gp && ts.isCallExpression(gp) && gp.expression === parent) {
            hit(apis, `${apiName}()`, file, lineOf(sf, parent), textOf(sf, gp).slice(0, 160));
          } else if (gp && (ts.isJsxOpeningElement(gp) || ts.isJsxSelfClosingElement(gp)) && gp.tagName === parent) {
            hit(apis, `${apiName}<JSX>`, file, lineOf(sf, parent), textOf(sf, gp).slice(0, 160));
          } else {
            hit(apis, apiName, file, lineOf(sf, parent), textOf(sf, parent).slice(0, 160));
          }
        } else if (!b.typeOnly) {
          hit(apis, `${b.module}::${b.imported}`, file, lineOf(sf, node), textOf(sf, node));
        }
      }
    }

    ts.forEachChild(node, visit);
  }
  visit(sf);
  return binding;
}

function walkSyntax(sf, file, syntax, types, jsx, globals, dynamic) {
  function visit(node) {
    const k = node.kind;
    const ln = () => lineOf(sf, node);
    const tx = () => textOf(sf, node);

    switch (k) {
      case ts.SyntaxKind.VariableDeclarationList: {
        const flags = node.flags;
        if (flags & ts.NodeFlags.Const) hit(syntax, "LANG-const", file, ln(), tx().slice(0, 80));
        else if (flags & ts.NodeFlags.Let) hit(syntax, "LANG-let", file, ln(), tx().slice(0, 80));
        else hit(syntax, "LANG-var", file, ln(), tx().slice(0, 80));
        break;
      }
      case ts.SyntaxKind.FunctionDeclaration:
        hit(syntax, node.asteriskToken ? "LANG-generator-function" : node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? "LANG-async-function" : "LANG-function-declaration", file, ln(), tx().slice(0, 100));
        break;
      case ts.SyntaxKind.FunctionExpression:
        hit(syntax, node.asteriskToken ? "LANG-generator-function-expr" : "LANG-function-expression", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.ArrowFunction:
        hit(syntax, node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? "LANG-async-arrow" : "LANG-arrow-function", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.MethodDeclaration:
        hit(syntax, "LANG-method", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.Constructor:
        hit(syntax, "LANG-constructor", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.GetAccessor:
        hit(syntax, "LANG-getter", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.SetAccessor:
        hit(syntax, "LANG-setter", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.ClassDeclaration:
        hit(syntax, node.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword) ? "LANG-class-extends" : "LANG-class", file, ln(), tx().slice(0, 80));
        if (node.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ImplementsKeyword)) {
          hit(types, "TS-implements", file, ln(), tx().slice(0, 80));
        }
        break;
      case ts.SyntaxKind.ClassExpression:
        hit(syntax, "LANG-class-expression", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.NewExpression:
        hit(syntax, "LANG-new", file, ln(), tx().slice(0, 100));
        if (ts.isIdentifier(node.expression)) {
          const n = node.expression.text;
          if (["Map", "Set", "WeakMap", "WeakSet", "Promise", "Error", "URL", "URLSearchParams", "Headers", "Request", "Response", "AbortController", "FormData", "Date", "RegExp", "Proxy", "Intl"].includes(n)) {
            hit(globals, `new ${n}`, file, ln(), tx().slice(0, 120));
          }
        }
        break;
      case ts.SyntaxKind.AwaitExpression:
        hit(syntax, "LANG-await", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.YieldExpression:
        hit(syntax, "LANG-yield", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.TryStatement:
        hit(syntax, "LANG-try", file, ln(), "try");
        if (node.catchClause) {
          hit(syntax, node.catchClause.variableDeclaration ? "LANG-catch-binding" : "LANG-optional-catch", file, lineOf(sf, node.catchClause), "catch");
        }
        if (node.finallyBlock) hit(syntax, "LANG-finally", file, ln(), "finally");
        break;
      case ts.SyntaxKind.ThrowStatement:
        hit(syntax, "LANG-throw", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.IfStatement:
        hit(syntax, "LANG-if", file, ln(), "if");
        if (node.elseStatement) hit(syntax, "LANG-else", file, ln(), "else");
        break;
      case ts.SyntaxKind.SwitchStatement:
        hit(syntax, "LANG-switch", file, ln(), "switch");
        break;
      case ts.SyntaxKind.CaseClause:
        hit(syntax, "LANG-case", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.DefaultClause:
        hit(syntax, "LANG-default-clause", file, ln(), "default:");
        break;
      case ts.SyntaxKind.ConditionalExpression:
        hit(syntax, "LANG-ternary", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.ForStatement:
        hit(syntax, "LANG-for", file, ln(), "for");
        break;
      case ts.SyntaxKind.ForOfStatement:
        hit(syntax, node.awaitModifier ? "LANG-for-await-of" : "LANG-for-of", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.ForInStatement:
        hit(syntax, "LANG-for-in", file, ln(), "for-in");
        break;
      case ts.SyntaxKind.WhileStatement:
        hit(syntax, "LANG-while", file, ln(), "while");
        break;
      case ts.SyntaxKind.DoStatement:
        hit(syntax, "LANG-do-while", file, ln(), "do-while");
        break;
      case ts.SyntaxKind.BreakStatement:
        hit(syntax, "LANG-break", file, ln(), "break");
        break;
      case ts.SyntaxKind.ContinueStatement:
        hit(syntax, "LANG-continue", file, ln(), "continue");
        break;
      case ts.SyntaxKind.ReturnStatement:
        hit(syntax, "LANG-return", file, ln(), "return");
        break;
      case ts.SyntaxKind.LabeledStatement:
        hit(syntax, "LANG-label", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.ObjectBindingPattern:
        hit(syntax, "LANG-destructure-object", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.ArrayBindingPattern:
        hit(syntax, "LANG-destructure-array", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.SpreadElement:
        hit(syntax, "LANG-spread", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.SpreadAssignment:
        hit(syntax, "LANG-spread-object", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.RestType:
        hit(types, "TS-rest-type", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.Parameter:
        if (node.dotDotDotToken) hit(syntax, "LANG-rest-param", file, ln(), tx().slice(0, 60));
        if (node.initializer) hit(syntax, "LANG-default-param", file, ln(), tx().slice(0, 60));
        if (node.questionToken) hit(types, "TS-optional-param", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.PropertyAssignment:
        if (node.name && ts.isComputedPropertyName(node.name)) hit(syntax, "LANG-computed-property", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.ShorthandPropertyAssignment:
        hit(syntax, "LANG-shorthand-property", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.TemplateExpression:
        hit(syntax, "LANG-template-literal", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        if (node.parent && ts.isTaggedTemplateExpression(node.parent)) break;
        hit(syntax, "LANG-template-literal-plain", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.TaggedTemplateExpression:
        hit(syntax, "LANG-tagged-template", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.QuestionDotToken:
        hit(syntax, "LANG-optional-chain-token", file, ln(), "?.");
        break;
      case ts.SyntaxKind.PropertyAccessExpression:
        if (node.questionDotToken) hit(syntax, "LANG-optional-chain", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.ElementAccessExpression:
        if (node.questionDotToken) hit(syntax, "LANG-optional-element", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.CallExpression:
        if (node.questionDotToken) hit(syntax, "LANG-optional-call", file, ln(), tx().slice(0, 80));
        if (ts.isIdentifier(node.expression)) {
          const n = node.expression.text;
          if (["fetch", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "queueMicrotask", "requestAnimationFrame", "structuredClone", "parseInt", "parseFloat", "Number", "String", "Boolean", "isNaN", "encodeURIComponent", "decodeURIComponent", "btoa", "atob"].includes(n)) {
            hit(globals, `${n}()`, file, ln(), tx().slice(0, 120));
          }
          if (n === "eval" || n === "Function") hit(dynamic, n, file, ln(), tx().slice(0, 80));
        }
        if (ts.isPropertyAccessExpression(node.expression)) {
          const obj = node.expression.expression.getText(sf);
          const meth = node.expression.name.text;
          if (obj === "JSON" && (meth === "parse" || meth === "stringify")) hit(globals, `JSON.${meth}()`, file, ln(), tx().slice(0, 100));
          if (obj === "Object" && ["keys", "values", "entries", "assign", "fromEntries", "freeze", "hasOwn"].includes(meth)) hit(globals, `Object.${meth}()`, file, ln(), tx().slice(0, 100));
          if (obj === "Promise" && ["all", "allSettled", "race", "any", "resolve", "reject"].includes(meth)) hit(globals, `Promise.${meth}()`, file, ln(), tx().slice(0, 100));
          if (obj === "Array" && ["from", "isArray"].includes(meth)) hit(globals, `Array.${meth}()`, file, ln(), tx().slice(0, 100));
          if (obj === "console") hit(globals, `console.${meth}()`, file, ln(), tx().slice(0, 80));
          if (obj === "Math") hit(globals, `Math.${meth}()`, file, ln(), tx().slice(0, 80));
          if (obj === "crypto" || obj === "globalThis.crypto") hit(globals, `crypto.${meth}()`, file, ln(), tx().slice(0, 80));
          if (["localStorage", "sessionStorage"].includes(obj)) hit(globals, `${obj}.${meth}()`, file, ln(), tx().slice(0, 80));
          if (obj === "document") hit(globals, `document.${meth}()`, file, ln(), tx().slice(0, 80));
          if (obj === "window") hit(globals, `window.${meth}()`, file, ln(), tx().slice(0, 80));
          if (obj === "process" && meth === "env") hit(globals, "process.env", file, ln(), tx().slice(0, 80));
          if (["map", "filter", "reduce", "forEach", "find", "some", "every", "flatMap", "flat", "sort", "includes", "join", "slice", "splice", "push", "pop", "shift", "unshift"].includes(meth)) {
            hit(syntax, `LANG-array.${meth}`, file, ln(), tx().slice(0, 80));
          }
          if (["then", "catch", "finally"].includes(meth)) hit(syntax, `LANG-promise.${meth}`, file, ln(), tx().slice(0, 80));
        }
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.expression.kind === ts.SyntaxKind.ImportKeyword) {
          hit(globals, "import.meta", file, ln(), tx().slice(0, 80));
        }
        break;
      case ts.SyntaxKind.BinaryExpression: {
        const op = node.operatorToken.kind;
        const map = {
          [ts.SyntaxKind.AmpersandAmpersandToken]: "LANG-logical-and",
          [ts.SyntaxKind.BarBarToken]: "LANG-logical-or",
          [ts.SyntaxKind.QuestionQuestionToken]: "LANG-nullish-coalesce",
          [ts.SyntaxKind.EqualsEqualsEqualsToken]: "LANG-strict-eq",
          [ts.SyntaxKind.ExclamationEqualsEqualsToken]: "LANG-strict-neq",
          [ts.SyntaxKind.EqualsEqualsToken]: "LANG-loose-eq",
          [ts.SyntaxKind.ExclamationEqualsToken]: "LANG-loose-neq",
          [ts.SyntaxKind.InstanceOfKeyword]: "LANG-instanceof",
          [ts.SyntaxKind.InKeyword]: "LANG-in",
          [ts.SyntaxKind.AmpersandAmpersandEqualsToken]: "LANG-logical-and-assign",
          [ts.SyntaxKind.BarBarEqualsToken]: "LANG-logical-or-assign",
          [ts.SyntaxKind.QuestionQuestionEqualsToken]: "LANG-nullish-assign",
          [ts.SyntaxKind.PlusEqualsToken]: "LANG-compound-assign",
          [ts.SyntaxKind.MinusEqualsToken]: "LANG-compound-assign",
          [ts.SyntaxKind.AsteriskEqualsToken]: "LANG-compound-assign",
          [ts.SyntaxKind.SlashEqualsToken]: "LANG-compound-assign",
          [ts.SyntaxKind.PercentEqualsToken]: "LANG-compound-assign",
        };
        if (map[op]) hit(syntax, map[op], file, ln(), tx().slice(0, 80));
        break;
      }
      case ts.SyntaxKind.TypeOfExpression:
        hit(syntax, "LANG-typeof", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.VoidExpression:
        hit(syntax, "LANG-void", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.DeleteExpression:
        hit(syntax, "LANG-delete", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.TypeAssertionExpression:
        hit(types, "TS-angle-assertion", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.AsExpression:
        if (node.type?.kind === ts.SyntaxKind.TypeReference && node.type.typeName?.escapedText === "const") {
          hit(types, "TS-as-const", file, ln(), tx().slice(0, 80));
        } else if (node.type?.kind === ts.SyntaxKind.LiteralType && node.type.literal?.kind === ts.SyntaxKind.ConstKeyword) {
          hit(types, "TS-as-const", file, ln(), tx().slice(0, 80));
        } else {
          hit(types, "TS-as-assertion", file, ln(), tx().slice(0, 80));
        }
        break;
      case ts.SyntaxKind.SatisfiesExpression:
        hit(types, "TS-satisfies", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.NonNullExpression:
        hit(types, "TS-non-null-assertion", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.InterfaceDeclaration:
        hit(types, "TS-interface", file, ln(), tx().slice(0, 80));
        if (node.typeParameters?.length) hit(types, "TS-generic-interface", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.TypeAliasDeclaration:
        hit(types, "TS-type-alias", file, ln(), tx().slice(0, 80));
        if (node.typeParameters?.length) hit(types, "TS-generic-alias", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.EnumDeclaration:
        hit(types, "TS-enum", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.ModuleDeclaration:
        hit(types, "TS-namespace-or-module", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.UnionType:
        hit(types, "TS-union", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.IntersectionType:
        hit(types, "TS-intersection", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.ConditionalType:
        hit(types, "TS-conditional-type", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.InferType:
        hit(types, "TS-infer", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.MappedType:
        hit(types, "TS-mapped-type", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.IndexedAccessType:
        hit(types, "TS-indexed-access", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.TypeOperator:
        if (node.operator === ts.SyntaxKind.KeyOfKeyword) hit(types, "TS-keyof", file, ln(), tx().slice(0, 60));
        if (node.operator === ts.SyntaxKind.ReadonlyKeyword) hit(types, "TS-readonly-type", file, ln(), tx().slice(0, 60));
        if (node.operator === ts.SyntaxKind.UniqueKeyword) hit(types, "TS-unique-symbol", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.TypeQuery:
        hit(types, "TS-typeof-type", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.TupleType:
        hit(types, "TS-tuple", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.ArrayType:
        hit(types, "TS-array-type", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.FunctionType:
        hit(types, "TS-function-type", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.ConstructorType:
        hit(types, "TS-constructor-type", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.TypeLiteral:
        hit(types, "TS-type-literal", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.LiteralType:
        hit(types, "TS-literal-type", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.TemplateLiteralType:
        hit(types, "TS-template-literal-type", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.TypePredicate:
        hit(types, "TS-type-predicate", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.TypeReference: {
        const name = node.typeName.getText(sf);
        if (["Promise", "Partial", "Pick", "Omit", "Record", "Required", "Readonly", "ReturnType", "Parameters", "Awaited", "NonNullable", "Extract", "Exclude", "InstanceType", "ThisParameterType", "ReadonlyArray"].includes(name)) {
          hit(types, `TS-utility-${name}`, file, ln(), tx().slice(0, 80));
        }
        if (name === "Array") hit(types, "TS-Array-generic", file, ln(), tx().slice(0, 60));
        if (node.typeArguments?.length) hit(types, "TS-type-arguments", file, ln(), tx().slice(0, 80));
        break;
      }
      case ts.SyntaxKind.AnyKeyword:
        if (node.parent && ts.isTypeNode(node)) hit(types, "TS-any", file, ln(), "any");
        break;
      case ts.SyntaxKind.UnknownKeyword:
        hit(types, "TS-unknown", file, ln(), "unknown");
        break;
      case ts.SyntaxKind.NeverKeyword:
        hit(types, "TS-never", file, ln(), "never");
        break;
      case ts.SyntaxKind.VoidKeyword:
        if (node.parent && (ts.isTypeNode(node) || ts.isFunctionLike(node.parent))) hit(types, "TS-void", file, ln(), "void");
        break;
      case ts.SyntaxKind.PropertySignature:
        if (node.questionToken) hit(types, "TS-optional-property", file, ln(), tx().slice(0, 40));
        if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword)) hit(types, "TS-readonly-property", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.IndexSignature:
        hit(types, "TS-index-signature", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.QuestionToken:
        break;
      case ts.SyntaxKind.JsxElement:
        hit(jsx, "JSX-element", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.JsxSelfClosingElement: {
        hit(jsx, "JSX-self-closing", file, ln(), tx().slice(0, 80));
        {
          const tag = node.tagName.getText(sf);
          if (/^[A-Z]/.test(tag) || tag.includes(".")) hit(jsx, "JSX-component", file, ln(), tag);
          else hit(jsx, "JSX-intrinsic", file, ln(), tag);
        }
        break;
      }
      case ts.SyntaxKind.JsxFragment:
        hit(jsx, "JSX-fragment", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.JsxSpreadAttribute:
        hit(jsx, "JSX-spread-props", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.JsxExpression:
        hit(jsx, "JSX-expression", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.JsxOpeningElement: {
        const tag = node.tagName.getText(sf);
        if (/^[A-Z]/.test(tag) || tag.includes(".")) hit(jsx, "JSX-component", file, ln(), tag);
        else hit(jsx, "JSX-intrinsic", file, ln(), tag);
        break;
      }
      case ts.SyntaxKind.Decorator:
        hit(syntax, "LANG-decorator", file, ln(), tx().slice(0, 60));
        break;
      case ts.SyntaxKind.ImportEqualsDeclaration:
        hit(syntax, "LANG-import-equals", file, ln(), tx().slice(0, 80));
        break;
      case ts.SyntaxKind.MetaProperty:
        hit(globals, node.getText(sf).startsWith("import.meta") ? "import.meta" : "new.target", file, ln(), tx().slice(0, 80));
        if (tx().includes("import.meta.env")) hit(globals, "import.meta.env", file, ln(), tx().slice(0, 100));
        break;
      case ts.SyntaxKind.RegularExpressionLiteral:
        hit(syntax, "LANG-regex-literal", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.BigIntLiteral:
        hit(syntax, "LANG-bigint", file, ln(), tx().slice(0, 40));
        break;
      case ts.SyntaxKind.ThisKeyword:
        hit(syntax, "LANG-this", file, ln(), "this");
        break;
      case ts.SyntaxKind.SuperKeyword:
        hit(syntax, "LANG-super", file, ln(), "super");
        break;
      case ts.SyntaxKind.NullKeyword:
        hit(syntax, "LANG-null", file, ln(), "null");
        break;
      default:
        break;
    }

    if (ts.isIdentifier(node) && node.text === "undefined") {
      hit(syntax, "LANG-undefined", file, ln(), "undefined");
    }
    if (ts.isIdentifier(node) && node.text === "process") {
      hit(globals, "process", file, ln(), tx().slice(0, 60));
    }
    if (ts.isPropertyAccessExpression(node) && node.getText(sf).startsWith("process.env")) {
      hit(globals, "process.env", file, ln(), tx().slice(0, 80));
    }
    if (ts.isPropertyAccessExpression(node) && node.getText(sf).startsWith("import.meta.env")) {
      hit(globals, "import.meta.env", file, ln(), tx().slice(0, 80));
    }
    if (ts.isElementAccessExpression(node) && !ts.isStringLiteral(node.argumentExpression) && !ts.isNumericLiteral(node.argumentExpression) && !ts.isNoSubstitutionTemplateLiteral(node.argumentExpression)) {
      if (node.argumentExpression) hit(dynamic, "computed-index", file, ln(), tx().slice(0, 80));
    }

    ts.forEachChild(node, visit);
  }
  visit(sf);
}

function scanSql(text, file, sql) {
  const patterns = [
    ["SQL-create-table", /\bCREATE\s+TABLE\b/gi],
    ["SQL-alter-table", /\bALTER\s+TABLE\b/gi],
    ["SQL-create-index", /\bCREATE\s+(UNIQUE\s+)?INDEX\b/gi],
    ["SQL-insert", /\bINSERT\s+INTO\b/gi],
    ["SQL-update", /\bUPDATE\s+\w+\s+SET\b/gi],
    ["SQL-delete", /\bDELETE\s+FROM\b/gi],
    ["SQL-select", /\bSELECT\b/gi],
    ["SQL-join", /\b(INNER|LEFT|RIGHT|FULL)\s+JOIN\b/gi],
    ["SQL-cte", /\bWITH\s+\w+\s+AS\s*\(/gi],
    ["SQL-jsonb", /\bJSONB\b/gi],
    ["SQL-uuid", /\bUUID\b/gi],
    ["SQL-rls-enable", /\bENABLE\s+ROW\s+LEVEL\s+SECURITY\b/gi],
    ["SQL-policy", /\bCREATE\s+POLICY\b/gi],
    ["SQL-constraint", /\b(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK)\b/gi],
    ["SQL-on-conflict", /\bON\s+CONFLICT\b/gi],
    ["SQL-returning", /\bRETURNING\b/gi],
    ["SQL-transaction", /\b(BEGIN|COMMIT|ROLLBACK)\b/gi],
    ["SQL-function", /\bCREATE\s+(OR\s+REPLACE\s+)?FUNCTION\b/gi],
    ["SQL-trigger", /\bCREATE\s+TRIGGER\b/gi],
    ["SQL-enum-type", /\bCREATE\s+TYPE\b/gi],
    ["SQL-comment", /\bCOMMENT\s+ON\b/gi],
    ["SQL-grant", /\bGRANT\b/gi],
    ["SQL-parameter", /\$\d+/g],
  ];
  const lines = text.split("\n");
  for (const [id, re] of patterns) {
    let m;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(text))) {
      const before = text.slice(0, m.index);
      const line = before.split("\n").length;
      hit(sql, id, file, line, (lines[line - 1] || m[0]).trim().slice(0, 120));
    }
  }
}

function scanCss(text, file, css) {
  const patterns = [
    ["CSS-at-import", /@import\b/g],
    ["CSS-at-layer", /@layer\b/g],
    ["CSS-at-media", /@media\b/g],
    ["CSS-at-theme", /@theme\b/g],
    ["CSS-at-apply", /@apply\b/g],
    ["CSS-at-tailwind", /@tailwind\b/g],
    ["CSS-at-custom", /@custom-variant\b/g],
    ["CSS-at-source", /@source\b/g],
    ["CSS-at-plugin", /@plugin\b/g],
    ["CSS-var", /var\(--/g],
    ["CSS-custom-prop", /--[a-zA-Z0-9-]+\s*:/g],
    ["CSS-flex", /display\s*:\s*flex/g],
    ["CSS-grid", /display\s*:\s*grid/g],
    ["CSS-nesting", /&\s*[.:#\[]/g],
  ];
  const lines = text.split("\n");
  for (const [id, re] of patterns) {
    const r = new RegExp(re.source, re.flags);
    let m;
    while ((m = r.exec(text))) {
      const line = text.slice(0, m.index).split("\n").length;
      hit(css, id, file, line, (lines[line - 1] || m[0]).trim().slice(0, 120));
    }
  }
}

function scanHtml(text, file, html) {
  const patterns = [
    ["HTML-script-module", /<script\s+type=["']module["']/g],
    ["HTML-root-div", /id=["']root["']/g],
    ["HTML-meta-viewport", /name=["']viewport["']/g],
    ["HTML-link-icon", /rel=["']icon["']/g],
  ];
  for (const [id, re] of patterns) {
    const r = new RegExp(re.source, re.flags);
    let m;
    while ((m = r.exec(text))) {
      const line = text.slice(0, m.index).split("\n").length;
      hit(html, id, file, line, m[0]);
    }
  }
}

function classifyFile(fileRel) {
  const ext = path.extname(fileRel).toLowerCase();
  if (fileRel === "package-lock.json") return { bucket: "excluded", reason: "lockfile internals" };
  if (fileRel === ".git" || fileRel.startsWith(".git/")) return { bucket: "excluded", reason: "git metadata" };
  if (DOC_EXT.has(ext)) return { bucket: "docs", reason: "markdown / not runtime construction" };
  if (ASSET_EXT.has(ext)) return { bucket: "asset", reason: "binary/media asset" };
  if (fileRel.startsWith("docs/") || fileRel.startsWith("guidelines/") || fileRel === "AGENTS.md" || fileRel === "README.md" || fileRel === "rules.md" || fileRel === "MODULES-ALIVE.md" || fileRel === "V2-BACKLOG.md" || fileRel === "ATTRIBUTIONS.md" || fileRel === "landingpage.md") {
    if (DOC_EXT.has(ext) || ext === "") return { bucket: "docs", reason: "product/spec prose" };
  }
  if (PARSE_EXT.has(ext)) return { bucket: "parse" };
  if (SQL_EXT.has(ext)) return { bucket: "sql" };
  if (CSS_EXT.has(ext)) return { bucket: "css" };
  if (HTML_EXT.has(ext)) return { bucket: "html" };
  if (JSON_EXT.has(ext) || YAML_EXT.has(ext) || fileRel.endsWith("Dockerfile.worker") || fileRel.endsWith(".service") || fileRel.startsWith(".env") || fileRel === ".gitignore") return { bucket: "config" };
  if (ext === ".py") return { bucket: "other", reason: "python helper" };
  return { bucket: "other", reason: `unclassified ${ext || "(no ext)"}` };
}

const listed = walk(ROOT);
const syntax = {};
const types = {};
const jsx = {};
const imports = {};
const apis = {};
const typeRefs = {};
const globals = {};
const dynamic = {};
const sql = {};
const css = {};
const html = {};
const manifest = [];
const diagnostics = [];

for (const f of listed) {
  if (f.status === "failed" || f.status === "excluded") {
    manifest.push({ path: f.rel, status: f.status, reason: f.reason });
    continue;
  }
  const cls = classifyFile(f.rel);
  let text;
  try {
    text = fs.readFileSync(f.abs, "utf8");
  } catch (e) {
    manifest.push({ path: f.rel, status: "failed", reason: `read: ${e.message}` });
    continue;
  }

  if (cls.bucket === "parse") {
    try {
      const sf = ts.createSourceFile(f.rel, text, ts.ScriptTarget.Latest, true, scriptKind(f.rel));
      // Parse diagnostics are not always populated on createSourceFile; scan parseDiagnostics if present.
      collectImports(sf, f.rel, imports, apis, syntax, typeRefs);
      walkSyntax(sf, f.rel, syntax, types, jsx, globals, dynamic);
      manifest.push({ path: f.rel, status: "scanned", kind: "js-ts-ast", bytes: text.length });
    } catch (e) {
      manifest.push({ path: f.rel, status: "failed", reason: `parse: ${e.message}` });
      diagnostics.push({ path: f.rel, error: String(e) });
    }
  } else if (cls.bucket === "sql") {
    scanSql(text, f.rel, sql);
    manifest.push({ path: f.rel, status: "scanned", kind: "sql", bytes: text.length });
  } else if (cls.bucket === "css") {
    scanCss(text, f.rel, css);
    manifest.push({ path: f.rel, status: "scanned", kind: "css", bytes: text.length });
  } else if (cls.bucket === "html") {
    scanHtml(text, f.rel, html);
    manifest.push({ path: f.rel, status: "scanned", kind: "html", bytes: text.length });
  } else if (cls.bucket === "config") {
    manifest.push({ path: f.rel, status: "scanned", kind: "config", bytes: text.length });
  } else if (cls.bucket === "docs") {
    manifest.push({ path: f.rel, status: "excluded", reason: cls.reason, kind: "docs", bytes: text.length });
  } else if (cls.bucket === "asset") {
    manifest.push({ path: f.rel, status: "excluded", reason: cls.reason, kind: "asset" });
  } else {
    manifest.push({ path: f.rel, status: "scanned", kind: "other", reason: cls.reason, bytes: text.length });
  }
}

function pack(store) {
  return finalize(store).map((r) => ({
    id: r.id,
    occurrences: r.occurrences,
    fileCount: r.fileCount,
    examples: r.examples,
    filesSample: r.files.slice(0, 12),
  }));
}

const summary = {
  root: ROOT,
  commit: "48d4511",
  listed: listed.length,
  scanned: manifest.filter((m) => m.status === "scanned").length,
  excluded: manifest.filter((m) => m.status === "excluded").length,
  failed: manifest.filter((m) => m.status === "failed").length,
  syntaxEntries: Object.keys(syntax).length,
  typeEntries: Object.keys(types).length,
  jsxEntries: Object.keys(jsx).length,
  importEntries: Object.keys(imports).length,
  apiEntries: Object.keys(apis).length,
  globalEntries: Object.keys(globals).length,
  sqlEntries: Object.keys(sql).length,
  cssEntries: Object.keys(css).length,
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest.sort((a, b) => a.path.localeCompare(b.path)), null, 2));
fs.writeFileSync(path.join(OUT, "syntax.json"), JSON.stringify(pack(syntax), null, 2));
fs.writeFileSync(path.join(OUT, "types.json"), JSON.stringify(pack(types), null, 2));
fs.writeFileSync(path.join(OUT, "jsx.json"), JSON.stringify(pack(jsx), null, 2));
fs.writeFileSync(path.join(OUT, "imports.json"), JSON.stringify(pack(imports), null, 2));
fs.writeFileSync(path.join(OUT, "apis.json"), JSON.stringify(pack(apis), null, 2));
fs.writeFileSync(path.join(OUT, "typeRefs.json"), JSON.stringify(pack(typeRefs), null, 2));
fs.writeFileSync(path.join(OUT, "globals.json"), JSON.stringify(pack(globals), null, 2));
fs.writeFileSync(path.join(OUT, "dynamic.json"), JSON.stringify(pack(dynamic), null, 2));
fs.writeFileSync(path.join(OUT, "sql.json"), JSON.stringify(pack(sql), null, 2));
fs.writeFileSync(path.join(OUT, "css.json"), JSON.stringify(pack(css), null, 2));
fs.writeFileSync(path.join(OUT, "html.json"), JSON.stringify(pack(html), null, 2));
fs.writeFileSync(path.join(OUT, "diagnostics.json"), JSON.stringify(diagnostics, null, 2));

console.log(JSON.stringify(summary, null, 2));

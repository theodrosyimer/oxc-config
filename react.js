/**
 * React config: Expo / React Native (mobile + web).
 * Parity source: @thyi/eslint-config v3.0.1 `react.js`.
 *
 * `eslint-plugin-react`, `eslint-plugin-react-hooks` and
 * `eslint-plugin-react-perf` are replaced by Oxlint's native `react` and
 * `react-perf` plugins (`react` includes the hooks rules).
 * `eslint-plugin-react-native` has no native port: its seven rules run from
 * this package's own JS plugin, `./react-native/` (a port of v5.0.0):
 * https://oxc.rs/docs/guide/usage/linter/writing-js-plugins
 */
import { fileURLToPath } from "node:url";

import { baseJsPlugins, oxcBase } from "./base.js";

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/**
 * Resolved to an absolute path from THIS package's location.
 * A bare specifier would be resolved relative to the consumer's config file,
 * which fails under pnpm's strict node_modules layout — the plugins are
 * dependencies of @thyi/oxc-config, not of the consuming app. The React Native
 * plugin ships inside this package.
 */
const reactNativePluginPath = fileURLToPath(new URL("./react-native/index.js", import.meta.url));

/** `@tanstack/eslint-plugin-query` runs as a JS plugin, resolved the same way. */
const tanstackQueryPluginPath = fileURLToPath(import.meta.resolve("@tanstack/eslint-plugin-query"));

/**
 * `eslint-plugin-react-hooks` runs as a JS plugin only for the two rules
 * Oxlint's native `react` plugin does not implement. `react` is a reserved
 * plugin name in Oxlint (it is the native plugin, hooks included), so it loads
 * under an alias.
 */
const reactHooksPluginPath = fileURLToPath(import.meta.resolve("eslint-plugin-react-hooks"));

/**
 * JS plugins every React variant loads on top of the base ones. `jsPlugins`
 * is replaced, not merged, by a config that extends another, hence the spread.
 */
/** @type {NonNullable<OxlintConfig['jsPlugins']>} */
export const reactJsPlugins = [
  ...baseJsPlugins,
  tanstackQueryPluginPath,
  { name: "react-hooks-js", specifier: reactHooksPluginPath },
];

/**
 * React rules shared by `react` and `react-web`:
 * - eslint-plugin-react `recommended`, via Oxlint's native react plugin.
 *   `prop-types` is left out: it checks JavaScript props, and TypeScript
 *   types them. `no-deprecated` has no Oxlint port; `react/no-unsafe` with
 *   `checkAliases` reports the deprecated lifecycle methods it covered, but
 *   not its other deprecated APIs. `jsx-uses-react` and `jsx-uses-vars`
 *   are not needed: Oxlint's `no-unused-vars` counts JSX use.
 * - eslint-plugin-react-perf `recommended`, via Oxlint's native react-perf
 *   plugin.
 * - eslint-plugin-react-hooks `recommended-latest`, via Oxlint's native
 *   react plugin. `config` and `gating` (React Compiler settings checks)
 *   have no Oxlint port and run from eslint-plugin-react-hooks itself
 *   (`react-hooks-js/*`).
 * - @tanstack/eslint-plugin-query `flat/recommended`.
 */
/** @type {NonNullable<OxlintConfig['rules']>} */
export const reactRules = {
  "react/display-name": "error",
  "react/jsx-key": "error",
  "react/jsx-no-comment-textnodes": "error",
  "react/jsx-no-duplicate-props": "error",
  "react/jsx-no-target-blank": "error",
  "react/jsx-no-undef": "error",
  "react/no-children-prop": "error",
  "react/no-danger-with-children": "error",
  "react/no-direct-mutation-state": "error",
  "react/no-find-dom-node": "error",
  "react/no-is-mounted": "error",
  "react/no-render-return-value": "error",
  "react/no-string-refs": "error",
  "react/no-unescaped-entities": "error",
  "react/no-unknown-property": "error",
  "react/require-render-return": "error",
  // On for every file, as in the ESLint config; the .tsx/.jsx override in
  // each React config turns it off.
  "react/react-in-jsx-scope": "error",
  "react/rules-of-hooks": "error",
  "react/exhaustive-deps": "warn",
  "react/error-boundaries": "error",
  "react/globals": "error",
  "react/immutability": "error",
  "react/incompatible-library": "warn",
  "react/preserve-manual-memoization": "error",
  "react/purity": "error",
  "react/refs": "error",
  "react/set-state-in-effect": "error",
  "react/set-state-in-render": "error",
  "react/static-components": "error",
  "react/unsupported-syntax": "warn",
  "react/use-memo": "error",
  "react/void-use-memo": "error",
  "react/no-unsafe": ["error", { checkAliases: true }],
  "react-perf/jsx-no-new-object-as-prop": "error",
  "react-perf/jsx-no-new-array-as-prop": "error",
  "react-perf/jsx-no-new-function-as-prop": "error",
  "react-hooks-js/config": "error",
  "react-hooks-js/gating": "error",
  "@tanstack/query/exhaustive-deps": "error",
  "@tanstack/query/no-rest-destructuring": "warn",
  "@tanstack/query/stable-query-client": "error",
  "@tanstack/query/no-unstable-deps": "error",
  "@tanstack/query/infinite-query-property-order": "error",
  "@tanstack/query/no-void-query-fn": "error",
  "@tanstack/query/mutation-property-order": "error",
};

/**
 * Globals from eslint-plugin-react-native's `environments['react-native']`.
 * Oxlint has no `env` entry for React Native, so they are declared inline
 * (legacy ESLint semantics: `false` -> readonly, `true` -> writable).
 * Extracted from eslint-plugin-react-native v5.0.0.
 */
/** @type {NonNullable<OxlintConfig['globals']>} */
export const reactNativeGlobals = {
  __DEV__: "readonly",
  __dirname: "readonly",
  alert: "readonly",
  Blob: "readonly",
  cancelAnimationFrame: "readonly",
  cancelIdleCallback: "readonly",
  clearImmediate: "writable",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  escape: "readonly",
  Event: "readonly",
  EventTarget: "readonly",
  exports: "readonly",
  fetch: "readonly",
  File: "readonly",
  FileReader: "readonly",
  FormData: "readonly",
  global: "readonly",
  module: "readonly",
  navigator: "readonly",
  process: "readonly",
  requestAnimationFrame: "writable",
  requestIdleCallback: "writable",
  require: "readonly",
  setImmediate: "writable",
  setInterval: "readonly",
  setTimeout: "readonly",
  WebSocket: "readonly",
  window: "readonly",
  XMLHttpRequest: "readonly",
};

/** @type {OxlintConfig} */
const reactConfig = {
  extends: [oxcBase],
  options: {
    typeAware: true,
  },
  plugins: [...(oxcBase.plugins ?? []), "react", "react-perf"],
  jsPlugins: [...reactJsPlugins, reactNativePluginPath],
  globals: reactNativeGlobals,
  rules: {
    ...reactRules,
    "typescript/no-floating-promises": [
      "error",
      {
        allowForKnownSafeCalls: [
          {
            from: "package",
            name: ["preventAutoHideAsync", "hideAsync"],
            package: "expo-router",
          },
          { from: "package", name: "init", package: "i18next" },
          { from: "file", name: "invalidateQueries" },
        ],
      },
    ],
    "typescript/no-require-imports": [
      "error",
      {
        allow: [
          ".*assets/*",
          "@/scripts/*",
          "tailwindcss-animate",
          "package.json",
          "node:",
          "zod",
          "dotenv",
        ],
      },
    ],
    // eslint-plugin-react-native has no flat/recommended config — these
    // replace `reactNative.configs.all` (all rules default to 2). They run
    // from the port in ./react-native/.
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-inline-styles": "error",
    "react-native/no-color-literals": "error",
    "react-native/no-raw-text": "error",
    "react-native/no-single-element-style-arrays": "error",
    "react-native/sort-styles": "error",
    // Rules from the rn-patterns, uniwind and vercel-react-native skills,
    // written for this plugin. Each message ends with an explicit "Fix: …".
    "react-native/no-falsy-and": "error",
    "react-native/no-raw-palette-classes": "error",
    "react-native/no-dynamic-classnames": "error",
    "react-native/with-uniwind-module-scope": "error",
    "react-native/scrollview-content-padding": "error",
    "react-native/no-legacy-shadow": "error",
    "react-native/animate-transform-opacity": "error",
    // Imports the skills ban, each with the component to use instead.
    "react-native/no-banned-imports": "error",
  },
  overrides: [
    {
      files: ["**/*.tsx", "**/*.jsx"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "react-native/no-inline-styles": "warn",
        "react-native/no-raw-text": [
          "warn",
          {
            skip: ["TextInput", "ThemedText", "ThemedView", "ButtonText", "Button.Text"],
          },
        ],
      },
    },
  ],
};

export default reactConfig;

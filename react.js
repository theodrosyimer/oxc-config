/**
 * React config: Expo / React Native (mobile + web).
 * Parity source: @thyi/eslint-config v2.8.5 `react.js`.
 *
 * `eslint-plugin-react` and `eslint-plugin-react-hooks` are replaced by
 * Oxlint's native `react` plugin (which includes the hooks rules).
 * `eslint-plugin-react-native` has no native port and runs as a JS plugin:
 * https://oxc.rs/docs/guide/usage/linter/js-plugins
 */
import { fileURLToPath } from "node:url";

import { baseJsPlugins, oxcBase } from "./base.js";

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/**
 * Resolved to an absolute path from THIS package's location.
 * A bare specifier would be resolved relative to the consumer's config file,
 * which fails under pnpm's strict node_modules layout — the plugin is a
 * dependency of @thyi/oxc-config, not of the consuming app.
 */
const reactNativePluginPath = fileURLToPath(import.meta.resolve("eslint-plugin-react-native"));

/** `@tanstack/eslint-plugin-query` runs as a JS plugin, resolved the same way. */
const tanstackQueryPluginPath = fileURLToPath(import.meta.resolve("@tanstack/eslint-plugin-query"));

/**
 * JS plugins every React variant loads on top of the base ones. `jsPlugins`
 * is replaced, not merged, by a config that extends another, hence the spread.
 */
/** @type {NonNullable<OxlintConfig['jsPlugins']>} */
export const reactJsPlugins = [...baseJsPlugins, tanstackQueryPluginPath];

/**
 * React rules shared by `react` and `react-web`:
 * - eslint-plugin-react `recommended` rules Oxlint files outside
 *   `correctness` (or under `suspicious` at warn). `jsx-uses-react`,
 *   `jsx-uses-vars`, `prop-types` and `no-deprecated` have no Oxlint port.
 * - eslint-plugin-react-hooks `recommended-latest`, via Oxlint's native
 *   react plugin. `config` and `gating` (React Compiler settings checks)
 *   have no Oxlint port.
 * - @tanstack/eslint-plugin-query `flat/recommended`.
 */
/** @type {NonNullable<OxlintConfig['rules']>} */
export const reactRules = {
  "react/display-name": "error",
  "react/jsx-no-comment-textnodes": "error",
  "react/jsx-no-target-blank": "error",
  "react/no-unescaped-entities": "error",
  "react/no-unknown-property": "error",
  "react/require-render-return": "error",
  "react/rules-of-hooks": "error",
  "react/exhaustive-deps": "warn",
  "react/incompatible-library": "warn",
  "react/unsupported-syntax": "warn",
  "react/react-in-jsx-scope": "off",
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
  plugins: [...(oxcBase.plugins ?? []), "react"],
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
          "nativewind/preset",
          "nativewind/theme",
          "nativewind/theme/hairlineWidth",
          "tailwindcss-animate",
          "package.json",
          "node:",
          "zod",
          "dotenv",
        ],
      },
    ],
    // eslint-plugin-react-native has no flat/recommended config — these
    // replace `reactNative.configs.all` (all rules default to 2).
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-inline-styles": "error",
    "react-native/no-color-literals": "error",
    "react-native/no-raw-text": "error",
    "react-native/no-single-element-style-arrays": "error",
    "react-native/sort-styles": "error",
  },
  overrides: [
    {
      files: ["**/*.tsx", "**/*.jsx"],
      rules: {
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

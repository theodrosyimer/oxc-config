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

import { oxcBase } from "./base.js";

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/**
 * Resolved to an absolute path from THIS package's location.
 * A bare specifier would be resolved relative to the consumer's config file,
 * which fails under pnpm's strict node_modules layout — the plugin is a
 * dependency of @thyi/oxc-config, not of the consuming app.
 */
const reactNativePluginPath = fileURLToPath(import.meta.resolve("eslint-plugin-react-native"));

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
  jsPlugins: [reactNativePluginPath],
  globals: reactNativeGlobals,
  rules: {
    // eslint-plugin-react-hooks recommended-latest, via Oxlint's native
    // react plugin.
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "react/react-in-jsx-scope": "off",
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

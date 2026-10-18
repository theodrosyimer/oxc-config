/**
 * React Web config: web-only React apps (TanStack Start, Vite).
 * Parity source: @thyi/eslint-config v3.0.1 `react-web.js`.
 *
 * The React config without the React Native plugin (./react-native/), its
 * globals, and its Expo allowances; browser globals instead.
 */
import { oxcBase } from "./base.js";
import { reactJsPlugins, reactRules } from "./react.js";

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/** @type {OxlintConfig} */
const reactWebConfig = {
  extends: [oxcBase],
  options: {
    typeAware: true,
  },
  plugins: [...(oxcBase.plugins ?? []), "react", "react-perf"],
  jsPlugins: reactJsPlugins,
  env: {
    node: true,
    browser: true,
  },
  rules: {
    ...reactRules,
    "typescript/no-floating-promises": [
      "error",
      {
        allowForKnownSafeCalls: [
          { from: "package", name: "init", package: "i18next" },
          { from: "file", name: "invalidateQueries" },
        ],
      },
    ],
    "typescript/no-require-imports": [
      "error",
      {
        allow: ["@/scripts/*", "tailwindcss-animate", "package.json", "node:", "zod", "dotenv"],
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.tsx", "**/*.jsx"],
      rules: {
        "react/react-in-jsx-scope": "off",
      },
    },
  ],
};

export default reactWebConfig;

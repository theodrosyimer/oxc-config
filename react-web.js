/**
 * React Web config: web-only React apps (TanStack Start, Vite).
 * Parity source: @thyi/eslint-config v3 `react-web.js`.
 *
 * The React config without eslint-plugin-react-native, its globals, and its
 * Expo / NativeWind allowances; browser globals instead.
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
  plugins: [...(oxcBase.plugins ?? []), "react"],
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
};

export default reactWebConfig;

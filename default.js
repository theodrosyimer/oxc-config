/**
 * Default config: Node.js / backend (NestJS, CLI, scripts).
 * Parity source: @thyi/eslint-config v3.0.1 `default.js`.
 */
import { oxcBase } from "./base.js";

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/** @type {OxlintConfig} */
const defaultConfig = {
  extends: [oxcBase],
  options: {
    // Runs typescript/* type-aware rules through tsgolint.
    // Requires `oxlint-tsgolint` installed and a TypeScript-7-compatible
    // tsconfig. Root config only — never set this in nested configs.
    typeAware: true,
  },
  rules: {
    "typescript/no-floating-promises": [
      "error",
      {
        allowForKnownSafeCalls: [{ from: "file", name: "invalidateQueries" }],
      },
    ],
    "typescript/no-require-imports": [
      "error",
      {
        allow: ["package.json", "path", "zod", "dotenv", "@/scripts/*"],
      },
    ],
  },
};

export default defaultConfig;

/**
 * Turborepo addon: `turbo/no-undeclared-env-vars` as a JS plugin.
 * Parity source: @thyi/eslint-config v3.0.1 `turbo.js`
 * (eslint-config-turbo enables exactly this one rule).
 *
 * Merge it into a root config via `extends`:
 *
 *   export default defineConfig({ extends: [defaultConfig, turboAddon] })
 */
import { fileURLToPath } from "node:url";

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

const turboPluginPath = fileURLToPath(import.meta.resolve("eslint-plugin-turbo"));

/** @type {OxlintConfig} */
export const turboAddon = {
  jsPlugins: [turboPluginPath],
  rules: {
    "turbo/no-undeclared-env-vars": "warn",
  },
};

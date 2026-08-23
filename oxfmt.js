/**
 * Shared Oxfmt options.
 * Parity source: prettier config (arrowParens/bracketSpacing/embeddedLanguageFormatting/
 * endOfLine/printWidth are Oxfmt defaults but kept explicit to preserve intent).
 *
 * Differences from the Prettier setup, on purpose:
 * - `experimentalTernaries: false` dropped — it was Prettier's default (a
 *   no-op) and Oxfmt has no such option.
 * - `prettier-plugin-pkg` replaced by native `sortPackageJson` (Oxfmt default:
 *   enabled). The key order differs from the Prettier plugin -> expect a
 *   one-time churn diff in every package.json.
 * - `sortImports` replaces eslint `import/order` (which oxc will not
 *   implement): same groups, `newlinesBetween` + case-insensitive `asc`
 *   ordering are Oxfmt defaults. `internalPattern` extends the default
 *   `["~/", "@/", "#"]` with the two extra pathGroups from the ESLint config.
 * - The global `~/.prettierrc` `proseWrap: "always"` trick has no Oxfmt
 *   equivalent (config resolution is per-project). Set `proseWrap` per
 *   project, or via an override for the files that need it.
 *
 * Docs: https://oxc.rs/docs/guide/usage/formatter/config-file-reference
 */

/** @typedef {import('oxfmt').OxfmtConfig} OxfmtConfig */

/** @type {OxfmtConfig} */
export const oxfmtConfig = {
  arrowParens: 'always',
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  endOfLine: 'lf',
  jsxSingleQuote: true,
  printWidth: 100,
  semi: false,
  singleAttributePerLine: false,
  singleQuote: true,
  trailingComma: 'all',
  sortImports: {
    internalPattern: ['~/', '@/', '#', '@docker/', '@scripts/'],
  },
  sortPackageJson: true,
}

export default oxfmtConfig

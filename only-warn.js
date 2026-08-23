/**
 * Replacement for eslint-plugin-only-warn, which downgraded every error to a
 * warning at runtime. Oxlint has no runtime severity rewriter, so the
 * downgrade is applied to the config object instead.
 *
 * Usage (per app in a Turborepo, so `lint` never fails a pipeline while CI
 * stays strict via `--max-warnings=0` or `options.maxWarnings`):
 *
 *   import { defineConfig } from 'oxlint'
 *   import reactConfig from '@thyi/oxc-config/react'
 *   import { onlyWarn } from '@thyi/oxc-config/only-warn'
 *
 *   export default defineConfig(onlyWarn(reactConfig))
 */

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/**
 * @param {unknown} severity
 * @returns {unknown}
 */
const downgradeSeverity = (severity) => {
  if (severity === 'error' || severity === 2) return 'warn'
  if (Array.isArray(severity)) {
    const [level, ...options] = severity
    if (level === 'error' || level === 2) return ['warn', ...options]
  }
  return severity
}

/**
 * @param {NonNullable<OxlintConfig['rules']> | undefined} rules
 * @returns {NonNullable<OxlintConfig['rules']> | undefined}
 */
const downgradeRules = (rules) => {
  if (rules === undefined) return undefined
  return Object.fromEntries(
    Object.entries(rules).map(([name, severity]) => [name, downgradeSeverity(severity)]),
  )
}

/**
 * Returns a deep copy of the config with every `error` severity (rules,
 * categories, overrides, and inherited `extends` configs) downgraded to
 * `warn`. The input config is not mutated.
 *
 * @template {OxlintConfig} T
 * @param {T} config
 * @returns {OxlintConfig}
 */
export const onlyWarn = (config) => {
  return {
    ...config,
    ...(config.extends !== undefined && {
      extends: config.extends.map((extended) => onlyWarn(extended)),
    }),
    ...(config.categories !== undefined && {
      categories: /** @type {NonNullable<OxlintConfig['categories']>} */ (
        Object.fromEntries(
          Object.entries(config.categories).map(([category, severity]) => [
            category,
            downgradeSeverity(severity),
          ]),
        )
      ),
    }),
    ...(config.rules !== undefined && { rules: downgradeRules(config.rules) }),
    ...(config.overrides !== undefined && {
      overrides: config.overrides.map((override) => ({
        ...override,
        ...(override.rules !== undefined && { rules: downgradeRules(override.rules) }),
      })),
    }),
  }
}

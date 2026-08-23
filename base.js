/**
 * Base building blocks shared by every @thyi/oxc-config variant.
 *
 * Parity source: @thyi/eslint-config v2.8.5 `base.js`.
 * Docs: https://oxc.rs/docs/guide/usage/linter/config
 *
 * NOTE: this package ships plain ESM `.js` on purpose. Oxlint loads
 * `oxlint.config.ts` through native `import()`, and Node.js does not
 * strip TypeScript types inside `node_modules` — shipping `.ts` source
 * would break consumers at config-load time.
 */

/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/**
 * `import/order` moved OUT of the linter: oxc will not implement it
 * (oxc-project/oxc#1117) — declaration ordering/grouping is Oxfmt's
 * `sortImports` job now (see `oxfmt.js`). Only member sorting stays here
 * via `sort-imports` + `ignoreDeclarationSort`.
 */

/**
 * IMPORTANT: spread this into the ROOT config's `ignorePatterns` yourself.
 * It is intentionally NOT part of `oxcBase`: `ignorePatterns` carried through
 * `extends` do not apply from the consuming project's root (verified against
 * oxlint 1.79.0 — an extended config's ignore list left node_modules linted;
 * the same list at root level filtered correctly). Additionally, without a
 * `.gitignore`, Oxlint walks node_modules — the default skipping rides on
 * gitignore files.
 */
/** @type {NonNullable<OxlintConfig['ignorePatterns']>} */
export const baseIgnorePatterns = [
  '**/*.json',
  '**/dist/**',
  '**/node_modules/**',
  '**/coverage/**',
  '**/build/**',
  '**/output/**',
  '**/lib/**',
  '**/html/**',
  '**/.turbo/**',
  '**/.expo/**',
  '**/.next/**',
  'eslint.config.*',
  'oxlint.config.*',
  'oxfmt.config.*',
  'babel.config.js',
  'metro.config.js',
]

/**
 * Built-in plugins. Setting `plugins` overwrites Oxlint's default set,
 * so every wanted plugin must be listed explicitly.
 * `eslint` core rules are always available and are not a plugin entry.
 */
/** @type {NonNullable<OxlintConfig['plugins']>} */
export const basePlugins = ['typescript', 'import', 'unicorn', 'oxc']

/**
 * Category baseline replacing the ESLint preset stack
 * (`eslint:recommended` + tseslint recommendedTypeChecked/stylisticTypeChecked).
 * Oxlint has no 1:1 preset concept; `correctness` (error, the default) is the
 * closest equivalent of "recommended", `suspicious` at warn adds the
 * probably-wrong tier without failing builds.
 */
/** @type {NonNullable<OxlintConfig['categories']>} */
export const baseCategories = {
  correctness: 'error',
  suspicious: 'warn',
}

/** @type {NonNullable<OxlintConfig['rules']>} */
export const baseRules = {
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  // `perf` category is off by default, but pinned so a category change
  // cannot silently enable it (same spirit as the non-null pinning below).
  'no-await-in-loop': 'off',
  'no-use-before-define': ['error', { functions: false }],
  'preserve-caught-error': ['error', { requireCatchParameter: true }],
  // Member sorting only — declaration ordering/grouping is Oxfmt sortImports.
  'sort-imports': ['error', { ignoreDeclarationSort: true }],
  'typescript/array-type': 'off',
  'typescript/consistent-type-definitions': 'off',
  'typescript/no-explicit-any': 'error',
  'typescript/no-extraneous-class': ['warn', { allowEmpty: true }],
  // The non-null assertion `!` is banned, along with the three ways round it.
  // `!` asserts something no test can fail on: it silences the checker at one
  // expression and leaves nothing behind that would notice when the assumption
  // stops holding. Every case has an alternative that keeps the check — narrow
  // it, guard it where the guard is reachable, or carry the value instead of
  // reaching back for it.
  //
  // In Oxlint, `no-non-null-asserted-optional-chain` and
  // `no-extra-non-null-assertion` are `correctness` (on by default); the other
  // two are `restriction` (off by default). All four are pinned here so a
  // category reshuffle cannot silently drop them. None need type information.
  'typescript/no-non-null-assertion': 'error',
  'typescript/no-non-null-asserted-nullish-coalescing': 'error',
  'typescript/no-non-null-asserted-optional-chain': 'error',
  'typescript/no-extra-non-null-assertion': 'error',
  // Same family, same reason: `as` re-labels a value without checking it.
  // 'never' bans it; `as const` is unaffected — the rule always permits const
  // assertions — so `satisfies` + `as const` idioms keep working.
  // The interop exception lives in baseOverrides below, by path.
  'typescript/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
  'typescript/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
}

/**
 * Type-aware rules — executed by tsgolint (`oxlint-tsgolint` package),
 * enabled through `options.typeAware` on the root config.
 * Options match their typescript-eslint equivalents.
 * https://oxc.rs/docs/guide/usage/linter/type-aware
 */
/** @type {NonNullable<OxlintConfig['rules']>} */
export const baseTypeAwareRules = {
  'typescript/no-misused-promises': [
    'error',
    {
      checksVoidReturn: {
        attributes: false,
      },
    },
  ],
  'typescript/no-unnecessary-condition': 'error',
  'typescript/no-unsafe-argument': 'warn',
  'typescript/require-await': 'off',
}

/**
 * The type-aware rules turned back off for plain JavaScript files —
 * the equivalent of `tseslint.configs.disableTypeChecked`.
 */
/** @type {NonNullable<OxlintConfig['rules']>} */
export const typeAwareOffForJs = {
  'typescript/no-floating-promises': 'off',
  'typescript/no-misused-promises': 'off',
  'typescript/no-unnecessary-condition': 'off',
  'typescript/no-unsafe-argument': 'off',
  'typescript/no-unsafe-assignment': 'off',
  'typescript/no-unsafe-member-access': 'off',
}

/** @type {NonNullable<OxlintConfig['overrides']>} */
export const baseOverrides = [
  {
    // Test-specific overrides. `env.jest` covers Vitest's jest-compatible
    // globals (describe/it/expect/vi-adjacent lifecycle hooks).
    files: ['tests/**/*.ts', '**/*spec.ts', '**/*test.ts'],
    env: {
      jest: true,
    },
    rules: {
      'typescript/no-explicit-any': 'warn',
      'typescript/no-unsafe-argument': 'off',
      'typescript/no-unsafe-assignment': 'off',
      'typescript/no-unsafe-member-access': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
    },
  },
  {
    // JavaScript-specific overrides (disable type-checked rules).
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: typeAwareOffForJs,
  },
  {
    // Third-party interop — the one place `as` is allowed.
    //
    // The exception is SEMANTIC ("this value crosses a boundary we do not own"),
    // and a path can only approximate it. This covers the hexagonal layout where
    // adapters, repositories and mappers live; anywhere else, the escape is an
    // inline disable carrying a reason (`// oxlint-disable-next-line
    // typescript/consistent-type-assertions -- <reason>`), which is greppable
    // and reviewable in a way a whole exempt directory is not.
    //
    // Deliberately NOT extended to tests: a cast in a test is usually a fixture
    // that should be typed, not interop.
    files: ['**/infrastructure/**/*.ts', '**/infrastructure/**/*.tsx'],
    rules: {
      'typescript/consistent-type-assertions': 'off',
    },
  },
]

/**
 * Shared skeleton every variant extends via `extends: [oxcBase]` in a
 * TS/JS config (object form — string paths are rejected by Oxlint's loader).
 * Does NOT carry `ignorePatterns` — see `baseIgnorePatterns` above.
 */
/** @type {OxlintConfig} */
export const oxcBase = {
  plugins: basePlugins,
  categories: baseCategories,
  env: {
    node: true,
  },
  rules: {
    ...baseRules,
    ...baseTypeAwareRules,
  },
  overrides: baseOverrides,
}

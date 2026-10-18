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

import { fileURLToPath } from "node:url";

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
  "**/*.json",
  "**/dist/**",
  "**/node_modules/**",
  "**/coverage/**",
  "**/build/**",
  "**/output/**",
  "**/lib/**",
  "**/html/**",
  "**/.turbo/**",
  "**/.expo/**",
  "**/.next/**",
  "eslint.config.*",
  "oxlint.config.*",
  "oxfmt.config.*",
  "babel.config.js",
  "metro.config.js",
  "**/.stryker-tmp/**",
  "**/reports/**",
];

/**
 * Built-in plugins. Setting `plugins` overwrites Oxlint's default set,
 * so every wanted plugin must be listed explicitly.
 * `eslint` core rules are always available and are not a plugin entry.
 */
/** @type {NonNullable<OxlintConfig['plugins']>} */
export const basePlugins = ["typescript", "import", "unicorn", "oxc"];

/**
 * `@stylistic/eslint-plugin` has no native port; its one rule in use
 * (`padding-line-between-statements`) runs as a JS plugin. Resolved to an
 * absolute path from THIS package for the same pnpm reason as in `react.js`.
 */
const stylisticPluginPath = fileURLToPath(import.meta.resolve("@stylistic/eslint-plugin"));

/** @type {NonNullable<OxlintConfig['jsPlugins']>} */
export const baseJsPlugins = [stylisticPluginPath];

/**
 * Category baseline replacing the ESLint preset stack
 * (`eslint:recommended` + tseslint recommendedTypeChecked/stylisticTypeChecked).
 * Oxlint has no 1:1 preset concept; `correctness` (error, the default) is the
 * closest equivalent of "recommended", `suspicious` at warn adds the
 * probably-wrong tier without failing builds.
 */
/** @type {NonNullable<OxlintConfig['categories']>} */
export const baseCategories = {
  correctness: "error",
  suspicious: "warn",
};

/** @type {NonNullable<OxlintConfig['rules']>} */
export const baseRules = {
  eqeqeq: ["error", "always", { null: "ignore" }],
  // `perf` category is off by default, but pinned so a category change
  // cannot silently enable it (same spirit as the non-null pinning below).
  "no-await-in-loop": "off",
  "no-use-before-define": ["error", { functions: false }],
  "preserve-caught-error": ["error", { requireCatchParameter: true }],
  // Member sorting only — declaration ordering/grouping is Oxfmt sortImports.
  "sort-imports": ["error", { ignoreDeclarationSort: true }],
  // Rules the ESLint preset stack (`eslint:recommended`, tseslint
  // `recommendedTypeChecked` + `stylisticTypeChecked`, import-x `recommended`)
  // turns on that Oxlint files outside `correctness`/`suspicious`, or files
  // under `suspicious` at warn where the preset said error. Listed one by one
  // so the two configs enable the same rules at the same severity.
  "no-array-constructor": "error",
  "no-case-declarations": "error",
  "no-empty": "error",
  "no-empty-function": "error",
  "no-fallthrough": "error",
  "no-prototype-builtins": "error",
  "no-regex-spaces": "error",
  "no-useless-assignment": "error",
  "no-var": "error",
  "prefer-const": "error",
  "prefer-rest-params": "error",
  "prefer-spread": "error",
  "import/export": "error",
  "import/no-duplicates": "warn",
  "typescript/adjacent-overload-signatures": "error",
  "typescript/ban-ts-comment": "error",
  "typescript/ban-tslint-comment": "error",
  "typescript/class-literal-property-style": "error",
  "typescript/consistent-generic-constructors": "error",
  "typescript/consistent-indexed-object-style": "error",
  "typescript/no-confusing-non-null-assertion": "error",
  "typescript/no-empty-object-type": "error",
  "typescript/no-inferrable-types": "error",
  "typescript/no-namespace": "error",
  "typescript/no-unnecessary-type-constraint": "error",
  "typescript/no-unsafe-function-type": "error",
  "typescript/prefer-for-of": "error",
  "typescript/prefer-function-type": "error",
  "typescript/array-type": ["error", { default: "generic" }],
  "typescript/consistent-type-definitions": "off",
  "typescript/method-signature-style": "error",
  // Index-signature access has ONE owner and it is the compiler:
  // `noPropertyAccessFromIndexSignature`. `dot-notation` demands the
  // opposite; it is off by category already and pinned so it stays off.
  "typescript/dot-notation": "off",
  "@stylistic/padding-line-between-statements": [
    "error",
    { blankLine: "always", prev: "*", next: "for" },
    { blankLine: "always", prev: "*", next: "return" },
    { blankLine: "always", prev: "*", next: "block-like" },
    { blankLine: "always", prev: "*", next: "if" },
    { blankLine: "never", prev: "*", next: ["case", "default"] },
  ],
  "typescript/no-explicit-any": "error",
  "typescript/no-extraneous-class": ["warn", { allowEmpty: true }],
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
  "typescript/no-non-null-assertion": "error",
  "typescript/no-non-null-asserted-nullish-coalescing": "error",
  "typescript/no-non-null-asserted-optional-chain": "error",
  "typescript/no-extra-non-null-assertion": "error",
  // Same family, same reason: `as` re-labels a value without checking it.
  // 'never' bans it; `as const` is unaffected — the rule always permits const
  // assertions — so `satisfies` + `as const` idioms keep working.
  // The interop exception lives in baseOverrides below, by path.
  "typescript/consistent-type-assertions": ["error", { assertionStyle: "never" }],
  "typescript/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
};

/**
 * Type-aware rules — executed by tsgolint (`oxlint-tsgolint` package),
 * enabled through `options.typeAware` on the root config.
 * Options match their typescript-eslint equivalents.
 * https://oxc.rs/docs/guide/usage/linter/type-aware
 */
/** @type {NonNullable<OxlintConfig['rules']>} */
export const baseTypeAwareRules = {
  "typescript/no-misused-promises": [
    "error",
    {
      checksVoidReturn: {
        attributes: false,
      },
    },
  ],
  "typescript/no-unnecessary-condition": "error",
  "typescript/no-unsafe-argument": "warn",
  "typescript/require-await": "off",
  // recommendedTypeChecked + stylisticTypeChecked rules outside the enabled
  // categories (or under `suspicious` at warn), same reason as in baseRules.
  "typescript/no-unnecessary-type-assertion": "error",
  "typescript/no-unsafe-assignment": "error",
  "typescript/no-unsafe-call": "error",
  "typescript/no-unsafe-enum-comparison": "error",
  "typescript/no-unsafe-member-access": "error",
  "typescript/no-unsafe-return": "error",
  "typescript/non-nullable-type-assertion-style": "error",
  "typescript/only-throw-error": "error",
  "typescript/prefer-find": "error",
  "typescript/prefer-includes": "error",
  "typescript/prefer-nullish-coalescing": "error",
  "typescript/prefer-optional-chain": "error",
  "typescript/prefer-promise-reject-errors": "error",
  "typescript/prefer-regexp-exec": "error",
  "typescript/prefer-string-starts-ends-with": "error",
  "typescript/restrict-plus-operands": "error",
};

/**
 * Every type-aware rule turned back off for plain JavaScript files —
 * the equivalent of `tseslint.configs.disableTypeChecked`. The four core
 * rules are the ones typescript-eslint's `eslint-recommended` enables for
 * TypeScript files only.
 */
/** @type {NonNullable<OxlintConfig['rules']>} */
export const typeAwareOffForJs = {
  "no-var": "off",
  "prefer-const": "off",
  "prefer-rest-params": "off",
  "prefer-spread": "off",
  "typescript/await-thenable": "off",
  "typescript/consistent-return": "off",
  "typescript/no-array-delete": "off",
  "typescript/no-base-to-string": "off",
  "typescript/no-duplicate-type-constituents": "off",
  "typescript/no-floating-promises": "off",
  "typescript/no-for-in-array": "off",
  "typescript/no-implied-eval": "off",
  "typescript/no-meaningless-void-operator": "off",
  "typescript/no-misused-promises": "off",
  "typescript/no-misused-spread": "off",
  "typescript/no-redundant-type-constituents": "off",
  "typescript/no-unnecessary-boolean-literal-compare": "off",
  "typescript/no-unnecessary-condition": "off",
  "typescript/no-unnecessary-template-expression": "off",
  "typescript/no-unnecessary-type-arguments": "off",
  "typescript/no-unnecessary-type-assertion": "off",
  "typescript/no-unnecessary-type-conversion": "off",
  "typescript/no-unnecessary-type-parameters": "off",
  "typescript/no-unsafe-argument": "off",
  "typescript/no-unsafe-assignment": "off",
  "typescript/no-unsafe-call": "off",
  "typescript/no-unsafe-enum-comparison": "off",
  "typescript/no-unsafe-member-access": "off",
  "typescript/no-unsafe-return": "off",
  "typescript/no-unsafe-type-assertion": "off",
  "typescript/no-unsafe-unary-minus": "off",
  "typescript/no-useless-default-assignment": "off",
  "typescript/non-nullable-type-assertion-style": "off",
  "typescript/only-throw-error": "off",
  "typescript/prefer-find": "off",
  "typescript/prefer-includes": "off",
  "typescript/prefer-nullish-coalescing": "off",
  "typescript/prefer-optional-chain": "off",
  "typescript/prefer-promise-reject-errors": "off",
  "typescript/prefer-regexp-exec": "off",
  "typescript/prefer-string-starts-ends-with": "off",
  "typescript/require-array-sort-compare": "off",
  "typescript/restrict-plus-operands": "off",
  "typescript/restrict-template-expressions": "off",
  "typescript/unbound-method": "off",
};

/** @type {NonNullable<OxlintConfig['overrides']>} */
export const baseOverrides = [
  {
    // Test-specific overrides. `env.jest` covers Vitest's jest-compatible
    // globals (describe/it/expect/vi-adjacent lifecycle hooks).
    files: ["tests/**/*.ts", "**/*spec.ts", "**/*test.ts"],
    env: {
      jest: true,
    },
    rules: {
      "typescript/no-explicit-any": "warn",
      "typescript/no-unsafe-argument": "off",
      "typescript/no-unsafe-assignment": "off",
      "typescript/no-unsafe-member-access": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
    },
  },
  {
    // JavaScript-specific overrides (disable type-checked rules).
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
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
    files: ["**/infrastructure/**/*.ts", "**/infrastructure/**/*.tsx"],
    rules: {
      "typescript/consistent-type-assertions": "off",
    },
  },
];

/**
 * Shared skeleton every variant extends via `extends: [oxcBase]` in a
 * TS/JS config (object form — string paths are rejected by Oxlint's loader).
 * Does NOT carry `ignorePatterns` — see `baseIgnorePatterns` above.
 */
/** @type {OxlintConfig} */
export const oxcBase = {
  plugins: basePlugins,
  jsPlugins: baseJsPlugins,
  categories: baseCategories,
  env: {
    node: true,
  },
  rules: {
    ...baseRules,
    ...baseTypeAwareRules,
  },
  overrides: baseOverrides,
};

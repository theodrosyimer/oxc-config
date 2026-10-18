/**
 * Base building blocks shared by every @thyi/oxc-config variant.
 *
 * Parity source: @thyi/eslint-config v3.0.1 `base.js`.
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
 * Only the plugins the ESLint config has an equivalent for: no `unicorn`,
 * no `oxc`. No native `import` either: its resolver cannot take the
 * `@repo/source` condition, so the import rules run from eslint-plugin-import-x
 * itself (`import-x-js`, below).
 */
/** @type {NonNullable<OxlintConfig['plugins']>} */
export const basePlugins = ["typescript"];

/**
 * `@stylistic/eslint-plugin` has no native port; its one rule in use
 * (`padding-line-between-statements`) runs as a JS plugin. Resolved to an
 * absolute path from THIS package for the same pnpm reason as in `react.js`.
 */
const stylisticPluginPath = fileURLToPath(import.meta.resolve("@stylistic/eslint-plugin"));

/**
 * eslint-plugin-import-x, the plugin @thyi/eslint-config uses, as a JS
 * plugin: Oxlint's native `import` resolver reads no `customConditions` and
 * takes no `conditionNames`, so in a live-types monorepo it follows
 * `default` into a gitignored `dist/` and the import rules skip the import.
 * `import-x` is a reserved plugin name in Oxlint, hence the alias.
 */
const importXPluginPath = fileURLToPath(import.meta.resolve("eslint-plugin-import-x"));

/** @type {NonNullable<OxlintConfig['jsPlugins']>} */
export const baseJsPlugins = [
  stylisticPluginPath,
  { name: "import-x-js", specifier: importXPluginPath },
];

/**
 * The import-x settings @thyi/eslint-config v3.0.1 resolves to, unchanged:
 * the `typescript` resolver with the `@repo/source` condition first (the
 * live-types source export), and the parser import-x reads TypeScript
 * dependencies with.
 *
 * "Live-types repos resolve #/ and workspace specifiers through the
 * @repo/source condition; without it the resolver follows `default` into
 * gitignored dist/. Inert in repos whose exports never declare it. Supplying
 * conditionNames REPLACES the resolver defaults, hence the tail." (eslint-config
 * `base.js`)
 *
 * IMPORTANT: put these in the ROOT config's `settings` yourself, like
 * `baseIgnorePatterns`. Oxlint 1.79.0 passes only the root config's
 * `settings` to JS plugins: the same settings set in an extended config left
 * `@repo/source` unresolved, and at the root they resolved it.
 */
export const baseSettings = {
  "import-x/extensions": [".js", ".jsx", ".mjs", ".cjs"],
  "import-x/external-module-folders": ["node_modules", "node_modules/@types"],
  "import-x/parsers": {
    "@typescript-eslint/parser": [".ts", ".tsx", ".cts", ".mts"],
  },
  "import-x/resolver": {
    typescript: {
      conditionNames: [
        "@repo/source",
        "types",
        "import",
        "esm2020",
        "es2020",
        "es2015",
        "require",
        "node",
        "node-addons",
        "browser",
        "default",
      ],
    },
    node: true,
  },
};

/**
 * Every category off, `correctness` included (Oxlint turns it on by
 * default). Oxlint's categories do not match the ESLint preset stack
 * (`eslint:recommended` + tseslint recommendedTypeChecked/stylisticTypeChecked
 * + import-x recommended): they add rules the ESLint config never enables.
 * Every rule is listed by name below instead, so the two configs enable the
 * same rules at the same severity.
 */
/** @type {NonNullable<OxlintConfig['categories']>} */
export const baseCategories = {
  correctness: "off",
  nursery: "off",
  pedantic: "off",
  perf: "off",
  restriction: "off",
  style: "off",
  suspicious: "off",
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
  // The rest of the ESLint preset stack (`eslint:recommended`, tseslint
  // `recommendedTypeChecked` + `stylisticTypeChecked`, import-x
  // `recommended`), one rule per line at the preset's severity.
  "for-direction": "error",
  "no-async-promise-executor": "error",
  "no-compare-neg-zero": "error",
  "no-cond-assign": "error",
  "no-constant-binary-expression": "error",
  "no-constant-condition": "error",
  "no-control-regex": "error",
  "no-debugger": "error",
  "no-delete-var": "error",
  "no-dupe-else-if": "error",
  "no-duplicate-case": "error",
  "no-empty-character-class": "error",
  "no-empty-pattern": "error",
  "no-empty-static-block": "error",
  "no-ex-assign": "error",
  "no-extra-boolean-cast": "error",
  "no-global-assign": "error",
  "no-invalid-regexp": "error",
  "no-irregular-whitespace": "error",
  "no-loss-of-precision": "error",
  "no-misleading-character-class": "error",
  "no-nonoctal-decimal-escape": "error",
  "no-self-assign": "error",
  "no-shadow-restricted-names": "error",
  "no-sparse-arrays": "error",
  "no-unassigned-vars": "error",
  "no-unsafe-finally": "error",
  "no-unsafe-optional-chaining": "error",
  "no-unused-expressions": "error",
  "no-unused-labels": "error",
  "no-unused-private-class-members": "error",
  "no-useless-backreference": "error",
  "no-useless-catch": "error",
  "no-useless-escape": "error",
  "require-yield": "error",
  "use-isnan": "error",
  "valid-typeof": "error",
  "import-x-js/default": "error",
  "import-x-js/namespace": "error",
  "import-x-js/no-named-as-default": "warn",
  "import-x-js/no-named-as-default-member": "warn",
  "import-x-js/no-unresolved": "error",
  "typescript/no-duplicate-enum-values": "error",
  "typescript/no-misused-new": "error",
  "typescript/no-require-imports": "error",
  "typescript/no-this-alias": "error",
  "typescript/no-unsafe-declaration-merging": "error",
  "typescript/no-wrapper-object-types": "error",
  "typescript/prefer-as-const": "error",
  "typescript/prefer-namespace-keyword": "error",
  "typescript/triple-slash-reference": "error",
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
  "import-x-js/export": "error",
  "import-x-js/no-duplicates": "warn",
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
  // opposite; it is pinned off so it stays off.
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
  // None of the four need type information.
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
  // The rest of recommendedTypeChecked + stylisticTypeChecked, one rule per
  // line at the preset's severity.
  "typescript/await-thenable": "error",
  "typescript/no-array-delete": "error",
  "typescript/no-base-to-string": "error",
  "typescript/no-duplicate-type-constituents": "error",
  "typescript/no-floating-promises": "error",
  "typescript/no-for-in-array": "error",
  "typescript/no-implied-eval": "error",
  "typescript/no-redundant-type-constituents": "error",
  "typescript/no-unsafe-unary-minus": "error",
  "typescript/restrict-template-expressions": "error",
  "typescript/unbound-method": "error",
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
  "typescript/no-array-delete": "off",
  "typescript/no-base-to-string": "off",
  "typescript/no-duplicate-type-constituents": "off",
  "typescript/no-floating-promises": "off",
  "typescript/no-for-in-array": "off",
  "typescript/no-implied-eval": "off",
  "typescript/no-misused-promises": "off",
  "typescript/no-redundant-type-constituents": "off",
  "typescript/no-unnecessary-condition": "off",
  "typescript/no-unnecessary-type-assertion": "off",
  "typescript/no-unsafe-argument": "off",
  "typescript/no-unsafe-assignment": "off",
  "typescript/no-unsafe-call": "off",
  "typescript/no-unsafe-enum-comparison": "off",
  "typescript/no-unsafe-member-access": "off",
  "typescript/no-unsafe-return": "off",
  "typescript/no-unsafe-unary-minus": "off",
  "typescript/non-nullable-type-assertion-style": "off",
  "typescript/only-throw-error": "off",
  "typescript/prefer-find": "off",
  "typescript/prefer-includes": "off",
  "typescript/prefer-nullish-coalescing": "off",
  "typescript/prefer-optional-chain": "off",
  "typescript/prefer-promise-reject-errors": "off",
  "typescript/prefer-regexp-exec": "off",
  "typescript/prefer-string-starts-ends-with": "off",
  "typescript/restrict-plus-operands": "off",
  "typescript/restrict-template-expressions": "off",
  "typescript/unbound-method": "off",
};

/**
 * The `eslint:recommended` rules typescript-eslint's `eslint-recommended`
 * turns off for TypeScript files (the compiler covers them), so ESLint runs
 * them on JavaScript files only, plus `import-x/named`, which import-x's
 * `typescript` preset turns off for TypeScript. `no-dupe-args` has no
 * Oxlint port.
 */
/** @type {NonNullable<OxlintConfig['rules']>} */
export const jsOnlyRules = {
  "constructor-super": "error",
  "getter-return": "error",
  "no-class-assign": "error",
  "no-const-assign": "error",
  "no-dupe-class-members": "error",
  "no-dupe-keys": "error",
  "no-func-assign": "error",
  "no-import-assign": "error",
  "no-new-native-nonconstructor": "error",
  "no-obj-calls": "error",
  "no-redeclare": "error",
  "no-setter-return": "error",
  "no-this-before-super": "error",
  "no-undef": "error",
  "no-unreachable": "error",
  "no-unsafe-negation": "error",
  "no-with": "error",
  "import-x-js/named": "error",
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
    rules: { ...typeAwareOffForJs, ...jsOnlyRules },
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
 * Does NOT carry `ignorePatterns` or `settings` — see `baseIgnorePatterns` and
 * `baseSettings` above.
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

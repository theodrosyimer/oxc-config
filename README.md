# @thyi/oxc-config

Oxlint + Oxfmt config for TypeScript, Node.js (NestJS/CLI), React and React
Native (Expo). Successor of `@thyi/eslint-config` v3.0.1 + the shared Prettier
config — same rules, same severities, same path-based exceptions, ported to the
Oxc toolchain.[^1][^2] The rules with no Oxlint port are listed under
[Known caveats](#known-caveats).

Validated against `oxlint@1.79.0`, `oxfmt@0.64.0`, `oxlint-tsgolint`,
TypeScript 7.0.2.

## What replaced what

| Before                                             | After                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| eslint core + `@eslint/js` recommended             | Oxlint built-in rules, each listed by name; every category is off                                     |
| typescript-eslint (incl. type-aware presets)       | Oxlint `typescript/*` rules; type-aware via `oxlint-tsgolint` (tsgolint)[^3]                          |
| `eslint-plugin-import-x` + TS resolver             | Same plugin and resolver through JS plugins (`import-x-js/*`), same settings, `@repo/source` included |
| `import/order`                                     | **Oxfmt `sortImports`** — oxc will not implement `import/order`[^4]                                   |
| `eslint-plugin-react`, `eslint-plugin-react-hooks` | Oxlint native `react` plugin; `eslint-plugin-react-hooks` as a JS plugin for 2 rules                  |
| (new) `eslint-plugin-react-perf` `recommended`     | Oxlint native `react-perf` plugin                                                                     |
| `@eslint/compat` (`fixupPluginRules`)              | Dropped — Oxlint runs the JS plugins without it                                                       |
| `eslint-plugin-react-native`                       | This package's own JS plugin, `react-native/`: a port of v5.0.0's 7 rules plus 8 from the skills[^11] |
| `@stylistic/eslint-plugin`                         | Same plugin through JS plugins (`padding-line-between-statements` only)                               |
| `@tanstack/eslint-plugin-query`                    | Same plugin through JS plugins (`flat/recommended` rules, React configs)                              |
| (new) `eslint-plugin-better-tailwindcss`           | Same plugin through JS plugins, all 15 rules, React configs[^12]                                      |
| `eslint-config-turbo`                              | `eslint-plugin-turbo` through JS plugins (`./turbo` export)                                           |
| `eslint-config-prettier`                           | Dropped — nothing to disable                                                                          |
| Prettier + `prettier-plugin-pkg`                   | Oxfmt (`./oxfmt` export); native `sortPackageJson`                                                    |

## Install (per project)

```sh
pnpm add -D oxlint oxfmt oxlint-tsgolint @thyi/oxc-config
```

`oxlint-tsgolint` is only needed where type-aware linting runs (skip it for
pure-JS packages).

## Usage

`extends` in `oxlint.config.ts` takes **imported config objects** — string
paths are rejected by Oxlint's TS-config loader.

### Node.js / NestJS / CLI — `oxlint.config.ts`

```ts
import { defineConfig } from "oxlint";
import defaultConfig, { baseIgnorePatterns, baseSettings } from "@thyi/oxc-config";

export default defineConfig({
  extends: [defaultConfig],
  // Always at ROOT level: ignore patterns and settings carried through
  // `extends` do not apply from the consuming project (verified on oxlint
  // 1.79.0). baseSettings holds the import-x resolver (@repo/source).
  ignorePatterns: baseIgnorePatterns,
  settings: baseSettings,
});
```

### Expo / React Native — `oxlint.config.ts`

```ts
import { defineConfig } from "oxlint";
import { baseIgnorePatterns, baseSettings, reactConfig } from "@thyi/oxc-config";

export default defineConfig({
  extends: [reactConfig],
  ignorePatterns: baseIgnorePatterns,
  // Your Tailwind CSS entry file (Uniwind: `global.css` at the project root).
  settings: {
    ...baseSettings,
    "better-tailwindcss": { entryPoint: "global.css" },
  },
});
```

### Web-only React (TanStack Start, Vite) — `oxlint.config.ts`

The React config without the React Native plugin (`react-native/`) and its
Expo allowances; browser globals instead.

```ts
import { defineConfig } from "oxlint";
import { baseIgnorePatterns, baseSettings, reactWebConfig } from "@thyi/oxc-config";

export default defineConfig({
  extends: [reactWebConfig],
  ignorePatterns: baseIgnorePatterns,
  // Your Tailwind CSS entry file.
  settings: {
    ...baseSettings,
    "better-tailwindcss": { entryPoint: "src/styles.css" },
  },
});
```

### Turborepo env-var check (addon, composable with either)

```ts
import { defineConfig } from "oxlint";
import defaultConfig, { baseIgnorePatterns, baseSettings, turboAddon } from "@thyi/oxc-config";

export default defineConfig({
  extends: [defaultConfig, turboAddon],
  ignorePatterns: baseIgnorePatterns,
  settings: baseSettings,
});
```

### Formatter — `oxfmt.config.ts`

```ts
import { defineConfig } from "oxfmt";
import { oxfmtConfig } from "@thyi/oxc-config/oxfmt";

export default defineConfig({
  ...oxfmtConfig,
  // per-project additions, e.g.:
  // proseWrap: 'always',
  // sortTailwindcss: true,
});
```

### package.json scripts

```jsonc
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt",
    "format:check": "oxfmt --check",
    // replaces `tsc --noEmit && lint` in one pass:
    "check": "oxlint --type-aware --type-check && oxfmt --check",
  },
}
```

### lint-staged

```jsonc
{
  "lint-staged": {
    "*": "oxfmt --no-error-on-unmatched-pattern",
    "*.{ts,tsx,js,jsx}": "oxlint --fix --no-error-on-unmatched-pattern",
  },
}
```

## Editor setup (VS Code / Cursor)

One extension covers both tools: `oxc.oxc-vscode`. It runs `oxlint --lsp` /
`oxfmt --lsp` from the project, so both must be local devDependencies.[^6][^7]

`.vscode/extensions.json`

```json
{
  "recommendations": ["oxc.oxc-vscode"]
}
```

`.vscode/settings.json`

```jsonc
{
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "always",
  },
  "[javascript]": { "editor.defaultFormatter": "oxc.oxc-vscode", "editor.formatOnSave": true },
  "[javascriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode", "editor.formatOnSave": true },
  "[typescript]": { "editor.defaultFormatter": "oxc.oxc-vscode", "editor.formatOnSave": true },
  "[typescriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode", "editor.formatOnSave": true },
  "[json]": { "editor.defaultFormatter": "oxc.oxc-vscode", "editor.formatOnSave": true },
  // remove once eslint/prettier are fully gone from the repo:
  "eslint.enable": false,
  "prettier.enable": false,
}
```

Type-aware diagnostics in-editor: enabled by `options.typeAware: true` in the
root config (already set by `defaultConfig`/`reactConfig`/`reactWebConfig`).[^3] For nested
client dirs, point the extension at the right binaries via `oxc.path.oxlint` /
`oxc.path.tsgolint`.

Zed, JetBrains, Neovim: see the official editor pages — same LSP binaries.[^6][^7]

## Monorepo setup (Turborepo + `packages/config`)

The shared presets live in one workspace package, `packages/config`, next to
the TypeScript and Vitest presets. Every app and package lints itself through
turbo with a one-line config; the root lints only its own tooling. Checked on
a pnpm workspace with `oxlint@1.79.0` and `oxfmt@0.64.0`.

```text
packages/config/
├── oxlint/node.js       Node.js / NestJS / CLI preset
├── oxlint/react.js      Expo / React Native preset
├── oxlint/react-web.js  web-only React preset
├── oxfmt/index.js       formatter preset
└── package.json
packages/<name>/oxlint.config.ts   export { default } from "@repo/config/oxlint/node";
apps/<name>/oxlint.config.ts       the React preset + the app's Tailwind entry file
oxlint.config.ts                   root: the node preset, ignoring packages/ and apps/
oxfmt.config.ts                    root: the formatter preset, for the whole repository
```

**1. `packages/config/package.json`** — the presets' dependencies live here.

```jsonc
{
  "name": "@repo/config",
  "private": true,
  "type": "module",
  "exports": {
    "./oxlint/*": "./oxlint/*.js",
    "./oxfmt": "./oxfmt/index.js",
  },
  "dependencies": {
    "@thyi/oxc-config": "^4.0.0",
    "oxfmt": "catalog:",
    "oxlint": "catalog:",
    "oxlint-tsgolint": "catalog:",
  },
}
```

**2. The presets** — plain `.js`: Node.js does not strip TypeScript types from
files under `node_modules`. Each preset carries `ignorePatterns` itself, and is
re-exported (never put under `extends`) by the packages, because
`ignorePatterns` coming through `extends` do not apply.

```js
// packages/config/oxlint/node.js
import { defineConfig } from "oxlint";
import { baseIgnorePatterns, baseSettings, defaultConfig, turboAddon } from "@thyi/oxc-config";

export default defineConfig({
  extends: [defaultConfig, turboAddon],
  ignorePatterns: baseIgnorePatterns,
  settings: baseSettings,
});
```

```js
// packages/config/oxlint/react.js — react-web.js is the same with reactWebConfig
import { defineConfig } from "oxlint";
import { baseIgnorePatterns, baseSettings, reactConfig, turboAddon } from "@thyi/oxc-config";

export default defineConfig({
  extends: [reactConfig, turboAddon],
  ignorePatterns: baseIgnorePatterns,
  settings: baseSettings,
});
```

```js
// packages/config/oxfmt/index.js
import { defineConfig } from "oxfmt";
import { oxfmtConfig } from "@thyi/oxc-config/oxfmt";

export default defineConfig({ ...oxfmtConfig, proseWrap: "always" });
```

**3. Each package** — the config, the binaries its scripts call, the scripts.

```ts
// packages/<name>/oxlint.config.ts
export { default } from "@repo/config/oxlint/node";
```

```jsonc
// packages/<name>/package.json
{
  "scripts": {
    "lint": "oxlint --fix",
    "lint:check": "oxlint --type-aware --type-check --max-warnings=0",
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "oxlint": "catalog:",
    "oxlint-tsgolint": "catalog:",
  },
}
```

**4. Each React app** — spread the preset to add the app's Tailwind CSS entry
file, relative to the app folder (`global.css` for Uniwind). Without it,
`better-tailwindcss/no-unknown-classes` reports every `@theme` token.

```ts
// apps/mobile/oxlint.config.ts
import react from "@repo/config/oxlint/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  ...react,
  settings: { ...react.settings, "better-tailwindcss": { entryPoint: "global.css" } },
});
```

The app also needs `tailwindcss` in its devDependencies.

**5. The root** — the node preset for the root tooling only.

```ts
// oxlint.config.ts
import node from "@repo/config/oxlint/node";
import { defineConfig } from "oxlint";

export default defineConfig({
  ...node,
  ignorePatterns: [...(node.ignorePatterns ?? []), "packages/", "apps/", "docs/"],
});
```

```ts
// oxfmt.config.ts
export { default } from "@repo/config/oxfmt";
```

```jsonc
// package.json
{
  "scripts": {
    "lint": "oxlint --fix --disable-nested-config && turbo run lint",
    "lint:check": "oxlint --type-aware --type-check --max-warnings=0 --disable-nested-config && turbo run lint:check",
    "format": "oxfmt",
    "format:check": "oxfmt --check",
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "oxfmt": "catalog:",
    "oxlint": "catalog:",
    "oxlint-tsgolint": "catalog:",
  },
}
```

`--disable-nested-config` is required on the root run: without it, Oxlint
applies each package's own `oxlint.config.ts` to that package's folder and the
root's `packages/` ignore has no effect, so the root lints every package
again. Never put the flag in a package script.

One root `oxfmt` formats the whole repository, and still uses a package's own
`oxfmt.config.ts` for that package's files when one exists, so packages need
no format scripts.

**6. `turbo.json`**

```jsonc
{
  "tasks": {
    "lint": { "dependsOn": ["^lint"] },
    "lint:check": { "dependsOn": ["^build", "^lint:check"] },
  },
}
```

`^build` because type-aware linting reads the built `.d.ts` of the workspace
packages a package imports.[^3]

**7. `.gitignore`** lists `node_modules` and the build folders: Oxfmt skips what
`.gitignore` lists (it formatted `dist/` when it was not listed), and Oxlint
reads it too, on top of `baseIgnorePatterns`.

**Notes**

- `options.typeAware` / `options.typeCheck` only work in the config at the
  folder Oxlint runs from — each package's when turbo runs it.[^3]
- Keep the root `tsconfig.json` from including everything (`"files": []` at
  the root, a scoped `include` per package), or tsgolint builds giant
  programs.[^3] A root solution file still type-checks root tooling files such
  as `vitest.config.ts`.
- `baseIgnorePatterns` covers the build and tooling folders on top of
  `.gitignore`.

## Migration checklist (from eslint-config v3 + Prettier)

1. Remove: `@thyi/eslint-config`, `eslint`, `prettier`,
   `prettier-plugin-pkg`, `eslint.config.*`, `prettier.config.*`,
   `.prettierignore` (fold into `ignorePatterns`), and any of these a
   project installed itself: `@eslint/js`, `@eslint/compat`,
   `typescript-eslint`, `@typescript-eslint/*`, `eslint-plugin-import-x`,
   `eslint-import-resolver-typescript`, `eslint-config-prettier`,
   `eslint-plugin-react`, `eslint-plugin-react-hooks`,
   `eslint-plugin-react-native`, `@stylistic/eslint-plugin`,
   `@tanstack/eslint-plugin-query`, `eslint-config-turbo`, `globals`.
2. Add configs above; update scripts, lint-staged, CI, `.vscode/`.
3. Run `pnpm oxfmt` once; commit; add the SHA to `.git-blame-ignore-revs`
   (expect `package.json` key-order churn — native `sortPackageJson` uses a
   different order than `prettier-plugin-pkg`[^8]).
4. `// prettier-ignore` comments keep working; `// oxfmt-ignore` also works in
   JS/TS.[^2] Inline lint disables become
   `// oxlint-disable-next-line <plugin>/<rule> -- reason`.
5. Optional cross-check before deleting ESLint: `npx @oxlint/migrate
eslint.config.js --type-aware` and diff its output against this package.[^1]

## Known caveats

- **JS plugins are alpha.**[^5] `turbo/*`, `@stylistic/*`, `@tanstack/query/*`
  and `react-hooks-js/*` rules were verified against the ESLint v9 flat API
  (which is what Oxlint implements), with these exact options — but none of
  these plugins is on oxc's conformance-tested list. After first install, run `oxlint` on a file with a known violation
  (undeclared env var) to confirm the bridge end-to-end.
- **The React Native plugin** (`react-native/`) is a port of
  eslint-plugin-react-native v5.0.0 (MIT, `react-native/LICENSE`) to Oxlint's
  `createOnce` API.[^11] Same rule names, options, messages and fixes; its
  tests are that plugin's own 114 test cases, run with Oxlint's `RuleTester`
  (`pnpm test`). `eslintCompatPlugin` also makes it load in ESLint.
- **React Native rules from the skills** (`reactConfig` only, all `error`;
  every message ends with "Fix: …"):

  | Rule                                      | Reports                                                                                         |
  | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
  | `react-native/no-falsy-and`               | `{value && <X />}` children whose condition is not a boolean (crash on `""` / `0`)              |
  | `react-native/no-raw-palette-classes`     | raw colors, numeric spacing, default shadows, `[…]` values in `*className` (rn-patterns tokens) |
  | `react-native/no-dynamic-classnames`      | class names built at runtime: `` `bg-${color}-500` ``, `'bg-' + color`                          |
  | `react-native/with-uniwind-module-scope`  | `withUniwind()` inside a function, or around a react-native / Reanimated component              |
  | `react-native/scrollview-content-padding` | padding classes on a ScrollView's `className` instead of `contentContainerClassName`            |
  | `react-native/no-legacy-shadow`           | `shadowColor` / `shadowOffset` / `shadowOpacity` / `shadowRadius` / `elevation`                 |
  | `react-native/animate-transform-opacity`  | `width`, `height`, `top`, `left`, `margin*`, `padding*` returned by `useAnimatedStyle`          |

  `react-native/no-banned-imports` bans `nativewind`, and `TouchableOpacity`,
  `TouchableHighlight`, `Image`, `SafeAreaView` and `KeyboardAvoidingView`
  from `react-native`, with the replacement in the message itself.
  The StyleSheet rules (`sort-styles`, `no-unused-styles`, …) stay on for code
  that uses React Native's own styling.

- **`no-use-before-define` parity**: oxc has open issues where behavior
  diverges from typescript-eslint (missed references from inner functions;
  config not always honored).[^9][^10] If a divergence bites, alias the
  typescript-eslint rule through `jsPlugins` until fixed.
- **Type-aware requires a TypeScript-7-compatible tsconfig** (no `baseUrl`,
  no options removed in TS 7).[^3] The installed `typescript` package version
  is irrelevant to tsgolint — a project pinned to 6.0.3 for Stryker can still
  use type-aware linting as long as its tsconfig is TS7-clean.
- **No home-directory config**: the `~/.prettierrc` `proseWrap` trick has no
  Oxfmt equivalent; set `proseWrap` (or an override) per project.
- **Rules Oxlint has no port for** (enabled in `@thyi/eslint-config` v3.0.1)
  and what covers them here:

  | ESLint rule                                        | Here                                                                                                                  |
  | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | `react/prop-types`                                 | left out: it checks JavaScript props, and TypeScript types them                                                       |
  | `react/no-deprecated`                              | partly: `react/no-unsafe` with `checkAliases` reports the deprecated lifecycle methods, not the other deprecated APIs |
  | `react-hooks/config`, `react-hooks/gating`         | eslint-plugin-react-hooks itself, as the `react-hooks-js` JS plugin                                                   |
  | `import-x/order`                                   | Oxfmt `sortImports`                                                                                                   |
  | `no-octal`, `no-dupe-args` (JavaScript files only) | Oxlint's parser rejects both                                                                                          |
  | `react/jsx-uses-react`, `react/jsx-uses-vars`      | not needed: `no-unused-vars` counts JSX use                                                                           |

  Every other rule the ESLint presets enable is listed explicitly at the same
  severity, and no rule outside that list is on.

- **Import rules run from eslint-plugin-import-x**, as `import-x-js/*`: Oxlint's
  native `import` resolver reads no `customConditions` and takes no
  `conditionNames`, so in a live-types monorepo it followed `default` into a
  missing `dist/` and its rules skipped the import. The JS plugin uses the
  same resolver and settings as `@thyi/eslint-config`, so `@repo/source`
  resolves. Put `baseSettings` in the root config's `settings`: Oxlint passes
  only the root config's settings to JS plugins. Its TypeScript parser needs
  `typescript` 6.0.x installed, as with `@thyi/eslint-config`.
- `@tanstack/query/no-void-query-fn` asks for type information, which Oxlint
  does not give JS plugins; expect it to stay silent.
- `sortPackageJson.sortScripts` defaults to `false` — scripts keep their
  order; flip it per project if wanted.

[^1]: https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint

[^2]: https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier

[^3]: https://oxc.rs/docs/guide/usage/linter/type-aware

[^4]: https://github.com/oxc-project/oxc/issues/1117

[^5]: https://oxc.rs/docs/guide/usage/linter/js-plugins

[^6]: https://oxc.rs/docs/guide/usage/linter/editors

[^7]: https://oxc.rs/docs/guide/usage/formatter/editors

[^8]: https://oxc.rs/docs/guide/usage/formatter/config-file-reference

[^9]: https://github.com/oxc-project/oxc/issues/19504

[^10]: https://github.com/oxc-project/oxc/issues/19437

[^11]: https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html

[^12]: https://github.com/schoero/eslint-plugin-better-tailwindcss

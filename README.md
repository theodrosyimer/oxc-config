# @thyi/oxc-config

Oxlint + Oxfmt config for TypeScript, Node.js (NestJS/CLI), React and React
Native (Expo). Successor of `@thyi/eslint-config` v2.8.5 + the shared Prettier
config — same rules, same severities, same path-based exceptions, ported to the
Oxc toolchain.[^1][^2]

Validated against `oxlint@1.79.0`, `oxfmt@0.64.0`, `oxlint-tsgolint`,
TypeScript 7.0.2.

## What replaced what

| Before                                             | After                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| eslint core + `@eslint/js` recommended             | Oxlint built-in rules; `correctness` (error) + `suspicious` (warn) baseline  |
| typescript-eslint (incl. type-aware presets)       | Oxlint `typescript/*` rules; type-aware via `oxlint-tsgolint` (tsgolint)[^3] |
| `eslint-plugin-import` + TS resolver               | Oxlint `import` plugin (tsconfig-aware resolution built in)                  |
| `import/order`                                     | **Oxfmt `sortImports`** — oxc will not implement `import/order`[^4]          |
| `eslint-plugin-react`, `eslint-plugin-react-hooks` | Oxlint native `react` plugin (includes `rules-of-hooks`/`exhaustive-deps`)   |
| `eslint-plugin-react-native`                       | Same plugin, loaded through Oxlint **JS plugins** (ESLint-v9 compat)[^5]     |
| `eslint-config-turbo`                              | `eslint-plugin-turbo` through JS plugins (`./turbo` export)                  |
| `eslint-plugin-only-warn`                          | `onlyWarn(config)` helper (`./only-warn` export)                             |
| `eslint-config-prettier`                           | Dropped — nothing to disable                                                 |
| Prettier + `prettier-plugin-pkg`                   | Oxfmt (`./oxfmt` export); native `sortPackageJson`                           |

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
import defaultConfig, { baseIgnorePatterns } from "@thyi/oxc-config";

export default defineConfig({
  extends: [defaultConfig],
  // Always at ROOT level: ignore patterns carried through `extends`
  // do not apply from the consuming project (verified on oxlint 1.79.0).
  ignorePatterns: baseIgnorePatterns,
});
```

### Expo / React Native — `oxlint.config.ts`

```ts
import { defineConfig } from "oxlint";
import { baseIgnorePatterns, reactConfig } from "@thyi/oxc-config";

export default defineConfig({
  extends: [reactConfig],
  ignorePatterns: baseIgnorePatterns,
});
```

### Turborepo env-var check (addon, composable with either)

```ts
import { defineConfig } from "oxlint";
import defaultConfig, { baseIgnorePatterns, turboAddon } from "@thyi/oxc-config";

export default defineConfig({
  extends: [defaultConfig, turboAddon],
  ignorePatterns: baseIgnorePatterns,
});
```

### only-warn mode (never fail local lint; CI stays strict)

```ts
import { defineConfig } from "oxlint";
import { baseIgnorePatterns, onlyWarn, reactConfig } from "@thyi/oxc-config";

export default defineConfig({
  extends: [onlyWarn(reactConfig)],
  ignorePatterns: baseIgnorePatterns,
  options: { maxWarnings: 0 }, // optional: strict exit code even in warn mode
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
root config (already set by `defaultConfig`/`reactConfig`).[^3] For nested
client dirs, point the extension at the right binaries via `oxc.path.oxlint` /
`oxc.path.tsgolint`.

Zed, JetBrains, Neovim: see the official editor pages — same LSP binaries.[^6][^7]

## CI (GitHub Actions)

```yaml
name: NPM Package CI

on:
  push:
    branches: ["**"] # Universal coverage
  pull_request:
    branches: ["**"]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Package CI
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      - name: Checkout code
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-depth: 0

      - name: Install pnpm
        uses: pnpm/action-setup@fc06bc1257f339d1d5d8b3a19a8cae5388b55320 # v5.0.0

      - name: Install Node.js
        uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f # v6.3.0
        with:
          node-version-file: ".nvmrc" # >=24.14.1 per `engines` (Oxlint TS configs need Node >=22.18)
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # STEP 1: Format check (Fail Fast — cheapest signal first)
      - name: Check formatting
        run: pnpm oxfmt --check

      # STEP 2: Build Package
      # Before lint on purpose FOR MONOREPOS: type-aware linting resolves
      # workspace dependencies through their built .d.ts.
      # Standalone package: lint does not depend on your own dist/ (types
      # resolve from source + node_modules), so move this step back after
      # lint to restore lint-first fail-fast — unless the package
      # self-references its own `exports` (e.g. `my-pkg/sub` in tests)
      # mapped to dist/, which puts you back in the build-first case.
      # No build script at all (plain-JS package like this one): remove.
      - name: Build package
        run: pnpm run build

      # STEP 3: Lint + typecheck in one pass (replaces `tsc --noEmit`)
      - name: Lint package code
        run: pnpm oxlint --type-aware --type-check --max-warnings=0

      # STEP 4: Fast unit tests (always run)
      - name: Unit tests
        run: pnpm run test
        if: github.ref != 'refs/heads/main' && github.base_ref != 'main'

      # STEP 5: Full test suite (main branch only)
      - name: Full test suite (Unit + Integration + E2E)
        run: pnpm run test:all
        if: github.ref == 'refs/heads/main' || github.base_ref == 'main'
```

`--type-check` reports TypeScript errors alongside lint results, replacing a
separate `tsc --noEmit` job.[^3] One ordering change versus a lint-first
pipeline: build precedes lint because type-aware rules need built `.d.ts` for
workspace dependencies[^3] — the fail-fast slot is taken by `oxfmt --check`
instead, which is the cheapest of the three checks.

## Monorepo notes

- One **root** `oxlint.config.ts` extending this package; per-app tweaks go in
  nested configs. `options.typeAware`/`options.typeCheck` are **root-only** —
  never set them in nested configs.[^3]
- Type-aware linting reads real type info: `pnpm install && pnpm -r build`
  before `oxlint --type-aware` so workspace `.d.ts` exist.[^3]
- Keep root `tsconfig.json` from including everything (`"files": []` at root;
  scoped `include` per package) or tsgolint builds giant programs.[^3]
- Oxlint respects `.gitignore` automatically; `baseIgnorePatterns` covers the
  build/tooling dirs on top of that.

## Migration checklist (from eslint-config v2.8.x + Prettier)

1. Remove: `eslint`, `@eslint/js`, `typescript-eslint`,
   `@typescript-eslint/*`, `eslint-plugin-import`,
   `eslint-import-resolver-typescript`, `eslint-config-prettier`,
   `eslint-plugin-only-warn`, `eslint-plugin-react`,
   `eslint-plugin-react-hooks`, `eslint-config-turbo`, `prettier`,
   `prettier-plugin-pkg`, `eslint.config.*`, `prettier.config.*`,
   `.prettierignore` (fold into `ignorePatterns`).
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

- **JS plugins are alpha.**[^5] `react-native/*` and `turbo/*` rules were
  verified against the ESLint v9 flat API (which is what Oxlint implements),
  with these exact options — but neither plugin is on oxc's conformance-tested
  list. After first install, run `oxlint` on a file with a known violation
  (inline style / undeclared env var) to confirm the bridge end-to-end.
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

# Changelog

## [4.1.0](https://github.com/theodrosyimer/oxc-config/compare/4.0.1...4.1.0) (2026-10-18)

### ✨ Features

* add eslint-plugin-better-tailwindcss to the React configs ([679df8f](https://github.com/theodrosyimer/oxc-config/commit/679df8fea9400d5e094cfe6e2de9fee79a02a5c4))

### 📚 Documentation

* add the monorepo setup to the README ([83e65a9](https://github.com/theodrosyimer/oxc-config/commit/83e65a9b2cbb3506ef3dca14dc47489ef227a891))

## [4.0.1](https://github.com/theodrosyimer/oxc-config/compare/4.0.0...4.0.1) (2026-10-18)

### 📚 Documentation

* remove the sample CI workflow from the README ([ba806e8](https://github.com/theodrosyimer/oxc-config/commit/ba806e805d5dd8d5fff8479cae5f0da80bf978da))

## [4.0.0](https://github.com/theodrosyimer/oxc-config/compare/3.2.0...4.0.0) (2026-10-18)

### ⚠ BREAKING CHANGES

* the onlyWarn helper and the ./only-warn export are
  removed, as are the baseJsPlugins, reactJsPlugins and reactRules exports
  of the main entry. Every Oxlint category is off, so rules that were on
  through correctness or suspicious and are not in eslint-config 3.0.1 no
  longer report. The React config adds react-perf, react/no-unsafe and the
  eight React Native plugin rules at error, and bans NativeWind,
  TouchableOpacity, TouchableHighlight and react-native's Image,
  SafeAreaView and KeyboardAvoidingView.

### ✨ Features

* match eslint-config 3.0.1 exactly and add a React Native plugin ([3745ca9](https://github.com/theodrosyimer/oxc-config/commit/3745ca9619588a40481809b7aa4bd67b3b48e01f))

## [3.2.0](https://github.com/theodrosyimer/oxc-config/compare/3.0.4...3.2.0) (2026-10-18)

### ✨ Features

* match @thyi/eslint-config v3 rules and add react-web ([15ed2c7](https://github.com/theodrosyimer/oxc-config/commit/15ed2c732f8a9e42195949372f224badbb99f362))

### 🐛 Bug Fixes

* **ci:** publish with pnpm through OIDC like eslint-config ([aa0b3fe](https://github.com/theodrosyimer/oxc-config/commit/aa0b3fe7f79001fe48c1910f73982692f0077556))

## [3.0.4](https://github.com/theodrosyimer/oxc-config/compare/3.0.3...3.0.4) (2026-08-23)

* comment out publish step in release workflow ([1071e13](https://github.com/theodrosyimer/oxc-config/commit/1071e13c764b78d533c024b6ed34aa48ab01ee39))
* fix formatting in changelog for consistency ([9a8fe4a](https://github.com/theodrosyimer/oxc-config/commit/9a8fe4af9a01f1e74f74c5fbe87a1e53dd93d153))

## [3.0.3](https://github.com/theodrosyimer/oxc-config/compare/3.0.2...3.0.3) (2026-08-23)

- update changelog formatting for consistency ([5e6fd90](https://github.com/theodrosyimer/oxc-config/commit/5e6fd909f70f8a9b2efc4177624dcd4eadfb441e))
- update publish steps in release workflow ([e7638da](https://github.com/theodrosyimer/oxc-config/commit/e7638da41531816e75b99f989c0093ca7df0e192))

## [3.0.2](https://github.com/theodrosyimer/oxc-config/compare/3.0.1...3.0.2) (2026-08-23)

- add build step and bootstrap publish variant to release workflow ([94a6125](https://github.com/theodrosyimer/oxc-config/commit/94a61259513328032075487bac96b9f755b31373))
- add dependency integrity verification step in release workflow ([8b213bf](https://github.com/theodrosyimer/oxc-config/commit/8b213bf514de8cee7d30fdb56d308de9e363c63f))
- remove build step from release workflow ([c0f82a9](https://github.com/theodrosyimer/oxc-config/commit/c0f82a912ad2db0913c3282e87f090533487875c))

### 💎 Style Changes

- format changelog ([36f988b](https://github.com/theodrosyimer/oxc-config/commit/36f988b38a54358f2d06808af4d218e89e8df1fe))

## 3.0.1 (2026-08-23)

- add .nvmrc file with Node.js version 24.19.0 ([5341d9c](https://github.com/theodrosyimer/oxc-config/commit/5341d9c4ca4bbb8de3f382c5a8f5fb8579fb830a))
- project initialization ([fbed60e](https://github.com/theodrosyimer/oxc-config/commit/fbed60ed02b4a03257703f2c2a51e38e6fa4aec1))
- remove build step from release workflow and update dependency integrity check ([9cc698d](https://github.com/theodrosyimer/oxc-config/commit/9cc698d2cc5aafd8b7749ab4f5c4169102eefc86))
- streamline CI workflow by removing unnecessary build and test steps ([b397358](https://github.com/theodrosyimer/oxc-config/commit/b397358c392c3e4e9b074df6a55643faa82c0f6c))
- update configuration files ([4b133d3](https://github.com/theodrosyimer/oxc-config/commit/4b133d3d1568cfbe5d3e9eb11795f85d5c44447b))

### 🐛 Bug Fixes

- add missing dependency ([e29c763](https://github.com/theodrosyimer/oxc-config/commit/e29c76317295fbc6c415bfd14ef21df9da594b7b))

### 💎 Style Changes

- forma config files ([1dc41bb](https://github.com/theodrosyimer/oxc-config/commit/1dc41bb750753454b6ccb64fba5cbc47b7b7767c))

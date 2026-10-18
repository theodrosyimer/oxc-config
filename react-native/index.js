/**
 * React Native rules for Oxlint, loaded as a JS plugin under the name
 * `react-native`:
 * - a port of eslint-plugin-react-native v5.0.0's seven rules (MIT, see
 *   ./LICENSE), with the same names, options, messages and fixes, checked
 *   against that plugin's own test cases (`rules/*.test.js`);
 * - eight rules from the rn-patterns, uniwind and vercel-react-native skills
 *   (`no-falsy-and`, `no-raw-palette-classes`, `no-dynamic-classnames`,
 *   `with-uniwind-module-scope`, `scrollview-content-padding`,
 *   `no-legacy-shadow`, `animate-transform-opacity`, `no-banned-imports`),
 *   each message ending with an explicit "Fix: …".
 *
 * Written with Oxlint's `createOnce` API; `eslintCompatPlugin` adds the
 * ESLint `create` method to each rule, so the plugin also runs in ESLint.
 * https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html
 */
import { eslintCompatPlugin } from "@oxlint/plugins";

import animateTransformOpacity from "./rules/animate-transform-opacity.js";
import noBannedImports from "./rules/no-banned-imports.js";
import noColorLiterals from "./rules/no-color-literals.js";
import noDynamicClassnames from "./rules/no-dynamic-classnames.js";
import noFalsyAnd from "./rules/no-falsy-and.js";
import noInlineStyles from "./rules/no-inline-styles.js";
import noLegacyShadow from "./rules/no-legacy-shadow.js";
import noRawPaletteClasses from "./rules/no-raw-palette-classes.js";
import noRawText from "./rules/no-raw-text.js";
import noSingleElementStyleArrays from "./rules/no-single-element-style-arrays.js";
import noUnusedStyles from "./rules/no-unused-styles.js";
import scrollviewContentPadding from "./rules/scrollview-content-padding.js";
import sortStyles from "./rules/sort-styles.js";
import splitPlatformComponents from "./rules/split-platform-components.js";
import withUniwindModuleScope from "./rules/with-uniwind-module-scope.js";

export default eslintCompatPlugin({
  meta: {
    name: "react-native",
  },
  rules: {
    "animate-transform-opacity": animateTransformOpacity,
    "no-banned-imports": noBannedImports,
    "no-color-literals": noColorLiterals,
    "no-dynamic-classnames": noDynamicClassnames,
    "no-falsy-and": noFalsyAnd,
    "no-inline-styles": noInlineStyles,
    "no-legacy-shadow": noLegacyShadow,
    "no-raw-palette-classes": noRawPaletteClasses,
    "no-raw-text": noRawText,
    "no-single-element-style-arrays": noSingleElementStyleArrays,
    "no-unused-styles": noUnusedStyles,
    "scrollview-content-padding": scrollviewContentPadding,
    "sort-styles": sortStyles,
    "split-platform-components": splitPlatformComponents,
    "with-uniwind-module-scope": withUniwindModuleScope,
  },
});

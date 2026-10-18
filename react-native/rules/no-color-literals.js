/**
 * Detects color literals. Ported from eslint-plugin-react-native v5.0.0
 * `lib/rules/no-color-literals.js` (MIT, see ../LICENSE).
 */
import { inspect } from "node:util";

import { defineRule } from "@oxlint/plugins";

import { astHelpers } from "../ast-helpers.js";
import { StyleSheets } from "../style-sheets.js";

export default defineRule({
  meta: {
    schema: [],
  },
  createOnce(context) {
    let styleSheets;

    return {
      before() {
        styleSheets = new StyleSheets();
      },
      CallExpression(node) {
        if (!astHelpers.isStyleSheetDeclaration(node, context.settings)) {
          return;
        }

        for (const style of astHelpers.getStyleDeclarations(node)) {
          styleSheets.addColorLiterals(astHelpers.collectColorLiterals(style.value, context));
        }
      },
      JSXAttribute(node) {
        if (!astHelpers.isStyleAttribute(node)) {
          return;
        }

        styleSheets.addColorLiterals(astHelpers.collectColorLiterals(node.value, context));
      },
      "Program:exit"() {
        for (const style of styleSheets.getColorLiterals() ?? []) {
          if (!style) {
            continue;
          }

          context.report({
            node: style.node,
            message: "Color literal: {{expression}}",
            data: { expression: inspect(style.expression) },
          });
        }
      },
    };
  },
});

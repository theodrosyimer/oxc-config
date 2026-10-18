/**
 * Detects inline styles. Ported from eslint-plugin-react-native v5.0.0
 * `lib/rules/no-inline-styles.js` (MIT, see ../LICENSE).
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
      JSXAttribute(node) {
        if (!astHelpers.isStyleAttribute(node)) {
          return;
        }

        styleSheets.addObjectExpressions(
          astHelpers.collectStyleObjectExpressions(node.value, context),
        );
      },
      "Program:exit"() {
        for (const style of styleSheets.getObjectExpressions() ?? []) {
          if (!style) {
            continue;
          }

          context.report({
            node: style.node,
            message: "Inline style: {{expression}}",
            data: { expression: inspect(style.expression) },
          });
        }
      },
    };
  },
});

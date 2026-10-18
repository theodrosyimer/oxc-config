/**
 * Detects unused styles. Ported from eslint-plugin-react-native v5.0.0
 * `lib/rules/no-unused-styles.js` (MIT, see ../LICENSE).
 */
import { defineRule } from "@oxlint/plugins";

import { astHelpers } from "../ast-helpers.js";
import { detectComponents } from "../components.js";
import { StyleSheets } from "../style-sheets.js";

export default defineRule({
  meta: {
    schema: [],
  },
  createOnce: detectComponents((context, getComponents) => {
    let styleSheets;
    let styleReferences;

    return {
      before() {
        styleSheets = new StyleSheets();
        styleReferences = new Set();
      },
      MemberExpression(node) {
        const styleRef = astHelpers.getPotentialStyleReferenceFromMemberExpression(node);

        if (styleRef) {
          styleReferences.add(styleRef);
        }
      },
      CallExpression(node) {
        if (!astHelpers.isStyleSheetDeclaration(node, context.settings)) {
          return;
        }

        styleSheets.add(astHelpers.getStyleSheetName(node), astHelpers.getStyleDeclarations(node));
      },
      "Program:exit"() {
        if (Object.keys(getComponents().all()).length === 0) {
          return;
        }

        for (const reference of styleReferences) {
          styleSheets.markAsUsed(reference);
        }

        for (const [styleSheetName, styles] of Object.entries(styleSheets.getUnusedReferences())) {
          for (const node of styles) {
            context.report(node, `Unused style detected: ${styleSheetName}.${node.key.name}`);
          }
        }
      },
    };
  }),
});

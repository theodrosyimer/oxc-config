/**
 * Disallows single element style arrays. Ported from eslint-plugin-react-native
 * v5.0.0 `lib/rules/no-single-element-style-arrays.js` (MIT, see ../LICENSE).
 */
import { defineRule } from "@oxlint/plugins";

export default defineRule({
  meta: {
    docs: {
      description:
        "Disallow single element style arrays. These cause unnecessary re-renders as the identity of the array always changes",
      category: "Stylistic Issues",
      recommended: false,
      url: "",
    },
    fixable: "code",
  },
  createOnce(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "style") return;
        if (!node.value.expression) return;
        if (node.value.expression.type !== "ArrayExpression") return;
        if (node.value.expression.elements.length !== 1) return;

        context.report({
          node,
          message: "Single element style arrays are not necessary and cause unnecessary re-renders",
          fix(fixer) {
            const realStyleNode = node.value.expression.elements[0];
            const styleSource = context.sourceCode.getText(realStyleNode);

            return fixer.replaceText(node.value.expression, styleSource);
          },
        });
      },
    };
  },
});

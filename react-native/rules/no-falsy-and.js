/**
 * Reports `{value && <Element />}` as a JSX child when `value` is not a
 * boolean: React Native renders "" or 0 as text outside <Text> and crashes.
 * Source: vercel-react-native-skills `rules/rendering-no-falsy-and.md`.
 */
import { defineRule } from "@oxlint/plugins";

const COMPARISONS = new Set(["==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof"]);

/** An operand whose value is always true or false. */
const isBoolean = (node) => {
  switch (node.type) {
    case "UnaryExpression":
      return node.operator === "!";
    case "BinaryExpression":
      return COMPARISONS.has(node.operator);
    case "Literal":
      return typeof node.value === "boolean";
    case "CallExpression":
      return node.callee.type === "Identifier" && node.callee.name === "Boolean";
    case "LogicalExpression":
      return isBoolean(node.left) && isBoolean(node.right);
    default:
      return false;
  }
};

/** The `&&` operands before the rendered element: `a && b && <X />` → a, b. */
const conditions = (node) =>
  node.left.type === "LogicalExpression" && node.left.operator === "&&"
    ? [...conditions(node.left), node.left.right]
    : [node.left];

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow `value && <Element />` children whose condition is not a boolean",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      LogicalExpression(node) {
        if (node.operator !== "&&") return;
        if (node.parent.type !== "JSXExpressionContainer") return;

        const owner = node.parent.parent;

        if (owner.type !== "JSXElement" && owner.type !== "JSXFragment") return;

        for (const operand of conditions(node)) {
          if (isBoolean(operand)) {
            continue;
          }

          const text = context.sourceCode.getText(operand);

          context.report({
            node: operand,
            message: `\`${text} && …\` renders \`${text}\` itself when it is "" or 0, and React Native crashes on text outside <Text>. Fix: make the condition a boolean — \`{!!${text} && …}\` or \`{${text} ? … : null}\`.`,
          });
        }
      },
    };
  },
});

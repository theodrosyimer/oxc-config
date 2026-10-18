/**
 * Reports class names built from a value at runtime (`bg-${color}-500`,
 * `'bg-' + color`): Uniwind resolves class names at build time, so the class
 * never applies. Source: uniwind `SKILL.md`, Critical Rule 2 ("Never construct
 * classNames dynamically … `bg-${color}-500` will NOT work").
 */
import { defineRule } from "@oxlint/plugins";

import { isClassNameAttribute } from "../class-name-strings.js";

const touchesBefore = (text) => text.length > 0 && !/\s$/.test(text);
const touchesAfter = (text) => text.length > 0 && !/^\s/.test(text);

/** A template literal with an interpolation glued to a class-name fragment. */
const isGluedTemplate = (node) =>
  node.expressions.some(
    (_, index) =>
      touchesBefore(node.quasis[index].value.cooked ?? "") ||
      touchesAfter(node.quasis[index + 1].value.cooked ?? ""),
  );

const isStringLiteral = (node) => node.type === "Literal" && typeof node.value === "string";

/** `'bg-' + color` or `color + '-500'`: a string glued to a runtime value. */
const isGluedConcatenation = (node) =>
  node.operator === "+" &&
  ((isStringLiteral(node.left) && !isStringLiteral(node.right) && touchesBefore(node.left.value)) ||
    (isStringLiteral(node.right) && !isStringLiteral(node.left) && touchesAfter(node.right.value)));

/** Every glued fragment inside a class-name expression. */
const gluedFragments = (node) => {
  if (!node) {
    return [];
  }

  switch (node.type) {
    case "JSXExpressionContainer":
      return gluedFragments(node.expression);
    case "TemplateLiteral":
      return isGluedTemplate(node) ? [node] : node.expressions.flatMap(gluedFragments);
    case "BinaryExpression":
      return isGluedConcatenation(node)
        ? [node]
        : [...gluedFragments(node.left), ...gluedFragments(node.right)];
    case "ConditionalExpression":
      return [...gluedFragments(node.consequent), ...gluedFragments(node.alternate)];
    case "LogicalExpression":
      return [...gluedFragments(node.left), ...gluedFragments(node.right)];
    case "ArrayExpression":
      return node.elements.flatMap(gluedFragments);
    case "CallExpression":
      return node.arguments.flatMap(gluedFragments);
    default:
      return [];
  }
};

/** The glued class name itself: the token of the template around the value. */
const fragmentText = (node, sourceCode) => {
  const text = sourceCode.getText(node);

  if (node.type !== "TemplateLiteral") {
    return text;
  }

  const inner = text.substring(1, text.length - 1).trim();
  const tokens = inner.split(/\s+(?![^{]*\})/);

  return tokens.find((token) => token.includes("${")) ?? inner;
};

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow class names built from a value at runtime",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      JSXAttribute(node) {
        if (!isClassNameAttribute(node)) return;

        for (const fragment of gluedFragments(node.value)) {
          context.report({
            node: fragment,
            message: `\`${fragmentText(fragment, context.sourceCode)}\` builds a class name from a value at runtime; Uniwind only sees complete class names written in the source, so this class never applies. Fix: write each complete class and choose between them — \`{isError ? "bg-status-error-bg" : "bg-surface-default"}\`, or a map of complete strings.`,
          });
        }
      },
    };
  },
});

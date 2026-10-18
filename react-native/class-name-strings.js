/**
 * Helpers for rules that read Uniwind class names: which JSX attributes hold
 * class names, and the string pieces an attribute value is built from.
 */

/** `className` and every `*ClassName` prop (`contentContainerClassName`, …). */
export const isClassNameAttribute = (node) =>
  node.name.type === "JSXIdentifier" && /^(className|[a-z]\w*ClassName)$/.test(node.name.name);

/**
 * Every static string piece of a class-name expression, with the node it sits
 * in: string literals, template-literal quasis, and the strings inside
 * conditionals, logical expressions, arrays and call arguments (`cn(...)`).
 * @returns {Array<{ text: string, node: object }>}
 */
export const collectClassNameStrings = (node) => {
  if (!node) {
    return [];
  }

  switch (node.type) {
    case "Literal":
      return typeof node.value === "string" ? [{ text: node.value, node }] : [];
    case "JSXExpressionContainer":
      return collectClassNameStrings(node.expression);
    case "TemplateLiteral":
      return [
        ...node.quasis.map((quasi) => ({ text: quasi.value.cooked ?? "", node })),
        ...node.expressions.flatMap(collectClassNameStrings),
      ];
    case "ConditionalExpression":
      return [
        ...collectClassNameStrings(node.consequent),
        ...collectClassNameStrings(node.alternate),
      ];
    case "LogicalExpression":
    case "BinaryExpression":
      return [...collectClassNameStrings(node.left), ...collectClassNameStrings(node.right)];
    case "ArrayExpression":
      return node.elements.flatMap(collectClassNameStrings);
    case "CallExpression":
      return node.arguments.flatMap(collectClassNameStrings);
    default:
      return [];
  }
};

/** The class names in a string, without variant prefixes (`dark:`, `ios:`). */
export const splitClassNames = (text) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => cls.substring(cls.lastIndexOf(":") + 1));

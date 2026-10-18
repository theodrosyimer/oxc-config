/**
 * Reports `withUniwind()` called inside a function (a new component on every
 * render), and `withUniwind()` around a react-native or react-native-reanimated
 * component (they already support className; wrapping breaks them).
 * Source: uniwind `SKILL.md`, Critical Rule 7 and "Module-level wrapping
 * (NEVER inside render functions)"; ds__rn-patterns
 * `references/image-patterns.md` ("Wrap once at module level").
 */
import { defineRule } from "@oxlint/plugins";

const BUILT_IN_MODULES = new Set(["react-native", "react-native-reanimated"]);

const isFunction = (node) =>
  node.type === "FunctionDeclaration" ||
  node.type === "FunctionExpression" ||
  node.type === "ArrowFunctionExpression";

const isInsideFunction = (node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (isFunction(current)) {
      return true;
    }
  }

  return false;
};

/** The leftmost identifier of `View` or `Animated.View`. */
const rootIdentifier = (node) => {
  if (node.type === "Identifier") return node;
  if (node.type === "MemberExpression") return rootIdentifier(node.object);

  return undefined;
};

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require withUniwind at module scope, and only around third-party components",
    },
    schema: [],
  },
  createOnce(context) {
    let uniwindNames;
    let importedFrom;

    return {
      before() {
        uniwindNames = new Set();
        importedFrom = new Map();
      },
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          importedFrom.set(specifier.local.name, node.source.value);

          if (
            node.source.value === "uniwind" &&
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === "withUniwind"
          ) {
            uniwindNames.add(specifier.local.name);
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || !uniwindNames.has(node.callee.name)) return;

        if (isInsideFunction(node)) {
          context.report({
            node,
            message:
              "withUniwind() runs inside a function, so it creates a new component on every render. Fix: call it once at the top of the module — `const Image = withUniwind(ExpoImage);` — and use that component.",
          });
        }

        const [wrapped] = node.arguments;
        const root = wrapped && rootIdentifier(wrapped);
        const from = root && importedFrom.get(root.name);

        if (from === undefined || !BUILT_IN_MODULES.has(from)) return;

        const name = context.sourceCode.getText(wrapped);

        context.report({
          node: wrapped,
          message: `\`${name}\` from ${from} already supports className; wrapping it with withUniwind breaks its behavior. Fix: remove withUniwind and pass className to \`${name}\` directly.`,
        });
      },
    };
  },
});

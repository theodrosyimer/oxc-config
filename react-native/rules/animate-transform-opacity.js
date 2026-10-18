/**
 * Reports layout properties in the style a `useAnimatedStyle` callback
 * returns: animating them recalculates layout on every frame.
 * Source: ds__rn-patterns `references/interaction-patterns.md`, "GPU-Accelerated
 * Properties Only" ("Never animate: `width`, `height`, `top`, `left`,
 * `margin`, `padding`" … "Exception: Layout animations via
 * `layout={LinearTransition}`").
 */
import { defineRule } from "@oxlint/plugins";

const isLayoutProperty = (name) =>
  ["width", "height", "top", "left"].includes(name) ||
  name.startsWith("margin") ||
  name.startsWith("padding");

const isFunction = (node) =>
  node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";

/** The objects a worklet returns: its expression body, or its own `return` statements. */
const returnedObjects = (worklet) => {
  if (worklet.body.type === "ObjectExpression") {
    return [worklet.body];
  }

  if (worklet.body.type !== "BlockStatement") {
    return [];
  }

  const found = [];
  const visit = (node) => {
    if (!node || typeof node.type !== "string") return;
    if (node !== worklet.body && isFunction(node)) return;
    if (node.type === "FunctionDeclaration") return;

    if (node.type === "ReturnStatement") {
      if (node.argument && node.argument.type === "ObjectExpression") {
        found.push(node.argument);
      }

      return;
    }

    for (const key of Object.keys(node)) {
      if (key === "parent") continue;

      const value = node[key];

      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  };

  visit(worklet.body);

  return found;
};

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Allow only transform and opacity in useAnimatedStyle",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "useAnimatedStyle") return;

        const [worklet] = node.arguments;

        if (!worklet || !isFunction(worklet)) return;

        for (const style of returnedObjects(worklet)) {
          for (const property of style.properties) {
            if (
              property.type !== "Property" ||
              property.computed ||
              property.key.type !== "Identifier"
            ) {
              continue;
            }

            if (!isLayoutProperty(property.key.name)) {
              continue;
            }

            context.report({
              node: property.key,
              message: `\`${property.key.name}\` is animated, which recalculates layout on every frame. Fix: animate \`transform\` (translateX, translateY, scale, rotate) or \`opacity\` instead; for a size change, use a layout animation — \`layout={LinearTransition}\`.`,
            });
          }
        }
      },
    };
  },
});

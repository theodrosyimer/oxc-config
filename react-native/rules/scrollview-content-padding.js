/**
 * Reports padding classes in a ScrollView's own `className`: the padding
 * clips the content at the edges; it belongs on the content container.
 * Source: ds__rn-patterns `references/layout-patterns.md`, "ScrollView
 * Patterns" ("Padding goes on `contentContainerStyle`, NOT the ScrollView
 * itself (avoids clipping)").
 */
import { defineRule } from "@oxlint/plugins";

import { collectClassNameStrings, splitClassNames } from "../class-name-strings.js";

const SCROLL_VIEWS = new Set(["ScrollView", "Animated.ScrollView"]);
const PADDING = /^p[xytrblse]?-/;

const elementName = (name) =>
  name.type === "JSXMemberExpression"
    ? `${elementName(name.object)}.${name.property.name}`
    : name.name;

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require ScrollView padding on contentContainerClassName",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "className") return;
        if (!SCROLL_VIEWS.has(elementName(node.parent.name))) return;

        for (const { text, node: piece } of collectClassNameStrings(node.value)) {
          for (const cls of splitClassNames(text)) {
            if (!PADDING.test(cls)) {
              continue;
            }

            context.report({
              node: piece,
              message: `Padding \`${cls}\` on the ScrollView itself clips its content at the edges. Fix: move it to the content container — \`contentContainerClassName="${cls}"\`.`,
            });
          }
        }
      },
    };
  },
});

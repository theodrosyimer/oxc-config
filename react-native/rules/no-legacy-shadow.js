/**
 * Reports the legacy shadow styles `shadowColor`, `shadowOffset`,
 * `shadowOpacity`, `shadowRadius` and `elevation` in style objects.
 * Source: vercel-react-native-skills `rules/ui-styling.md` ("Use CSS
 * `boxShadow` string syntax for shadows"); ds__rn-patterns `SKILL.md`
 * ("`boxShadow` CSS prop / Legacy shadowColor/shadowOffset/elevation").
 */
import { defineRule } from "@oxlint/plugins";

const LEGACY = new Set([
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "elevation",
]);

const keyName = (property) =>
  property.key.type === "Identifier" ? property.key.name : String(property.key.value);

/** A style prop: `style`, or any `*Style` prop (`contentContainerStyle`, …). */
const isStyleAttribute = (node) =>
  node.type === "JSXAttribute" &&
  node.name.type === "JSXIdentifier" &&
  /^(style|[a-z]\w*Style)$/.test(node.name.name);

const isCallTo = (node, test) => node.type === "CallExpression" && test(node.callee);

const isStyleSheetCreate = (callee) =>
  callee.type === "MemberExpression" &&
  callee.object.type === "Identifier" &&
  callee.object.name === "StyleSheet" &&
  callee.property.type === "Identifier" &&
  callee.property.name === "create";

const isUseAnimatedStyle = (callee) =>
  callee.type === "Identifier" && callee.name === "useAnimatedStyle";

/** Is this object part of a style: a style prop, StyleSheet.create, or useAnimatedStyle? */
const isStyleObject = (node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (isStyleAttribute(current)) return true;
    if (isCallTo(current, isStyleSheetCreate) || isCallTo(current, isUseAnimatedStyle)) return true;
    if (current.type === "JSXAttribute" || current.type === "Program") return false;
  }

  return false;
};

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Require boxShadow instead of the legacy shadow styles",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      Property(node) {
        if (node.parent.type !== "ObjectExpression") return;
        if (node.computed || !LEGACY.has(keyName(node))) return;
        if (!isStyleObject(node.parent)) return;

        context.report({
          node: node.key,
          message: `\`${keyName(node)}\` is a legacy shadow style. Fix: use one CSS \`boxShadow\` string instead — \`boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"\` — or a className token: shadow-elevation-low, shadow-elevation-medium or shadow-elevation-high.`,
        });
      },
    };
  },
});

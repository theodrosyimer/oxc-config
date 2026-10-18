/**
 * Detects raw text outside of a Text component. Ported from
 * eslint-plugin-react-native v5.0.0 `lib/rules/no-raw-text.js` (MIT, see
 * ../LICENSE).
 */
import { defineRule } from "@oxlint/plugins";

const elementName = (node) => {
  const reversedIdentifiers = [];

  if (node.type === "JSXElement" && node.openingElement.type === "JSXOpeningElement") {
    let object = node.openingElement.name;

    while (object.type === "JSXMemberExpression") {
      if (object.property.type === "JSXIdentifier") {
        reversedIdentifiers.push(object.property.name);
      }

      object = object.object;
    }

    if (object.type === "JSXIdentifier") {
      reversedIdentifiers.push(object.name);
    }
  }

  return reversedIdentifiers.reverse().join(".");
};

const hasAllowedParent = (parent, allowedElements) => {
  let current = parent;

  while (current) {
    if (current.type === "JSXElement" && allowedElements.includes(elementName(current))) {
      return true;
    }

    current = current.parent;
  }

  return false;
};

const hasOnlyLineBreak = (value) => /^[\r\n\t\f\v]+$/.test(value.replace(/ /g, ""));

export default defineRule({
  meta: {
    schema: [
      {
        type: "object",
        properties: {
          skip: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  createOnce(context) {
    let allowedElements;

    const report = (node) => {
      const errorValue =
        node.type === "TemplateLiteral"
          ? `TemplateLiteral: ${node.expressions[0].name}`
          : node.value.trim();
      const formattedErrorValue =
        errorValue.length > 0 ? `Raw text (${errorValue})` : "Whitespace(s)";

      context.report({
        node,
        message: `${formattedErrorValue} cannot be used outside of a <Text> tag`,
      });
    };

    const isOutsideText = (node) => !hasAllowedParent(node.parent, allowedElements);

    return {
      before() {
        const options = context.options[0] || {};

        allowedElements = ["Text", "TSpan", "StyledText", "Animated.Text"].concat(
          options.skip ?? [],
        );
      },
      Literal(node) {
        const parentType = node.parent.type;
        const onlyFor = ["JSXExpressionContainer", "JSXElement"];

        if (
          typeof node.value !== "string" ||
          hasOnlyLineBreak(node.value) ||
          !onlyFor.includes(parentType) ||
          (node.parent.parent && node.parent.parent.type === "JSXAttribute")
        )
          return;

        const isStringLiteral = parentType === "JSXExpressionContainer";

        if (isOutsideText(isStringLiteral ? node.parent : node)) {
          report(node);
        }
      },
      JSXText(node) {
        if (typeof node.value !== "string" || hasOnlyLineBreak(node.value)) return;

        if (isOutsideText(node)) {
          report(node);
        }
      },
      TemplateLiteral(node) {
        if (
          node.parent.type !== "JSXExpressionContainer" ||
          (node.parent.parent && node.parent.parent.type === "JSXAttribute")
        )
          return;

        if (isOutsideText(node.parent)) {
          report(node);
        }
      },
    };
  },
});

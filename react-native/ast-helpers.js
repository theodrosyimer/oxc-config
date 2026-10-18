/**
 * AST helpers shared by the StyleSheet rules. Ported from
 * eslint-plugin-react-native v5.0.0 `lib/util/stylesheet.js` (MIT, see
 * ./LICENSE); the behavior is unchanged.
 */

/** The context of the rule that last collected styles; read by getText. */
let currentContext;

const getText = (node) => currentContext.sourceCode.getText(node);

const getStyleSheetObjectNames = (settings) =>
  settings["react-native/style-sheet-object-names"] || ["StyleSheet"];

const chunkProperties = (properties) => {
  const result = [];
  let chunk = [];

  for (const property of properties) {
    if (property.type === "Property") {
      chunk.push(property);
    } else if (chunk.length) {
      result.push(chunk);
      chunk = [];
    }
  }

  if (chunk.length) {
    result.push(chunk);
  }

  return result;
};

export const astHelpers = {
  containsStyleSheetObject(node, objectNames) {
    return Boolean(
      node &&
      node.type === "CallExpression" &&
      node.callee &&
      node.callee.object &&
      node.callee.object.name &&
      objectNames.includes(node.callee.object.name),
    );
  },

  containsCreateCall(node) {
    return Boolean(
      node && node.callee && node.callee.property && node.callee.property.name === "create",
    );
  },

  isStyleSheetDeclaration(node, settings) {
    const objectNames = getStyleSheetObjectNames(settings);

    return Boolean(
      astHelpers.containsStyleSheetObject(node, objectNames) && astHelpers.containsCreateCall(node),
    );
  },

  getStyleSheetName(node) {
    if (node && node.parent && node.parent.id) {
      return node.parent.id.name;
    }

    return undefined;
  },

  getStyleDeclarations(node) {
    if (
      node &&
      node.type === "CallExpression" &&
      node.arguments &&
      node.arguments[0] &&
      node.arguments[0].properties
    ) {
      return node.arguments[0].properties.filter((property) => property.type === "Property");
    }

    return [];
  },

  getStyleDeclarationsChunks(node) {
    if (
      node &&
      node.type === "CallExpression" &&
      node.arguments &&
      node.arguments[0] &&
      node.arguments[0].properties
    ) {
      return chunkProperties(node.arguments[0].properties);
    }

    return [];
  },

  getPropertiesChunks(properties) {
    return chunkProperties(properties);
  },

  getExpressionIdentifier(node) {
    if (!node) {
      return "";
    }

    switch (node.type) {
      case "Identifier":
        return node.name;
      case "Literal":
        return node.value;
      case "TemplateLiteral":
        return node.quasis.reduce(
          (result, quasi, index) =>
            result +
            quasi.value.cooked +
            astHelpers.getExpressionIdentifier(node.expressions[index]),
          "",
        );
      default:
        return "";
    }
  },

  getStylePropertyIdentifier(node) {
    if (node && node.key) {
      return astHelpers.getExpressionIdentifier(node.key);
    }

    return undefined;
  },

  isStyleAttribute(node) {
    return Boolean(
      node.type === "JSXAttribute" &&
      node.name &&
      node.name.name &&
      node.name.name.toLowerCase().includes("style"),
    );
  },

  collectStyleObjectExpressions(node, context) {
    currentContext = context;

    if (astHelpers.hasArrayOfStyleReferences(node)) {
      return astHelpers.collectStyleObjectExpressionFromContainers(node.expression.elements);
    }

    if (node && node.expression) {
      return astHelpers.getStyleObjectExpressionFromNode(node.expression);
    }

    return [];
  },

  collectColorLiterals(node, context) {
    if (!node) {
      return [];
    }

    currentContext = context;

    if (astHelpers.hasArrayOfStyleReferences(node)) {
      return astHelpers.collectColorLiteralsFromContainers(node.expression.elements);
    }

    if (node.type === "ObjectExpression") {
      return astHelpers.getColorLiteralsFromNode(node);
    }

    return astHelpers.getColorLiteralsFromNode(node.expression);
  },

  collectStyleObjectExpressionFromContainers(nodes) {
    return nodes.flatMap((node) => astHelpers.getStyleObjectExpressionFromNode(node));
  },

  collectColorLiteralsFromContainers(nodes) {
    return nodes.flatMap((node) => astHelpers.getColorLiteralsFromNode(node));
  },

  getStyleReferenceFromNode(node) {
    if (!node) {
      return [];
    }

    switch (node.type) {
      case "MemberExpression":
        return [astHelpers.getStyleReferenceFromExpression(node)];
      case "LogicalExpression":
        return [
          ...astHelpers.getStyleReferenceFromNode(node.left),
          ...astHelpers.getStyleReferenceFromNode(node.right),
        ];
      case "ConditionalExpression":
        return [
          ...astHelpers.getStyleReferenceFromNode(node.consequent),
          ...astHelpers.getStyleReferenceFromNode(node.alternate),
        ];
      default:
        return [];
    }
  },

  getStyleObjectExpressionFromNode(node) {
    if (!node) {
      return [];
    }

    switch (node.type) {
      case "ObjectExpression":
        return [astHelpers.getStyleObjectFromExpression(node)];
      case "LogicalExpression":
        return [
          ...astHelpers.getStyleObjectExpressionFromNode(node.left),
          ...astHelpers.getStyleObjectExpressionFromNode(node.right),
        ];
      case "ConditionalExpression":
        return [
          ...astHelpers.getStyleObjectExpressionFromNode(node.consequent),
          ...astHelpers.getStyleObjectExpressionFromNode(node.alternate),
        ];
      default:
        return [];
    }
  },

  getColorLiteralsFromNode(node) {
    if (!node) {
      return [];
    }

    switch (node.type) {
      case "ObjectExpression":
        return [astHelpers.getColorLiteralsFromExpression(node)];
      case "LogicalExpression":
        return [
          ...astHelpers.getColorLiteralsFromNode(node.left),
          ...astHelpers.getColorLiteralsFromNode(node.right),
        ];
      case "ConditionalExpression":
        return [
          ...astHelpers.getColorLiteralsFromNode(node.consequent),
          ...astHelpers.getColorLiteralsFromNode(node.alternate),
        ];
      default:
        return [];
    }
  },

  hasArrayOfStyleReferences(node) {
    return (
      node &&
      Boolean(
        node.type === "JSXExpressionContainer" &&
        node.expression &&
        node.expression.type === "ArrayExpression",
      )
    );
  },

  getStyleReferenceFromExpression(node) {
    const result = [];
    const name = astHelpers.getObjectName(node);

    if (name) {
      result.push(name);
    }

    const property = astHelpers.getPropertyName(node);

    if (property) {
      result.push(property);
    }

    return result.join(".");
  },

  getStyleObjectFromExpression(node) {
    const expression = {};
    let invalid = false;

    if (node.properties && node.properties.length) {
      for (const p of node.properties) {
        if (!p.value || !p.key) {
          continue;
        }

        if (p.value.type === "Literal") {
          invalid = true;
          expression[p.key.name] = p.value.value;
        } else if (p.value.type === "ConditionalExpression") {
          const innerNode = p.value;

          if (innerNode.consequent.type === "Literal" || innerNode.alternate.type === "Literal") {
            invalid = true;
            expression[p.key.name] = getText(innerNode);
          }
        } else if (
          p.value.type === "UnaryExpression" &&
          p.value.operator === "-" &&
          p.value.argument.type === "Literal"
        ) {
          invalid = true;
          expression[p.key.name] = -1 * p.value.argument.value;
        } else if (
          p.value.type === "UnaryExpression" &&
          p.value.operator === "+" &&
          p.value.argument.type === "Literal"
        ) {
          invalid = true;
          expression[p.key.name] = p.value.argument.value;
        }
      }
    }

    return invalid ? { expression, node } : undefined;
  },

  getColorLiteralsFromExpression(node) {
    const expression = {};
    let invalid = false;

    if (node.properties && node.properties.length) {
      for (const p of node.properties) {
        if (!(p.key && p.key.name && p.key.name.toLowerCase().includes("color"))) {
          continue;
        }

        if (p.value.type === "Literal") {
          invalid = true;
          expression[p.key.name] = p.value.value;
        } else if (p.value.type === "ConditionalExpression") {
          const innerNode = p.value;

          if (innerNode.consequent.type === "Literal" || innerNode.alternate.type === "Literal") {
            invalid = true;
            expression[p.key.name] = getText(innerNode);
          }
        }
      }
    }

    return invalid ? { expression, node } : undefined;
  },

  getObjectName(node) {
    if (node && node.object && node.object.name) {
      return node.object.name;
    }

    return undefined;
  },

  getPropertyName(node) {
    if (node && node.property && node.property.name) {
      return node.property.name;
    }

    return undefined;
  },

  getPotentialStyleReferenceFromMemberExpression(node) {
    if (
      node &&
      node.object &&
      node.object.type === "Identifier" &&
      node.object.name &&
      node.property &&
      node.property.type === "Identifier" &&
      node.property.name &&
      node.parent.type !== "MemberExpression"
    ) {
      return [node.object.name, node.property.name].join(".");
    }

    return undefined;
  },

  isEitherShortHand(property1, property2) {
    const shorthands = ["margin", "padding", "border", "flex"];

    if (shorthands.includes(property1)) {
      return property2.startsWith(property1);
    }

    if (shorthands.includes(property2)) {
      return property1.startsWith(property2);
    }

    return false;
  },
};

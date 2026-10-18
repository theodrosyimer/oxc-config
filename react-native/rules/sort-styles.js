/**
 * Requires StyleSheet object keys to be sorted. Ported from
 * eslint-plugin-react-native v5.0.0 `lib/rules/sort-styles.js` (MIT, see
 * ../LICENSE).
 */
import { defineRule } from "@oxlint/plugins";

import { astHelpers } from "../ast-helpers.js";

export default defineRule({
  meta: {
    fixable: "code",
    schema: [
      {
        enum: ["asc", "desc"],
      },
      {
        type: "object",
        properties: {
          ignoreClassNames: {
            type: "boolean",
          },
          ignoreStyleProperties: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  createOnce(context) {
    let order;
    let ignoreClassNames;
    let ignoreStyleProperties;
    let isValidOrder;
    let sourceCode;

    // Code-unit comparison with `<`/`>`, as upstream: never a locale collation.
    const sort = (array) =>
      [...array].sort((a, b) => {
        const identifierA = astHelpers.getStylePropertyIdentifier(a);
        const identifierB = astHelpers.getStylePropertyIdentifier(b);

        if (astHelpers.isEitherShortHand(identifierA, identifierB)) {
          return a.range[0] - b.range[0];
        }

        const sortOrder = identifierA < identifierB ? -1 : identifierA > identifierB ? 1 : 0;

        return sortOrder * (order === "asc" ? 1 : -1);
      });

    const report = (array, type, node, prev, current) => {
      const currentName = astHelpers.getStylePropertyIdentifier(current);
      const prevName = astHelpers.getStylePropertyIdentifier(prev);
      const hasComments = array.some(
        (prop) =>
          sourceCode.getCommentsBefore(prop).length + sourceCode.getCommentsAfter(prop).length > 0,
      );

      context.report({
        node,
        message: `Expected ${type} to be in ${order}ending order. '${currentName}' should be before '${prevName}'.`,
        loc: current.key.loc,
        fix: hasComments
          ? undefined
          : (fixer) => {
              const sortedArray = sort(array);

              return array
                .map((item, i) =>
                  item === sortedArray[i]
                    ? null
                    : fixer.replaceText(item, sourceCode.getText(sortedArray[i])),
                )
                .filter(Boolean);
            },
      });
    };

    const checkIsSorted = (array, arrayName, node) => {
      let previous;

      for (const current of array) {
        if (previous === undefined) {
          previous = current;
          continue;
        }

        if (previous.type !== "Property" || current.type !== "Property") {
          return;
        }

        const prevName = astHelpers.getStylePropertyIdentifier(previous);
        const currentName = astHelpers.getStylePropertyIdentifier(current);
        const oneIsShorthandForTheOther =
          arrayName === "style properties" && astHelpers.isEitherShortHand(prevName, currentName);

        if (!oneIsShorthandForTheOther && !isValidOrder(prevName, currentName)) {
          report(array, arrayName, node, previous, current);

          return;
        }

        previous = current;
      }
    };

    return {
      before() {
        order = context.options[0] || "asc";
        ({ ignoreClassNames, ignoreStyleProperties } = context.options[1] || {});
        isValidOrder = order === "asc" ? (a, b) => a <= b : (a, b) => a >= b;
        ({ sourceCode } = context);
      },
      CallExpression(node) {
        if (!astHelpers.isStyleSheetDeclaration(node, context.settings)) {
          return;
        }

        const classDefinitionsChunks = astHelpers.getStyleDeclarationsChunks(node);

        if (!ignoreClassNames) {
          for (const classDefinitions of classDefinitionsChunks) {
            checkIsSorted(classDefinitions, "class names", node);
          }
        }

        if (ignoreStyleProperties) return;

        for (const classDefinitions of classDefinitionsChunks) {
          for (const classDefinition of classDefinitions) {
            const styleProperties = classDefinition.value.properties;

            if (!styleProperties || styleProperties.length < 2) {
              continue;
            }

            for (const stylePropertyChunk of astHelpers.getPropertiesChunks(styleProperties)) {
              checkIsSorted(stylePropertyChunk, "style properties", node);
            }
          }
        }
      },
    };
  },
});

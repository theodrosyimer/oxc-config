/**
 * Android and iOS components must be used in platform-specific files. Ported
 * from eslint-plugin-react-native v5.0.0 `lib/rules/split-platform-components.js`
 * (MIT, see ../LICENSE).
 */
import { defineRule } from "@oxlint/plugins";

const androidMessage = "Android components should be placed in android files";
const iosMessage = "IOS components should be placed in ios files";
const conflictMessage = "IOS and Android components can't be mixed";

const getName = (node) => {
  if (node.type === "Property") {
    const key = node.key || node.argument;

    return key.type === "Identifier" ? key.name : key.value;
  }

  if (node.type === "Identifier") {
    return node.name;
  }

  return undefined;
};

const hasNodeWithName = (nodes, name) =>
  nodes.some((node) => {
    const nodeName = getName(node);

    return nodeName && nodeName.includes(name);
  });

export default defineRule({
  meta: {
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          androidPathRegex: {
            type: "string",
          },
          iosPathRegex: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  createOnce(context) {
    let iosPathRegex;
    let androidPathRegex;
    let reactComponents;

    const reportErrors = (components, filename) => {
      const containsAndroidAndIOS =
        hasNodeWithName(components, "IOS") && hasNodeWithName(components, "Android");

      for (const node of components) {
        const propName = getName(node);

        if (propName.includes("IOS") && !iosPathRegex.test(filename)) {
          context.report(node, containsAndroidAndIOS ? conflictMessage : iosMessage);
        }

        if (propName.includes("Android") && !androidPathRegex.test(filename)) {
          context.report(node, containsAndroidAndIOS ? conflictMessage : androidMessage);
        }
      }
    };

    return {
      before() {
        const options = context.options[0];

        iosPathRegex = options?.iosPathRegex
          ? new RegExp(options.iosPathRegex)
          : /\.ios\.[j|t]sx?$/;
        androidPathRegex = options?.androidPathRegex
          ? new RegExp(options.androidPathRegex)
          : /\.android\.[j|t]sx?$/;
        reactComponents = [];
      },
      VariableDeclarator(node) {
        const destructuring = node.init && node.id && node.id.type === "ObjectPattern";
        const statelessDestructuring = destructuring && node.init.name === "React";

        if (destructuring && statelessDestructuring) {
          reactComponents = reactComponents.concat(node.id.properties);
        }
      },
      ImportDeclaration(node) {
        if (node.source.value !== "react-native") {
          return;
        }

        for (const importSpecifier of node.specifiers) {
          if (importSpecifier.type === "ImportSpecifier") {
            reactComponents = reactComponents.concat(importSpecifier.imported);
          }
        }
      },
      "Program:exit"() {
        reportErrors(reactComponents, context.filename);
      },
    };
  },
});

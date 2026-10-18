/**
 * React component detection, used by `no-unused-styles` to report only in
 * files that declare a component. Ported from eslint-plugin-react-native
 * v5.0.0 `lib/util/Components.js` (MIT, see ./LICENSE); the behavior is
 * unchanged. Only the detection the rules use is kept: the upstream
 * `getRelatedComponent`, `set` and `length` have no caller.
 */

/** Confidence: 0 = banned, 1 = maybe, 2 = yes. */
class Components {
  list = {};

  getId(node) {
    return node && node.range.join(":");
  }

  /**
   * Adds a node to the list, or updates its confidence.
   * @param {object} node
   * @param {number} confidence
   */
  add(node, confidence) {
    const id = this.getId(node);
    const known = this.list[id];

    if (known) {
      known.confidence =
        confidence === 0 || known.confidence === 0 ? 0 : Math.max(known.confidence, confidence);

      return;
    }

    this.list[id] = { node, confidence };
  }

  /** The components detected with confidence 2. */
  all() {
    return Object.fromEntries(
      Object.entries(this.list).filter(([, component]) => component.confidence >= 2),
    );
  }
}

/**
 * Wraps a rule's `createOnce` so it can read the components detected in the
 * current file, with the detection visitors merged into the rule's own.
 * `getComponents` returns the current file's list: it is reset in `before`.
 * @param {(context: object, getComponents: () => Components) => object} rule
 */
export const detectComponents = (rule) => (context) => {
  let components;
  const getText = (node) => context.sourceCode.getText(node);
  const getScope = (node) => context.sourceCode.getScope(node);

  const isES5Component = (node) =>
    Boolean(node.parent) && /^(React\.)?createClass$/.test(getText(node.parent.callee));

  const isES6Component = (node) =>
    Boolean(node.superClass) && /^(React\.)?(Pure)?Component$/.test(getText(node.superClass));

  const isReturningJSX = (node) => {
    const property = { ReturnStatement: "argument", ArrowFunctionExpression: "body" }[node.type];

    if (property === undefined) {
      return false;
    }

    const value = node[property];
    const returnsJSX = value && (value.type === "JSXElement" || value.type === "JSXFragment");
    const returnsCreateElement =
      value &&
      value.callee &&
      value.callee.property &&
      value.callee.property.name === "createElement";

    return Boolean(returnsJSX || returnsCreateElement);
  };

  const getParentES5Component = (node) => {
    let scope = getScope(node);

    while (scope) {
      const candidate = scope.block && scope.block.parent && scope.block.parent.parent;

      if (candidate && isES5Component(candidate)) {
        return candidate;
      }

      scope = scope.upper;
    }

    return null;
  };

  const getParentES6Component = (node) => {
    let scope = getScope(node);

    while (scope && scope.type !== "class") {
      scope = scope.upper;
    }

    const candidate = scope && scope.block;

    if (!candidate || !isES6Component(candidate)) {
      return null;
    }

    return candidate;
  };

  const getParentStatelessComponent = (node) => {
    let scope = getScope(node);

    while (scope) {
      const candidate = scope.block;
      const isFunction = /Function/.test(candidate.type);
      const isNotMethod = !candidate.parent || candidate.parent.type !== "MethodDefinition";
      const isNotArgument = !candidate.parent || candidate.parent.type !== "CallExpression";

      if (isFunction && isNotMethod && isNotArgument) {
        return candidate;
      }

      scope = scope.upper;
    }

    return null;
  };

  const getParentComponent = (node) =>
    getParentES6Component(node) || getParentES5Component(node) || getParentStatelessComponent(node);

  const addParent = (confidence) => (node) => {
    const parent = getParentComponent(node);

    if (!parent) {
      return;
    }

    components.add(parent, confidence);
  };

  const detection = {
    ClassDeclaration(node) {
      if (!isES6Component(node)) {
        return;
      }

      components.add(node, 2);
    },
    ClassProperty: addParent(2),
    ObjectExpression(node) {
      if (!isES5Component(node)) {
        return;
      }

      components.add(node, 2);
    },
    FunctionExpression: addParent(1),
    FunctionDeclaration: addParent(1),
    ArrowFunctionExpression(node) {
      const parent = getParentComponent(node);

      if (!parent) {
        return;
      }

      components.add(parent, parent.expression && isReturningJSX(parent) ? 2 : 1);
    },
    ThisExpression(node) {
      const parent = getParentComponent(node);

      if (!parent || !/Function/.test(parent.type)) {
        return;
      }

      // Ban functions with a ThisExpression
      components.add(parent, 0);
    },
    ReturnStatement(node) {
      if (!isReturningJSX(node)) {
        return;
      }

      const parent = getParentComponent(node);

      if (!parent) {
        return;
      }

      components.add(parent, 2);
    },
  };

  const visitors = rule(context, () => components);
  const merged = {
    ...visitors,
    before() {
      components = new Components();

      return visitors.before ? visitors.before() : undefined;
    },
  };

  for (const [type, detect] of Object.entries(detection)) {
    merged[type] = (node) => {
      detect(node);

      return visitors[type] ? visitors[type](node) : undefined;
    };
  }

  return merged;
};

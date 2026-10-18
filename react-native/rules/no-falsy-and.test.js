import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./no-falsy-and.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const message = (operand) =>
  `\`${operand} && …\` renders \`${operand}\` itself when it is "" or 0, and React Native crashes on text outside <Text>. Fix: make the condition a boolean — \`{!!${operand} && …}\` or \`{${operand} ? … : null}\`.`;

ruleTester.run("no-falsy-and", rule, {
  valid: [
    "<View>{!!name && <Text>{name}</Text>}</View>",
    "<View>{name ? <Text>{name}</Text> : null}</View>",
    "<View>{Boolean(name) && <Text>{name}</Text>}</View>",
    "<View>{count > 0 && <Text>{count}</Text>}</View>",
    "<View>{name !== '' && <Text>{name}</Text>}</View>",
    "<View>{!hidden && <Text>shown</Text>}</View>",
    "<View>{!!a && b > 1 && <Text>both</Text>}</View>",
    // Not a JSX child: a prop value or a plain expression.
    "<View visible={name && ready} />",
    "const visible = name && ready;",
  ],
  invalid: [
    {
      code: "<View>{name && <Text>{name}</Text>}</View>",
      errors: [{ message: message("name") }],
    },
    {
      code: "<View>{items.length && <List items={items} />}</View>",
      errors: [{ message: message("items.length") }],
    },
    {
      code: "<>{count && <Text>{count} items</Text>}</>",
      errors: [{ message: message("count") }],
    },
    {
      code: "<View>{!!ready && name && <Text>{name}</Text>}</View>",
      errors: [{ message: message("name") }],
    },
  ],
});

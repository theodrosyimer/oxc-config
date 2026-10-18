import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./no-dynamic-classnames.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const message = (fragment) =>
  `\`${fragment}\` builds a class name from a value at runtime; Uniwind only sees complete class names written in the source, so this class never applies. Fix: write each complete class and choose between them — \`{isError ? "bg-status-error-bg" : "bg-surface-default"}\`, or a map of complete strings.`;

ruleTester.run("no-dynamic-classnames", rule, {
  valid: [
    '<View className="bg-surface-default" />',
    "<View className={isError ? 'bg-status-error-bg' : 'bg-surface-default'} />",
    // A whole class chosen at runtime, separated by spaces, is complete.
    "<View className={`flex-1 ${isError ? 'bg-status-error-bg' : ''} px-component-md`} />",
    "<View className={`${base} ${extra}`} />",
    "<View className={'flex-1 ' + extra} />",
    "<View className={cn('flex-1', variants[size])} />",
  ],
  invalid: [
    {
      code: "<View className={`bg-${color}-500`} />",
      errors: [{ message: message("bg-${color}-500") }],
    },
    {
      code: "<Text className={`text-${size}`} />",
      errors: [{ message: message("text-${size}") }],
    },
    {
      code: "<View contentContainerClassName={`flex-1 gap-${gap}`} />",
      errors: [{ message: message("gap-${gap}") }],
    },
    {
      code: "<View className={'bg-' + color} />",
      errors: [{ message: message("'bg-' + color") }],
    },
    {
      code: "<View className={cn('flex-1', `p-${space}`)} />",
      errors: [{ message: message("p-${space}") }],
    },
  ],
});

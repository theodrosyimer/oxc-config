import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./scrollview-content-padding.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const message = (cls) =>
  `Padding \`${cls}\` on the ScrollView itself clips its content at the edges. Fix: move it to the content container — \`contentContainerClassName="${cls}"\`.`;

ruleTester.run("scrollview-content-padding", rule, {
  valid: [
    '<ScrollView className="flex-1 bg-surface-default" contentContainerClassName="px-component-md py-component-md" />',
    '<Animated.ScrollView className="flex-1" contentContainerClassName="pb-safe" />',
    // Padding on other components is fine.
    '<View className="px-component-md" />',
  ],
  invalid: [
    {
      code: '<ScrollView className="flex-1 bg-surface-default px-component-md">{children}</ScrollView>',
      errors: [{ message: message("px-component-md") }],
    },
    {
      code: '<Animated.ScrollView className="pt-safe py-component-lg" />',
      errors: [{ message: message("pt-safe") }, { message: message("py-component-lg") }],
    },
    {
      code: "<ScrollView className={isWide ? 'p-component-md' : 'flex-1'} />",
      errors: [{ message: message("p-component-md") }],
    },
  ],
});

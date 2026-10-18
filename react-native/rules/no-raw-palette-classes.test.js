import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./no-raw-palette-classes.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const prefix = (cls) =>
  `\`${cls}\` is a raw design value, not a token from the rn-patterns Token Vocabulary. Fix: `;
const background = (cls) =>
  `${prefix(cls)}use a surface, action or status token — bg-surface-default, bg-surface-raised, bg-surface-overlay, bg-surface-sunken, bg-action-primary, bg-action-secondary, bg-action-ghost or bg-status-error-bg.`;
const text = (cls) =>
  `${prefix(cls)}use a content or status token — text-content-primary, text-content-secondary, text-content-tertiary, text-content-disabled, text-content-on-action, text-status-error-text or text-status-success-text.`;
const border = (cls) =>
  `${prefix(cls)}use a border token — border-default, border-subtle, border-strong, border-focus or border-status-error-border.`;
const padding = (cls) =>
  `${prefix(cls)}use a spacing token — px-component-sm, px-component-md, px-component-lg, py-component-sm, py-component-md or py-component-lg.`;
const margin = (cls) =>
  `${prefix(cls)}space siblings with a gap token on their parent — gap-inline-xs, gap-inline-sm, gap-inline-md, gap-layout-sm, gap-layout-md or gap-layout-xl.`;
const gap = (cls) =>
  `${prefix(cls)}use a gap token — gap-inline-xs, gap-inline-sm, gap-inline-md, gap-layout-sm, gap-layout-md or gap-layout-xl.`;
const shadow = (cls) =>
  `${prefix(cls)}use an elevation token — shadow-elevation-low, shadow-elevation-medium or shadow-elevation-high.`;
const color = (cls) => `${prefix(cls)}use a semantic color token from the Token Vocabulary.`;

ruleTester.run("no-raw-palette-classes", rule, {
  valid: [
    '<View className="bg-surface-default px-component-md gap-layout-md rounded-lg flex-1" />',
    '<Text className="text-content-primary text-lg font-semibold text-center" />',
    '<View className="border border-default border-2 shadow-elevation-low" />',
    '<View className="dark:bg-surface-raised active:bg-action-primary-active" />',
    '<ScrollView contentContainerClassName="py-component-lg gap-inline-sm" />',
    '<View className={cn("bg-surface-default", isError && "bg-status-error-bg")} />',
    // Not a className prop.
    '<View accessibilityLabel="bg-blue-500" />',
  ],
  invalid: [
    {
      code: '<View className="bg-white p-4" />',
      errors: [{ message: background("bg-white") }, { message: padding("p-4") }],
    },
    {
      code: '<Text className="text-foreground text-blue-500" />',
      errors: [{ message: text("text-foreground") }, { message: text("text-blue-500") }],
    },
    {
      code: '<View className="border-border bg-card bg-primary" />',
      errors: [
        { message: border("border-border") },
        { message: background("bg-card") },
        { message: background("bg-primary") },
      ],
    },
    {
      code: '<View className="shadow-lg mt-2 gap-4" />',
      errors: [
        { message: shadow("shadow-lg") },
        { message: margin("mt-2") },
        { message: gap("gap-4") },
      ],
    },
    {
      code: '<View className="dark:bg-blue-500 bg-[#fff] ring-red-500" />',
      errors: [
        { message: background("bg-blue-500") },
        { message: background("bg-[#fff]") },
        { message: color("ring-red-500") },
      ],
    },
    {
      code: "<View contentContainerClassName={isOpen ? 'px-2' : 'px-component-md'} />",
      errors: [{ message: padding("px-2") }],
    },
    {
      code: "<View className={`bg-surface-default ${isError ? 'bg-red-100' : ''}`} />",
      errors: [{ message: background("bg-red-100") }],
    },
  ],
});

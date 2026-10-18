import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./no-legacy-shadow.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const message = (prop) =>
  `\`${prop}\` is a legacy shadow style. Fix: use one CSS \`boxShadow\` string instead — \`boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"\` — or a className token: shadow-elevation-low, shadow-elevation-medium or shadow-elevation-high.`;

ruleTester.run("no-legacy-shadow", rule, {
  valid: [
    '<View style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }} />',
    "const styles = StyleSheet.create({ card: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } });",
    // Not a style object.
    "const settings = { elevation: 4 };",
    "<Map camera={{ elevation: 4 }} />",
  ],
  invalid: [
    {
      code: '<View style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 }} />',
      errors: [
        { message: message("shadowColor") },
        { message: message("shadowOffset") },
        { message: message("shadowOpacity") },
      ],
    },
    {
      code: "<View style={[styles.card, { elevation: 4 }]} />",
      errors: [{ message: message("elevation") }],
    },
    {
      code: "const styles = StyleSheet.create({ card: { shadowRadius: 8, elevation: 2 } });",
      errors: [{ message: message("shadowRadius") }, { message: message("elevation") }],
    },
    {
      code: "<FlatList contentContainerStyle={{ shadowColor: 'black' }} />",
      errors: [{ message: message("shadowColor") }],
    },
    {
      code: "const style = useAnimatedStyle(() => ({ shadowOpacity: progress.get() }));",
      errors: [{ message: message("shadowOpacity") }],
    },
  ],
});

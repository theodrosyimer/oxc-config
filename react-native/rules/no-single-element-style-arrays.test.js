// Test cases ported verbatim from eslint-plugin-react-native v5.0.0,
// tests/lib/rules/no-single-element-style-arrays.js (MIT, Copyright (c) 2015 Tom Hastjarjanto);
// only the test harness changed: Oxlint's RuleTester under Vitest.
/**
 * @fileoverview Enforce no single element style arrays
 * @author Michael Gall
 */

/* eslint-disable quotes */ // For better readability on tests involving quotes

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";
import rule from "./no-single-element-style-arrays.js";

RuleTester.describe = describe;
RuleTester.it = it;

const unnecessaryArrayMessage =
  "Single element style arrays are not necessary and cause unnecessary re-renders";

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------
const config = {
  settings: {
    "react-native/style-sheet-object-names": ["StyleSheet", "OtherStyleSheet"],
  },
};

const ruleTester = new RuleTester({
  eslintCompat: true,
  languageOptions: { parserOptions: { lang: "jsx", ecmaFeatures: { jsx: true } } },
});
const tests = {
  valid: [
    {
      code: `
      const Hello = React.createClass({
        render: function() {
          return <App {...props}>foo</App>;
        }
      });
    `,
    },
    {
      code: "<App>foo</App>",
    },
    {
      code: "<App style={woop}>foo</App>",
    },
    {
      code: '<App style={{woop: "woop"}}>foo</App>',
    },
    {
      code: "<App style={[woope, wap]}>foo</App>",
    },
    {
      code: '<App className="asdf" style={woop}>foo</App>',
    },
  ],

  invalid: [
    {
      code: "<App style={[woop]}>foo</App>",
      output: "<App style={woop}>foo</App>",
      errors: [{ message: unnecessaryArrayMessage }],
    },
    {
      code: '<App style={[{woop: "woop"}]}>foo</App>',
      output: '<App style={{woop: "woop"}}>foo</App>',
      errors: [{ message: unnecessaryArrayMessage }],
    },
  ],
};

tests.valid.forEach((t) => Object.assign(t, config));
tests.invalid.forEach((t) => Object.assign(t, config));

ruleTester.run("single-element-style-array", rule, tests);

// Test cases ported verbatim from eslint-plugin-react-native v5.0.0,
// tests/lib/rules/split-platform-components.js (MIT, Copyright (c) 2015 Tom Hastjarjanto);
// only the test harness changed: Oxlint's RuleTester under Vitest.
/**
 * @fileoverview Android and IOS components should be
 * used in platform specific React Native components.
 * @author Tom Hastjarjanto
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";
import rule from "./split-platform-components.js";

RuleTester.describe = describe;
RuleTester.it = it;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const noFixAsNull = () =>
  tests.invalid.forEach((t) => {
    if (t.output === t.code) t.output = null;
  });

const ruleTester = new RuleTester({
  eslintCompat: true,
  languageOptions: { parserOptions: { lang: "jsx", ecmaFeatures: { jsx: true } } },
});
const tests = {
  valid: [
    {
      code: `
      const React = require('react-native');
      const {
        ActivityIndicatiorIOS,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <ActivityIndicatiorIOS />;
        }
      });
    `,
      filename: "Hello.ios.js",
    },
    {
      code: `
      const React = require('react-native');
      const {
        ProgressBarAndroid,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <ProgressBarAndroid />;
        }
      });
    `,
      filename: "Hello.android.js",
    },
    {
      code: `
      const React = require('react-native');
      const {
        View,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <View />;
        }
      });
    `,
      filename: "Hello.js",
    },
    {
      code: `
      import {
        ActivityIndicatiorIOS,
      } from 'react-native'
    `,
      filename: "Hello.ios.js",
    },
    {
      code: `
      import {
        ProgressBarAndroid,
      } from 'react-native'
    `,
      filename: "Hello.android.js",
    },
    {
      code: `
      import {
        View,
      } from 'react-native'
    `,
      filename: "Hello.js",
    },
    {
      code: `
      const React = require('react-native');
      const {
        ActivityIndicatiorIOS,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <ActivityIndicatiorIOS />;
        }
      });
    `,
      options: [
        {
          iosPathRegex: "\\.ios(\\.test)?\\.js$",
        },
      ],
      filename: "Hello.ios.test.js",
    },
    {
      code: `
      const React = require('react-native');
      const {
        ProgressBarAndroid,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <ProgressBarAndroid />;
        }
      });
    `,
      options: [
        {
          androidPathRegex: "\\.android(\\.test)?\\.js$",
        },
      ],
      filename: "Hello.android.test.js",
    },
  ],

  invalid: [
    {
      code: `
      const React = require('react-native');
      const {
        ProgressBarAndroid,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <ProgressBarAndroid />;
        }
      });
    `,
      filename: "Hello.js",
      errors: [
        {
          message: "Android components should be placed in android files",
        },
      ],
    },
    {
      code: `
      const React = require('react-native');
      const {
        ActivityIndicatiorIOS,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <ActivityIndicatiorIOS />;
        }
      });
    `,
      filename: "Hello.js",
      errors: [
        {
          message: "IOS components should be placed in ios files",
        },
      ],
    },
    {
      code: `
      const React = require('react-native');
      const {
        ActivityIndicatiorIOS,
        ProgressBarAndroid,
      } = React
      const Hello = React.createClass({
        render: function() {
          return <ActivityIndicatiorIOS />;
        }
      });
    `,
      filename: "Hello.js",
      errors: [
        {
          message: "IOS and Android components can't be mixed",
        },
        {
          message: "IOS and Android components can't be mixed",
        },
      ],
    },
    {
      code: `
      import {
        ProgressBarAndroid,
      } from 'react-native'
    `,
      filename: "Hello.js",
      errors: [
        {
          message: "Android components should be placed in android files",
        },
      ],
    },
    {
      code: `
      import {
        ActivityIndicatiorIOS,
      } from 'react-native'
    `,
      filename: "Hello.js",
      errors: [
        {
          message: "IOS components should be placed in ios files",
        },
      ],
    },
    {
      code: `
      import {
        ActivityIndicatiorIOS,
        ProgressBarAndroid,
      } from 'react-native'
    `,
      filename: "Hello.js",
      errors: [
        {
          message: "IOS and Android components can't be mixed",
        },
        {
          message: "IOS and Android components can't be mixed",
        },
      ],
    },
  ],
};

const config = {};

tests.valid.forEach((t) => Object.assign(t, config));
tests.invalid.forEach((t) => Object.assign(t, config));

noFixAsNull();
[...tests.valid, ...tests.invalid].forEach((t) => {
  if (t.filename.endsWith(".js")) t.filename = `${t.filename}x`;
});
const asJs = (name) => name.replace(/\.jsx$/, ".js");
const seenAsJs = {
  ...rule,
  createOnce: (context) =>
    rule.createOnce(
      Object.create(context, {
        filename: { get: () => asJs(context.filename) },
      }),
    ),
};
ruleTester.run("split-platform-components", seenAsJs, tests);

// Test cases ported verbatim from eslint-plugin-react-native v5.0.0,
// tests/lib/rules/no-raw-text.js (MIT, Copyright (c) 2015 Tom Hastjarjanto);
// only the test harness changed: Oxlint's RuleTester under Vitest.
/**
 * @fileoverview Detects raw text outside of Text component
 * @author Alex Zhukov
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";
import rule from "./no-raw-text.js";

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
        export default class MyComponent extends Component {
          render() {
            return (<View><Text>some text</Text></View>);
          }
        }
      `,
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            const text = 'some text';
            return (<View><Text>{\`\${text}\`}</Text></View>);
          }
        }
      `,
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            return (<View><Text>{'some text'}</Text></View>);
          }
        }
      `,
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            return (
              <View>
                <Text>some text</Text>
              </View>
            );
          }
        }
      `,
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            return (
              <Svg>
                <Text>
                  <TSpan>some text</TSpan>
                </Text>
              </Svg>
            );
          }
        }
      `,
    },
    {
      code: `
        const StyledText = styled.Text\`
          color: red;
        \`
        export default class MyComponent extends Component {
          render() {
            return (<StyledText>some text</StyledText>);
          }
        }
      `,
    },
    {
      code: `
        const Title = ({ children }) => (<Text>{children}</Text>);
        <Title>This is the title</Title>
      `,
      options: [{ skip: ["Title"] }],
    },
    {
      code: `
        const Title = ({ children }) => (<Title.Text>{children}</Title.Text>);
        Title.Text = ({ children }) => (<Text>{children}</Text>);
        <Title.Text>This is the title</Title.Text>
      `,
      options: [{ skip: ["Title.Text"] }],
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            return (<View><Text style={{color: 'red'}}>some text</Text></View>);
          }
        }
      `,
    },
    {
      // Testing nested components inside an allowed component
      code: `
        <Text>Some text <>More text</></Text>
      `,
    },
  ],
  invalid: [
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            return (<View>some text</View>);
          }
        }
      `,
      errors: [
        {
          message: "Raw text (some text) cannot be used outside of a <Text> tag",
        },
      ],
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            const text = 'some text';
            return (<View>{\`\${text}\`}</View>);
          }
        }
      `,
      errors: [
        {
          message: "Raw text (TemplateLiteral: text) cannot be used outside of a <Text> tag",
        },
      ],
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            return (<View>{'some text'}</View>);
          }
        }
      `,
      errors: [
        {
          message: "Raw text (some text) cannot be used outside of a <Text> tag",
        },
      ],
    },
    {
      code: `
        export default class MyComponent extends Component {
          render() {
            return (<View>  </View>);
          }
        }
      `,
      errors: [
        {
          message: "Whitespace(s) cannot be used outside of a <Text> tag",
        },
      ],
    },
    {
      code: `
        const Component = ({ children }) => (<Text>{children}</Text>);
        <Component>some text</Component>
      `,
      options: [{ skip: ["Title"] }],
      errors: [
        {
          message: "Raw text (some text) cannot be used outside of a <Text> tag",
        },
      ],
    },
    {
      code: `
        const Component = ({ children }) => (<Text>{children}</Text>);
        <Component>some text</Component>
      `,
      options: [{ skip: ["Component.Text"] }],
      errors: [
        {
          message: "Raw text (some text) cannot be used outside of a <Text> tag",
        },
      ],
    },
    {
      // Tests fix to https://github.com/Intellicode/eslint-plugin-react-native/issues/270
      // from https://github.com/Intellicode/eslint-plugin-react-native/issues/270#issuecomment-897766305
      code: `
        return <MyComponent myFunctionProp={() => {}}>my children</MyComponent>;
      `,
      errors: [
        {
          message: "Raw text (my children) cannot be used outside of a <Text> tag",
        },
      ],
    },
  ],
};

const config = {};

const TSConfig = {
  languageOptions: { parserOptions: { lang: "tsx" } },
};

tests.valid.forEach((t) => Object.assign(t, config));
tests.invalid.forEach((t) => Object.assign(t, config));

noFixAsNull();
ruleTester.run("no-raw-text", rule, tests);

tests.valid.forEach((t) => Object.assign(t, TSConfig));
tests.invalid.forEach((t) => Object.assign(t, TSConfig));

noFixAsNull();
ruleTester.run("no-raw-text", rule, tests);

// Not upstream: each built-in allowed parent as the DIRECT parent of the text.
// Upstream only nests <TSpan> inside <Text> and has no <Animated.Text> case,
// so removing either from the allowed list failed no test.
ruleTester.run("no-raw-text (allowed parents)", rule, {
  valid: [
    { code: "<Text>some text</Text>" },
    { code: "<TSpan>some text</TSpan>" },
    { code: "<StyledText>some text</StyledText>" },
    { code: "<Animated.Text>some text</Animated.Text>" },
    { code: "<Animated.Text>{'some text'}</Animated.Text>" },
  ],
  invalid: [
    {
      code: "<Animated.View>some text</Animated.View>",
      errors: [{ message: "Raw text (some text) cannot be used outside of a <Text> tag" }],
    },
  ],
});

// Test cases ported verbatim from eslint-plugin-react-native v5.0.0,
// tests/lib/rules/no-color-literals.js (MIT, Copyright (c) 2015 Tom Hastjarjanto);
// only the test harness changed: Oxlint's RuleTester under Vitest.
/**
 * @fileoverview No color literals used in styles
 * @author Aaron Greenwald
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";
import rule from "./no-color-literals.js";

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
        const $red = 'red'
        const $blue = 'blue'
        const styles = StyleSheet.create({
            style1: {
                color: $red,
            },
            style2: {
                color: $blue,
            }
        });
        export default class MyComponent extends Component {
            render() {
                const isDanger = true;
                return <View 
                           style={[styles.style1, isDanger ? styles.style1 : styles.style2]}
                       />;
            }
        }
      `,
    },
    {
      code: `
        const styles = StyleSheet.create({
            style1: {
                color: $red,
            },
            style2: {
                color: $blue,
            }
        });
        export default class MyComponent extends Component {
            render() {
                const trueColor = '#fff';
                const falseColor = '#000' 
                return <View 
                   style={[style1, 
                           this.state.isDanger && {color: falseColor}, 
                           {color: someBoolean ? trueColor : falseColor }]} 
                        />;
            }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        const Hello = React.createClass({
          render: function() {
            return <Text style={{backgroundColor: '#FFFFFF', opacity: 0.5}}>
              Hello {this.props.name}
             </Text>;
          }
        });
      `,
      errors: [
        {
          message: "Color literal: { backgroundColor: '#FFFFFF' }",
        },
      ],
    },
    {
      code: `
        const Hello = React.createClass({
          render: function() {
            return <Text style={{backgroundColor: '#FFFFFF', opacity: this.state.opacity}}>
              Hello {this.props.name}
             </Text>;
          }
        });
      `,
      errors: [
        {
          message: "Color literal: { backgroundColor: '#FFFFFF' }",
        },
      ],
    },
    {
      code: `
        const styles = StyleSheet.create({
          text: {fontColor: '#000'}
        })
        const Hello = React.createClass({
          render: function() {
            return <Text style={{opacity: this.state.opacity, height: 12, fontColor: styles.text}}>
              Hello {this.props.name}
             </Text>;
          }
        });
      `,
      errors: [
        {
          message: "Color literal: { fontColor: '#000' }",
        },
      ],
    },
    {
      code: `
        const Hello = React.createClass({
          render: function() {
            return <Text style={[styles.text, {backgroundColor: '#FFFFFF'}]}>
              Hello {this.props.name}
             </Text>;
          }
        });
      `,
      errors: [
        {
          message: "Color literal: { backgroundColor: '#FFFFFF' }",
        },
      ],
    },
    {
      code: `
        const Hello = React.createClass({
          render: function() {
            const someBoolean = false; 
            return <Text style={[styles.text, someBoolean && {backgroundColor: '#FFFFFF'}]}>
              Hello {this.props.name}
             </Text>;
          }
        });
      `,
      errors: [
        {
          message: "Color literal: { backgroundColor: '#FFFFFF' }",
        },
      ],
    },
    {
      code: `
        const styles = StyleSheet.create({
            style1: {
                color: 'red',
            },
            // this is illegal even though it's not used anywhere
            style2: {
                borderBottomColor: 'blue',
            }
        });
        export default class MyComponent extends Component {
            render() {
                return <View 
                   style={[style1, 
                           this.state.isDanger && styles.style1, 
                           {backgroundColor: someBoolean ? '#fff' : '#000'}]} 
                        />;
            }
        }
      `,
      errors: [
        {
          message: "Color literal: { color: 'red' }",
        },
        {
          message: "Color literal: { borderBottomColor: 'blue' }",
        },
        {
          message: "Color literal: { backgroundColor: \"someBoolean ? '#fff' : '#000'\" }", //eslint-disable-line
        },
      ],
    },
  ],
};

const config = {};

tests.valid.forEach((t) => Object.assign(t, config));
tests.invalid.forEach((t) => Object.assign(t, config));

noFixAsNull();
ruleTester.run("no-color-literals", rule, tests);

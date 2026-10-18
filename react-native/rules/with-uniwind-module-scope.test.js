import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./with-uniwind-module-scope.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const insideFunction =
  "withUniwind() runs inside a function, so it creates a new component on every render. Fix: call it once at the top of the module — `const Image = withUniwind(ExpoImage);` — and use that component.";
const builtIn = (name, from) =>
  `\`${name}\` from ${from} already supports className; wrapping it with withUniwind breaks its behavior. Fix: remove withUniwind and pass className to \`${name}\` directly.`;

ruleTester.run("with-uniwind-module-scope", rule, {
  valid: [
    'import { withUniwind } from "uniwind"; import { Image as ExpoImage } from "expo-image"; export const Image = withUniwind(ExpoImage);',
    'import { withUniwind } from "uniwind"; import { BlurView } from "expo-blur"; const StyledBlurView = withUniwind(BlurView);',
    // withUniwind from another module is not Uniwind's.
    'import { withUniwind } from "./local"; function A() { return withUniwind(B); }',
  ],
  invalid: [
    {
      code: 'import { withUniwind } from "uniwind"; import { Image as ExpoImage } from "expo-image"; function Avatar() { const Image = withUniwind(ExpoImage); return <Image />; }',
      errors: [{ message: insideFunction }],
    },
    {
      code: 'import { withUniwind } from "uniwind"; const useImage = () => withUniwind(ExpoImage);',
      errors: [{ message: insideFunction }],
    },
    {
      code: 'import { withUniwind } from "uniwind"; import { View } from "react-native"; const StyledView = withUniwind(View);',
      errors: [{ message: builtIn("View", "react-native") }],
    },
    {
      code: 'import { withUniwind } from "uniwind"; import Animated from "react-native-reanimated"; const StyledAnimatedView = withUniwind(Animated.View);',
      errors: [{ message: builtIn("Animated.View", "react-native-reanimated") }],
    },
    {
      code: 'import { withUniwind as wrap } from "uniwind"; import { Text as RNText } from "react-native"; const T = wrap(RNText);',
      errors: [{ message: builtIn("RNText", "react-native") }],
    },
  ],
});

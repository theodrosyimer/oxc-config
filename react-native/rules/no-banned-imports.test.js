import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./no-banned-imports.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const nativewind = (source) =>
  `\`${source}\` is NativeWind, and styling here is Uniwind. Fix: import from 'uniwind' (withUniwind, useResolveClassNames) and drop cssInterop/remapProps — Uniwind supports className on core components without them.`;
const touchable = (name) =>
  `\`${name}\` from react-native is replaced by Pressable. Fix: import { Pressable } from 'react-native' and use <Pressable onPress={…}> (pressed styles via the \`active:\` class).`;
const image =
  "`Image` from react-native is replaced by expo-image. Fix: import { Image as ExpoImage } from 'expo-image' and wrap it once at module scope — const Image = withUniwind(ExpoImage) — for className support.";
const safeArea =
  "`SafeAreaView` from react-native is not used. Fix: on a ScrollView set contentInsetAdjustmentBehavior=\"automatic\", or use the pt-safe / pb-safe classes; if a wrapper is unavoidable, import SafeAreaView from 'react-native-safe-area-context'.";
const keyboard =
  "`KeyboardAvoidingView` from react-native is replaced by react-native-keyboard-controller. Fix: import { KeyboardAwareScrollView } (or KeyboardAvoidingView) from 'react-native-keyboard-controller'.";

ruleTester.run("no-banned-imports", rule, {
  valid: [
    'import { Pressable, View, Text } from "react-native";',
    'import { Image } from "expo-image";',
    'import { SafeAreaView } from "react-native-safe-area-context";',
    'import { KeyboardAvoidingView } from "react-native-keyboard-controller";',
    'import { withUniwind } from "uniwind";',
    'import * as RN from "react-native";',
  ],
  invalid: [
    {
      code: 'import { cssInterop } from "nativewind";',
      errors: [{ message: nativewind("nativewind") }],
    },
    {
      code: 'import "nativewind/theme";',
      errors: [{ message: nativewind("nativewind/theme") }],
    },
    {
      code: 'const preset = require("nativewind/preset");',
      errors: [{ message: nativewind("nativewind/preset") }],
    },
    {
      code: 'import { TouchableOpacity, TouchableHighlight, View } from "react-native";',
      errors: [
        { message: touchable("TouchableOpacity") },
        { message: touchable("TouchableHighlight") },
      ],
    },
    {
      code: 'import { Image as RNImage } from "react-native";',
      errors: [{ message: image }],
    },
    {
      code: 'import { SafeAreaView, KeyboardAvoidingView } from "react-native";',
      errors: [{ message: safeArea }, { message: keyboard }],
    },
    {
      code: 'export { Image } from "react-native";',
      errors: [{ message: image }],
    },
  ],
});

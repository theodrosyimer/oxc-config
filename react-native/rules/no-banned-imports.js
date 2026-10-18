/**
 * Reports the imports the skills ban in React Native code, each message
 * naming the replacement. A plugin rule instead of `no-restricted-imports`,
 * whose custom message Oxlint prints only as a separate `help:` line.
 * Sources: CLAUDE.md ("UniWind (never NativeWind)"); uniwind SKILL.md ("Never
 * use `cssInterop` or `remapProps` — Those are NativeWind APIs");
 * vercel-react-native-skills `rules/ui-pressable.md` ("Never use
 * `TouchableOpacity` or `TouchableHighlight`"); ds__rn-patterns
 * `references/image-patterns.md` ("Always use `expo-image`, never RN
 * `Image`"), `references/layout-patterns.md` ("NEVER import SafeAreaView from
 * `react-native`") and `references/form-patterns.md` (KeyboardAvoidingView
 * "from `react-native-keyboard-controller`, NOT React Native's built-in").
 */
import { defineRule } from "@oxlint/plugins";

const touchable = (name) =>
  `\`${name}\` from react-native is replaced by Pressable. Fix: import { Pressable } from 'react-native' and use <Pressable onPress={…}> (pressed styles via the \`active:\` class).`;

/** Named exports of `react-native` that are banned, with their message. */
const REACT_NATIVE = new Map([
  ["TouchableOpacity", touchable("TouchableOpacity")],
  ["TouchableHighlight", touchable("TouchableHighlight")],
  [
    "Image",
    "`Image` from react-native is replaced by expo-image. Fix: import { Image as ExpoImage } from 'expo-image' and wrap it once at module scope — const Image = withUniwind(ExpoImage) — for className support.",
  ],
  [
    "SafeAreaView",
    "`SafeAreaView` from react-native is not used. Fix: on a ScrollView set contentInsetAdjustmentBehavior=\"automatic\", or use the pt-safe / pb-safe classes; if a wrapper is unavoidable, import SafeAreaView from 'react-native-safe-area-context'.",
  ],
  [
    "KeyboardAvoidingView",
    "`KeyboardAvoidingView` from react-native is replaced by react-native-keyboard-controller. Fix: import { KeyboardAwareScrollView } (or KeyboardAvoidingView) from 'react-native-keyboard-controller'.",
  ],
]);

const isNativewind = (source) => source === "nativewind" || source.startsWith("nativewind/");

const nativewindMessage = (source) =>
  `\`${source}\` is NativeWind, and styling here is Uniwind. Fix: import from 'uniwind' (withUniwind, useResolveClassNames) and drop cssInterop/remapProps — Uniwind supports className on core components without them.`;

const nameOf = (node) => (node.type === "Identifier" ? node.name : node.value);

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow NativeWind and the react-native components the skills replace",
    },
    schema: [],
  },
  createOnce(context) {
    /** `import … from`, `export … from` and `import "…"`. */
    const checkModule = (node) => {
      const source = node.source.value;

      if (isNativewind(source)) {
        context.report({ node: node.source, message: nativewindMessage(source) });

        return;
      }

      if (source !== "react-native") return;

      for (const specifier of node.specifiers ?? []) {
        const imported =
          specifier.type === "ImportSpecifier"
            ? nameOf(specifier.imported)
            : specifier.type === "ExportSpecifier"
              ? nameOf(specifier.local)
              : undefined;
        const message = imported && REACT_NATIVE.get(imported);

        if (message) {
          context.report({ node: specifier, message });
        }
      }
    };

    return {
      ImportDeclaration: checkModule,
      ExportNamedDeclaration(node) {
        if (node.source) checkModule(node);
      },
      ExportAllDeclaration(node) {
        if (isNativewind(node.source.value)) checkModule(node);
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "require") return;

        const [argument] = node.arguments;

        if (argument?.type !== "Literal" || typeof argument.value !== "string") return;
        if (!isNativewind(argument.value)) return;

        context.report({ node: argument, message: nativewindMessage(argument.value) });
      },
    };
  },
});

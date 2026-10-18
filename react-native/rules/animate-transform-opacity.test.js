import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import rule from "./animate-transform-opacity.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const message = (prop) =>
  `\`${prop}\` is animated, which recalculates layout on every frame. Fix: animate \`transform\` (translateX, translateY, scale, rotate) or \`opacity\` instead; for a size change, use a layout animation — \`layout={LinearTransition}\`.`;

ruleTester.run("animate-transform-opacity", rule, {
  valid: [
    "const style = useAnimatedStyle(() => ({ opacity: progress.get(), transform: [{ translateY: offset.get() }] }));",
    "const style = useAnimatedStyle(() => { return { transform: [{ scale: scale.get() }] }; });",
    // Outside useAnimatedStyle, layout props are ordinary styles.
    "const style = { width: 100, height: 40, marginTop: 8 };",
    // A nested function's object is not the animated style.
    "const style = useAnimatedStyle(() => { const measure = () => ({ width: 1 }); return { opacity: 1 }; });",
  ],
  invalid: [
    {
      code: "const style = useAnimatedStyle(() => ({ width: withTiming(open.get() ? 200 : 0) }));",
      errors: [{ message: message("width") }],
    },
    {
      code: "const style = useAnimatedStyle(() => { return { height: h.get(), top: t.get(), left: l.get() }; });",
      errors: [
        { message: message("height") },
        { message: message("top") },
        { message: message("left") },
      ],
    },
    {
      code: "const style = useAnimatedStyle(function () { return { marginTop: m.get(), paddingHorizontal: p.get(), opacity: 1 }; });",
      errors: [{ message: message("marginTop") }, { message: message("paddingHorizontal") }],
    },
  ],
});

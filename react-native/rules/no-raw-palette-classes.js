/**
 * Reports raw design values in Uniwind class names — palette colors, numeric
 * spacing, default shadows, arbitrary values and the names rn-patterns bans —
 * where the rn-patterns Token Vocabulary has a semantic token.
 * Source: ds__rn-patterns `SKILL.md`, "Token Vocabulary" ("Enforce these
 * tokens in ALL generated code" … "NEVER use: bg-card, text-foreground,
 * border-border, bg-primary, bg-white, p-4, shadow-lg, bg-blue-500").
 */
import { defineRule } from "@oxlint/plugins";

import {
  collectClassNameStrings,
  isClassNameAttribute,
  splitClassNames,
} from "../class-name-strings.js";

const PALETTE =
  "(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\\d{2,3})?|white|black";
const COLOR_UTILITIES =
  "bg|text|border(?:-[xytrblse])?|ring|fill|stroke|divide|outline|accent|from|via|to|decoration|placeholder|caret";

const RAW_COLOR = new RegExp(`^(${COLOR_UTILITIES})-(?:${PALETTE})(?:\\/\\d+)?$`);
const ARBITRARY = /^-?([a-z]+(?:-[a-z]+)*)-\[.+\]$/;
const SPACING_SCALE =
  /^-?(p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy])-(?:\d+(?:\.\d+)?|px)$/;
const DEFAULT_SHADOW = /^shadow(?:-(?:sm|md|lg|xl|2xl|inner))?$/;
const BANNED_NAMES = new Map([
  ["bg-card", "bg"],
  ["bg-primary", "bg"],
  ["text-foreground", "text"],
  ["border-border", "border"],
]);

const FIXES = {
  bg: "use a surface, action or status token — bg-surface-default, bg-surface-raised, bg-surface-overlay, bg-surface-sunken, bg-action-primary, bg-action-secondary, bg-action-ghost or bg-status-error-bg.",
  text: "use a content or status token — text-content-primary, text-content-secondary, text-content-tertiary, text-content-disabled, text-content-on-action, text-status-error-text or text-status-success-text.",
  border:
    "use a border token — border-default, border-subtle, border-strong, border-focus or border-status-error-border.",
  padding:
    "use a spacing token — px-component-sm, px-component-md, px-component-lg, py-component-sm, py-component-md or py-component-lg.",
  margin:
    "space siblings with a gap token on their parent — gap-inline-xs, gap-inline-sm, gap-inline-md, gap-layout-sm, gap-layout-md or gap-layout-xl.",
  gap: "use a gap token — gap-inline-xs, gap-inline-sm, gap-inline-md, gap-layout-sm, gap-layout-md or gap-layout-xl.",
  shadow:
    "use an elevation token — shadow-elevation-low, shadow-elevation-medium or shadow-elevation-high.",
  color: "use a semantic color token from the Token Vocabulary.",
};

/** The family of a utility name, picking the fix to suggest. */
const familyOf = (utility) => {
  if (utility === "bg") return "bg";
  if (utility === "text") return "text";
  if (utility.startsWith("border")) return "border";
  if (/^p[xytrblse]?$/.test(utility)) return "padding";
  if (/^m[xytrblse]?$/.test(utility) || utility.startsWith("space-")) return "margin";
  if (utility.startsWith("gap")) return "gap";
  if (utility === "shadow") return "shadow";

  return "color";
};

/** The fix family for a raw class, or undefined for a class that is fine. */
const rawFamily = (cls) => {
  if (BANNED_NAMES.has(cls)) return BANNED_NAMES.get(cls);
  if (DEFAULT_SHADOW.test(cls)) return "shadow";

  const color = RAW_COLOR.exec(cls);

  if (color) return familyOf(color[1]);

  const spacing = SPACING_SCALE.exec(cls);

  if (spacing) return familyOf(spacing[1]);

  const arbitrary = ARBITRARY.exec(cls);

  if (arbitrary) return familyOf(arbitrary[1]);

  return undefined;
};

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require rn-patterns semantic tokens instead of raw design values in class names",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      JSXAttribute(node) {
        if (!isClassNameAttribute(node)) return;

        for (const { text, node: piece } of collectClassNameStrings(node.value)) {
          for (const cls of splitClassNames(text)) {
            const family = rawFamily(cls);

            if (family === undefined) {
              continue;
            }

            context.report({
              node: piece,
              message: `\`${cls}\` is a raw design value, not a token from the rn-patterns Token Vocabulary. Fix: ${FIXES[family]}`,
            });
          }
        }
      },
    };
  },
});

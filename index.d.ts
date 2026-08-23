import type { OxlintConfig } from "oxlint";
import type { OxfmtConfig } from "oxfmt";

export declare const baseIgnorePatterns: NonNullable<OxlintConfig["ignorePatterns"]>;
export declare const basePlugins: NonNullable<OxlintConfig["plugins"]>;
export declare const baseCategories: NonNullable<OxlintConfig["categories"]>;
export declare const baseRules: NonNullable<OxlintConfig["rules"]>;
export declare const baseTypeAwareRules: NonNullable<OxlintConfig["rules"]>;
export declare const typeAwareOffForJs: NonNullable<OxlintConfig["rules"]>;
export declare const baseOverrides: NonNullable<OxlintConfig["overrides"]>;
export declare const oxcBase: OxlintConfig;

export declare const defaultConfig: OxlintConfig;
export declare const reactConfig: OxlintConfig;
export declare const reactNativeGlobals: NonNullable<OxlintConfig["globals"]>;
export declare const turboAddon: OxlintConfig;
export declare const oxfmtConfig: OxfmtConfig;
export declare const onlyWarn: <T extends OxlintConfig>(config: T) => OxlintConfig;

declare const _default: OxlintConfig;
export default _default;

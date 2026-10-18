/**
 * The StyleSheets found in the source code, with the styles a rule collects
 * from them. Ported from eslint-plugin-react-native v5.0.0
 * `lib/util/stylesheet.js` (MIT, see ./LICENSE).
 */
export class StyleSheets {
  styleSheets = {};
  colorLiterals = undefined;
  objectExpressions = undefined;

  /**
   * Adds a StyleSheet to the collection.
   * @param {string} styleSheetName - The name of the StyleSheet.
   * @param {Array<object>} properties - The style declarations of the StyleSheet.
   */
  add(styleSheetName, properties) {
    this.styleSheets[styleSheetName] = properties;
  }

  /**
   * Marks a style as used by removing it from its StyleSheet.
   * @param {string} fullyQualifiedName - For example `styles.text`.
   */
  markAsUsed(fullyQualifiedName) {
    const [styleSheetName, styleSheetProperty] = fullyQualifiedName.split(".");

    if (this.styleSheets[styleSheetName]) {
      this.styleSheets[styleSheetName] = this.styleSheets[styleSheetName].filter(
        (property) => property.key.name !== styleSheetProperty,
      );
    }
  }

  /** Every collected StyleSheet with its styles not marked as used. */
  getUnusedReferences() {
    return this.styleSheets;
  }

  /** @param {Array<object | undefined>} expressions */
  addColorLiterals(expressions) {
    this.colorLiterals = (this.colorLiterals ?? []).concat(expressions);
  }

  getColorLiterals() {
    return this.colorLiterals;
  }

  /** @param {Array<object | undefined>} expressions */
  addObjectExpressions(expressions) {
    this.objectExpressions = (this.objectExpressions ?? []).concat(expressions);
  }

  getObjectExpressions() {
    return this.objectExpressions;
  }
}

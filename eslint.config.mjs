import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier"; // añadir prettier
import tsdoc from "eslint-plugin-tsdoc"; // añadimos tsdoc

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  { plugins: {
      tsdoc,
    }
  },
  // {rules: {
  //   "@typescript-eslint/no-unused-vars": "warn", // Da advertencia de las variables no utilizadas
  //   "init-declarations": "off", // Regla de typescript-eslint que se requiere desactivar para no tener conflictos con la siguiente.
  //   "@typescript-eslint/init-declarations": "error", // requiera inicializar una variable en la misma sentencia donde se declara.
  // }},
  { rules: {
    "tsdoc/syntax": "warn",
    "prefer-const": "off",
  }},
  { ignores: [
      "eslint.config.mjs",
      "dist/*",
      "docs/*",
  ]},
];

import {fixupConfigRules, fixupPluginRules} from "@eslint/compat";
import _import from "eslint-plugin-import";
import eslintComments from "eslint-plugin-eslint-comments";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import {fileURLToPath} from "node:url";
import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";
import globals from "globals"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: ["**/node_modules", "**/build", "**/coverage"],
}, ...fixupConfigRules(compat.extends(
  "eslint:recommended",
  "plugin:eslint-comments/recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:import/typescript",
  "prettier",
)), {
  plugins: {
    import: fixupPluginRules(_import),
    "eslint-comments": fixupPluginRules(eslintComments),
  },
  files: ["**/*.ts", "**/*.js"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },

    parser: tsParser,
    ecmaVersion: 2020,

    parserOptions: {
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
      sourceType: 'module',
    },
  },

  rules: {
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "eslint-comments/disable-enable-pair": ["error", {
      allowWholeFile: true,
    }],
    "eslint-comments/no-unused-disable": "error",
    "import/order": ["error", {
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
      },
    }],
    "sort-imports": ["error", {
      ignoreDeclarationSort: true,
      ignoreCase: true,
    }],
  },
}];

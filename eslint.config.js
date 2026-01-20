import js from "@eslint/js";
import globals from "globals";
import vue from "eslint-plugin-vue";
import { globalIgnores } from "eslint/config";

export default [
  globalIgnores(["dist"]),
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];

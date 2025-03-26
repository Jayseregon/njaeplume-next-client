import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  js.configs.recommended,
  {
    ignores: [
      ".now/*",
      "*.css",
      ".changeset",
      "dist",
      "esm/*",
      "public/*",
      "tests/*",
      "scripts/*",
      "*.config.js",
      ".DS_Store",
      "node_modules",
      "coverage",
      ".next",
      "build",
      "!.commitlintrc.cjs",
      "!.lintstagedrc.cjs",
      "!jest.config.js",
      "!plopfile.js",
      "!react-shim.js",
      "!tsup.config.ts",
    ],
  },
  {
    plugins: {
      prettier,
      "unused-imports": unusedImports,
    },
  },
  ...compat.config({
    env: {
      browser: false,
      es2021: true,
      node: true,
    },
    extends: ["next/core-web-vitals", "next/typescript", "next", "prettier"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: "module",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-console": 0,
      "react/prop-types": 0,
      "react/jsx-uses-react": 0,
      "react/react-in-jsx-scope": 0,
      "react-hooks/exhaustive-deps": 0,
      "jsx-a11y/click-events-have-key-events": 1,
      "jsx-a11y/interactive-supports-focus": 1,
      "prettier/prettier": 1,
      "no-unused-vars": 0,
      "unused-imports/no-unused-vars": [
        1,
        {
          vars: "all",
          varsIgnorePattern: "^_.*?$",
          args: "after-used",
          argsIgnorePattern: "^_.*?$",
        },
      ],
      "unused-imports/no-unused-imports": 1,
      "@typescript-eslint/no-unused-vars": [
        1,
        {
          vars: "all", // Check all variables
          args: "after-used",
          ignoreRestSiblings: false,
          varsIgnorePattern: "^_.*?$", // Ignore variables starting with '_'
          argsIgnorePattern: "^_.*?$",
        },
      ],
      "import/order": [
        1,
        {
          groups: [
            "type",
            "builtin",
            "object",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "~/**",
              group: "external",
              position: "after",
            },
          ],
          "newlines-between": "always",
        },
      ],
      "react/self-closing-comp": 1,
      "react/jsx-sort-props": [
        1,
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
      "padding-line-between-statements": [
        1,
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
      ],
      "@next/next/no-img-element": 0,
    },
    overrides: [
      {
        files: [
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/*.spec.ts",
          "**/*.spec.tsx",
        ],
        rules: {
          "@typescript-eslint/no-explicit-any": 0,
          "@typescript-eslint/no-unused-vars": 0,
          "react/display-name": 0,
          "@typescript-eslint/no-require-imports": 0,
          "@typescript-eslint/prefer-ts-expect-error": 0,
          "@typescript-eslint/ban-ts-comment": 0, // Allows ts-expect-error, ts-ignore, etc.
        },
      },
      {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
          "@typescript-eslint/no-explicit-any": 0,
          "no-useless-catch": 0,
          "no-constant-binary-expression": 0,
          "no-useless-escape": 0,
        },
      },
      // Add this new override for email template files
      {
        files: ["**/*EmailTemplate*.tsx", "**/*email-template*.tsx", "**/email/**.tsx"],
        rules: {
          "@next/next/no-head-element": "off"
        }
      }
    ],
  }),
];

export default eslintConfig
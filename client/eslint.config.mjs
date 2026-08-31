import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Next.js, React, React Hooks, accessibility and Core Web Vitals rules.
  ...nextVitals,
  // Base TypeScript rules recommended by Next.js.
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // TypeScript rules that use type information from tsconfig.json.
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/array-type": "off",
    },
  },

  // General correctness and consistency rules for JavaScript and TypeScript.
  {
    rules: {
      // Require array callbacks to return a value consistently.
      "array-callback-return": "error",
      // Require braces around every control-flow block.
      curly: ["error", "all"],
      // Require strict equality (=== and !==).
      eqeqeq: ["error", "always"],
      // Allow only intentional warning and error console output.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Remove else blocks when the if branch already returns.
      "no-else-return": ["error", { allowElseIf: false }],
      // Disallow ternaries that can be written more simply.
      "no-unneeded-ternary": "error",
      // Prefer concise object property and method syntax.
      "object-shorthand": "error",
      // Require const when a variable is never reassigned.
      "prefer-const": "error",
      // Prefer template literals over string concatenation.
      "prefer-template": "error",
    },
  },

  // Project-specific TypeScript conventions. Kept after presets to override them.
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      // Require `import type` for imports used only as types.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      // Require `export type` for exports used only as types.
      "@typescript-eslint/consistent-type-exports": "error",
      // Require switches over unions and enums to handle every case.
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },

  // Remove unused imports and report unused variables (prefix with `_` to ignore).
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Must stay last: disables formatting rules that conflict with Prettier.
  prettier,
]);

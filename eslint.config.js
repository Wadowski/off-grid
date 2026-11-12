// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

const calendarAttribute = "JSXAttribute[name.name=/^(label|placeholder|title|error|aria-label)$/]";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "data/**",
      "**/node_modules/**",
      "e2e/.features-gen/**",
      "e2e/test-results/**",
      "e2e/playwright-report/**",
      "e2e/artifacts/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", ".claude/hooks/**/*.mjs"],
    languageOptions: {
      globals: { console: "readonly", process: "readonly", URL: "readonly" },
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: { module: "readonly" },
    },
  },
  {
    files: [
      "apps/main-web/src/**/calendar*/**/*.{ts,tsx}",
      "apps/main-web/src/**/*calendar*.{ts,tsx}",
    ],
    ignores: ["**/*.test.*"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: [
            "JSXText[value=/\\S/]",
            "JSXElement > JSXExpressionContainer > Literal[value=/\\S/]",
          ].join(", "),
          message: "Use Text with textId for calendar UI text.",
        },
        {
          selector: [
            `${calendarAttribute} > Literal[value=/\\S/]`,
            `${calendarAttribute} > JSXExpressionContainer > Literal[value=/\\S/]`,
            `${calendarAttribute} > JSXExpressionContainer > ConditionalExpression > Literal[value=/\\S/]`,
            `${calendarAttribute} > JSXExpressionContainer > TemplateLiteral > TemplateElement[value.cooked=/\\S/]`,
          ].join(", "),
          message: "Use a catalog key through Text or t().",
        },
      ],
    },
  },
  prettier,
);

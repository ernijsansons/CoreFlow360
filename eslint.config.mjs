import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript strict mode enforcement
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/strict-boolean-expressions": "off",
      
      // React best practices
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      
      // Code quality
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      
      // Import organization
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always"
      }],
      
      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      
      // Security
      "react/no-dangerously-set-inner-html": "error",
      
      // Performance
      "react/jsx-no-bind": "warn",
      "react/jsx-no-leaked-render": "error"
    }
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "*.config.js",
      "*.config.mjs",
      "**/*.d.ts"
    ]
  }
];

export default eslintConfig;

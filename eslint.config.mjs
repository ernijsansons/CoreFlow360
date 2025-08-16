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
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/strict-boolean-expressions": "off",
      
      // React best practices
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      
      // Code quality
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      
      
      // Security
      "react/no-danger": "warn",
      
      // Performance
      "react/jsx-no-bind": "off"
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
      "**/*.d.ts",
      "v0-deployed/**",
      "prisma/seed*.ts",
      "public/sw.js"
    ]
  }
];

export default eslintConfig;

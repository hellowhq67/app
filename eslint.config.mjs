import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React 19 Compiler rules — downgrade to warnings.
      // These patterns (initialising state in effects, using refs, etc.) are
      // valid in production and require significant refactoring to "fix" cleanly.
      // They do not cause runtime failures; they are stylistic preferences of
      // the React 19 Compiler.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      // anonymous default exports — only in config files
      "import/no-anonymous-default-export": "warn",
    },
  },
]);

export default eslintConfig;

---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.sql"
  - "**/*.yml"
  - "**/*.yaml"
  - "**/*.toml"
---

# Code style rules

- DO name functions, variables, tables, jobs and steps so the code explains itself. Choose a clearer name instead of adding a comment.
- DO split a function into smaller named functions when each part reads better on its own.
- DON'T add comments, JSDoc or header blocks to code. Keep only what a tool needs to work: the SPDX header that REUSE requires, the shebang line, REUSE-Ignore markers, and type annotations such as `/** @type {...} */` that TypeScript or the editor reads.
- DON'T export a symbol unless another file or package uses it. Keep each package's `src/index.ts` to the symbols that callers actually need.
- DON'T export a helper only so that a test can reach it. Test it through the function that uses it.
- DON'T document rules in a config file. Put guidance in `docs/` or in the `.claude/rules` file that applies.

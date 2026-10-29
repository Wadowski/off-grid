---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.mjs"
---

# Code style rules

- DO name functions, variables and types so the code explains itself. Choose a clearer name instead of adding a comment.
- DO split a function into smaller named functions when each part reads better on its own.
- DON'T add comments or JSDoc to code. The only exception is the SPDX header that REUSE requires at the top of each file.
- DON'T export a symbol unless another file or package uses it. Keep each package's `src/index.ts` to the symbols that callers actually need.
- DON'T export a helper only so that a test can reach it. Test it through the function that uses it.

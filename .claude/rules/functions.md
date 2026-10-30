---
paths:
  - "apps/**/*.ts"
  - "modules/**/*.ts"
  - "packages/**/*.ts"
---

# Function rules

- DO write every named function as an arrow function: `export const createFamily = async (...) => { ... }`. Don't use `function` declarations or function expressions.
- DO keep one function per file. The file is named after the function in kebab-case: `createFamily` lives in `create-family.ts`.
- DO give a helper its own file too, even when only one other function uses it.
- DO keep a file that combines several functions to wiring only: imports, then a plain object or a registration call. A route registry or a module descriptor is an example.
- DO write a function's dependencies as leading parameters, not as a closure, so each file stands alone: `export const getFamily = async (pool, viewerUserId, familyId) => ...`.
- DON'T put a named function in `index.ts`. It only re-exports.
- Inline callbacks passed as arguments (`rows.map((row) => ...)`) stay inline when they are a single expression.
- Error subclasses may stay classes. Any other class is rewritten as functions and closures, since its methods are functions.
- Test files (`*.test.ts`) keep their helper functions beside the tests that use them. Those helpers are still arrow functions.
- Test files follow [testing.md](testing.md): one `describe` per unit, not one file per test.

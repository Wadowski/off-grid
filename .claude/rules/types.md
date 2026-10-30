---
paths:
  - "packages/**/*.ts"
  - "modules/**/*.ts"
  - "apps/**/*.ts"
---

# Type rules

- DO put the types of a package or module in one `types.ts` file under its `src/`, and import them from there. Interfaces, type aliases and enums never live in a logic file, including a file that holds one function.
- DON'T declare an interface or type alias in a file that also holds logic. Move it to `types.ts`.
- DON'T copy a type's shape into another file. Import it, or extend it with a named alias in `types.ts`.
- DO keep `types.ts` free of runtime code. Functions and classes stay in their own files.
- DO put the module-level constants of a package or module (values that are not functions) in one `constants.ts` under its `src/`, next to `types.ts`.
- DO apply the same split to test helpers: harness types go in `test/types.ts`.
- DON'T export a type from `index.ts` unless a caller outside the package uses it.

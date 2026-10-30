---
paths:
  - "apps/**/*.ts"
  - "modules/**/*.ts"
  - "packages/**/*.ts"
---

# Shared code rules

- DO move code that a second module would need into a shared package before a second copy appears. HTTP helpers (auth, validation errors, read outcomes) go in `packages/http`. Access checks go in `packages/access-control`. Event and database helpers go in `packages/event-bus` and `packages/db`.
- DON'T copy a helper from one module into another. Import it from the shared package.
- DO keep a shared package free of module code: it must not import from `modules/` or `apps/`.
- DO add a test next to each shared function, in the shared package.

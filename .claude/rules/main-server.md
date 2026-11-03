---
paths:
  - "apps/main-server/**/*.ts"
---

# Main server rules

- DO keep `apps/main-server/src/` to the entry points (`main.ts`, `migrate.ts`, `recover-admin.ts`, `index.ts`), `types.ts` and `constants.ts`. Docker, Compose, e2e and the README run the entry points by path, so DON'T move them.
- DO put every other file in a feature folder: `config/`, `lifecycle/`, `module-wiring/`, `http/`, `request-identity/`, `readiness/`, `migrations/`, `recovery/`. See "Source layout" in [apps/main-server/README.md](../../apps/main-server/README.md).
- DO use a kind-based subfolder inside a large feature (`http/errors/`, `http/headers/`). DON'T group by kind at the top level, and DON'T add `utils/` or `helpers/`.
- DO place a new file in the feature it belongs to, or add a new feature folder when none fits. DON'T add files to the `src/` root.
- DON'T name a folder `modules/`, since the `module-public-api` boundary rule matches that path.
- DO keep tests beside the file they test.

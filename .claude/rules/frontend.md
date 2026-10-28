---
paths:
  - "apps/main-web/**"
  - "packages/ui/**"
---

# Frontend rules

- DO use design tokens from `packages/ui` for colour, spacing and type.
- DO meet WCAG 2.2 AA.
- DO send every user-facing string through the i18n catalogs.
- DO give interactive elements stable `data-testid` names in kebab-case.
- DO talk to the server only through `packages/contracts` and `packages/api-client`.
- DON'T hard-code colours or spacing values.
- DON'T import from `modules/` or from `packages/` other than `contracts`, `api-client` and `ui`. `web-allowed-imports` enforces this ([boundaries.md](../../docs/architecture/boundaries.md)).
- DON'T rely on immediate consistency. Events are eventually consistent, so screens must tolerate a short delay after a change ([ADR 0002](../../docs/adr/0002-outbox-events-and-projections.md)).

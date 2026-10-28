---
paths:
  - "**/*.test.ts"
---

# Testing rules

- DO follow the test pyramid: many unit tests, fewer integration tests, few end-to-end scenarios.
- DO name test files `<unit>.test.ts` next to the code they test.
- DO run integration tests against a real Postgres container, not mocks.
- DO add a regression test for every bug fix.
- DO poll with a timeout when waiting for async work.
- DON'T use `sleep` in tests.
- DON'T skip, weaken or delete a test to make a change pass ([CLAUDE.md](../../CLAUDE.md)).
- DON'T test domain code through I/O. Domain code is pure, so unit-test it directly ([boundaries.md](../../docs/architecture/boundaries.md)).

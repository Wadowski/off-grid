## Linked issue

Closes OG-NN

## Summary

<!-- What changed and why, in a few lines. -->

## Decisions

<!-- Choices a reviewer should know about. Link an ADR if a decision changed. -->

## Feature files

<!-- List the .feature files added or changed, or write "None (no user-visible behaviour)". -->

-

## Checklist

- [ ] Tests added or updated, and `pnpm test` passes
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm check:boundaries` pass
- [ ] E2E smoke passes (`pnpm e2e:smoke`), or the change has no user-visible behaviour
- [ ] No `@wip` tag is left on finished work (list open `@wip` scenarios below)
- [ ] ADR written if a decision changed (`docs/adr/`)
- [ ] Docs updated
- [ ] Every commit is signed off (`git commit -s`), checked with `pnpm dco:check`

## Auth-sensitive review (delete this section if the change does not touch identity, sessions, passwords, tokens, recovery codes or logging)

- [ ] No password, token, recovery code, hash or session value is logged or returned in a response, event or projection
- [ ] Only `modules/identity` reads or writes credential, session or recovery-code data, and other code imports `modules/identity/src/index.ts` only
- [ ] Secrets are hashed with Argon2id and compared in constant time. If the shared helpers do not exist yet, the change adds no second path and says so below
- [ ] The current user and family come from the request context, never from the body, query or path
- [ ] A test covers the new secret-handling path (logger output or response shape)
- [ ] Every rule in [.claude/rules/auth-sensitive.md](../.claude/rules/auth-sensitive.md) was followed, including its known redaction limits

## Open `@wip` scenarios

<!-- Scenarios that are still unfinished, with the reason. Write "None" if there are none. -->

## How it was tested

<!-- Commands run and what they showed. Say what was not verified. -->

## Risks and privacy impact

<!-- Data stored, sent or exposed by this change. Write "None" if there is no impact. -->

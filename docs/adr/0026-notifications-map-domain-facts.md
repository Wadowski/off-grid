# 0026. Notifications map domain facts to notices

- **Status:** Accepted

## Context

[ADR 0025](0025-one-module-owns-notifications.md) moved the inbox into the notifications module, but producers still publish `user-notified-v1`, a notice that already says what to tell the person. Identity decides the notice type, so each module makes a notification product decision and the rules spread across producers.

A generic CRUD event such as `user-updated-v1` does not carry the meaning that a security notice needs. A password change and a recovery-code change are different facts, and a consumer should not infer them from field differences.

## Decision

- We will publish domain facts, named for what happened, in the past tense and versioned: `password-changed-v1` and `recovery-code-regenerated-v1` from identity. A producer does not know which notice, if any, a fact produces.
- The notifications module owns the mapping from a fact to a notice. The mapping is one constant in `modules/notifications/src/constants.ts`, with a subscriber per fact that writes the inbox item.
- The inbox item's id is the event id, so a redelivered event writes one item.
- Fact payloads carry only the identifier of the person they concern. A consumer that needs more reads it through a projection ([ADR 0013](0013-projections-for-other-modules-only.md)).
- `user-notified-v1` is retired. It is a released event, so its schema stays in the contracts and in `released-events.json`. No module publishes or consumes it after this change.
- This record supersedes the part of [ADR 0025](0025-one-module-owns-notifications.md) that says producers publish `user-notified-v1`.

## Consequences

- Easier: adding a notice means one mapping entry in the notifications module. Producers do not change.
- Easier: notice text and recipients can change without a new event version.
- Harder: each new notice needs its own fact event, with a contract, a test and a README entry.
- Harder: the notifications module depends on the fact contracts of other modules. A change to a fact is a new version, as with any event.
- Follow-up: calendar and list facts (for example `calendar-reminder-due-v1` for [OG-90](https://linear.app/offgridos/issue/OG-90)) use the same pattern.

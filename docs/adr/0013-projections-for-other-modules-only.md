# 0013. Projections are for another module's data only

- **Status:** Accepted

## Context

[0002](0002-outbox-events-and-projections.md) introduced read-only projections as the way a module reads data it does not own. The non-negotiables in CLAUDE.md and the module and event rules were worded so that every module's reads looked like projections.

The family module was the first to be built on the rule. It first kept a projection of its own families, which duplicated data it already owned. A review found this unnecessary: the module can read its own tables under row-level security, and a projection of its own data adds a second copy to keep consistent.

## Decision

- We will read a module's own data directly, through its own tables and row-level security policies.
- We will build a projection only for data owned by another module, fed by that module's events.
- The rules in `.claude/rules/modules.md` and `.claude/rules/events.md`, and the non-negotiable in CLAUDE.md, state this.

## Consequences

- The family module lists families from `family_member` and `family` under read policies, without a summary table.
- A projection of another module's data still follows [0002](0002-outbox-events-and-projections.md): read-only, versioned, and checked with `sourceVersion`.
- The `new-module`, `new-migration` and `new-event` skills no longer tell an agent to stop when a db helper is missing, because the helpers exist. They still forbid building a projection of the module's own data.

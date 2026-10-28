# 0003. Built-in tunnel for remote access, deferred

- **Status:** Accepted

## Context

Households may want to reach their server from outside the home network. Third-party VPN products add a dependency, an account and a trust relationship that Offgrid does not want to require.

## Decision

- Remote access, when it is built, will be a tunnel built into the application at the app level, not a third-party VPN.
- Remote access is out of scope for the local server MVP and is not built now.
- Tunnel implementation decisions are deferred to a later record.

## Consequences

- The MVP stays fully local, with no outbound network calls (see the non-negotiables in [CLAUDE.md](../../CLAUDE.md)).
- Nothing in the MVP may assume that remote access exists. Access control must not depend on it.
- A future tunnel needs its own record covering the protocol, key handling and hosting model.

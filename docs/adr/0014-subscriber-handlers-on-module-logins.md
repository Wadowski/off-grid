# 0014. Subscriber handlers run on their module login, with at-least-once delivery

- **Status:** Accepted

## Context

[0011](0011-restricted-event-access-and-retention.md) runs each subscriber's handler on the bus connection with `SET ROLE <module>_app`, and advances the subscriber's cursor in the same transaction as the handler's writes. The bus role was made a member of every module role so that `SET ROLE` would work.

Membership let a handler run `RESET ROLE` and act with any module's privileges, which is more than 0011 intended. A handler on the bus connection could also reach the event stream.

## Decision

- We will run each subscriber's handler on a connection that logs in as the subscriber's module role, `<module>_app`. The bus keeps a pool per module login. A handler cannot change its role, since it holds no membership in any other role.
- We will remove the bus role's membership in module roles. `infra/init/sql/03-bus-membership.sql` is deleted. The bus role still reads and advances cursors through definer functions, and it reads the stream only from its own connection.
- We will run each handler attempt in its own transaction on the module connection. The bus advances a subscriber's cursor on its own connection after that transaction commits, one event at a time. Dead-letter records go on the bus connection too.
- Delivery is therefore at least once. A crash between a handler's commit and the cursor advance runs the handler again. Handlers must be idempotent, and projections use the source version to ignore repeats, as [0013](0013-projections-for-other-modules-only.md) and the event rules require.
- A transport subscription has no module privileges. It runs on the bus connection, as 0011 says.
- Replay uses the same module connections, one transaction per event.

## Consequences

- The handler's writes and the cursor advance are no longer atomic. Review must check every new handler for idempotency.
- A handler cannot use the bus role's privileges or another module's, which closes the escalation path that 0011 left open.
- Each subscribing module needs its own pool. The server holds one pool per registered module login, with the same app password, as the rest of the server does.
- Module logins must exist in the database before a subscriber runs. The init scripts create one login per module schema.

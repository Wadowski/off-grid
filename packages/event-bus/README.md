# @offgrid/event-bus

Purpose: in-process event bus between modules.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Subscriptions

- `subscribe` takes one event type. `subscribeToEvents` takes several: they share one cursor, so the handler sees them in publish order.
- `onFailure` sets what happens after `maxAttempts` failures on an event:
  - `"skip"` (default): the event is dead-lettered and delivery moves on.
  - `"halt"`: delivery stops at that event and retries it on later passes. Later events are not applied until it succeeds. A halted handler can run again for events it already applied in the same batch, so it must be idempotent.

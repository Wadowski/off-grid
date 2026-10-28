---
paths:
  - "packages/contracts/**"
  - "packages/event-bus/**"
  - "modules/*/src/events/**"
---

# Event rules

Modules talk only through versioned events ([ADR 0002](../../docs/adr/0002-outbox-events-and-projections.md)).

- DO name events `<entity>-<created|updated|removed>-v1`.
- DO define each payload schema in `packages/contracts`, validated with zod.
- DO write the event to the outbox in the same transaction as the data change.
- DO make handlers idempotent. Delivery can repeat or arrive out of order.
- DO store the source event version in projections, and treat projections as read-only.
- DON'T change a released event version. Add a `-v2` event instead.
- DON'T publish an event for a rolled-back change.
- DON'T write back to a projection's source module.
- DON'T add Redis or an external message broker ([ADR 0002](../../docs/adr/0002-outbox-events-and-projections.md)).
- DON'T put personal data in event payloads beyond what the consumer needs.

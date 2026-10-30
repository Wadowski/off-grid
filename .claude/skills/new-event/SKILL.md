---
name: new-event
description: Add a new versioned domain event end to end - contract in packages/contracts, outbox write in the same transaction, a projection consumer with a source-version check, and replay, idempotency and dead-letter tests. Use when a module must publish a change to other modules, or a consumer needs a read-only projection of another module's data.
---

# new-event

Modules talk only through versioned events ([ADR 0002](../../../docs/adr/0002-outbox-events-and-projections.md)). Read first: [.claude/rules/events.md](../../rules/events.md) and [.claude/rules/testing.md](../../rules/testing.md).

Naming: entity lifecycle events use `<entity>-<created|updated|removed>-v1`, for example `family-member-created-v1`. Other events, such as a notification request like `notify-user`, follow their own clear name in the same versioned form (`<name>-v1`). A released version never changes; a change of shape is a new `-v2`.

Note: the runtime exists in `packages/event-bus`: `publish(tx, definition, input)` writes to the outbox, `createEventBus(...).subscribe(...)` consumes, `replayEvents` rebuilds, and `classifySourceVersion` decides apply/duplicate/stale/gap. Reference: `modules/family/src/events`.

## Steps

1. **Check the event does not exist.** Search `packages/contracts/src` and `modules/*/src/events` for the name.
   Verify: `grep -rn "<entity>-" packages/contracts modules --include=*.ts` returns nothing for the new name.

2. **Write the contract.** In `packages/contracts`, add the zod schema for the payload and export the event type. Include only the fields a consumer needs, with no personal data beyond that ([events rule](../../rules/events.md)).
   Verify: `pnpm --filter @offgrid/contracts typecheck` passes.

3. **Publish via the outbox.** In the producing module, write the event to the outbox in the same transaction as the data change. Never publish for a rolled-back change.
   Verify: a unit test in the module asserts the outbox row exists after commit and is absent when the transaction rolls back.

4. **Add the projection consumer.** In the consuming module, store the source event version on the projection row. Before applying, compare the incoming version with the stored one and skip older versions. The projection is read-only: never write back to the source module.
   Verify: `pnpm --filter <consumer> test` passes, including the stale-version case.

5. **Test replay and idempotency.** Add tests that: applying the same event twice leaves the same state; replaying a stream from the start reproduces the projection; out-of-order delivery does not regress the version. Run them against a real Postgres container, not mocks ([testing rules](../../rules/testing.md)). Poll with a timeout; do not sleep.
   Verify: the integration suite passes against the container.

6. **Test dead-letter handling.** A handler that keeps failing moves the event to the dead-letter store after the retry limit, and the failure is logged without personal data.
   Verify: a test asserts the dead-letter row and the log line.

7. **Run the checks.** Boundaries catch cross-module imports; the contract package must not import module code.
   Verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm check:boundaries` pass.

8. **Document it.** Add the event to the producing module's README under "Published events", with its version and payload summary.
   Verify: `pnpm format:check` passes.

## Do not

- Edit a released event version. Add `-v2`.
- Add Redis or any external broker ([ADR 0002](../../../docs/adr/0002-outbox-events-and-projections.md)).
- Make a handler depend on delivery order.
- Import another module's code to read its data. Use the projection.

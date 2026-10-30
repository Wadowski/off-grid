# @offgrid/contracts

Purpose: shared zod schemas, event definitions and OpenAPI.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Layout

- `src/uuid-schema.ts`, `src/family-id-schema.ts` and the other id and timestamp schemas: id schemas (`FamilyId`, `UserId`, `AccessGroupId`), timestamps and the error response shape (`code` plus `message`), in `src/error-response-schema.ts`.
- `src/define-event.ts`, `src/parse-event.ts` and `src/event-envelope-schema.ts`: `defineEvent`, the event envelope and `parseEvent`. Names are kebab-case and end in `-v<version>`, for example `family-created-v1`.
- `src/event-definitions.ts`: every event defined in this package. Add each new event here.
- `src/compare-released-events.ts`: compares the live event schemas with the released snapshot.
- `src/build-open-api-document.ts`: builds the OpenAPI document from the shared schemas.
- `released-events.json`: snapshot of released event schemas. Committed; never hand-edit an existing entry.
- `openapi.json`: generated OpenAPI document. Committed; never hand-edit.

## Commands

Run from the repo root.

```bash
pnpm gen:openapi      # regenerate openapi.json
pnpm check:contracts  # fail on a changed or removed released event, or a stale openapi.json
```

`check:contracts` allows new events. To record an event that was added since the snapshot, run `pnpm --filter @offgrid/contracts check:contracts -- --update` (the `--update` flag is passed through to the script). It never rewrites an existing entry.

## Rules

- A released event is frozen. A change of shape is a new version (`-v2`), defined next to the old one.
- Payloads are zod schemas, and the envelope carries `sourceVersion` for projections.
- Only shared, cross-boundary shapes live here. Module-private types stay in their module.

# @offgrid/http

Purpose: HTTP helpers shared by every module route: the signed-in user check, the standard error bodies, validation failures and read outcomes from `@offgrid/access-control`.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Responses

Every error body is `{ code, message }`. The codes are stable:

- `UNAUTHENTICATED` (401): no signed-in user on the request.
- `VALIDATION_FAILED` (400): the request body, params or query did not match the schema. The message lists each failing field.
- `NOT_FOUND` (404): the resource does not exist.
- `ACCESS_DENIED` (403): the resource exists, but the signed-in user may not view it.

## Functions

- `withUser(currentUserId, handle)`: wraps a route handler. Sends 401 without a user, otherwise calls `handle` with the user id.
- `sendValidationFailed(reply, error)`: sends 400 with the zod issues as the message.
- `sendReadOutcome(reply, outcome)`: sends 200 with the value, or 404 or 403 from a `ReadOutcome`.
- `sendUnauthenticated`, `sendNotFound`, `sendAccessDenied`: the fixed-message responses.

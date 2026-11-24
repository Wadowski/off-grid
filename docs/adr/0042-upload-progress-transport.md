# 0042. Upload progress uses an injected XHR transport, and the upload queue lives in memory

- **Status:** Accepted

## Context

[ADR 0038](0038-streamed-upload-request-shape.md) sends each file as one raw request. The Files page must show the progress of each upload, so the web app needs to know how many bytes have left the browser. `fetch` cannot report upload progress, and a streamed request body needs HTTP/2, which the local HTTP stack does not provide. [OG-125](https://linear.app/offgridos/issue/OG-125) adds the Upload button and the queue.

The API client in `packages/api-client` must stay free of session code, and the web app must not write request code outside the typed client.

## Decision

- `createApiClient` takes an optional `sendUpload` transport. `createFilesClient.uploadFile` builds the URL, the headers and the body, calls the transport and parses the answer with the contract schemas. Without a transport it falls back to the plain byte request, without progress.
- The web app provides the transport in `apps/main-web/src/session/`. It sends with `XMLHttpRequest`, reports `upload.onprogress`, adds the same session headers as the other requests, and renews the session once on 401, like `sendWithSession`.
- The upload queue is app-level React state in `AppShell`. It runs one upload at a time, in pick order. It is kept in memory for the browser tab, so it survives navigation inside the app and is dropped on sign-out, reload or a change of family space.

## Consequences

- Easier: progress is real per byte, the api-client stays free of session code, and each file is one request.
- Harder: the queue is lost on reload, because a `File` handle cannot be restored from storage. Uploads that are running stop when the tab closes.
- A family-space change aborts the running upload and fails the queued items, because the family header is read from the session at send time.
- Rejected: `fetch` with a streamed body (no progress on HTTP/1.1 and Chromium only); chunked or resumable uploads (a separate design under `/uploads`); persisting the queue in browser storage (cannot restore `File` handles); parallel uploads (ordering and bandwidth).
- The queue is in-process state of the browser tab, by nature. It is not server state, so the shared-state rules do not apply.

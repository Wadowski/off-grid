# 0038. Uploads send the raw file bytes with the name and parent in headers

- **Status:** Accepted

## Context

[OG-114](https://linear.app/offgridos/issue/OG-114) adds the first way to put a file into a drive. The request has to carry the bytes, a file name, a parent folder and a declared media type. The bytes can be large, so the server must store them while they arrive, without holding the whole file in memory, and it must stop reading once a configured size limit is passed ([0033](0033-file-bytes-on-a-disk-volume.md)).

A multipart body would need a parser dependency and buffers each part for the form fields. A name in the query string would put a personal name into URLs, which logs and proxies record.

## Decision

- `POST /api/files/drives/{id}/files` takes the file bytes as the raw request body, as they are, without a wrapper.
- The declared media type travels in `Content-Type`. When it is absent, the server derives the type from the file name extension and falls back to `application/octet-stream`.
- The file name travels in the `X-Offgrid-File-Name` header, percent-encoded. The parent folder travels in `X-Offgrid-Parent-Id`; when the header is absent, the file goes to the root of the drive.
- The server reads the body as a stream, enforces `OFFGRID_FILES_MAX_UPLOAD_BYTES` while it reads, and answers 413 `PAYLOAD_TOO_LARGE` when the limit is passed.
- No multipart parser and no new dependency are added. The raw body parser applies only to the upload route, so the JSON routes keep their parsing.

## Consequences

- Easier: the server streams each byte to storage once, with no buffering, and the limit is checked as the bytes arrive. Clients send one request with the bytes and their metadata.
- Harder: a client must percent-encode non-ASCII names and set the headers itself. Browser uploads use `XMLHttpRequest` or `fetch` with the file as the body, which is also what progress reporting needs ([OG-125](https://linear.app/offgridos/issue/OG-125)).
- Chunked and resumable uploads stay a separate design under the `/uploads` routes, which remain unimplemented.

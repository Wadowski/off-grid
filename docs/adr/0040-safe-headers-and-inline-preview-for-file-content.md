# 0040. Safe headers and inline preview for file content

- **Status:** Accepted

## Context

[OG-116](https://linear.app/offgridos/issue/OG-116) adds the routes that send the bytes of a file or of one of its versions: `GET /files/:id/content` and `GET /files/:id/versions/:versionId/content`. The bytes come from a person's upload, so the stored media type is untrusted. A stored `text/html` or an SVG rendered by the browser on the server's origin would run script. [0033](0033-file-bytes-on-a-disk-volume.md) keeps the bytes on a disk volume, and [0034](0034-files-access-model-trash-and-versions.md) keeps the access check in the database through row-level security.

The web app will show images and PDFs in an `<img>` or a viewer, so a download must also be able to render inline. Browsers only trust what the response headers say.

## Decision

### 1. Every content response carries the same safe headers

A successful response (200 or 206) sends `Content-Length`, `Content-Type`, `Content-Disposition`, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store` and `Accept-Ranges: bytes`. The bytes are never cached by a shared cache, and the browser never sniffs a type.

We chose no ETag and no `Last-Modified`. An ETag from the file hash would expose the hash that [0033](0033-file-bytes-on-a-disk-volume.md) keeps off the wire. Conditional requests are out of scope.

### 2. Attachment is the default; inline is asked for and allowed for a short list

The content URL takes a query parameter `disposition`, with the values `attachment` (the default) and `inline`. The response is inline only when the caller asks for it and the stored media type is one of `image/png`, `image/jpeg`, `image/gif`, `image/webp` or `application/pdf`. Any other type is sent as an attachment with `Content-Type: application/octet-stream`, so a stored `text/html` or `image/svg+xml` is never rendered.

Rejected: inline for every safe type by default. A plain download link would then open in the browser instead of saving. Rejected: a request header such as `Sec-Fetch-Dest`. A `fetch` cannot set it or read it, and it is hard to test.

### 3. Inline responses carry a restrictive Content-Security-Policy

An inline image is sent with `Content-Security-Policy: default-src 'none'; sandbox`. A PDF cannot use the `sandbox` directive, because it blocks the browser's PDF viewer, so a PDF is sent with `default-src 'none'; object-src 'self'; frame-ancestors 'self'`. The PDF policy is checked in a browser before the change is merged.

### 4. A byte range is honoured only in its simple form

A `Range: bytes=a-b`, `bytes=a-` or `bytes=-n` header answers 206 with `Content-Range`. A range outside the object answers 416 with `Content-Range: bytes */<size>`. A malformed header, a unit other than `bytes`, or a multi-range header is ignored and the whole file is sent with 200. Multi-range responses are out of scope.

### 5. The file name is encoded so no header can be broken

`Content-Disposition` carries an ASCII `filename` fallback and an RFC 5987 `filename*=UTF-8''...`. Quotes, backslashes, control characters (CR and LF among them) and non-ASCII characters are replaced or percent-encoded in the fallback and the encoded form, so a name cannot end the header or add another one.

### 6. Hidden rows and missing bytes

A file or version the caller cannot see answers 404 `NOT_FOUND`, as for every files read. A row whose bytes are missing from storage answers 404 and logs only the ids, never the name, the key or the hash.

### 7. Consequences

- `<img>` and `<iframe>` elements cannot send the bearer header. The web issue (OG-137) must fetch the bytes into a blob, or add a cookie path. This change does not add a cookie or a query token.
- Content is streamed from storage outside the database transaction, so a slow client does not hold a pooled connection.
- Rollback is a revert of the routes. There is no migration and no event.

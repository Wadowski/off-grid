# @offgrid/file-storage

Purpose: the common file-storage port and its adapters. Feature code writes, reads and deletes opaque objects through one interface, so a disk volume, an in-memory fake or a later S3-compatible client all run the same key rules, range rules and error types.
Public API: `src/index.ts` (adapters, key and range primitives, errors, types) and `@offgrid/file-storage/testing` for the shared contract suite.
Owner: platform team

## Interface

`FileStorage` (`src/types.ts`) has five operations:

- `put(source, { signal? })` reads an `AsyncIterable<Uint8Array>` and returns `{ key, sizeBytes, sha256 }`. An aborted or failed source leaves no object behind.
- `get(key, { start, end? })` returns a `Readable`. `end` is inclusive and optional; omitting the range returns the whole object.
- `delete(key)` removes the object. Deleting a missing key is not an error.
- `exists(key)` returns a boolean.
- `listKeys()` yields `{ key, modifiedAt }` for every committed object.

Keys are 32 lowercase hex characters from 16 random bytes. Every operation rejects a key that does not match `^[0-9a-f]{32}$` with `StorageKeyInvalidError` before it reaches a backend.

## Adapters

- `createDiskFileStorage(directory)`: objects live at `<directory>/ab/cd/<key>`. A write streams into `<directory>/.tmp/<random>.part`, hashes and counts while it streams, fsyncs, then renames to the final key. A failed or aborted write removes its temporary file. The adapter checks that every resolved path stays under the directory. `listKeys` ignores the temporary folder and any name that is not a key.
- `createInMemoryFileStorage()`: a `Map` in process memory. It is a test double with the same contract, not a cache.

Both adapters throw the same errors: `StorageIoError` (carries a file-system error code only), `StorageKeyInvalidError`, `StorageObjectNotFoundError`, `StorageRangeNotSatisfiableError` and `StorageKeyAllocationError`. Their messages never contain a key, path, hash or name.

## Shared primitives for adapters

Exported from the index so that any adapter reuses the same rules:

- `isValidStorageKey` and `assertValidStorageKey` (key shape).
- `allocateStorageKey(isTaken)` generates a key that the backend reports as free, and gives up after a few taken keys.
- `resolveRequestedRange(sizeBytes, range)` turns an optional inclusive range into `{ start, length }`, or throws `StorageRangeNotSatisfiableError`.

## Contract suite

`describeFileStorageContract(name, createFixture)` from `@offgrid/file-storage/testing` registers the behaviour every adapter must have: the put result, exact bytes, first, middle, last and open-ended ranges, range rejection, missing-key errors, empty objects, `exists`, idempotent `delete`, key rejection before any operation, `listKeys` contents after deletes, failing sources and an already-aborted signal.

`createFixture` returns `{ storage, cleanup }`. `createStorageRoot`, `createTemporaryDirectory` and `removeDirectory` in the same entry are helpers for disk-backed fixtures.

The package's own tests run the suite against the disk and in-memory adapters (`src/disk/*.test.ts`, `src/memory/*.test.ts`). The disk tests also cover temp-file cleanup, traversal and a 300 MiB write that must stay under 64 MiB of memory growth.

## Adding an adapter (for example S3)

1. Implement `FileStorage` for the backend in its own folder, for example `src/s3/create-s3-file-storage.ts`, or in a separate package that depends on `@offgrid/file-storage`.
2. Validate every key with `assertValidStorageKey` before the backend call, and use `resolveRequestedRange` for `get` so ranges behave the same way.
3. Throw the shared error classes. Do not add backend-specific error types to callers.
4. Map the backend's "no such object" to `StorageObjectNotFoundError` and its "range not satisfiable" to `StorageRangeNotSatisfiableError`.
5. Add a test file that calls `describeFileStorageContract("s3", createFixture)` from `@offgrid/file-storage/testing`. The fixture can use a test bucket or a fake server, and `cleanup` must remove what the test wrote.

Nothing in this package imports from `modules/` or `apps/`. Feature modules import it through `@offgrid/file-storage` only.

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export { createDiskFileStorage } from "./disk/create-disk-file-storage.js";
export { createInMemoryFileStorage } from "./memory/create-in-memory-file-storage.js";
export { allocateStorageKey } from "./keys/allocate-storage-key.js";
export { assertValidStorageKey } from "./keys/assert-valid-storage-key.js";
export { isValidStorageKey } from "./keys/is-valid-storage-key.js";
export { resolveRequestedRange } from "./ranges/resolve-requested-range.js";
export { StorageIoError } from "./errors/storage-io-error.js";
export { StorageKeyAllocationError } from "./errors/storage-key-allocation-error.js";
export { StorageKeyInvalidError } from "./errors/storage-key-invalid-error.js";
export { StorageObjectNotFoundError } from "./errors/storage-object-not-found-error.js";
export { StorageRangeNotSatisfiableError } from "./errors/storage-range-not-satisfiable-error.js";
export type {
  ByteRange,
  FileStorage,
  PutOptions,
  StoredObject,
  StoredObjectEntry,
} from "./types.js";

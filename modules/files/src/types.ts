// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Readable } from "node:stream";

export interface ByteRange {
  readonly start: number;
  readonly end?: number;
}

export interface StoredObject {
  readonly key: string;
  readonly sizeBytes: number;
  readonly sha256: string;
}

export interface PutOptions {
  readonly signal?: AbortSignal;
}

export interface StoredObjectEntry {
  readonly key: string;
  readonly modifiedAt: Date;
}

export interface ShardKeyFile {
  readonly key: string;
  readonly path: string;
}

export interface InMemoryObject {
  readonly bytes: Buffer;
  readonly modifiedAt: Date;
}

export interface FileStorage {
  put(source: AsyncIterable<Uint8Array>, options?: PutOptions): Promise<StoredObject>;
  get(key: string, range?: ByteRange): Promise<Readable>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  listKeys(): AsyncIterable<StoredObjectEntry>;
}

export interface StorageIntegrityReport {
  readonly orphanKeys: readonly string[];
  readonly missingKeys: readonly string[];
  readonly orphanCount: number;
  readonly missingCount: number;
  readonly checkedRowCount: number;
  readonly checkedObjectCount: number;
}

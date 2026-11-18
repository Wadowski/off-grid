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

export interface FileStorage {
  put(source: AsyncIterable<Uint8Array>, options?: PutOptions): Promise<StoredObject>;
  get(key: string, range?: ByteRange): Promise<Readable>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

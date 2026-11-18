// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createHashingCountingTransform } from "./hashing-counting-transform.js";
import { syncFile } from "./sync-file.js";

export const writeStreamToTempFile = async (
  tempPath: string,
  source: AsyncIterable<Uint8Array>,
  signal: AbortSignal | undefined,
): Promise<{ readonly sizeBytes: number; readonly sha256: string }> => {
  const hashing = createHashingCountingTransform();
  await pipeline(source, hashing.stream, createWriteStream(tempPath, { flags: "wx" }), { signal });
  await syncFile(tempPath);
  return hashing.summary();
};

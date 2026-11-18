// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { Transform } from "node:stream";

export const createHashingCountingTransform = () => {
  const hash = createHash("sha256");
  let sizeBytes = 0;
  const stream = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      hash.update(chunk);
      sizeBytes += chunk.length;
      callback(null, chunk);
    },
  });
  return {
    stream,
    summary: () => ({ sizeBytes, sha256: hash.digest("hex") }),
  };
};

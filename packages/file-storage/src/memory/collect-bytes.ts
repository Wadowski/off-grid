// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const collectBytes = async (
  source: AsyncIterable<Uint8Array>,
  signal: AbortSignal | undefined,
): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of source) {
    signal?.throwIfAborted();
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const limitUploadStream = (
  source: AsyncIterable<Uint8Array>,
  maxBytes: number,
  createExceededError: () => Error,
): AsyncIterable<Uint8Array> => ({
  [Symbol.asyncIterator]: () => {
    const iterator = source[Symbol.asyncIterator]();
    let receivedBytes = 0;
    return {
      next: async () => {
        const result = await iterator.next();
        if (result.done === true) {
          return result;
        }
        receivedBytes += result.value.byteLength;
        if (receivedBytes > maxBytes) {
          await iterator.return?.();
          throw createExceededError();
        }
        return result;
      },
      return: async () => {
        await iterator.return?.();
        return { done: true, value: undefined };
      },
    };
  },
});

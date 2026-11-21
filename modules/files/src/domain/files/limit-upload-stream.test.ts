// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { limitUploadStream } from "./limit-upload-stream.js";

const createExceededError = (): Error => new Error("exceeded");

const chunksOf = (...sizes: number[]): AsyncIterable<Uint8Array> =>
  Readable.from(sizes.map((size) => new Uint8Array(size)));

const collect = async (source: AsyncIterable<Uint8Array>): Promise<number[]> => {
  const sizes: number[] = [];
  for await (const chunk of source) {
    sizes.push(chunk.byteLength);
  }
  return sizes;
};

describe("limitUploadStream", () => {
  it("passes every chunk through when the total stays within the limit", async () => {
    const limited = limitUploadStream(chunksOf(3, 4), 7, createExceededError);

    await expect(collect(limited)).resolves.toEqual([3, 4]);
  });

  it("passes an empty body through", async () => {
    const limited = limitUploadStream(chunksOf(), 0, createExceededError);

    await expect(collect(limited)).resolves.toEqual([]);
  });

  it("throws the given error on the chunk that passes the limit", async () => {
    const limited = limitUploadStream(chunksOf(3, 5, 1), 7, createExceededError);
    const received: number[] = [];

    await expect(
      (async () => {
        for await (const chunk of limited) {
          received.push(chunk.byteLength);
        }
      })(),
    ).rejects.toThrow("exceeded");
    expect(received).toEqual([3]);
  });
});

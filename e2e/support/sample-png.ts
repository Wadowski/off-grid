// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { deflateSync } from "node:zlib";
import { pngChunk } from "./png-chunk.js";

const WIDTH = 240;
const HEIGHT = 160;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const BIT_DEPTH_8 = 8;
const COLOR_TYPE_RGB = 2;
const BYTES_PER_PIXEL = 3;

export const samplePng = (): Buffer => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = BIT_DEPTH_8;
  header[9] = COLOR_TYPE_RGB;
  const rowLength = 1 + WIDTH * BYTES_PER_PIXEL;
  const pixels = Buffer.alloc(rowLength * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const offset = y * rowLength + 1 + x * BYTES_PER_PIXEL;
      pixels[offset] = Math.round((x / WIDTH) * 255);
      pixels[offset + 1] = Math.round((y / HEIGHT) * 255);
      pixels[offset + 2] = 160;
    }
  }
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(pixels)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
};

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toDroppedFiles } from "./to-dropped-files.js";

const fileItem = (file: File, isDirectory = false): DataTransferItem =>
  ({
    kind: "file",
    getAsFile: () => file,
    webkitGetAsEntry: () => ({ isDirectory }),
  }) as unknown as DataTransferItem;

const dataTransferOf = (items: readonly DataTransferItem[]) =>
  ({ items }) as unknown as DataTransfer;

describe("toDroppedFiles", () => {
  it("returns every dropped regular file in drop order", () => {
    const first = new File(["a"], "a.txt");
    const second = new File(["b"], "b.txt");

    expect(toDroppedFiles(dataTransferOf([fileItem(first), fileItem(second)]))).toEqual([
      first,
      second,
    ]);
  });

  it("skips a dropped directory and keeps the files next to it", () => {
    const notes = new File(["n"], "Notes.txt");

    expect(
      toDroppedFiles(dataTransferOf([fileItem(new File([], "Photos"), true), fileItem(notes)])),
    ).toEqual([notes]);
  });

  it("skips items that are not files, such as dropped text", () => {
    const text = { kind: "string", getAsFile: () => null } as unknown as DataTransferItem;

    expect(toDroppedFiles(dataTransferOf([text]))).toEqual([]);
  });

  it("keeps a file when the browser does not report entries", () => {
    const file = new File(["a"], "a.txt");
    const item = { kind: "file", getAsFile: () => file } as unknown as DataTransferItem;

    expect(toDroppedFiles(dataTransferOf([item]))).toEqual([file]);
  });
});

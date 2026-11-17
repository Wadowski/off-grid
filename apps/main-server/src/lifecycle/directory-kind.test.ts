// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { directoryKindOf } from "./directory-kind.js";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, stat: vi.fn(actual.stat) };
});

const errorWithCode = (code: string): NodeJS.ErrnoException =>
  Object.assign(new Error(`${code}: simulated`), { code });

describe("directoryKindOf", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "offgrid-directory-kind-"));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    vi.mocked(stat).mockClear();
  });

  it("reports a directory as directory", async () => {
    await expect(directoryKindOf(root)).resolves.toBe("directory");
  });

  it("reports a regular file as other", async () => {
    const file = join(root, "note.txt");
    writeFileSync(file, "");

    await expect(directoryKindOf(file)).resolves.toBe("other");
  });

  it("reports an absent path as missing (ENOENT)", async () => {
    await expect(directoryKindOf(join(root, "absent"))).resolves.toBe("missing");
  });

  it("reports a path below a regular file as missing (ENOTDIR)", async () => {
    const file = join(root, "note.txt");
    writeFileSync(file, "");

    await expect(directoryKindOf(join(file, "child"))).resolves.toBe("missing");
  });

  it("rethrows a permission error instead of reporting the path as missing", async () => {
    vi.mocked(stat).mockRejectedValueOnce(errorWithCode("EACCES"));

    await expect(directoryKindOf(root)).rejects.toThrow("EACCES: simulated");
  });

  it("rethrows an I/O error instead of reporting the path as missing", async () => {
    vi.mocked(stat).mockRejectedValueOnce(errorWithCode("EIO"));

    await expect(directoryKindOf(root)).rejects.toThrow("EIO: simulated");
  });
});

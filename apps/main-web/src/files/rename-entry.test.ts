// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { renameFile } from "./files-api.js";
import { renameEntry } from "./rename-entry.js";
import type { FileEntry } from "./types.js";

vi.mock("./files-api.js", () => ({ renameFile: vi.fn() }));

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const ENTRY = { id: FILE_ID, name: "Notes.md" } as FileEntry;

afterEach(() => {
  vi.resetAllMocks();
});

describe("renameEntry", () => {
  it("sends the new name for the entry and returns the renamed entry", async () => {
    vi.mocked(renameFile).mockResolvedValue(ENTRY);

    await expect(renameEntry(FILE_ID, "Notes.md")).resolves.toEqual(ENTRY);
    expect(renameFile).toHaveBeenCalledWith(FILE_ID, { name: "Notes.md" });
  });
});

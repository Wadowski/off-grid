// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileVersionSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toFileActivityEntries } from "./to-file-activity-entries.js";

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const ANNA_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const BEN_ID = "9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e";

const version = (number: number, createdByUserId: string) =>
  fileVersionSchema.parse({
    id: `8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c${number}0`,
    fileId: FILE_ID,
    number,
    size: 100,
    mimeType: "application/pdf",
    createdByUserId,
    createdAt: `2026-01-0${number}T00:00:00.000Z`,
  });

describe("toFileActivityEntries", () => {
  it("lists the versions newest first with the name of who saved each", () => {
    const versions = [version(1, ANNA_ID), version(2, BEN_ID)];
    const names = new Map([
      [ANNA_ID, "Anna"],
      [BEN_ID, "Ben"],
    ]);

    const entries = toFileActivityEntries(versions, (userId) => names.get(userId) ?? null);

    expect(entries.map((entry) => [entry.number, entry.name])).toEqual([
      [2, "Ben"],
      [1, "Anna"],
    ]);
    expect(entries[0]?.createdAt).toEqual(new Date("2026-01-02T00:00:00.000Z"));
  });

  it("keeps an entry whose author cannot be resolved, without a name", () => {
    const entries = toFileActivityEntries([version(1, BEN_ID)], () => null);

    expect(entries).toEqual([expect.objectContaining({ number: 1, name: null })]);
  });
});

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../api/web-api-client.js";
import { TRASH_PAGE_LIMIT } from "./constants.js";
import { readAllTrashPages } from "./read-all-trash-pages.js";
import type { Drive, FileListItem, FileListPage } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const ITEM = { id: "item-1" } as FileListItem;
const OTHER_ITEM = { id: "item-2" } as FileListItem;

const pageOf = (items: FileListItem[], nextCursor: string | null): FileListPage =>
  ({ items, breadcrumbs: [], nextCursor }) as FileListPage;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readAllTrashPages", () => {
  it("reads every page of the drive trash, following the cursor, in order", async () => {
    const list = vi
      .spyOn(webFilesClient, "listDriveTrash")
      .mockResolvedValueOnce(pageOf([ITEM], "next"))
      .mockResolvedValueOnce(pageOf([OTHER_ITEM], null));

    await expect(readAllTrashPages(DRIVE_ID)).resolves.toEqual([ITEM, OTHER_ITEM]);
    expect(list).toHaveBeenNthCalledWith(1, DRIVE_ID, { limit: TRASH_PAGE_LIMIT });
    expect(list).toHaveBeenNthCalledWith(2, DRIVE_ID, {
      limit: TRASH_PAGE_LIMIT,
      cursor: "next",
    });
  });

  it("rejects when a later page fails", async () => {
    vi.spyOn(webFilesClient, "listDriveTrash")
      .mockResolvedValueOnce(pageOf([ITEM], "next"))
      .mockRejectedValueOnce(new Error("offline"));

    await expect(readAllTrashPages(DRIVE_ID)).rejects.toThrow("offline");
  });
});

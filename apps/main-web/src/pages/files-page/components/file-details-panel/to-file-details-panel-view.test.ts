// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { Breadcrumb, Drive, FileDetailsState, FileEntry } from "../../../../files/types.js";
import { toFileDetailsPanelView } from "./to-file-details-panel-view.js";

const REFRESH = vi.fn(async () => undefined);

const regularFile = { isFolder: false, name: "Trip.pdf" } as FileEntry;
const folderEntry = { isFolder: true, name: "Photos" } as FileEntry;

const detailsWith = (overrides: Partial<FileDetailsState>): FileDetailsState => ({
  file: null,
  breadcrumbs: [],
  status: "ready",
  errorTextId: null,
  refresh: REFRESH,
  refreshQuietly: REFRESH,
  ...overrides,
});

describe("toFileDetailsPanelView", () => {
  it("is loading while the details are fetched", () => {
    expect(toFileDetailsPanelView(detailsWith({ status: "loading" }))).toEqual({ kind: "loading" });
  });

  it("is ready with the file and its breadcrumbs", () => {
    const breadcrumbs: readonly Breadcrumb[] = [
      {
        kind: "drive",
        id: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"],
        name: "Personal",
      },
    ];

    expect(toFileDetailsPanelView(detailsWith({ file: regularFile, breadcrumbs }))).toEqual({
      kind: "ready",
      file: regularFile,
      breadcrumbs,
    });
  });

  it("is failed with the mapped error text and the retry action when the request failed", () => {
    expect(
      toFileDetailsPanelView(
        detailsWith({ status: "failed", errorTextId: "files.errors.notFound" }),
      ),
    ).toEqual({ kind: "failed", errorTextId: "files.errors.notFound", onRetry: REFRESH });
  });

  it("is failed with the generic error text when a failed request has no mapped text", () => {
    expect(toFileDetailsPanelView(detailsWith({ status: "failed" }))).toEqual({
      kind: "failed",
      errorTextId: "files.errors.failed",
      onRetry: REFRESH,
    });
  });

  it("is failed with the folder text when the entry is a folder", () => {
    expect(toFileDetailsPanelView(detailsWith({ file: folderEntry }))).toEqual({
      kind: "failed",
      errorTextId: "files.errors.isFolder",
      onRetry: REFRESH,
    });
  });
});

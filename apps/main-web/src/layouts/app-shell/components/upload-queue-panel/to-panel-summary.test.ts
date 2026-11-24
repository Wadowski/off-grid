// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { UploadItem } from "../../../../uploads/index.js";
import { toPanelSummary } from "./to-panel-summary.js";

const itemWith = (status: UploadItem["status"], percent = 0): UploadItem =>
  ({ id: status + percent, status, percent }) as UploadItem;

describe("toPanelSummary", () => {
  it("counts the finished uploads while one is still running", () => {
    expect(toPanelSummary([itemWith("done", 100), itemWith("uploading", 50)])).toEqual({
      textId: "files.upload.summaryActive",
      values: { done: 1, total: 2 },
      percent: 75,
    });
  });

  it("reports the failures once everything has finished", () => {
    expect(toPanelSummary([itemWith("done", 100), itemWith("failed")])).toMatchObject({
      textId: "files.upload.summaryFailed",
      values: { count: 1 },
    });
  });

  it("does not count a failed upload as progress in the aggregate", () => {
    expect(toPanelSummary([itemWith("done", 100), itemWith("failed", 100)])).toMatchObject({
      textId: "files.upload.summaryFailed",
      percent: 50,
    });
  });

  it("reports the uploaded count when everything succeeded", () => {
    expect(toPanelSummary([itemWith("done", 100), itemWith("done", 100)])).toMatchObject({
      textId: "files.upload.summaryDone",
      values: { count: 2 },
      percent: 100,
    });
  });
});

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isActiveUploadItem, type UploadItem } from "../../../../uploads/index.js";
import type { PanelSummary } from "./types.js";

const progressOf = (item: UploadItem): number => (item.status === "failed" ? 0 : item.percent);

export const toPanelSummary = (items: readonly UploadItem[]): PanelSummary => {
  const total = items.length;
  const percent =
    total === 0 ? 0 : Math.floor(items.reduce((sum, item) => sum + progressOf(item), 0) / total);
  const finished = items.filter((item) => !isActiveUploadItem(item)).length;
  const done = items.filter((item) => item.status === "done").length;
  const failed = items.filter((item) => item.status === "failed").length;
  if (items.some(isActiveUploadItem)) {
    return { textId: "files.upload.summaryActive", values: { done: finished, total }, percent };
  }
  if (failed > 0) {
    return { textId: "files.upload.summaryFailed", values: { count: failed }, percent };
  }
  return { textId: "files.upload.summaryDone", values: { count: done }, percent };
};

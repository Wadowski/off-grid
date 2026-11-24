// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type PanelSummaryTextId =
  "files.upload.summaryActive" | "files.upload.summaryDone" | "files.upload.summaryFailed";

export type PanelSummary = {
  readonly textId: PanelSummaryTextId;
  readonly values: Readonly<Record<string, number>>;
  readonly percent: number;
};

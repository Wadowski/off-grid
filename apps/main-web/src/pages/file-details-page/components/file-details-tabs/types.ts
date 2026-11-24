// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FileDetailsTab = "details" | "activity";

export type FileDetailsTabsProps = {
  readonly value: FileDetailsTab;
  readonly activityCount: number | null;
  readonly onChange: (tab: FileDetailsTab) => void;
};

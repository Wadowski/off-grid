// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type ReminderGroupProps = {
  readonly offsets: readonly number[];
  readonly disabled: boolean;
  readonly submitAttempt: number;
  readonly onChange: (offsets: readonly number[], valid: boolean) => void;
};

export type ReminderFocusRequest = {
  readonly testId: string;
};

export type ReminderAnnouncement = "added" | "removed";

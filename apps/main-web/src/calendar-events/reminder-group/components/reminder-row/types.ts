// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReminderDraft, ReminderErrorCode, ReminderUnit } from "../../../types.js";

export type ReminderRowProps = {
  readonly index: number;
  readonly total: number;
  readonly draft: ReminderDraft;
  readonly error: ReminderErrorCode | undefined;
  readonly disabled: boolean;
  readonly onAmount: (amount: string) => void;
  readonly onUnit: (unit: ReminderUnit) => void;
  readonly onRemove: () => void;
};

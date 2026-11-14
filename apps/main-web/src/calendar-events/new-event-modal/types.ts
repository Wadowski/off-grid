// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Calendar } from "../../calendars/types.js";

export type NewEventModalProps = {
  readonly calendars: readonly Calendar[];
  readonly timeZone: string;
  readonly onClose: () => void;
  readonly onSaved: () => void;
};

export type FormAlertTextId =
  | "calendar.eventModal.incomplete"
  | "calendar.eventModal.invalid"
  | "calendar.eventModal.saveFailed";

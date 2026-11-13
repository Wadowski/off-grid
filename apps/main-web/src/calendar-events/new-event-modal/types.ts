// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Calendar } from "../../calendars/types.js";

export type NewEventModalProps = {
  readonly calendars: readonly Calendar[];
  readonly timeZone: string;
  // Called when the modal is dismissed without saving. The entered values are discarded.
  readonly onClose: () => void;
  // Called after the event is saved.
  readonly onSaved: () => void;
};

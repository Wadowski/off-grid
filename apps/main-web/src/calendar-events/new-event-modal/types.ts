// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Calendar } from "../../calendars/types.js";
import type { EventFormValues } from "../types.js";

export type EditingEvent = {
  readonly eventId: string;
  readonly initialValues: EventFormValues;
};

export type NewEventModalProps = {
  readonly calendars: readonly Calendar[];
  readonly timeZone: string;
  readonly onClose: () => void;
  readonly onSaved: () => void;
  readonly editing?: EditingEvent;
};

export type FormAlertTextId =
  | "calendar.eventModal.incomplete"
  | "calendar.eventModal.invalid"
  | "calendar.eventModal.saveFailed"
  | "calendar.guests.partialFailure";

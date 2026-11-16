import type { KeyboardEvent } from "react";
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarEventUpdateInput, NewCalendarEventInput } from "@offgrid/contracts";
import type { REMINDER_UNITS } from "./constants.js";

export type EventFormValues = {
  readonly title: string;
  readonly calendarId: string;
  readonly isAllDay: boolean;
  readonly startDate: string;
  readonly startTime: string;
  readonly endDate: string;
  readonly endTime: string;
  readonly location: string;
  readonly description: string;
  readonly reminderOffsetsMinutes: readonly number[];
};

export type EventFormErrors = {
  readonly title?: "titleRequired" | "titleTooLong";
  readonly end?: "endsBeforeStart" | "invalid";
  readonly form?: "incomplete" | "invalid";
};

export type MutableEventFormErrors = { -readonly [K in keyof EventFormErrors]: EventFormErrors[K] };

export type ZodIssueLike = {
  readonly code: string;
  readonly path: readonly PropertyKey[];
  readonly params?: Readonly<Record<string, unknown>>;
};

export type EventFormResult =
  | { readonly ok: true; readonly request: NewCalendarEventInput }
  | { readonly ok: false; readonly errors: EventFormErrors };

export type LocationParts = { readonly pathname: string; readonly search: string };

export type EventUpdateResult =
  | { readonly ok: true; readonly request: CalendarEventUpdateInput | undefined }
  | { readonly ok: false; readonly errors: EventFormErrors };

export type EventDetailsTarget = {
  readonly to: { readonly pathname: string; readonly search: string };
  readonly state: { readonly background: string };
};

export type EventsChangedListener = () => void;

export type OpenEvent = (eventId: string) => void;

export type EventOpenProps = {
  readonly role?: "button";
  readonly tabIndex?: 0;
  readonly "aria-haspopup"?: "dialog";
  readonly onClick?: () => void;
  readonly onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

export type EventFormSource = {
  readonly calendarId: string;
  readonly title: string;
  readonly location: string | null;
  readonly description: string | null;
  readonly isAllDay: boolean;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly reminderOffsetsMinutes?: readonly number[];
};

export type ReminderUnit = (typeof REMINDER_UNITS)[number];

export type ReminderDraft = {
  readonly key: number;
  readonly amount: string;
  readonly unit: ReminderUnit;
};

export type ReminderErrorCode = "empty" | "notWhole" | "negative" | "tooLarge" | "duplicate";

export type ReminderOffsetResult =
  | { readonly ok: true; readonly minutes: number }
  | { readonly ok: false; readonly error: ReminderErrorCode };

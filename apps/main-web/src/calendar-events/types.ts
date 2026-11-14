// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NewCalendarEventInput } from "@offgrid/contracts";

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

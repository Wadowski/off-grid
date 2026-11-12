// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilySummary } from "../../types.js";
import type { CalendarColor } from "../../calendars/calendar-accents.js";
import type { CalendarSaveStatus } from "../../calendars/types.js";
import type { ReactNode } from "react";

export type CalendarFormValues = {
  readonly name: string;
  readonly color: CalendarColor;
  readonly familyId: string | undefined;
};

type CalendarFormBase = {
  readonly initialValues?: { readonly name: string; readonly color: CalendarColor };
  readonly status: CalendarSaveStatus;
  readonly onSubmit: (values: CalendarFormValues) => Promise<void>;
  readonly submitTextId: "calendar.calendars.create" | "calendar.actions.save";
  readonly footer?: ReactNode;
};

export type CalendarFormProps = CalendarFormBase &
  (
    | { readonly mode: "create"; readonly families: readonly FamilySummary[] }
    | { readonly mode: "edit"; readonly ownerFamilyName: string | undefined }
  );

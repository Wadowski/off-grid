// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { EventFormErrors, EventFormValues } from "../../../types.js";

export type NewEventFieldsProps = {
  readonly values: EventFormValues;
  readonly errors: EventFormErrors;
  readonly timeZone: string;
  readonly narrow: boolean;
  readonly calendarPicker: ReactNode;
  readonly update: <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => void;
};

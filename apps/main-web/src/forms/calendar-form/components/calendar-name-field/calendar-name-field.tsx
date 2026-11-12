// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text, TextField } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { CALENDAR_NAME_MAX_LENGTH } from "../../../../calendars/constants.js";
import type { CalendarNameErrorTextId } from "../../validate-calendar-name.js";

type CalendarNameFieldProps = {
  readonly value: string;
  readonly errorTextId: CalendarNameErrorTextId | undefined;
  readonly onChange: (value: string) => void;
};

export const CalendarNameField = ({ value, errorTextId, onChange }: CalendarNameFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      data-testid="calendar-name"
      name="name"
      value={value}
      placeholder={t("calendar.calendars.namePlaceholder")}
      maxLength={CALENDAR_NAME_MAX_LENGTH}
      onChange={(event) => onChange(event.target.value)}
      label={<Text variant="label" textId="calendar.calendars.name" />}
      labelAside={<Text variant="status" textId="families.required" />}
      error={errorTextId === undefined ? undefined : <Text variant="error" textId={errorTextId} />}
    />
  );
};

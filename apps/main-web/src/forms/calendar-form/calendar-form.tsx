// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { CALENDAR_COLORS } from "@offgrid/contracts";
import type { FormEvent } from "react";
import { useState } from "react";
import { type CalendarColor, calendarAccentColor } from "../../calendars/calendar-accents.js";
import { SwatchPicker } from "../shared/swatch-picker/swatch-picker.js";
import { CalendarNameField } from "./components/calendar-name-field/calendar-name-field.js";
import { OwnerField } from "./components/owner-field/owner-field.js";
import { CALENDAR_COLOR_LABEL_TEXT_IDS } from "./constants.js";
import { calendarFormFooterStyle, calendarFormStyle } from "./styles.js";
import type { CalendarFormProps } from "./types.js";
import { validateCalendarName, type CalendarNameErrorTextId } from "./validate-calendar-name.js";

export const CalendarForm = (props: CalendarFormProps) => {
  const { mode, status, errorTextId, onSubmit, submitTextId, footer, initialValues } = props;
  const [name, setName] = useState(initialValues?.name ?? "");
  const [color, setColor] = useState<CalendarColor>(initialValues?.color ?? "blue");
  const [familyId, setFamilyId] = useState("");
  const [nameErrorTextId, setNameErrorTextId] = useState<CalendarNameErrorTextId | undefined>(
    undefined,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const errorTextId = validateCalendarName(trimmedName);
    setNameErrorTextId(errorTextId);
    if (errorTextId !== undefined) {
      return;
    }
    await onSubmit({
      name: trimmedName,
      color,
      familyId: mode === "create" && familyId !== "" ? familyId : undefined,
    });
  };

  return (
    <form data-testid="calendar-form" style={calendarFormStyle} onSubmit={handleSubmit} noValidate>
      <CalendarNameField value={name} errorTextId={nameErrorTextId} onChange={setName} />
      {mode === "create" ? (
        <OwnerField
          mode="create"
          families={props.families}
          value={familyId}
          onChange={setFamilyId}
        />
      ) : (
        <OwnerField mode="edit" ownerFamilyName={props.ownerFamilyName} />
      )}
      <SwatchPicker<CalendarColor>
        headingId="calendar-color-heading"
        headingTextId="calendar.calendars.color"
        options={CALENDAR_COLORS}
        value={color}
        onChange={setColor}
        labelTextIds={CALENDAR_COLOR_LABEL_TEXT_IDS}
        backgroundOf={(option) => calendarAccentColor(option).background}
        testIdPrefix="calendar-color"
      />
      <Button
        type="submit"
        fullWidth
        data-testid="calendar-submit"
        disabled={status === "submitting"}
      >
        <Text variant="action" textId={submitTextId} />
      </Button>
      <div role="status" data-testid="calendar-status">
        {status === "failed" && (
          <Text variant="status" textId={errorTextId ?? "calendar.errors.failed"} />
        )}
      </div>
      {footer !== undefined && <div style={calendarFormFooterStyle}>{footer}</div>}
    </form>
  );
};

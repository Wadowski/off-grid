// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Select, Text, VisuallyHidden } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../calendars/calendar-accents.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { webCalendarClient } from "../../api/web-api-client.js";
import { createCalendarEvent } from "../create-calendar-event.js";
import { FORM_ID } from "../constants.js";
import { eventDialogShellStyle, eventDialogStyle } from "../dialog-styles.js";
import { notifyEventsChanged } from "../notify-events-changed.js";
import { defaultEventForm, toCreateEventRequest, withField } from "../event-form.js";
import { toUpdateEventRequest } from "../to-update-event-request.js";
import type { EventFormErrors, EventFormValues } from "../types.js";
import { NewEventFields } from "./components/new-event-fields/new-event-fields.js";
import { NewEventFooter } from "./components/new-event-footer/new-event-footer.js";
import { NewEventHeader } from "./components/new-event-header/new-event-header.js";
import { newEventBodyStyle, newEventErrorStyle, newEventHeadingStyle } from "./styles.js";
import type { EditingEvent, FormAlertTextId, NewEventModalProps } from "./types.js";

const alertTextIdFor = (
  errors: EventFormErrors,
  saveFailed: boolean,
): FormAlertTextId | undefined => {
  if (saveFailed) {
    return "calendar.eventModal.saveFailed";
  }
  if (errors.form === "incomplete") {
    return "calendar.eventModal.incomplete";
  }
  if (errors.form === "invalid" || errors.end === "invalid") {
    return "calendar.eventModal.invalid";
  }
  return undefined;
};

export const NewEventModal = ({
  calendars,
  timeZone,
  onClose,
  onSaved,
  editing,
}: NewEventModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const narrow = useIsNarrow();
  const { t } = useTranslation();
  const defaultCalendarId = calendars[0]?.id ?? "";
  const [values, setValues] = useState<EventFormValues>(
    () =>
      editing?.initialValues ??
      defaultEventForm({ now: new Date(), calendarId: defaultCalendarId, timeZone }),
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [remindersValid, setRemindersValid] = useState(true);
  const [reminderSubmitAttempt, setReminderSubmitAttempt] = useState(0);

  const calendarId = values.calendarId !== "" ? values.calendarId : defaultCalendarId;

  const update = <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) =>
    setValues((current) => withField(current, field, value));

  const changeReminders = (offsets: readonly number[], valid: boolean) => {
    update("reminderOffsetsMinutes", offsets);
    setRemindersValid(valid);
  };

  const blockOnInvalidReminders = (): boolean => {
    if (remindersValid) {
      return false;
    }
    setReminderSubmitAttempt((attempt) => attempt + 1);
    return true;
  };

  const dismiss = () => dialogRef.current?.close();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    const current = withField(values, "calendarId", calendarId);
    if (editing !== undefined) {
      await saveChanges(editing, current);
      return;
    }
    const result = toCreateEventRequest(current, timeZone);
    if (!result.ok) {
      setErrors(result.errors);
      setSaveFailed(false);
      return;
    }
    if (blockOnInvalidReminders()) {
      return;
    }
    setErrors({});
    setSaveFailed(false);
    setSaving(true);
    try {
      await createCalendarEvent(calendarId, result.request);
      onSaved();
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  };

  const saveChanges = async (target: EditingEvent, current: EventFormValues) => {
    const result = toUpdateEventRequest(target.initialValues, current, timeZone);
    if (!result.ok) {
      setErrors(result.errors);
      setSaveFailed(false);
      return;
    }
    if (blockOnInvalidReminders()) {
      return;
    }
    setErrors({});
    setSaveFailed(false);
    if (result.request === undefined) {
      onSaved();
      return;
    }
    setSaving(true);
    try {
      await webCalendarClient.updateCalendarEvent(target.eventId, result.request);
      notifyEventsChanged();
      onSaved();
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  };

  const createButton = (
    <Button
      type="submit"
      form={FORM_ID}
      variant="primary"
      disabled={saving || calendarId === ""}
      aria-busy={saving}
    >
      {!narrow && <MaterialIcon name="done" size="17px" color="currentColor" />}
      <Text
        variant="action"
        textId={
          saving
            ? "calendar.eventModal.saving"
            : editing !== undefined
              ? "calendar.eventModal.save"
              : narrow
                ? "calendar.eventModal.add"
                : "calendar.eventModal.create"
        }
      />
    </Button>
  );

  const cancelButton = (
    <Button type="button" variant="ghost" onClick={dismiss}>
      <Text variant="action" textId="calendar.actions.cancel" />
    </Button>
  );

  const closeButton = (
    <Button type="button" variant="ghost" size="small" onClick={dismiss}>
      <MaterialIcon name="close" size="17px" color="currentColor" />
      <VisuallyHidden>
        <Text variant="action" textId="calendar.actions.close" />
      </VisuallyHidden>
    </Button>
  );

  const selectedCalendar = calendars.find((calendar) => calendar.id === calendarId);
  const calendarPicker = (
    <Select
      aria-label={t("calendar.event.calendar")}
      value={calendarId}
      onChange={(event) => update("calendarId", event.target.value)}
      options={calendars.map((calendar) => ({ value: calendar.id, label: calendar.name }))}
      accent={
        selectedCalendar === undefined ? undefined : calendarAccentColor(selectedCalendar.color)
      }
    />
  );

  const heading = (
    <div id="new-event-heading" style={newEventHeadingStyle}>
      <Text
        variant="subheading"
        textId={
          editing === undefined ? "calendar.eventModal.heading" : "calendar.eventModal.editHeading"
        }
      />
    </div>
  );

  const alertTextId = alertTextIdFor(errors, saveFailed);

  return (
    <Dialog
      dialogRef={dialogRef}
      style={eventDialogStyle(narrow)}
      backdrop="glossy"
      labelledBy="new-event-heading"
      onClose={onClose}
      dismissOnBackdropClick
      testId="new-event-modal"
    >
      <div style={eventDialogShellStyle}>
        <NewEventHeader
          narrow={narrow}
          heading={heading}
          cancelButton={cancelButton}
          createButton={createButton}
          calendarPicker={calendarPicker}
          closeButton={closeButton}
        />

        <form
          id={FORM_ID}
          style={newEventBodyStyle}
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <NewEventFields
            values={values}
            errors={errors}
            timeZone={timeZone}
            narrow={narrow}
            calendarPicker={calendarPicker}
            saving={saving}
            reminderSubmitAttempt={reminderSubmitAttempt}
            update={update}
            onRemindersChange={changeReminders}
          />

          {alertTextId !== undefined && (
            <div role="alert" style={newEventErrorStyle}>
              <Text variant="error" textId={alertTextId} />
            </div>
          )}
        </form>

        {!narrow && <NewEventFooter cancelButton={cancelButton} createButton={createButton} />}
      </div>
    </Dialog>
  );
};

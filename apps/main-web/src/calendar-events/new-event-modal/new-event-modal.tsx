// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Checkbox, Dialog, Select, Text, TextField, VisuallyHidden } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { createCalendarEvent } from "../create-calendar-event.js";
import type { EventFormErrors, EventFormValues } from "../event-form.js";
import { defaultEventForm, toCreateEventRequest, withField } from "../event-form.js";
import type { NewEventModalProps } from "./types.js";
import {
  NEW_EVENT_MODAL_CLASS,
  newEventActionsStyle,
  newEventBodyStyle,
  newEventErrorStyle,
  newEventFooterStyle,
  newEventFormStyle,
  newEventGroupStyle,
  newEventHeaderStyle,
  newEventHeadingStyle,
  newEventLabelStyle,
  newEventModalCss,
  newEventRowStyle,
  newEventTextareaStyle,
} from "./styles.js";

const FORM_ID = "new-event-form";

// The alert under the form: a failed save, or an input the form could not turn into a request.
type FormAlertTextId =
  | "calendar.eventModal.incomplete"
  | "calendar.eventModal.invalid"
  | "calendar.eventModal.saveFailed";

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

export const NewEventModal = ({ calendars, timeZone, onClose, onSaved }: NewEventModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const narrow = useIsNarrow();
  const { t } = useTranslation();
  const [values, setValues] = useState<EventFormValues>(() =>
    defaultEventForm({ now: new Date(), calendarId: calendars[0]?.id ?? "", timeZone }),
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // The picker uses the first calendar until the person chooses another one.
  const calendarId = values.calendarId !== "" ? values.calendarId : (calendars[0]?.id ?? "");

  const update = <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) =>
    setValues((current) => withField(current, field, value));

  // Closing the native dialog (Cancel, the close button, Escape or the backdrop) dismisses the modal
  // without a request. The entered values go with it.
  const dismiss = () => dialogRef.current?.close();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    const result = toCreateEventRequest(withField(values, "calendarId", calendarId), timeZone);
    if (!result.ok) {
      setErrors(result.errors);
      setSaveFailed(false);
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

  const saveButton = (
    <Button
      type="submit"
      form={FORM_ID}
      variant="primary"
      disabled={saving || calendarId === ""}
      aria-busy={saving}
    >
      <Text
        variant="action"
        textId={saving ? "calendar.eventModal.saving" : "calendar.actions.save"}
      />
    </Button>
  );

  const cancelButton = (
    <Button type="button" variant="ghost" onClick={dismiss}>
      <Text variant="action" textId="calendar.actions.cancel" />
    </Button>
  );

  const alertTextId = alertTextIdFor(errors, saveFailed);

  return (
    <Dialog
      dialogRef={dialogRef}
      className={NEW_EVENT_MODAL_CLASS}
      labelledBy="new-event-heading"
      onClose={onClose}
      dismissOnBackdropClick
      testId="new-event-modal"
    >
      <style>{newEventModalCss}</style>
      <div style={newEventFormStyle}>
        <header style={newEventHeaderStyle}>
          {narrow && cancelButton}
          <div id="new-event-heading" style={newEventHeadingStyle}>
            <Text variant="subheading" textId="calendar.event.new" />
          </div>
          {narrow ? (
            saveButton
          ) : (
            <Button type="button" variant="ghost" size="small" onClick={dismiss}>
              <MaterialIcon name="close" size="17px" color="currentColor" />
              <VisuallyHidden>
                <Text variant="action" textId="calendar.eventModal.close" />
              </VisuallyHidden>
            </Button>
          )}
        </header>

        <form
          id={FORM_ID}
          style={newEventBodyStyle}
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <TextField
            label={<Text variant="label" textId="calendar.event.title" />}
            placeholder={t("calendar.eventModal.titlePlaceholder")}
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            error={
              errors.title === undefined ? undefined : (
                <Text
                  variant="error"
                  textId={
                    errors.title === "titleTooLong"
                      ? "calendar.eventModal.titleTooLong"
                      : "calendar.eventModal.titleRequired"
                  }
                />
              )
            }
          />

          <div style={newEventGroupStyle}>
            <label style={newEventLabelStyle}>
              <Text variant="label" textId="calendar.event.calendar" />
              <Select
                value={calendarId}
                onChange={(event) => update("calendarId", event.target.value)}
                options={calendars.map((calendar) => ({
                  value: calendar.id,
                  label: calendar.name,
                }))}
              />
            </label>
            <Checkbox
              label={<Text variant="body" textId="calendar.eventModal.allDay" />}
              checked={values.isAllDay}
              onChange={(event) => update("isAllDay", event.target.checked)}
            />
            <div style={newEventRowStyle}>
              <TextField
                type="date"
                label={<Text variant="label" textId="calendar.eventModal.startDate" />}
                value={values.startDate}
                onChange={(event) => update("startDate", event.target.value)}
              />
              {!values.isAllDay && (
                <TextField
                  type="time"
                  label={<Text variant="label" textId="calendar.eventModal.startTime" />}
                  value={values.startTime}
                  onChange={(event) => update("startTime", event.target.value)}
                />
              )}
            </div>
            <div style={newEventRowStyle}>
              <TextField
                type="date"
                label={<Text variant="label" textId="calendar.eventModal.endDate" />}
                value={values.endDate}
                onChange={(event) => update("endDate", event.target.value)}
                error={
                  errors.end === "endsBeforeStart" ? (
                    <Text variant="error" textId="calendar.eventModal.endsBeforeStart" />
                  ) : undefined
                }
              />
              {!values.isAllDay && (
                <TextField
                  type="time"
                  label={<Text variant="label" textId="calendar.eventModal.endTime" />}
                  value={values.endTime}
                  onChange={(event) => update("endTime", event.target.value)}
                />
              )}
            </div>
            <div style={newEventLabelStyle}>
              <Text variant="label" textId="calendar.eventModal.timeZone" />
              <Text variant="body" value={timeZone} />
            </div>
          </div>

          <div style={newEventGroupStyle}>
            <TextField
              label={<Text variant="label" textId="calendar.eventModal.location" />}
              placeholder={t("calendar.eventModal.locationPlaceholder")}
              value={values.location}
              onChange={(event) => update("location", event.target.value)}
            />
            <label style={newEventLabelStyle}>
              <Text variant="label" textId="calendar.eventModal.description" />
              <textarea
                style={newEventTextareaStyle}
                placeholder={t("calendar.eventModal.descriptionPlaceholder")}
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </label>
          </div>

          {alertTextId !== undefined && (
            <div role="alert" style={newEventErrorStyle}>
              <Text variant="error" textId={alertTextId} />
            </div>
          )}
        </form>

        {!narrow && (
          <footer style={newEventFooterStyle}>
            {cancelButton}
            <div style={newEventActionsStyle}>{saveButton}</div>
          </footer>
        )}
      </div>
    </Dialog>
  );
};

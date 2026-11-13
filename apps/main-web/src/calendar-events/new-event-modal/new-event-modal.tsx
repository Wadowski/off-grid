// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, Dialog, IconTile, Text, VisuallyHidden } from "@offgrid/ui";
import type { FormEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../calendars/calendar-accents.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { createCalendarEvent } from "../create-calendar-event.js";
import type { EventFormErrors, EventFormValues } from "../event-form.js";
import { defaultEventForm, toCreateEventRequest, withField } from "../event-form.js";
import type { NewEventModalProps } from "./types.js";
import {
  NEW_EVENT_MODAL_CLASS,
  NEW_EVENT_SWITCH_CLASS,
  newEventActionsStyle,
  newEventBodyStyle,
  newEventCalendarSelectStyle,
  newEventDateInputStyle,
  newEventErrorStyle,
  newEventFieldLabelStyle,
  newEventFieldStyle,
  newEventFooterStyle,
  newEventFormStyle,
  newEventGroupHeadStyle,
  newEventGroupStyle,
  newEventGroupTitleStyle,
  newEventHeaderActionsStyle,
  newEventHeaderStyle,
  newEventHeadingStyle,
  newEventLabelRowStyle,
  newEventLabelStyle,
  newEventModalCss,
  newEventSwitchLabelStyle,
  newEventTextareaStyle,
  newEventTimeCardStyle,
  newEventTimeInputStyle,
  newEventTimeRowStyle,
  newEventTimesStyle,
  newEventTitleCardStyle,
  newEventTitleGroupStyle,
  newEventTitleInputStyle,
  newEventTitleLabelStyle,
  newEventZoneStyle,
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

// A start or end block of the Time & Duration card: a caption, a date and, for a timed event, a time.
type DateTimeBlockProps = {
  readonly caption: ReactNode;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly date: string;
  readonly time: string;
  readonly showTime: boolean;
  readonly onDate: (value: string) => void;
  readonly onTime: (value: string) => void;
  readonly error?: ReactNode;
};

const DateTimeBlock = ({
  caption,
  dateLabel,
  timeLabel,
  date,
  time,
  showTime,
  onDate,
  onTime,
  error,
}: DateTimeBlockProps) => (
  <div style={newEventTimeCardStyle}>
    {caption}
    <div style={newEventTimeRowStyle}>
      <input
        type="date"
        aria-label={dateLabel}
        style={newEventDateInputStyle}
        value={date}
        onChange={(event) => onDate(event.target.value)}
      />
      {showTime && (
        <input
          type="time"
          aria-label={timeLabel}
          style={newEventTimeInputStyle}
          value={time}
          onChange={(event) => onTime(event.target.value)}
        />
      )}
    </div>
    {error}
  </div>
);

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

  // The desktop button reads "Create Event" with a tick; the phone bar reads "Add", as in the designs.
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

  // The picker takes the colour of the calendar it shows, so the calendar is visible at a glance.
  const selectedCalendar = calendars.find((calendar) => calendar.id === calendarId);
  const calendarAccent =
    selectedCalendar === undefined
      ? { background: cssVar("color-surface-high"), color: cssVar("color-fg") }
      : calendarAccentColor(selectedCalendar.color);

  const calendarPicker = (
    <select
      aria-label={t("calendar.event.calendar")}
      value={calendarId}
      onChange={(event) => update("calendarId", event.target.value)}
      style={newEventCalendarSelectStyle(calendarAccent)}
    >
      {calendars.map((calendar) => (
        <option key={calendar.id} value={calendar.id}>
          {calendar.name}
        </option>
      ))}
    </select>
  );

  const heading = (
    <div id="new-event-heading" style={newEventHeadingStyle}>
      <Text variant="subheading" textId="calendar.eventModal.heading" />
    </div>
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
          {narrow ? (
            <>
              {cancelButton}
              {heading}
              {createButton}
            </>
          ) : (
            <>
              <div style={newEventTitleGroupStyle}>
                <IconTile
                  size="2rem"
                  shape="rounded"
                  background={`color-mix(in srgb, ${cssVar("color-primary")} 12%, transparent)`}
                  color={cssVar("color-primary")}
                >
                  <MaterialIcon name="event_note" size="19px" color="currentColor" />
                </IconTile>
                {heading}
              </div>
              <div style={newEventHeaderActionsStyle}>
                {calendarPicker}
                <Button type="button" variant="ghost" size="small" onClick={dismiss}>
                  <MaterialIcon name="close" size="17px" color="currentColor" />
                  <VisuallyHidden>
                    <Text variant="action" textId="calendar.eventModal.close" />
                  </VisuallyHidden>
                </Button>
              </div>
            </>
          )}
        </header>

        <form
          id={FORM_ID}
          style={newEventBodyStyle}
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          {narrow && (
            <label style={newEventLabelStyle}>
              <Text variant="label" textId="calendar.event.calendar" />
              {calendarPicker}
            </label>
          )}

          <div style={newEventTitleCardStyle}>
            <label style={newEventTitleLabelStyle}>
              <Text variant="label" textId="calendar.event.title" />
              <input
                type="text"
                style={newEventTitleInputStyle}
                placeholder={t("calendar.eventModal.titlePlaceholder")}
                value={values.title}
                aria-invalid={errors.title !== undefined}
                onChange={(event) => update("title", event.target.value)}
              />
            </label>
            {errors.title !== undefined && (
              <Text
                variant="error"
                textId={
                  errors.title === "titleTooLong"
                    ? "calendar.eventModal.titleTooLong"
                    : "calendar.eventModal.titleRequired"
                }
              />
            )}
          </div>

          <div style={newEventGroupStyle}>
            <div style={newEventGroupHeadStyle}>
              <span style={newEventGroupTitleStyle}>
                <MaterialIcon name="schedule" size="18px" color={cssVar("color-primary")} />
                <Text variant="label" textId="calendar.eventModal.timeAndDuration" />
              </span>
              <label style={newEventSwitchLabelStyle}>
                <Text variant="label" textId="calendar.eventModal.allDay" />
                <input
                  type="checkbox"
                  role="switch"
                  className={NEW_EVENT_SWITCH_CLASS}
                  checked={values.isAllDay}
                  onChange={(event) => update("isAllDay", event.target.checked)}
                />
              </label>
            </div>

            <div style={newEventTimesStyle}>
              <DateTimeBlock
                caption={<Text variant="label" textId="calendar.eventModal.starts" />}
                dateLabel={t("calendar.eventModal.startDate")}
                timeLabel={t("calendar.eventModal.startTime")}
                date={values.startDate}
                time={values.startTime}
                showTime={!values.isAllDay}
                onDate={(value) => update("startDate", value)}
                onTime={(value) => update("startTime", value)}
              />
              <DateTimeBlock
                caption={<Text variant="label" textId="calendar.eventModal.ends" />}
                dateLabel={t("calendar.eventModal.endDate")}
                timeLabel={t("calendar.eventModal.endTime")}
                date={values.endDate}
                time={values.endTime}
                showTime={!values.isAllDay}
                onDate={(value) => update("endDate", value)}
                onTime={(value) => update("endTime", value)}
                error={
                  errors.end === "endsBeforeStart" ? (
                    <Text variant="error" textId="calendar.eventModal.endsBeforeStart" />
                  ) : undefined
                }
              />
            </div>

            <div style={newEventZoneStyle}>
              <MaterialIcon name="public" size="15px" color={cssVar("color-muted")} />
              <Text variant="label" textId="calendar.eventModal.timeZone" />
              <Text variant="body" value={timeZone} />
            </div>
          </div>

          <div style={newEventGroupStyle}>
            <label style={newEventFieldLabelStyle}>
              <span style={newEventLabelRowStyle}>
                <MaterialIcon name="location_on" size="16px" color={cssVar("color-primary")} />
                <Text variant="label" textId="calendar.eventModal.location" />
              </span>
              <input
                type="text"
                style={newEventFieldStyle}
                placeholder={t("calendar.eventModal.locationPlaceholder")}
                value={values.location}
                onChange={(event) => update("location", event.target.value)}
              />
            </label>
            <label style={newEventFieldLabelStyle}>
              <span style={newEventLabelRowStyle}>
                <MaterialIcon name="notes" size="16px" color={cssVar("color-primary")} />
                <Text variant="label" textId="calendar.eventModal.description" />
              </span>
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
            <div style={newEventActionsStyle}>{createButton}</div>
          </footer>
        )}
      </div>
    </Dialog>
  );
};

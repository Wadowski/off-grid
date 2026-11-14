// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  Button,
  Checkbox,
  cssVar,
  Dialog,
  IconTile,
  Select,
  Text,
  TextField,
  Textarea,
  VisuallyHidden,
} from "@offgrid/ui";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../calendars/calendar-accents.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { createCalendarEvent } from "../create-calendar-event.js";
import { defaultEventForm, toCreateEventRequest, withField } from "../event-form.js";
import type { EventFormErrors, EventFormValues } from "../types.js";
import { DateTimeBlock } from "./components/date-time-block/date-time-block.js";
import {
  newEventActionsStyle,
  newEventBodyStyle,
  newEventColumnStyle,
  newEventDialogStyle,
  newEventErrorStyle,
  newEventFooterStyle,
  newEventFormStyle,
  newEventGroupHeadStyle,
  newEventGroupStyle,
  newEventGroupTitleStyle,
  newEventHeaderActionsStyle,
  newEventHeaderStyle,
  newEventHeadingStyle,
  newEventIconTileBackground,
  newEventLabelRowStyle,
  newEventTimesStyle,
  newEventTitleCardStyle,
  newEventTitleGroupStyle,
  newEventZoneStyle,
} from "./styles.js";
import type { FormAlertTextId, NewEventModalProps } from "./types.js";

const FORM_ID = "new-event-form";

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

  const calendarId = values.calendarId !== "" ? values.calendarId : (calendars[0]?.id ?? "");

  const update = <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) =>
    setValues((current) => withField(current, field, value));

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
      <Text variant="subheading" textId="calendar.eventModal.heading" />
    </div>
  );

  const alertTextId = alertTextIdFor(errors, saveFailed);

  return (
    <Dialog
      dialogRef={dialogRef}
      style={newEventDialogStyle(narrow)}
      backdrop="glossy"
      labelledBy="new-event-heading"
      onClose={onClose}
      dismissOnBackdropClick
      testId="new-event-modal"
    >
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
                  background={newEventIconTileBackground}
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
                    <Text variant="action" textId="calendar.actions.close" />
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
            <div style={newEventGroupStyle}>
              <div style={newEventColumnStyle}>
                <Text variant="label" textId="calendar.event.calendar" />
                {calendarPicker}
              </div>
            </div>
          )}

          <div style={newEventTitleCardStyle}>
            <TextField
              variant="title"
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
          </div>

          <div style={newEventGroupStyle}>
            <div style={newEventGroupHeadStyle}>
              <span style={newEventGroupTitleStyle}>
                <MaterialIcon name="schedule" size="18px" color={cssVar("color-primary")} />
                <Text variant="label" textId="calendar.eventModal.timeAndDuration" />
              </span>
              <Checkbox
                variant="switch"
                label={<Text variant="label" textId="calendar.eventModal.allDay" />}
                checked={values.isAllDay}
                onChange={(event) => update("isAllDay", event.target.checked)}
              />
            </div>

            <div style={newEventTimesStyle}>
              <DateTimeBlock
                caption={<Text variant="label" textId="calendar.eventModal.starts" />}
                dateLabel={
                  <VisuallyHidden>
                    <Text variant="label" textId="calendar.eventModal.startDate" />
                  </VisuallyHidden>
                }
                timeLabel={
                  <VisuallyHidden>
                    <Text variant="label" textId="calendar.eventModal.startTime" />
                  </VisuallyHidden>
                }
                date={values.startDate}
                time={values.startTime}
                showTime={!values.isAllDay}
                onDate={(value) => update("startDate", value)}
                onTime={(value) => update("startTime", value)}
              />
              <DateTimeBlock
                caption={<Text variant="label" textId="calendar.eventModal.ends" />}
                dateLabel={
                  <VisuallyHidden>
                    <Text variant="label" textId="calendar.eventModal.endDate" />
                  </VisuallyHidden>
                }
                timeLabel={
                  <VisuallyHidden>
                    <Text variant="label" textId="calendar.eventModal.endTime" />
                  </VisuallyHidden>
                }
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
            <TextField
              label={
                <span style={newEventLabelRowStyle}>
                  <MaterialIcon name="location_on" size="16px" color={cssVar("color-primary")} />
                  <Text variant="label" textId="calendar.eventModal.location" />
                </span>
              }
              placeholder={t("calendar.eventModal.locationPlaceholder")}
              value={values.location}
              onChange={(event) => update("location", event.target.value)}
            />
            <Textarea
              label={
                <span style={newEventLabelRowStyle}>
                  <MaterialIcon name="notes" size="16px" color={cssVar("color-primary")} />
                  <Text variant="label" textId="calendar.eventModal.description" />
                </span>
              }
              placeholder={t("calendar.eventModal.descriptionPlaceholder")}
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
            />
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

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Select, Text, VisuallyHidden } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../calendars/calendar-accents.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { webCalendarClient } from "../../api/web-api-client.js";
import { useSession } from "../../session/use-session.js";
import { createCalendarEvent } from "../create-calendar-event.js";
import { FORM_ID } from "../constants.js";
import { eventDialogShellStyle, eventDialogStyle } from "../dialog-styles.js";
import { notifyEventsChanged } from "../notify-events-changed.js";
import { defaultEventForm, toCreateEventRequest, withField } from "../event-form.js";
import { toUpdateEventRequest } from "../to-update-event-request.js";
import type { EventFormErrors, EventFormValues, GuestChanges } from "../types.js";
import { guestChanges } from "../guests/guest-changes.js";
import { GuestField } from "../guests/guest-field/guest-field.js";
import { syncEventGuests } from "../guests/sync-event-guests.js";
import { toggleGuest } from "../guests/toggle-guest.js";
import { useEventGuests } from "../guests/use-event-guests.js";
import { useGuestCandidates } from "../guests/use-guest-candidates.js";
import { NewEventFields } from "./components/new-event-fields/new-event-fields.js";
import { NewEventFooter } from "./components/new-event-footer/new-event-footer.js";
import { NewEventHeader } from "./components/new-event-header/new-event-header.js";
import { newEventBodyStyle, newEventErrorStyle, newEventHeadingStyle } from "./styles.js";
import type { EditingEvent, FormAlertTextId, NewEventModalProps } from "./types.js";

const alertTextIdFor = (
  errors: EventFormErrors,
  saveFailed: boolean,
  guestsFailed: boolean,
): FormAlertTextId | undefined => {
  if (saveFailed) {
    return "calendar.eventModal.saveFailed";
  }
  if (guestsFailed) {
    return "calendar.guests.partialFailure";
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
  const session = useSession();
  const defaultCalendarId = calendars[0]?.id ?? "";
  const [values, setValues] = useState<EventFormValues>(
    () =>
      editing?.initialValues ??
      defaultEventForm({ now: new Date(), calendarId: defaultCalendarId, timeZone }),
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [savedEventId, setSavedEventId] = useState<string | undefined>(undefined);
  const [pendingGuests, setPendingGuests] = useState<GuestChanges | undefined>(undefined);
  const [guestsFailed, setGuestsFailed] = useState(false);
  const [baselineGuestIds, setBaselineGuestIds] = useState<readonly string[]>([]);
  const existingGuests = useEventGuests(editing?.eventId);
  const selfUserId = session.status === "signedIn" ? session.user.id : "";
  const candidates = useGuestCandidates(selfUserId);

  const calendarId = values.calendarId !== "" ? values.calendarId : defaultCalendarId;
  const selectedCalendar = calendars.find((calendar) => calendar.id === calendarId);
  const guestsAllowed = selectedCalendar?.familyId === null;
  const guestsLoaded = editing === undefined || existingGuests.status === "ready";

  useEffect(() => {
    if (editing === undefined || existingGuests.status !== "ready") {
      return;
    }
    const guestIds = existingGuests.guests.map((guest) => guest.userId);
    setBaselineGuestIds(guestIds);
    setValues((current) => withField(current, "guestUserIds", guestIds));
  }, [editing, existingGuests.status, existingGuests.guests]);

  const update = <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) =>
    setValues((current) => withField(current, field, value));

  const chooseCalendar = (nextCalendarId: string) => {
    const nextCalendar = calendars.find((calendar) => calendar.id === nextCalendarId);
    setValues((current) =>
      nextCalendar?.familyId === null
        ? withField(current, "calendarId", nextCalendarId)
        : { ...withField(current, "calendarId", nextCalendarId), guestUserIds: [] },
    );
  };

  const dismiss = () => dialogRef.current?.close();

  const applyGuestChanges = async (eventId: string, changes: GuestChanges) => {
    const failed = await syncEventGuests(eventId, changes);
    if (failed.toInvite.length === 0 && failed.toRemove.length === 0) {
      setPendingGuests(undefined);
      setSaving(false);
      notifyEventsChanged();
      onSaved();
      return;
    }
    setPendingGuests(failed);
    setSaving(false);
    setGuestsFailed(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    if (savedEventId !== undefined && pendingGuests !== undefined) {
      setSaving(true);
      setGuestsFailed(false);
      await applyGuestChanges(savedEventId, pendingGuests);
      return;
    }
    const current = withField(values, "calendarId", calendarId);
    if (editing !== undefined) {
      await saveChanges(editing, current);
      return;
    }
    await createWithGuests(current);
  };

  const createWithGuests = async (current: EventFormValues) => {
    const result = toCreateEventRequest(current, timeZone);
    if (!result.ok) {
      setErrors(result.errors);
      setSaveFailed(false);
      return;
    }
    setErrors({});
    setSaveFailed(false);
    setSaving(true);
    let created: { readonly id: string };
    try {
      created = await createCalendarEvent(calendarId, result.request);
    } catch {
      setSaving(false);
      setSaveFailed(true);
      return;
    }
    setSavedEventId(created.id);
    await applyGuestChanges(
      created.id,
      guestChanges([], guestsAllowed ? current.guestUserIds : []),
    );
  };

  const saveChanges = async (target: EditingEvent, current: EventFormValues) => {
    const result = toUpdateEventRequest(target.initialValues, current, timeZone);
    if (!result.ok) {
      setErrors(result.errors);
      setSaveFailed(false);
      return;
    }
    setErrors({});
    setSaveFailed(false);
    setSaving(true);
    try {
      if (result.request !== undefined) {
        await webCalendarClient.updateCalendarEvent(target.eventId, result.request);
      }
    } catch {
      setSaving(false);
      setSaveFailed(true);
      return;
    }
    setSavedEventId(target.eventId);
    await applyGuestChanges(
      target.eventId,
      guestChanges(baselineGuestIds, guestsAllowed ? current.guestUserIds : baselineGuestIds),
    );
  };

  const createButton = (
    <Button
      type="submit"
      form={FORM_ID}
      variant="primary"
      disabled={saving || calendarId === "" || !guestsLoaded}
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

  const calendarPicker = (
    <Select
      aria-label={t("calendar.event.calendar")}
      value={calendarId}
      onChange={(event) => chooseCalendar(event.target.value)}
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

  const alertTextId = alertTextIdFor(errors, saveFailed, guestsFailed);

  const guestField = (
    <GuestField
      selectedIds={values.guestUserIds}
      candidatesState={candidates}
      disabled={!guestsAllowed}
      onToggle={(userId) => setValues((current) => toggleGuest(current, userId))}
    />
  );

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
            guestField={guestField}
            update={update}
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

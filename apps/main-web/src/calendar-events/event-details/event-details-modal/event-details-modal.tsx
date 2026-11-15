// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Text, VisuallyHidden } from "@offgrid/ui";
import { useRef } from "react";
import { MaterialIcon } from "../../../icons/material-icon/material-icon.js";
import {
  eventDialogFooterStyle,
  eventDialogShellStyle,
  eventDialogStyle,
} from "../../dialog-styles.js";
import { EventDetailsBody } from "../event-details-body/event-details-body.js";
import { eventAccentOf } from "../event-accent-of.js";
import { EventDetailsState } from "../event-details-state/event-details-state.js";
import {
  detailsActionsStyle,
  detailsCalendarChipStyle,
  detailsDotStyle,
  detailsHeaderStyle,
} from "./styles.js";
import type { EventDetailsModalProps } from "./types.js";

export const EventDetailsModal = ({
  event,
  status,
  retry,
  timeZone,
  onClose,
  onEdit,
  onDelete,
  onSaveReminders,
}: EventDetailsModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const accent = event === undefined ? undefined : eventAccentOf(event);
  const editable = event !== undefined && !event.readOnly;

  return (
    <Dialog
      dialogRef={dialogRef}
      style={eventDialogStyle(false)}
      backdrop="glossy"
      labelledBy="event-details-heading"
      onClose={onClose}
      dismissOnBackdropClick
      testId="event-details-modal"
    >
      <div style={eventDialogShellStyle}>
        <div style={detailsHeaderStyle}>
          <span id="event-details-heading" style={detailsCalendarChipStyle(accent)}>
            <span aria-hidden="true" style={detailsDotStyle(accent)} />
            <Text variant="label" value={event?.calendarName ?? ""} />
          </span>
          <div style={detailsActionsStyle}>
            {editable && (
              <Button type="button" variant="ghost" size="small" onClick={onEdit}>
                <MaterialIcon name="edit" size="18px" color="currentColor" />
                <VisuallyHidden>
                  <Text variant="action" textId="calendar.eventDetails.edit" />
                </VisuallyHidden>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => dialogRef.current?.close()}
            >
              <MaterialIcon name="close" size="18px" color="currentColor" />
              <VisuallyHidden>
                <Text variant="action" textId="calendar.actions.close" />
              </VisuallyHidden>
            </Button>
          </div>
        </div>
        {event !== undefined && status === "ready" ? (
          <EventDetailsBody event={event} timeZone={timeZone} onSaveReminders={onSaveReminders} />
        ) : (
          <EventDetailsState status={status === "ready" ? "failed" : status} retry={retry} />
        )}
        {editable && (
          <div style={eventDialogFooterStyle}>
            <Button type="button" variant="ghost" onClick={onDelete}>
              <Text variant="error" textId="calendar.eventDetails.delete" />
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};

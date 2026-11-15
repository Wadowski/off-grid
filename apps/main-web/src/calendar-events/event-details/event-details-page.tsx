// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, Text, VisuallyHidden } from "@offgrid/ui";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { EventDetailsBody } from "./event-details-body.js";
import { EventDetailsState } from "./event-details-state.js";
import {
  detailsAppBarStyle,
  detailsPageStyle,
  detailsPhoneActionRowStyle,
  detailsPhoneBodyStyle,
} from "./styles.js";
import type { EventDetailsPageProps } from "./types.js";

export const EventDetailsPage = ({
  event,
  status,
  retry,
  timeZone,
  onBack,
  onEdit,
  onDelete,
}: EventDetailsPageProps) => {
  const editable = event !== undefined && !event.readOnly;
  return (
    <section style={detailsPageStyle} data-testid="event-details-page">
      <header style={detailsAppBarStyle}>
        <Button type="button" variant="ghost" size="small" onClick={onBack}>
          <MaterialIcon name="arrow_back" size="22px" color="currentColor" />
          <Text variant="action" textId="calendar.eventDetails.back" />
        </Button>
        <Text variant="subheading" textId="calendar.eventDetails.heading" />
      </header>
      <div style={detailsPhoneBodyStyle}>
        {event !== undefined && status === "ready" ? (
          <EventDetailsBody event={event} timeZone={timeZone} />
        ) : (
          <EventDetailsState status={status === "ready" ? "failed" : status} retry={retry} />
        )}
      </div>
      {editable && (
        <div style={detailsPhoneActionRowStyle}>
          <Button type="button" variant="primary" fullWidth onClick={onEdit}>
            <MaterialIcon name="edit" size="18px" color="currentColor" />
            <Text variant="action" textId="calendar.eventDetails.edit" />
          </Button>
          <Button type="button" variant="secondary" onClick={onDelete}>
            <MaterialIcon name="delete" size="18px" color={cssVar("color-danger")} />
            <VisuallyHidden>
              <Text variant="error" textId="calendar.eventDetails.delete" />
            </VisuallyHidden>
          </Button>
        </div>
      )}
    </section>
  );
};

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import type { CalendarEventStatus } from "./use-calendar-event.js";
import { detailsStatusStyle } from "./styles.js";

export const EventDetailsState = ({
  status,
  retry,
}: {
  readonly status: Exclude<CalendarEventStatus, "ready">;
  readonly retry: () => void;
}) => {
  if (status === "loading") {
    return <Text variant="status" role="status" textId="calendar.eventDetails.loading" />;
  }
  if (status === "notFound") {
    return (
      <div role="alert" style={detailsStatusStyle}>
        <Text variant="body" textId="calendar.eventDetails.notFound" />
      </div>
    );
  }
  return (
    <div role="alert" style={detailsStatusStyle}>
      <Text variant="error" textId="calendar.eventDetails.loadFailed" />
      <Button variant="secondary" size="small" onClick={retry}>
        <Text variant="action" textId="calendar.mobileViews.retry" />
      </Button>
    </div>
  );
};

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { deleteActionsStyle, deletePanelStyle } from "./styles.js";
import type { DeleteCalendarPanelProps } from "./types.js";

export const DeleteCalendarPanel = ({
  deleting,
  errorTextId,
  onConfirm,
}: DeleteCalendarPanelProps) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div style={deletePanelStyle}>
        <Button variant="ghost" data-testid="calendar-delete" onClick={() => setConfirming(true)}>
          <Text variant="error" textId="calendar.calendars.delete" />
        </Button>
        {errorTextId !== undefined && <Text variant="error" textId={errorTextId} />}
      </div>
    );
  }

  return (
    <div style={deletePanelStyle} data-testid="calendar-delete-confirm">
      <Text variant="body" textId="calendar.calendars.deleteConfirm" />
      <div style={deleteActionsStyle}>
        <Button
          variant="secondary"
          data-testid="calendar-delete-cancel"
          onClick={() => setConfirming(false)}
        >
          <Text variant="action" textId="calendar.actions.cancel" />
        </Button>
        <Button
          variant="primary"
          data-testid="calendar-delete-submit"
          disabled={deleting}
          onClick={onConfirm}
        >
          <Text variant="action" textId="calendar.calendars.delete" />
        </Button>
      </div>
      {errorTextId !== undefined && <Text variant="error" textId={errorTextId} />}
    </div>
  );
};

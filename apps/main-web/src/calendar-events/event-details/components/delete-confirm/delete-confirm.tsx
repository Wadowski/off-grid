// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Text } from "@offgrid/ui";
import { useRef } from "react";
import {
  eventDialogFooterStyle,
  eventDialogShellStyle,
  eventDialogStyle,
} from "../../../dialog-styles.js";
import { deleteConfirmTextStyle } from "./styles.js";
import type { DeleteConfirmProps } from "./types.js";

export const DeleteConfirm = ({
  onCancel,
  onConfirm,
  failed,
  deleting,
  narrow,
}: DeleteConfirmProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <Dialog
      dialogRef={dialogRef}
      style={eventDialogStyle(narrow)}
      backdrop="glossy"
      labelledBy="delete-event-heading"
      onClose={onCancel}
      testId="delete-event-confirm"
    >
      <div style={eventDialogShellStyle}>
        <div style={deleteConfirmTextStyle}>
          <div id="delete-event-heading">
            <Text variant="subheading" textId="calendar.eventDetails.deleteTitle" />
          </div>
          <Text variant="body" textId="calendar.eventDetails.deleteBody" />
        </div>
        {failed && (
          <div role="alert" style={deleteConfirmTextStyle}>
            <Text variant="error" textId="calendar.eventDetails.deleteFailed" />
          </div>
        )}
        <div style={eventDialogFooterStyle}>
          <Button type="button" variant="ghost" onClick={() => dialogRef.current?.close()}>
            <Text variant="action" textId="calendar.actions.cancel" />
          </Button>
          <Button type="button" variant="primary" disabled={deleting} onClick={onConfirm}>
            <Text variant="action" textId="calendar.eventDetails.deleteConfirm" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

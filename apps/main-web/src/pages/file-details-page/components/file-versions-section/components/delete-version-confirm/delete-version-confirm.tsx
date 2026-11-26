// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Text } from "@offgrid/ui";
import { useRef } from "react";
import { deleteVersionConfirmActionsStyle, deleteVersionConfirmBodyStyle } from "./styles.js";
import type { DeleteVersionConfirmProps } from "./types.js";

export const DeleteVersionConfirm = ({
  versionNumber,
  onCancel,
  onConfirm,
}: DeleteVersionConfirmProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = `delete-version-heading-${versionNumber}`;

  return (
    <Dialog
      dialogRef={dialogRef}
      backdrop="glossy"
      labelledBy={headingId}
      onClose={onCancel}
      testId="delete-version-confirm"
    >
      <div style={deleteVersionConfirmBodyStyle} onKeyDown={(event) => event.stopPropagation()}>
        <div id={headingId}>
          <Text
            variant="subheading"
            textId="files.versions.deleteTitle"
            values={{ count: versionNumber }}
          />
        </div>
        <Text variant="body" textId="files.versions.deleteBody" />
        <div style={deleteVersionConfirmActionsStyle}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => dialogRef.current?.close()}
            data-testid="delete-version-cancel"
          >
            <Text variant="action" textId="files.versions.deleteCancel" />
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            data-testid="delete-version-confirm-action"
          >
            <Text variant="action" textId="files.versions.deleteConfirm" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

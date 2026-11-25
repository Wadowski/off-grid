// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Text } from "@offgrid/ui";
import { useEffect, useRef } from "react";
import {
  deleteEntryDialogStyle,
  deleteEntryFooterStyle,
  deleteEntryShellStyle,
  deleteEntryTextStyle,
} from "./styles.js";
import type { DeleteEntryDialogProps } from "./types.js";

export const DeleteEntryDialog = ({
  name,
  isFolder,
  narrow,
  pending,
  errorTextId,
  onCancel,
  onConfirm,
}: DeleteEntryDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return undefined;
    }
    const keepOpenWhilePending = (event: Event) => {
      if (pending) {
        event.preventDefault();
      }
    };
    dialog.addEventListener("cancel", keepOpenWhilePending);
    return () => dialog.removeEventListener("cancel", keepOpenWhilePending);
  }, [pending]);

  const closeUnlessPending = () => {
    if (!pending) {
      dialogRef.current?.close();
    }
  };

  return (
    <Dialog
      dialogRef={dialogRef}
      style={deleteEntryDialogStyle(narrow)}
      backdrop="glossy"
      dismissOnBackdropClick={!pending}
      labelledBy="delete-entry-heading"
      onClose={onCancel}
      testId="delete-entry-dialog"
    >
      <div style={deleteEntryShellStyle}>
        <div style={deleteEntryTextStyle}>
          <div id="delete-entry-heading">
            <Text variant="subheading" textId="files.delete.title" />
          </div>
          <Text
            variant="body"
            textId={isFolder ? "files.delete.bodyFolder" : "files.delete.bodyFile"}
            values={{ name }}
          />
        </div>
        {errorTextId === null ? null : (
          <div style={deleteEntryTextStyle}>
            <Text
              variant="error"
              role="alert"
              textId={errorTextId}
              data-testid="delete-entry-error"
            />
          </div>
        )}
        <div style={deleteEntryFooterStyle}>
          <Button
            type="button"
            variant="ghost"
            onClick={closeUnlessPending}
            data-testid="delete-entry-cancel"
          >
            <Text variant="action" textId="files.delete.cancel" />
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={pending}
            onClick={onConfirm}
            data-testid="delete-entry-confirm"
          >
            <Text variant="action" textId="files.delete.confirm" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

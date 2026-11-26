// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Text } from "@offgrid/ui";
import { useEffect, useRef } from "react";
import {
  confirmDialogFooterStyle,
  confirmDialogShellStyle,
  confirmDialogStyle,
  confirmDialogTextStyle,
} from "./styles.js";
import type { ConfirmDialogProps } from "./types.js";

export const ConfirmDialog = ({
  testIdPrefix,
  titleTextId,
  bodyTextId,
  bodyValues,
  cancelTextId,
  confirmTextId,
  narrow,
  pending,
  errorTextId,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = `${testIdPrefix}-heading`;

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
      style={confirmDialogStyle(narrow)}
      backdrop="glossy"
      dismissOnBackdropClick={!pending}
      labelledBy={headingId}
      onClose={onCancel}
      testId={`${testIdPrefix}-dialog`}
    >
      <div style={confirmDialogShellStyle}>
        <div style={confirmDialogTextStyle}>
          <div id={headingId}>
            <Text variant="subheading" textId={titleTextId} />
          </div>
          <Text variant="body" textId={bodyTextId} values={bodyValues} />
        </div>
        {errorTextId === null ? null : (
          <div style={confirmDialogTextStyle}>
            <Text
              variant="error"
              role="alert"
              textId={errorTextId}
              data-testid={`${testIdPrefix}-error`}
            />
          </div>
        )}
        <div style={confirmDialogFooterStyle}>
          <Button
            type="button"
            variant="ghost"
            onClick={closeUnlessPending}
            data-testid={`${testIdPrefix}-cancel`}
          >
            <Text variant="action" textId={cancelTextId} />
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={pending}
            onClick={onConfirm}
            data-testid={`${testIdPrefix}-confirm`}
          >
            <Text variant="action" textId={confirmTextId} />
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Dialog, Text } from "@offgrid/ui";
import { useEffect, useRef } from "react";
import { useMoveDialog } from "../../use-move-dialog.js";
import { FolderPicker } from "./components/folder-picker/folder-picker.js";
import {
  moveDialogFooterStyle,
  moveDialogSectionStyle,
  moveDialogShellStyle,
  moveDialogStyle,
} from "./styles.js";
import type { MoveDialogProps } from "./types.js";

export const MoveDialog = ({
  drives,
  source,
  narrow,
  returnFocusTo,
  onClose,
  onMoved,
}: MoveDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const state = useMoveDialog(drives, source, returnFocusTo, onMoved);
  const pending = state.step === "moving";
  const confirming = state.step === "confirmingCrossOwner";

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
      style={moveDialogStyle(narrow)}
      backdrop="glossy"
      dismissOnBackdropClick={!pending}
      labelledBy="move-dialog-heading"
      onClose={onClose}
      testId="move-dialog"
    >
      <div style={moveDialogShellStyle}>
        <div style={moveDialogSectionStyle}>
          <div id="move-dialog-heading">
            <Text
              variant="subheading"
              textId="files.move.title"
              values={{ name: source.entryName }}
            />
          </div>
          <Text variant="body" textId="files.move.hint" />
        </div>
        <div style={moveDialogSectionStyle}>
          <FolderPicker
            nodes={state.nodes}
            tree={state.tree}
            selectedId={state.selectedId}
            onSelect={state.select}
            onExpand={state.expand}
            onRetry={state.retry}
            onLoadMore={state.loadMore}
          />
        </div>
        {confirming ? (
          <div
            style={moveDialogSectionStyle}
            role="status"
            data-testid="move-dialog-cross-owner-confirm"
          >
            <Text variant="body" textId="files.move.crossOwnerConfirm" />
          </div>
        ) : null}
        {state.errorTextId === null ? null : (
          <div style={moveDialogSectionStyle}>
            <Text
              variant="error"
              role="alert"
              textId={state.errorTextId}
              data-testid="move-dialog-error"
            />
          </div>
        )}
        <div style={moveDialogFooterStyle}>
          <Button
            type="button"
            variant="ghost"
            onClick={closeUnlessPending}
            data-testid="move-dialog-cancel"
          >
            <Text variant="action" textId="files.move.cancel" />
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!state.canMove || pending}
            aria-busy={pending}
            onClick={() => void state.submit()}
            data-testid="move-dialog-confirm"
          >
            <Text
              variant="action"
              textId={
                confirming
                  ? "files.move.confirmAnyway"
                  : pending
                    ? "files.move.moving"
                    : "files.move.confirm"
              }
            />
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

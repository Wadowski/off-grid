// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ConfirmDialog } from "../confirm-dialog/confirm-dialog.js";
import type { DeleteEntryDialogProps } from "./types.js";

export const DeleteEntryDialog = ({
  name,
  isFolder,
  narrow,
  pending,
  errorTextId,
  onCancel,
  onConfirm,
}: DeleteEntryDialogProps) => (
  <ConfirmDialog
    testIdPrefix="delete-entry"
    titleTextId="files.delete.title"
    bodyTextId={isFolder ? "files.delete.bodyFolder" : "files.delete.bodyFile"}
    bodyValues={{ name }}
    noteTextId={null}
    cancelTextId="files.delete.cancel"
    confirmTextId="files.delete.confirm"
    narrow={narrow}
    pending={pending}
    errorTextId={errorTextId}
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);

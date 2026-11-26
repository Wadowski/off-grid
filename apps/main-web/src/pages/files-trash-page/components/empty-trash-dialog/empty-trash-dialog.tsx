// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ConfirmDialog } from "../../../files-page/components/confirm-dialog/confirm-dialog.js";
import type { EmptyTrashDialogProps } from "./types.js";

export const EmptyTrashDialog = ({
  narrow,
  pending,
  errorTextId,
  onCancel,
  onConfirm,
}: EmptyTrashDialogProps) => (
  <ConfirmDialog
    testIdPrefix="empty-trash"
    titleTextId="files.trash.emptyDialog.title"
    bodyTextId="files.trash.emptyDialog.body"
    bodyValues={{}}
    noteTextId="files.trash.retentionNote"
    cancelTextId="files.delete.cancel"
    confirmTextId="files.trash.emptyDialog.confirm"
    narrow={narrow}
    pending={pending}
    errorTextId={errorTextId}
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);

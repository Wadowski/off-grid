// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ConfirmDialog } from "../../../files-page/components/confirm-dialog/confirm-dialog.js";
import type { PurgeEntryDialogProps } from "./types.js";

export const PurgeEntryDialog = ({
  name,
  isFolder,
  narrow,
  pending,
  errorTextId,
  onCancel,
  onConfirm,
}: PurgeEntryDialogProps) => (
  <ConfirmDialog
    testIdPrefix="purge"
    titleTextId="files.trash.purgeDialog.title"
    bodyTextId={
      isFolder ? "files.trash.purgeDialog.bodyFolder" : "files.trash.purgeDialog.bodyFile"
    }
    bodyValues={{ name }}
    noteTextId="files.trash.retentionNote"
    cancelTextId="files.delete.cancel"
    confirmTextId="files.trash.purgeDialog.confirm"
    narrow={narrow}
    pending={pending}
    errorTextId={errorTextId}
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);

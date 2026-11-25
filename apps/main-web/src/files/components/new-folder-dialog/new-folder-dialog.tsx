// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Dialog, Text } from "@offgrid/ui";
import { useRef } from "react";
import { FolderForm } from "../../../forms/folder-form/folder-form.js";
import { useCreateFolder } from "../../use-create-folder.js";
import { newFolderDialogContentStyle, newFolderDialogStyle } from "./styles.js";
import type { NewFolderDialogProps } from "./types.js";

export const NewFolderDialog = ({
  driveId,
  parentId,
  onCreated,
  onClose,
}: NewFolderDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { status, errorTextId, create } = useCreateFolder(driveId, parentId);

  const submit = async (name: string) => {
    const entry = await create(name);
    if (entry !== null) {
      onCreated();
      dialogRef.current?.close();
    }
  };

  return (
    <Dialog
      dialogRef={dialogRef}
      labelledBy="new-folder-heading"
      backdrop="glossy"
      dismissOnBackdropClick
      style={newFolderDialogStyle}
      onClose={onClose}
      testId="new-folder-dialog"
    >
      <div style={newFolderDialogContentStyle}>
        <h2 id="new-folder-heading">
          <Text variant="subheading" textId="files.newFolder.heading" />
        </h2>
        <FolderForm
          status={status}
          errorTextId={errorTextId}
          onSubmit={submit}
          onCancel={() => dialogRef.current?.close()}
        />
      </div>
    </Dialog>
  );
};

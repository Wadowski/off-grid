// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Dialog, Text } from "@offgrid/ui";
import { useRef } from "react";
import { RENAME_ENTRY_FORM_COPY } from "../../../../forms/folder-form/constants.js";
import { FolderForm } from "../../../../forms/folder-form/folder-form.js";
import { useRenameEntry } from "../../../../files/use-rename-entry.js";
import { toRenameSelectionEnd } from "../../../../files/to-rename-selection-end.js";
import { renameEntryDialogContentStyle, renameEntryDialogStyle } from "./styles.js";
import type { RenameEntryDialogProps } from "./types.js";

export const RenameEntryDialog = ({ entry, onRenamed, onClose }: RenameEntryDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { status, errorTextId, rename } = useRenameEntry();

  const submit = async (name: string) => {
    if (name === entry.name) {
      dialogRef.current?.close();
      return;
    }
    const renamed = await rename(entry.id, name);
    if (renamed !== null) {
      onRenamed(renamed);
      dialogRef.current?.close();
    }
  };

  return (
    <Dialog
      dialogRef={dialogRef}
      labelledBy="rename-entry-heading"
      backdrop="glossy"
      dismissOnBackdropClick
      style={renameEntryDialogStyle}
      onClose={onClose}
      testId="rename-entry-dialog"
    >
      <div style={renameEntryDialogContentStyle}>
        <h2 id="rename-entry-heading">
          <Text
            variant="subheading"
            textId={entry.isFolder ? "files.rename.headingFolder" : "files.rename.headingFile"}
          />
        </h2>
        <FolderForm
          copy={RENAME_ENTRY_FORM_COPY}
          initialName={entry.name}
          initialSelectionEnd={toRenameSelectionEnd(entry)}
          status={status}
          errorTextId={errorTextId}
          onSubmit={submit}
          onCancel={() => dialogRef.current?.close()}
        />
      </div>
    </Dialog>
  );
};

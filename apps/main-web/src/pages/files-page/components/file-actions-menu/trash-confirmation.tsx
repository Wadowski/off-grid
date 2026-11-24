// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { useTrashEntry } from "../../../../files/use-trash-entry.js";
import { DeleteEntryDialog } from "../delete-entry-dialog/delete-entry-dialog.js";
import type { TrashConfirmationProps } from "./types.js";

export const TrashConfirmation = ({ entry, onCancel, onTrashed }: TrashConfirmationProps) => {
  const narrow = useIsNarrow();
  const trashEntry = useTrashEntry();
  const pending = trashEntry.status === "pending";

  const confirm = async () => {
    if (await trashEntry.trash(entry.id)) {
      onTrashed(entry);
    }
  };

  const cancel = () => {
    if (!pending) {
      onCancel();
    }
  };

  return (
    <DeleteEntryDialog
      name={entry.name}
      isFolder={entry.isFolder}
      narrow={narrow}
      pending={pending}
      errorTextId={trashEntry.errorTextId}
      onCancel={cancel}
      onConfirm={() => void confirm()}
    />
  );
};

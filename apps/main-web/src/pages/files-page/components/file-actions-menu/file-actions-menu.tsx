// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Menu } from "@offgrid/ui";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { useTrashEntry } from "../../../../files/use-trash-entry.js";
import { DeleteEntryDialog } from "../delete-entry-dialog/delete-entry-dialog.js";
import { toFileActions } from "./to-file-actions.js";
import type { FileActionsMenuProps } from "./types.js";

export const FileActionsMenu = ({ entry, onOpen, onTrashed }: FileActionsMenuProps) => {
  const { t } = useTranslation();
  const narrow = useIsNarrow();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const trashEntry = useTrashEntry();

  const confirmTrash = async () => {
    if (await trashEntry.trash(entry.id)) {
      setIsConfirming(false);
      onTrashed(entry);
    }
  };

  const cancelTrash = () => {
    setIsConfirming(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <Menu
        label={t("files.entryActions.menuLabel", { name: entry.name })}
        items={toFileActions(entry, { onOpen, onDelete: () => setIsConfirming(true) })}
        triggerTestId="file-actions-trigger"
        menuTestId="file-actions-menu"
        triggerRef={triggerRef}
      />
      {isConfirming ? (
        <DeleteEntryDialog
          name={entry.name}
          isFolder={entry.isFolder}
          narrow={narrow}
          pending={trashEntry.status === "pending"}
          errorTextId={trashEntry.errorTextId}
          onCancel={cancelTrash}
          onConfirm={() => void confirmTrash()}
        />
      ) : null}
    </>
  );
};

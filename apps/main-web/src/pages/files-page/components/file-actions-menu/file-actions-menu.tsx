// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Menu } from "@offgrid/ui";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FileListItem } from "../../../../files/types.js";
import { toFileActions } from "./to-file-actions.js";
import { TrashConfirmation } from "./trash-confirmation.js";
import type { FileActionsMenuProps } from "./types.js";

export const FileActionsMenu = ({ entry, onOpen, onTrashed }: FileActionsMenuProps) => {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const cancelTrash = () => {
    setIsConfirming(false);
    triggerRef.current?.focus();
  };

  const trashed = (trashedEntry: FileListItem) => {
    setIsConfirming(false);
    onTrashed(trashedEntry);
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
        <TrashConfirmation entry={entry} onCancel={cancelTrash} onTrashed={trashed} />
      ) : null}
    </>
  );
};

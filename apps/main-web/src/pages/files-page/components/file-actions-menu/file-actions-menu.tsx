// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Menu } from "@offgrid/ui";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { toFileActions } from "./to-file-actions.js";
import type { FileActionsMenuProps } from "./types.js";

export const FileActionsMenu = ({ entry, onOpen, onDelete }: FileActionsMenuProps) => {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Menu
      label={t("files.entryActions.menuLabel", { name: entry.name })}
      items={toFileActions(entry, {
        onOpen,
        onDelete: () => onDelete(entry, triggerRef.current),
      })}
      triggerTestId="file-actions-trigger"
      menuTestId="file-actions-menu"
      triggerRef={triggerRef}
    />
  );
};

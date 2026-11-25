// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { RestoreButtonProps } from "./types.js";

export const RestoreButton = ({
  name,
  entryId,
  disabled,
  compact,
  onRestore,
}: RestoreButtonProps) => {
  const { t } = useTranslation();
  const label = t("files.trash.restoreLabel", { name });

  return compact ? (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      aria-label={label}
      onClick={onRestore}
      data-testid="trash-restore"
      data-restore-id={entryId}
    >
      <MaterialIcon name="restore_from_trash" size="24px" color="currentColor" />
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="small"
      disabled={disabled}
      aria-label={label}
      onClick={onRestore}
      data-testid="trash-restore"
      data-restore-id={entryId}
    >
      <MaterialIcon name="restore_from_trash" size="1.125rem" color={cssVar("color-primary")} />
      <Text variant="body" element="span" textId="files.trash.restore" />
    </Button>
  );
};

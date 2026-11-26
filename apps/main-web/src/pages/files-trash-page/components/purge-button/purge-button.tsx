// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { PurgeButtonProps } from "./types.js";

export const PurgeButton = ({ name, disabled, compact, onPurge }: PurgeButtonProps) => {
  const { t } = useTranslation();
  const label = t("files.trash.purgeLabel", { name });

  return compact ? (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      aria-label={label}
      onClick={onPurge}
      data-testid="trash-purge"
    >
      <MaterialIcon name="delete_forever" size="24px" color={cssVar("color-danger")} />
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="small"
      disabled={disabled}
      aria-label={label}
      onClick={onPurge}
      data-testid="trash-purge"
    >
      <MaterialIcon name="delete_forever" size="1.125rem" color={cssVar("color-danger")} />
      <Text variant="body" element="span" textId="files.trash.purge" />
    </Button>
  );
};

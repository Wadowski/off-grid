// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, MaterialIcon } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { versionRowActionsStyle } from "./styles.js";
import type { VersionRowActionsProps } from "./types.js";

export const VersionRowActions = ({
  row,
  pending,
  onRestore,
  onDownload,
  onRequestDelete,
}: VersionRowActionsProps) => {
  const { t } = useTranslation();
  const color = cssVar("color-muted");

  return (
    <div style={versionRowActionsStyle}>
      {row.isCurrent ? null : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label={t("files.versions.restore", { count: row.number })}
          onClick={onRestore}
          data-testid="file-version-restore"
        >
          <MaterialIcon name="restore" size="18px" color={color} />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={pending}
        aria-label={t("files.versions.download", { count: row.number })}
        onClick={onDownload}
        data-testid="file-version-download"
      >
        <MaterialIcon name="download" size="18px" color={color} />
      </Button>
      {row.isCurrent ? null : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label={t("files.versions.delete", { count: row.number })}
          onClick={onRequestDelete}
          data-testid="file-version-delete"
        >
          <MaterialIcon name="delete" size="18px" color={color} />
        </Button>
      )}
    </div>
  );
};

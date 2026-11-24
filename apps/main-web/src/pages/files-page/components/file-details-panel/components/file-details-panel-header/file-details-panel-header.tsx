// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, FileTypeIcon, MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import {
  fileDetailsPanelHeaderStyle,
  fileDetailsPanelNameStyle,
  fileDetailsPanelTitleStyle,
} from "./styles.js";
import type { FileDetailsPanelHeaderProps } from "./types.js";

export const FileDetailsPanelHeader = ({
  nameId,
  summary,
  onClose,
}: FileDetailsPanelHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header style={fileDetailsPanelHeaderStyle} data-testid="file-details-panel-header">
      <div style={fileDetailsPanelTitleStyle}>
        {summary === null ? null : (
          <>
            <FileTypeIcon kind={summary.kind} />
            <Text
              variant="subheading"
              id={nameId}
              value={summary.name}
              style={fileDetailsPanelNameStyle}
              data-testid="file-details-panel-name"
            />
          </>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("files.details.panel.close")}
        onClick={onClose}
        data-testid="file-details-panel-close"
      >
        <MaterialIcon name="close" size="18px" color={cssVar("color-muted")} />
      </Button>
    </header>
  );
};

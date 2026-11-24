// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, ProgressBar, Text, cssVar } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import {
  uploadQueuePanelHeaderActionsStyle,
  uploadQueuePanelHeaderRowStyle,
  uploadQueuePanelHeaderStyle,
  uploadQueuePanelHeaderTitleStyle,
} from "./styles.js";
import type { UploadQueuePanelHeaderProps } from "./types.js";

export const UploadQueuePanelHeader = ({
  summary,
  expanded,
  controlsId,
  isIdle,
  toggleRef,
  onToggle,
  onClose,
}: UploadQueuePanelHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div style={uploadQueuePanelHeaderStyle}>
      <div style={uploadQueuePanelHeaderRowStyle}>
        <Text
          variant="label"
          textId="files.upload.heading"
          element="p"
          id="upload-queue-panel-title"
          style={uploadQueuePanelHeaderTitleStyle}
        />
        <Text
          variant="caption"
          textId={summary.textId}
          values={summary.values}
          element="span"
          data-testid="upload-queue-panel-summary"
        />
        <div style={uploadQueuePanelHeaderActionsStyle}>
          <Button
            ref={toggleRef}
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={expanded ? controlsId : undefined}
            aria-label={t(expanded ? "files.upload.minimize" : "files.upload.expand")}
            data-testid="upload-queue-panel-toggle"
          >
            <MaterialIcon
              name={expanded ? "keyboard_arrow_down" : "keyboard_arrow_up"}
              size="1.25rem"
              color={cssVar("color-muted")}
            />
          </Button>
          {isIdle ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t("files.upload.close")}
              data-testid="upload-queue-panel-close"
            >
              <MaterialIcon name="close" size="1.25rem" color={cssVar("color-muted")} />
            </Button>
          ) : null}
        </div>
      </div>
      <ProgressBar
        label={t("files.upload.heading")}
        percent={summary.percent}
        testId="upload-queue-panel-overall-progress"
      />
    </div>
  );
};

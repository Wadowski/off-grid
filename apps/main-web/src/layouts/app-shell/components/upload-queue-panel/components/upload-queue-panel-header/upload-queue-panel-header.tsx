// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, IconTile, MaterialIcon, ProgressBar, Tag, Text, cssVar } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import {
  uploadQueuePanelHeaderActionsStyle,
  uploadQueuePanelHeaderRowStyle,
  uploadQueuePanelHeaderStyle,
  uploadQueuePanelHeaderSummaryStyle,
  uploadQueuePanelHeaderTitleStyle,
  uploadQueuePanelInverseTextStyle,
  uploadQueuePanelPulseDotStyle,
} from "./styles.js";
import type { PanelSummary } from "../../types.js";
import type { UploadQueuePanelHeaderProps } from "./types.js";

const pillIconName = (isActive: boolean, textId: PanelSummary["textId"]): string => {
  if (isActive) {
    return "cloud_upload";
  }
  return textId === "files.upload.summaryFailed" ? "error" : "check";
};

export const UploadQueuePanelHeader = ({
  summary,
  activeCount,
  expanded,
  sheet,
  controlsId,
  isIdle,
  toggleRef,
  onToggle,
  onClose,
}: UploadQueuePanelHeaderProps) => {
  const { t } = useTranslation();
  const isActive = activeCount > 0;
  const inverse = sheet && !expanded;
  const iconColor = inverse ? cssVar("color-dark-chip-fg") : cssVar("color-muted");
  const textStyle = inverse ? uploadQueuePanelInverseTextStyle : undefined;
  const showBar = expanded || isActive;

  const pillLine = isActive
    ? {
        textId: "files.upload.summaryUploading" as const,
        values: { count: activeCount, percent: summary.percent },
      }
    : { textId: summary.textId, values: summary.values };

  return (
    <div style={uploadQueuePanelHeaderStyle}>
      <div style={uploadQueuePanelHeaderRowStyle}>
        {expanded ? null : (
          <IconTile
            size="1.75rem"
            shape="circle"
            background={cssVar("color-primary")}
            color={cssVar("color-accent-fg")}
          >
            <MaterialIcon
              name={pillIconName(isActive, summary.textId)}
              size="1rem"
              color={cssVar("color-accent-fg")}
            />
          </IconTile>
        )}
        {expanded ? (
          <Text
            variant="label"
            textId={sheet ? "files.upload.sheetTitle" : "files.upload.panelTitle"}
            element="p"
            id="upload-queue-panel-title"
            style={uploadQueuePanelHeaderTitleStyle}
          />
        ) : (
          <Text
            variant="label"
            textId={pillLine.textId}
            values={pillLine.values}
            element="span"
            style={{ ...uploadQueuePanelHeaderSummaryStyle, ...textStyle }}
            data-testid="upload-queue-panel-summary"
          />
        )}
        {expanded ? (
          <Tag tone="accent">
            <Text
              variant="caption"
              textId="files.upload.activeBadge"
              values={{ count: activeCount }}
              element="span"
            />
          </Tag>
        ) : isActive ? (
          <span aria-hidden="true" className="og-pulse" style={uploadQueuePanelPulseDotStyle} />
        ) : null}
        <div style={uploadQueuePanelHeaderActionsStyle}>
          <Button
            ref={toggleRef}
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={expanded ? controlsId : undefined}
            aria-label={expanded ? t("files.upload.minimize") : undefined}
            data-testid="upload-queue-panel-toggle"
          >
            {expanded ? null : (
              <Text variant="action" textId="files.upload.view" element="span" style={textStyle} />
            )}
            <MaterialIcon
              name={expanded ? "keyboard_arrow_down" : "keyboard_arrow_up"}
              size="1.25rem"
              color={iconColor}
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
              <MaterialIcon name="close" size="1.25rem" color={iconColor} />
            </Button>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <Text
          variant="caption"
          textId={summary.textId}
          values={summary.values}
          element="span"
          data-testid="upload-queue-panel-summary"
        />
      ) : null}
      {showBar ? (
        <ProgressBar
          label={t("files.upload.heading")}
          percent={summary.percent}
          testId="upload-queue-panel-overall-progress"
        />
      ) : null}
    </div>
  );
};

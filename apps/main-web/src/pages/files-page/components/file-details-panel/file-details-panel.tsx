// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useId } from "react";
import { useTranslation } from "react-i18next";
import { toFileDetailsValues } from "../../../../files/to-file-details-values.js";
import { useFileDetails } from "../../../../files/use-file-details.js";
import { FileDetailsPanelBody } from "./components/file-details-panel-body/file-details-panel-body.js";
import { FileDetailsPanelVersions } from "./components/file-details-panel-versions/file-details-panel-versions.js";
import { FileDetailsPanelHeader } from "./components/file-details-panel-header/file-details-panel-header.js";
import { FileDetailsPanelStatus } from "./components/file-details-panel-status/file-details-panel-status.js";
import { fileDetailsPanelStyle } from "./styles.js";
import { toFileDetailsPanelView } from "./to-file-details-panel-view.js";
import type { FileDetailsPanelProps } from "./types.js";

export const FileDetailsPanel = ({ fileId, onClose, onFileChanged }: FileDetailsPanelProps) => {
  const { t } = useTranslation();
  const nameId = useId();
  const details = useFileDetails(fileId, true);
  const view = toFileDetailsPanelView(details);
  const values = view.kind === "ready" ? toFileDetailsValues(view.file) : null;
  const summary = values === null ? null : { name: values.name, kind: values.kind };

  return (
    <section
      style={fileDetailsPanelStyle}
      data-testid="file-details-panel"
      aria-labelledby={summary === null ? undefined : nameId}
      aria-label={summary === null ? t("files.details.panel.label") : undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <FileDetailsPanelHeader nameId={nameId} summary={summary} onClose={onClose} />
      {view.kind === "ready" ? (
        <FileDetailsPanelBody
          file={view.file}
          breadcrumbs={view.breadcrumbs}
          versionsSection={
            <FileDetailsPanelVersions
              file={view.file}
              onFileChanged={onFileChanged}
              onDetailsChanged={details.refreshQuietly}
            />
          }
        />
      ) : (
        <FileDetailsPanelStatus {...view} />
      )}
    </section>
  );
};

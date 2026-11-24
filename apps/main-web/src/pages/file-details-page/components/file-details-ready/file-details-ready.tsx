// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatFileSize, Text } from "@offgrid/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatFileTimestamp } from "../../../../files/format-file-timestamp.js";
import { toFileActivityEntries } from "../../../../files/to-file-activity-entries.js";
import { toFileAccessEntries } from "../../../../files/to-file-access-entries.js";
import { toAccessStatus } from "../../../../files/to-access-status.js";
import { toFileDetailsValues } from "../../../../files/to-file-details-values.js";
import { toFileLocation } from "../../../../files/to-file-location.js";
import { toMemberName } from "../../../../files/to-member-name.js";
import { toModifiedBy } from "../../../../files/to-modified-by.js";
import { FileActivityList } from "../file-activity-list/file-activity-list.js";
import { FileAccessList } from "../file-access-list/file-access-list.js";
import { FileDetailsTabs } from "../file-details-tabs/file-details-tabs.js";
import { FileDetailsVersions } from "../file-details-versions/file-details-versions.js";
import type { FileDetailsTab } from "../file-details-tabs/types.js";
import { FileProperties } from "../file-properties/file-properties.js";
import type { PropertyRowData } from "../file-properties/types.js";
import { FileSummary } from "../file-summary/file-summary.js";
import { fileDetailsReadyStyle } from "./styles.js";
import type { FileDetailsReadyProps } from "./types.js";

export const FileDetailsReady = ({
  file,
  breadcrumbs,
  backTarget,
  screen,
}: FileDetailsReadyProps) => {
  const { i18n, t } = useTranslation();
  const [tab, setTab] = useState<FileDetailsTab>("details");
  const language = i18n.language;
  const values = toFileDetailsValues(file);
  const resolveName = (userId: string) => toMemberName(userId, screen.members, screen.viewer);
  const activityEntries = toFileActivityEntries(screen.versions.versions, resolveName);
  const modifiedBy = toModifiedBy(file.currentVersionId, screen.versions.versions, resolveName);
  const modifiedDate = formatFileTimestamp(values.updatedAt, language);
  const locationText = toFileLocation(breadcrumbs).join(t("files.details.locationSeparator"));
  const refreshAll = () => {
    void screen.versions.refreshQuietly();
    void screen.details.refreshQuietly();
  };
  const accessEntries =
    screen.drive === null || screen.viewer === null
      ? []
      : toFileAccessEntries(screen.drive, screen.members, screen.viewer);
  const rows: readonly PropertyRowData[] = [
    {
      key: "type",
      labelTextId: "files.details.type",
      value: <Text variant="body" textId={`files.kind.${values.kind}`} />,
    },
    {
      key: "size",
      labelTextId: "files.details.size",
      value: <Text variant="body" value={formatFileSize(values.sizeBytes, language)} />,
    },
    {
      key: "location",
      labelTextId: "files.details.location",
      value:
        backTarget === null ? (
          <Text variant="body" value={locationText} data-testid="file-details-location" />
        ) : (
          <Link to={backTarget.to} className="og-focusable" data-testid="file-details-location">
            <Text variant="link" value={locationText} />
          </Link>
        ),
    },
    {
      key: "modified",
      labelTextId: "files.details.modified",
      value:
        modifiedBy === null ? (
          <Text variant="body" value={modifiedDate} />
        ) : (
          <Text
            variant="body"
            textId="files.details.modifiedBy"
            values={{ date: modifiedDate, name: modifiedBy }}
          />
        ),
    },
    {
      key: "created",
      labelTextId: "files.details.created",
      value: <Text variant="body" value={formatFileTimestamp(values.createdAt, language)} />,
    },
    {
      key: "version",
      labelTextId: "files.details.version",
      value: (
        <Text
          variant="body"
          textId="files.details.versionValue"
          values={{ count: values.version }}
        />
      ),
    },
  ];

  return (
    <div style={fileDetailsReadyStyle} data-testid="file-details-ready">
      <FileSummary name={values.name} kind={values.kind} />
      <FileDetailsTabs
        value={tab}
        activityCount={screen.versions.status === "ready" ? activityEntries.length : null}
        onChange={setTab}
      />
      {tab === "details" ? (
        <>
          <FileProperties rows={rows} />
          <FileAccessList
            status={toAccessStatus(screen.drive, screen.drivesStatus, screen.membersStatus)}
            entries={accessEntries}
            familyDriveName={screen.drive?.familyId ? screen.drive.name : null}
            onRetry={screen.refreshMembers}
          />
          <FileDetailsVersions
            file={file}
            versions={screen.versions}
            resolveName={resolveName}
            refreshAll={refreshAll}
          />
        </>
      ) : (
        <FileActivityList
          status={screen.versions.status}
          entries={activityEntries}
          onRetry={screen.versions.refresh}
        />
      )}
    </div>
  );
};

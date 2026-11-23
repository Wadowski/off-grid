// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Link } from "react-router-dom";
import { formatFileSize, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { FILE_LOCATION_SEPARATOR } from "../../../../files/constants.js";
import { formatFileTimestamp } from "../../../../files/format-file-timestamp.js";
import { toFileDetailsValues } from "../../../../files/to-file-details-values.js";
import { toFileLocation } from "../../../../files/to-file-location.js";
import { FileProperties } from "../file-properties/file-properties.js";
import type { PropertyRowData } from "../file-properties/types.js";
import { FileSummary } from "../file-summary/file-summary.js";
import { fileDetailsReadyStyle } from "./styles.js";
import type { FileDetailsReadyProps } from "./types.js";

export const FileDetailsReady = ({ file, breadcrumbs, backTarget }: FileDetailsReadyProps) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const values = toFileDetailsValues(file);
  const locationText = toFileLocation(breadcrumbs).join(FILE_LOCATION_SEPARATOR);
  const locationValue =
    backTarget === null ? (
      <Text variant="body" value={locationText} data-testid="file-details-location" />
    ) : (
      <Link to={backTarget.to} className="og-focusable" data-testid="file-details-location">
        <Text variant="link" value={locationText} />
      </Link>
    );
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
    { key: "location", labelTextId: "files.details.location", value: locationValue },
    {
      key: "modified",
      labelTextId: "files.details.modified",
      value: <Text variant="body" value={formatFileTimestamp(values.updatedAt, language)} />,
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
      <FileProperties rows={rows} />
    </div>
  );
};

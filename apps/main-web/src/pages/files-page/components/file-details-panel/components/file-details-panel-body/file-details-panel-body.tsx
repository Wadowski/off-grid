// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatFileSize, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { FileProperties } from "../../../../../file-details-page/components/file-properties/file-properties.js";
import type { PropertyRowData } from "../../../../../file-details-page/components/file-properties/types.js";
import { formatFileTimestamp } from "../../../../../../files/format-file-timestamp.js";
import { toFileDetailsValues } from "../../../../../../files/to-file-details-values.js";
import { toFileLocation } from "../../../../../../files/to-file-location.js";
import type { FileDetailsPanelBodyProps } from "./types.js";

export const FileDetailsPanelBody = ({ file, breadcrumbs }: FileDetailsPanelBodyProps) => {
  const { i18n, t } = useTranslation();
  const language = i18n.language;
  const values = toFileDetailsValues(file);
  const locationText = toFileLocation(breadcrumbs).join(t("files.details.locationSeparator"));
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
      key: "location",
      labelTextId: "files.details.location",
      value: <Text variant="body" value={locationText} />,
    },
  ];

  return <FileProperties rows={rows} />;
};

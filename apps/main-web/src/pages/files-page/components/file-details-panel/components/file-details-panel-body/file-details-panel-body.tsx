// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatFileSize, Text } from "@offgrid/ui";
import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { PropertyLabelTextId } from "../../../../../file-details-page/components/file-properties/types.js";
import { formatFileTimestamp } from "../../../../../../files/format-file-timestamp.js";
import { toFileDetailsValues } from "../../../../../../files/to-file-details-values.js";
import { toFileLocation } from "../../../../../../files/to-file-location.js";
import {
  fileDetailsPanelHeadingStyle,
  fileDetailsPanelLabelStyle,
  fileDetailsPanelListStyle,
  fileDetailsPanelRowStyle,
  fileDetailsPanelSectionStyle,
  fileDetailsPanelValueStyle,
} from "./styles.js";
import type { FileDetailsPanelBodyProps } from "./types.js";

type PropertyRow = {
  readonly key: string;
  readonly labelTextId: PropertyLabelTextId;
  readonly value: ReactNode;
};

export const FileDetailsPanelBody = ({ file, breadcrumbs }: FileDetailsPanelBodyProps) => {
  const { i18n, t } = useTranslation();
  const headingId = useId();
  const language = i18n.language;
  const values = toFileDetailsValues(file);
  const locationText = toFileLocation(breadcrumbs).join(t("files.details.locationSeparator"));
  const rows: readonly PropertyRow[] = [
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

  return (
    <section
      style={fileDetailsPanelSectionStyle}
      aria-labelledby={headingId}
      data-testid="file-details-panel-properties"
    >
      <Text
        variant="label"
        id={headingId}
        textId="files.details.properties"
        style={fileDetailsPanelHeadingStyle}
      />
      <dl style={fileDetailsPanelListStyle}>
        {rows.map((row) => (
          <div
            key={row.key}
            style={fileDetailsPanelRowStyle}
            data-testid={`file-details-property-${row.key}`}
          >
            <dt style={fileDetailsPanelLabelStyle}>
              <Text variant="label" textId={row.labelTextId} />
            </dt>
            <dd style={fileDetailsPanelValueStyle}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

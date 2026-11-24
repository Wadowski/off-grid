// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatFileSize, Tag, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { formatFileTimestamp } from "../../../../../../files/format-file-timestamp.js";
import { VersionRowActions } from "../version-row-actions/version-row-actions.js";
import {
  versionRowInfoStyle,
  versionRowMetaStyle,
  versionRowStyle,
  versionRowTitleStyle,
} from "./styles.js";
import type { VersionRowProps } from "./types.js";

export const VersionRow = ({
  row,
  pending,
  onRestore,
  onDownload,
  onRequestDelete,
}: VersionRowProps) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const dateText = formatFileTimestamp(row.createdAt, language);

  return (
    <li
      style={versionRowStyle}
      data-testid="file-version-row"
      data-version={row.number}
      aria-busy={pending}
    >
      <div style={versionRowInfoStyle}>
        <div style={versionRowTitleStyle}>
          <Text variant="body" textId="files.versions.version" values={{ count: row.number }} />
          {row.isCurrent ? (
            <Tag tone="accent" data-testid="file-version-current">
              <Text variant="caption" textId="files.versions.current" />
            </Tag>
          ) : null}
        </div>
        <div style={versionRowMetaStyle}>
          {row.authorName === null ? (
            <Text
              variant="caption"
              textId="files.versions.metaFormerMember"
              values={{ date: dateText }}
            />
          ) : (
            <Text
              variant="caption"
              textId="files.versions.meta"
              values={{ date: dateText, name: row.authorName }}
            />
          )}
          <Text variant="caption" value={formatFileSize(row.sizeBytes, language)} />
        </div>
      </div>
      <VersionRowActions
        row={row}
        pending={pending}
        onRestore={onRestore}
        onDownload={onDownload}
        onRequestDelete={onRequestDelete}
      />
    </li>
  );
};

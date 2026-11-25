// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { FileModified } from "../file-meta/file-modified.js";
import { FileTypeIcon } from "../file-type-icon/file-type-icon.js";
import { activatableProps } from "../files/activatable-props.js";
import { formatFileDate } from "../files/format-file-date.js";
import { formatFileSize } from "../files/format-file-size.js";
import { Text } from "../text/text.js";
import {
  fileTableActionsCellStyle,
  fileTableActivatorStyle,
  fileTableCellStyle,
  fileTableNameCellStyle,
  fileTableNameStyle,
  fileTableRowStyle,
  fileTableSizeCellStyle,
} from "./styles.js";
import type { FileTableRowProps } from "./types.js";

export const FileTableRow = ({
  name,
  kind,
  modifiedAt,
  sizeBytes,
  itemCount,
  selected = false,
  onActivate,
  actions,
  variant = "files",
  locale,
  now,
  timeZone,
}: FileTableRowProps) => {
  const { i18n } = useTranslation();
  const language = locale ?? i18n.language;
  const modified =
    modifiedAt === undefined
      ? undefined
      : formatFileDate(modifiedAt, now ?? new Date(), language, timeZone);
  const nameContent = (
    <>
      <FileTypeIcon kind={kind} />
      <Text
        variant="body"
        value={name}
        title={name}
        style={fileTableNameStyle}
        data-testid="file-table-name"
      />
    </>
  );

  return (
    <tr style={fileTableRowStyle(selected)} data-testid="file-table-row" data-selected={selected}>
      <td style={fileTableNameCellStyle(selected)}>
        {variant === "trash" ? (
          <div style={fileTableActivatorStyle}>{nameContent}</div>
        ) : (
          <div
            style={fileTableActivatorStyle}
            data-testid="file-table-activate"
            aria-current={selected ? "true" : undefined}
            {...activatableProps(onActivate)}
          >
            {nameContent}
          </div>
        )}
      </td>
      <td style={fileTableCellStyle}>
        {modified === undefined ? null : <FileModified label={modified} />}
      </td>
      <td style={fileTableSizeCellStyle}>
        {kind === "folder" && itemCount !== undefined ? (
          <Text
            variant="caption"
            textId="files.itemCount"
            values={{ count: itemCount }}
            data-testid="file-item-count"
          />
        ) : null}
        {kind !== "folder" && sizeBytes !== undefined ? (
          <Text
            variant="caption"
            value={formatFileSize(sizeBytes, language)}
            data-testid="file-size"
          />
        ) : null}
      </td>
      {variant === "trash" ? null : (
        <td style={fileTableCellStyle}>
          <Text variant="caption" textId={`files.kind.${kind}`} />
        </td>
      )}
      <td style={fileTableActionsCellStyle}>{actions}</td>
    </tr>
  );
};

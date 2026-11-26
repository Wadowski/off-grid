// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { FILE_TABLE_COLUMNS_BY_VARIANT, FILE_TABLE_LABEL_TEXT_IDS } from "../constants.js";
import { Text } from "../text/text.js";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.js";
import { fileTableActionsHeaderStyle, fileTableHeaderCellStyle, fileTableStyle } from "./styles.js";
import type { FileTableProps } from "./types.js";

export const FileTable = ({ isBusy, variant = "files", children }: FileTableProps) => {
  const { t } = useTranslation();
  const columns = FILE_TABLE_COLUMNS_BY_VARIANT[variant];

  return (
    <table
      aria-label={t(FILE_TABLE_LABEL_TEXT_IDS[variant])}
      aria-busy={isBusy}
      data-testid="files-table"
      style={fileTableStyle}
    >
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" style={fileTableHeaderCellStyle(column)}>
              <Text variant="label" textId={column.textId} />
            </th>
          ))}
          <th scope="col" style={fileTableActionsHeaderStyle(variant)}>
            <VisuallyHidden>
              <Text variant="label" textId="files.entryActions.columnHeader" />
            </VisuallyHidden>
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

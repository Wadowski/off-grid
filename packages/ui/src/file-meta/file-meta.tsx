// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { formatFileDate } from "../files/format-file-date.js";
import { formatFileSize } from "../files/format-file-size.js";
import { Text } from "../text/text.js";
import { FileModified } from "./file-modified.js";
import { fileMetaStyle } from "./styles.js";
import type { FileMetaProps } from "./types.js";

export const FileMeta = ({
  id,
  kind,
  sizeBytes,
  itemCount,
  modifiedAt,
  locale,
  now,
  timeZone,
  spread = false,
}: FileMetaProps) => {
  const { i18n } = useTranslation();
  const language = locale ?? i18n.language;
  const showsItemCount = kind === "folder" && itemCount !== undefined;
  const showsSize = kind !== "folder" && sizeBytes !== undefined;
  const modified =
    modifiedAt === undefined
      ? undefined
      : formatFileDate(modifiedAt, now ?? new Date(), language, timeZone);

  return (
    <span id={id} style={fileMetaStyle(spread)}>
      {showsItemCount ? (
        <Text
          variant="caption"
          textId="files.itemCount"
          values={{ count: itemCount }}
          data-testid="file-item-count"
        />
      ) : null}
      {showsSize ? (
        <Text
          variant="caption"
          value={formatFileSize(sizeBytes, language)}
          data-testid="file-size"
        />
      ) : null}
      {(showsItemCount || showsSize) && modified !== undefined && !spread ? (
        <Text variant="caption" value="·" aria-hidden="true" />
      ) : null}
      {modified === undefined ? null : <FileModified label={modified} />}
    </span>
  );
};

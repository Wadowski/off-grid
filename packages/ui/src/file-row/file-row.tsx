// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileMeta } from "../file-meta/file-meta.js";
import { FileTypeIcon } from "../file-type-icon/file-type-icon.js";
import { activatableProps } from "../files/activatable-props.js";
import { fileNameStyle } from "../files/styles.js";
import { Text } from "../text/text.js";
import {
  fileRowActivatorStyle,
  fileRowStyle,
  fileRowTextStyle,
  fileRowTrailingStyle,
} from "./styles.js";
import type { FileRowProps } from "./types.js";

export const FileRow = ({
  name,
  kind,
  modifiedAt,
  sizeBytes,
  itemCount,
  selected = false,
  trailing,
  onActivate,
  locale,
  now,
  timeZone,
}: FileRowProps) => {
  return (
    <div style={fileRowStyle(selected)} data-testid="file-row" data-selected={selected}>
      <div
        style={fileRowActivatorStyle}
        data-testid="file-row-activate"
        {...activatableProps(onActivate)}
      >
        <FileTypeIcon kind={kind} />
        <span style={fileRowTextStyle}>
          <Text
            variant="body"
            value={name}
            title={name}
            style={fileNameStyle}
            data-testid="file-name"
          />
          <FileMeta
            kind={kind}
            sizeBytes={sizeBytes}
            itemCount={itemCount}
            modifiedAt={modifiedAt}
            locale={locale}
            now={now}
            timeZone={timeZone}
          />
        </span>
      </div>
      {trailing === undefined ? null : (
        <div style={fileRowTrailingStyle} data-testid="file-row-trailing">
          {trailing}
        </div>
      )}
    </div>
  );
};

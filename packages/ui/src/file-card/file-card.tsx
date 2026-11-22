// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar } from "../css-var.js";
import { FileMeta } from "../file-meta/file-meta.js";
import { FileTypeIcon } from "../file-type-icon/file-type-icon.js";
import { useId } from "react";
import { activatableProps } from "../files/activatable-props.js";
import { fileNameStyle } from "../files/styles.js";
import { Text } from "../text/text.js";
import {
  fileCardActivatorStyle,
  fileCardBadgeStyle,
  fileCardBodyStyle,
  fileCardFolderBodyStyle,
  fileCardMediaStyle,
  fileCardStyle,
  fileCardTrailingStyle,
} from "./styles.js";
import type { FileCardProps } from "./types.js";

export const FileCard = ({
  name,
  kind,
  modifiedAt,
  sizeBytes,
  itemCount,
  selected = false,
  trailing,
  media,
  onActivate,
  locale,
  now,
  timeZone,
}: FileCardProps) => {
  const metaId = useId();
  const isFolder = kind === "folder";
  return (
    <div style={fileCardStyle(selected)} data-testid="file-card" data-selected={selected}>
      <div
        style={fileCardActivatorStyle}
        data-testid="file-card-activate"
        {...activatableProps(onActivate)}
      >
        {isFolder ? null : (
          <div style={fileCardMediaStyle} data-testid="file-card-media">
            {media ?? <FileTypeIcon kind={kind} size="lg" />}
            <span style={fileCardBadgeStyle(cssVar(`color-file-${kind}`))}>
              <Text variant="caption" textId={`files.kind.${kind}`} data-testid="file-kind-badge" />
            </span>
          </div>
        )}
        <div style={isFolder ? fileCardFolderBodyStyle : fileCardBodyStyle}>
          {isFolder ? <FileTypeIcon kind={kind} /> : null}
          <Text
            variant="body"
            value={name}
            title={name}
            style={fileNameStyle}
            data-testid="file-name"
          />
          <FileMeta
            id={metaId}
            kind={kind}
            sizeBytes={sizeBytes}
            itemCount={itemCount}
            modifiedAt={modifiedAt}
            locale={locale}
            now={now}
            timeZone={timeZone}
            spread={!isFolder}
          />
        </div>
      </div>
      {trailing === undefined ? null : (
        <div style={fileCardTrailingStyle} data-testid="file-card-trailing">
          {trailing}
        </div>
      )}
    </div>
  );
};

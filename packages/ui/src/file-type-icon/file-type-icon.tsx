// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar } from "../css-var.js";
import { IconTile } from "../icon-tile/icon-tile.js";
import { MaterialIcon } from "../material-icon/material-icon.js";
import { Text } from "../text/text.js";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.js";
import { FILE_KIND_GLYPHS, FILE_TYPE_ICON_SIZES } from "../constants.js";
import { fileTypeIconStyle } from "./styles.js";
import type { FileTypeIconProps } from "./types.js";

export const FileTypeIcon = ({ kind, size = "md", labelled = false }: FileTypeIconProps) => {
  const color = cssVar(`color-file-${kind}`);
  const { tile, glyph } = FILE_TYPE_ICON_SIZES[size];
  return (
    <span style={fileTypeIconStyle} data-testid="file-type-icon" data-kind={kind}>
      <IconTile size={tile} background={cssVar(`color-file-${kind}-soft`)} color={color}>
        <MaterialIcon name={FILE_KIND_GLYPHS[kind]} size={glyph} color={color} filled />
      </IconTile>
      {labelled ? (
        <VisuallyHidden>
          <Text variant="caption" textId={`files.kind.${kind}`} />
        </VisuallyHidden>
      ) : null}
    </span>
  );
};

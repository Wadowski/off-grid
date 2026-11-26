// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MaterialIcon, Text, cssVar } from "@offgrid/ui";
import {
  dropOverlayFolderNameStyle,
  dropOverlayHintStyle,
  dropOverlayIconTileStyle,
  dropOverlayLayerStyle,
  dropOverlayTargetStyle,
} from "./styles.js";
import type { DropOverlayProps } from "./types.js";

const DropHint = ({ folderName }: DropOverlayProps) =>
  folderName === null ? (
    <Text
      variant="body"
      textId="files.dropZone.hintDrive"
      element="p"
      style={dropOverlayHintStyle}
    />
  ) : (
    <div style={dropOverlayHintStyle}>
      <Text variant="body" textId="files.dropZone.hintBefore" element="span" />{" "}
      <Text variant="body" value={folderName} element="span" style={dropOverlayFolderNameStyle} />{" "}
      <Text variant="body" textId="files.dropZone.hintAfter" element="span" />
    </div>
  );

export const DropOverlay = ({ folderName }: DropOverlayProps) => (
  <div style={dropOverlayLayerStyle} data-testid="files-drop-overlay" aria-hidden="true">
    <div style={dropOverlayTargetStyle}>
      <div style={dropOverlayIconTileStyle}>
        <MaterialIcon name="cloud_upload" size="36px" color={cssVar("color-primary")} />
      </div>
      <Text variant="subheading" textId="files.dropZone.title" element="p" />
      <DropHint folderName={folderName} />
    </div>
  </div>
);

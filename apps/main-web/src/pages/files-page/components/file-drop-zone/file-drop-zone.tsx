// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useFileDragState } from "../../../../files/use-file-drag-state.js";
import { useMediaQuery } from "../../../../media/use-media-query.js";
import { DropOverlay } from "./components/drop-overlay/drop-overlay.js";
import {
  fileDropZoneAnimatedContentStyle,
  fileDropZoneContentStyle,
  fileDropZoneDimmedContentStyle,
  fileDropZoneStyle,
} from "./styles.js";
import type { FileDropZoneProps } from "./types.js";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const FileDropZone = ({
  enabled,
  folderName,
  onFilesDropped,
  children,
}: FileDropZoneProps) => {
  const drag = useFileDragState(enabled, onFilesDropped);
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const contentStyle = drag.isDragging ? fileDropZoneDimmedContentStyle : fileDropZoneContentStyle;
  return (
    <div
      style={fileDropZoneStyle}
      data-testid="files-drop-zone"
      onDragEnter={drag.onDragEnter}
      onDragOver={drag.onDragOver}
      onDragLeave={drag.onDragLeave}
      onDrop={drag.onDrop}
    >
      <div
        style={
          reduceMotion ? contentStyle : { ...contentStyle, ...fileDropZoneAnimatedContentStyle }
        }
      >
        {children}
      </div>
      {drag.isDragging ? <DropOverlay folderName={folderName} /> : null}
    </div>
  );
};

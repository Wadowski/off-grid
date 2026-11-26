// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { isFilesDrag } from "./is-files-drag.js";
import { toDroppedFiles } from "./to-dropped-files.js";
import type { FileDragState } from "./types.js";

export const useFileDragState = (
  enabled: boolean,
  onFilesDropped: (files: readonly File[]) => void,
): FileDragState => {
  const [isDragging, setIsDragging] = useState(false);
  const enterCount = useRef(0);

  useEffect(() => {
    const reset = () => {
      enterCount.current = 0;
      setIsDragging(false);
    };
    window.addEventListener("dragend", reset);
    window.addEventListener("drop", reset);
    return () => {
      window.removeEventListener("dragend", reset);
      window.removeEventListener("drop", reset);
    };
  }, []);

  const onDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!isFilesDrag(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    enterCount.current += 1;
    setIsDragging(true);
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    if (!isFilesDrag(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = enabled ? "copy" : "none";
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!isFilesDrag(event.dataTransfer)) {
      return;
    }
    enterCount.current = Math.max(0, enterCount.current - 1);
    if (enterCount.current === 0) {
      setIsDragging(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    if (!isFilesDrag(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    enterCount.current = 0;
    setIsDragging(false);
    if (enabled) {
      onFilesDropped(toDroppedFiles(event.dataTransfer));
    }
  };

  return { isDragging: enabled && isDragging, onDragEnter, onDragOver, onDragLeave, onDrop };
};

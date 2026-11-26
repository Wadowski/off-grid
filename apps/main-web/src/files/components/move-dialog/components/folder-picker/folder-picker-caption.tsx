// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import type { FolderPickerCaptionProps } from "./types.js";

export const FolderPickerCaption = ({ caption }: FolderPickerCaptionProps) => (
  <Text
    variant="caption"
    textId={caption === "otherOwner" ? "files.move.otherOwner" : "files.move.currentLocation"}
  />
);

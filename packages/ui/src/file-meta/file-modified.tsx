// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "../text/text.js";
import type { FileModifiedProps } from "./types.js";

export const FileModified = ({ label }: FileModifiedProps) => {
  if (label.kind === "today") {
    return (
      <Text
        variant="caption"
        textId="files.date.today"
        values={{ time: label.time }}
        data-testid="file-modified"
      />
    );
  }
  if (label.kind === "yesterday") {
    return <Text variant="caption" textId="files.date.yesterday" data-testid="file-modified" />;
  }
  return <Text variant="caption" value={label.text} data-testid="file-modified" />;
};

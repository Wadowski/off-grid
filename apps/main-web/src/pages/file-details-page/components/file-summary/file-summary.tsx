// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Card, FileTypeIcon, Text } from "@offgrid/ui";
import { fileSummaryNameStyle, fileSummaryStyle } from "./styles.js";
import type { FileSummaryProps } from "./types.js";

export const FileSummary = ({ name, kind }: FileSummaryProps) => (
  <Card>
    <div style={fileSummaryStyle} data-testid="file-summary">
      <FileTypeIcon kind={kind} size="lg" />
      <Text
        variant="subheading"
        value={name}
        style={fileSummaryNameStyle}
        data-testid="file-details-name"
      />
      <Text variant="caption" textId={`files.kind.${kind}`} data-testid="file-details-kind" />
    </div>
  </Card>
);

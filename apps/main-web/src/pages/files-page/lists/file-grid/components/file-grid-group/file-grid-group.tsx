// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileCard } from "@offgrid/ui";
import { toFileRowValues } from "../../../../../../files/to-file-row-values.js";
import { fileGridGroupItemStyle, fileGridGroupStyle } from "./styles.js";
import type { FileGridGroupProps } from "./types.js";

export const FileGridGroup = ({
  label,
  testId,
  items,
  selectedId,
  onActivate,
}: FileGridGroupProps) => (
  <div role="list" aria-label={label} style={fileGridGroupStyle} data-testid={testId}>
    {items.map((item) => (
      <div key={item.id} role="listitem" style={fileGridGroupItemStyle}>
        <FileCard
          {...toFileRowValues(item)}
          selected={item.id === selectedId}
          onActivate={() => onActivate(item)}
        />
      </div>
    ))}
  </div>
);

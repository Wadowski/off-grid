// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileCard } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { toFileRowValues } from "../../../../../../files/to-file-row-values.js";
import { FileActionsMenu } from "../../../../components/file-actions-menu/file-actions-menu.js";
import { fileGridGroupItemStyle, fileGridGroupStyle } from "./styles.js";
import type { FileGridGroupProps } from "./types.js";

export const FileGridGroup = ({
  labelTextId,
  testId,
  items,
  selectedId,
  onActivate,
  onDelete,
  onMove,
}: FileGridGroupProps) => {
  const { t } = useTranslation();

  return (
    <div role="list" aria-label={t(labelTextId)} style={fileGridGroupStyle} data-testid={testId}>
      {items.map((item) => (
        <div key={item.id} role="listitem" style={fileGridGroupItemStyle}>
          <FileCard
            {...toFileRowValues(item)}
            selected={item.id === selectedId}
            onActivate={() => onActivate(item)}
            trailing={
              <FileActionsMenu
                entry={item}
                onOpen={() => onActivate(item)}
                onDelete={onDelete}
                onMove={onMove}
              />
            }
          />
        </div>
      ))}
    </div>
  );
};

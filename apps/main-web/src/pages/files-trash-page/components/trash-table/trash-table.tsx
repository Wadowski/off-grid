// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileTable, FileTableRow } from "@offgrid/ui";
import { toTrashRowValues } from "../../../../files/to-trash-row-values.js";
import { RestoreButton } from "../restore-button/restore-button.js";
import type { TrashTableProps } from "./types.js";

export const TrashTable = ({ items, restoring, onRestore }: TrashTableProps) => (
  <div data-testid="trash-list">
    <FileTable isBusy={false} variant="trash">
      {items.map((item) => (
        <FileTableRow
          key={item.id}
          variant="trash"
          {...toTrashRowValues(item)}
          actions={
            <RestoreButton
              name={item.name}
              entryId={item.id}
              disabled={restoring}
              compact={false}
              onRestore={() => onRestore(item)}
            />
          }
        />
      ))}
    </FileTable>
  </div>
);
